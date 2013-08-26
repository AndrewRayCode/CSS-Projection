$(function() {

var $canvas = $('#canvas'),
    height = $canvas.height(),
    width = $canvas.width();

var obj = [
    // front face
    Vector.create([ -1.0, -1.0, 1.0 ]),
    Vector.create([ -1.0, 1.0, 1.0 ]),
    Vector.create([ -1.0, -1.0, -1.0 ]),
    Vector.create([ -1.0, 1.0, -1.0 ]),

    Vector.create([ 1.0, -1.0, 1.0 ]),
    Vector.create([ 1.0, 1.0, 1.0 ]),
    Vector.create([ 1.0, -1.0, -1.0 ]),
    Vector.create([ 1.0, 1.0, -1.0 ])
];
obj.angle = {
    x: 0, y: 0, z: 0
};

var dot = function( vec ) {
    return $('<div class="point"></div>').appendTo( $canvas );
};

var modelMatrix = Matrix.create([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]).x(100);
var viewMatrix = Matrix.create([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]);
var x = 0;

var rotationMatrix = function( around, angle ) {
    var sin = Math.sin( angle * ( Math.PI / 180 ) ),
        cos = Math.sin( angle * ( Math.PI / 180 ) );

    if( around ===  'x' ) {
        return Matrix.create([
            [1, 0, 0, 0],
            [0, cos, -sin, 0],
            [0, sin, cos, 0],
            [0, 0, 0, 1]
        ]);
    } else if( around ===  'y' ) {
        return Matrix.create([
            [cos, 0, sin, 0],
            [0, 1, 0, 0],
            [-sin, 0, cos, 0],
            [0, 0, 0, 1]
        ]);
    } else if( around ===  'z' ) {
        return Matrix.create([
            [cos, sin, 0, 0],
            [sin, cos, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    }
};

var fov = 10,
    aspect = 1,
    near = 0.0001,
    far = 10,
    top = Math.tan( ( Math.PI / 180 ) * ( fov / 2 ) ),
    bottom = -top,
    right = top * aspect,
    left = -right;

var projectionMatrix = Matrix.create([
    [ ( 2 * near ) / ( right - left ), 0, ( right + left ) / ( right - left ) , 0],
    [0, ( 2 * near ) / ( top - bottom ), ( top + bottom ) / ( top - bottom ), 0],
    [0, 0, -( ( far + near ) / ( far - near ) ), -( ( 2 * far * near ) / ( far - near ))],
    [0, 0, -1, 0]
]);

var updateVert = function( vert ) {

    var homogen = Vector.create([
        vert.elements[0],
        vert.elements[1],
        vert.elements[2],
        1
    ]);

    var trans = projectionMatrix.
        multiply( viewMatrix ).
        multiply( modelMatrix.
            multiply( rotationMatrix( 'x', obj.angle.x ) ).
            multiply( rotationMatrix( 'z', obj.angle.y ) ).
            multiply( rotationMatrix( 'z', obj.angle.z ) )
        ).
        multiply( homogen );

    obj.angle.y += 0.1;
    obj.angle.x += 0.1;
    obj.angle.z += 0.1;

    // TODO: calculate pos here?
    var x = ( ( trans.elements[0] + 1 ) / 2.0 ) * width,
        y = ( ( trans.elements[1] + 1 ) / 2.0 ) * height;

    vert.$dot.css({
        top: x + 'px',
        left: y + 'px',
    });
};

$.each( obj, function( i, vert ) {
    vert.$dot = dot();
});

var drawLoop = function() {

    modelMatrix.elements[1][3] += 0.5;
    $.each( obj, function( i, vert ) {
        updateVert( vert );
    });
    window.requestAnimationFrame(drawLoop);
};
drawLoop();

});
