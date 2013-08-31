$(function() {

var $canvas = $('#canvas'),
    height = $canvas.height(),
    width = $canvas.width();

var camera = { x: 0, y: 0, z: 0 };
var fogDist = 0.5;

var dot = function( color ) {
    return $('<div class="point"></div>').appendTo( $canvas ).css( 'background', color );
};

var cube = function( side, tesselation ) {
    var obj = [],
        width = side / 2,
        step = side / tesselation,
        x, y, z;
    
    // Build top of cube first
    for( x = -width; x <= width; x += step ) {
        for( y = -width; y <= width; y += step ) {
            obj.push(
                Vector.create([ x, y, width ])
            );
        }
    }

    // draw the "ribs"
    for( z = width - step; z >= ( -width + step ); z -= step ) {

        // draw two lines at + and - side
        for( x = -width; x <= width; x += side ) {
            for( y = -width; y <= width; y += step ) {
                obj.push(
                    Vector.create([ x, y, z ])
                );
                obj[obj.length - 1].$dot = dot( 'green' );
            }
        }

        // Fill in the sides
        for( x = -width + step; x <= width - step; x += step ) {
            obj.push(
                Vector.create([ x, -width, z ]),
                Vector.create([ x, width, z ])
            );
            obj[obj.length - 1].$dot = dot( 'blue' );
            obj[obj.length - 2].$dot = dot( 'blue' );
        }
    }

    // draw bottom of cube
    for( x = -width; x <= width; x += step ) {
        for( y = -width; y <= width; y += step ) {
            obj.push(
                Vector.create([ x, y, -width ])
            );
        }
    }

    return obj;
};

var obj = cube( 1, 8 );

obj.angle = {
    x: 0, y: 0, z: 0
};

var modelMatrix = Matrix.create([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]).x(0.2);
modelMatrix.elements[3][3] = 1;

var viewMatrix = Matrix.create([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]);
var x = 0;

var rotationMatrix = function( around, angle ) {
    var sin = Math.sin( angle * ( Math.PI / 180 ) ),
        cos = Math.cos( angle * ( Math.PI / 180 ) );

    if( around === 'x' ) {
        return Matrix.create([
            [1, 0, 0, 0],
            [0, cos, -sin, 0],
            [0, sin, cos, 0],
            [0, 0, 0, 1]
        ]);
    } else if( around === 'y' ) {
        return Matrix.create([
            [cos, 0, sin, 0],
            [0, 1, 0, 0],
            [-sin, 0, cos, 0],
            [0, 0, 0, 1]
        ]);
    } else if( around === 'z' ) {
        return Matrix.create([
            [cos, -sin, 0, 0],
            [sin, cos, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    }
};

var fov = 50,
    aspect = width / height,
    near = 0.1,
    far = 2000,

    top = near * Math.tan( ( Math.PI / 180 ) * ( fov / 2 ) ),
    bottom = -top,
    right = top * aspect,
    left = -right;

var projectionMatrix = Matrix.create([
    [ ( 2 * near ) / ( right - left ), 0, ( right + left ) / ( right - left ) , 0],

    [0, ( 2 * near ) / ( top - bottom ), ( top + bottom ) / ( top - bottom ), 0],

    [0, 0, ( -( far + near ) / ( far - near ) ), ( -( 2 * far * near ) / ( far - near ))],

    [0, 0, -1, 0]
]);
var orthoMatrix= Matrix.create([
    [ 2 * ( right - left ), 0, 0, -( ( right + left ) / ( right - left ) )],

    [0, 2 / ( top - bottom ), 0, -( (top + bottom ) / (top - bottom) )],

    [0, 0, -( 2 / ( far - near ) ), -( ( far + near ) / ( far - near ))],

    [0, 0, 0, 1]
]);

var updateVert = function( vert ) {

    var homogen = Vector.create([
        vert.elements[0],
        vert.elements[1],
        vert.elements[2],
        1
    ]);

    var trans = projectionMatrix
        .multiply( viewMatrix )
        .multiply( modelMatrix
            .multiply( rotationMatrix( 'x', obj.angle.x ) )
            .multiply( rotationMatrix( 'y', obj.angle.y ) )
            .multiply( rotationMatrix( 'z', obj.angle.z ) )
        )
        .multiply( homogen
        );

    obj.angle.y += 0.001;
    obj.angle.x -= 0.001;
    obj.angle.z += 0.01;

    var x = ( ( trans.elements[0] + 1 ) / 2.0 ) * width,
        y = ( ( trans.elements[1] + 1 ) / 2.0 ) * height;

    vert.$dot.css({
        top: x + 'px',
        left: y + 'px',
        opacity: fogDist - scaleBetween( camera.z - trans.elements[2], 0, fogDist )
    });
};

var scaleBetween = function( val, min, max, scaleStart, scaleEnd ) {
    if( scaleStart === undefined ) {
        scaleStart = 0;
    }
    if( scaleEnd === undefined ) {
        scaleEnd = 1;
    }

    return Math.max(
        scaleStart,
            Math.min( scaleEnd,
                ( ( scaleEnd - scaleStart ) * ( val - min ) )  / ( max - min )
            )
    );
};

$.each( obj, function( i, vert ) {
    if( !vert.$dot ) {
        vert.$dot = dot();
    }
});

var drawLoop = function() {

    //modelMatrix.elements[1][3] += 0.5;
    $.each( obj, function( i, vert ) {
        updateVert( vert );
    });
    window.requestAnimationFrame( drawLoop );
};
drawLoop();

});
