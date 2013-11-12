require.config({
    urlArgs: "bust=" + Date.now(),
    paths: {
        'class': '../../../lib/class',
        'vector': '../../../lib/vector',
        'sprite': '../../../lib/sprite',
        'entity': '../../../lib/entity',
        'animation': '../../../lib/animation'
    }
});

require([
    'entity',
    'hero',
    'land',
    'animation'
], function ( Entity, Hero, Land, Animation ) {
    var img = new Image();

    img.onload = function() {
        console.log('test');
        var hero = new Hero( 0, 0 );

        hero.animation = new Animation( img, 2, 69, 32, 200 );

        var canvas = document.createElement( 'canvas' );
        document.body.appendChild( canvas );
        document.body.style.backgroundColor = '#f9f9f9';
        canvas.width = 1500;
        canvas.height = 250;
        var ctx = canvas.getContext( '2d' );

        var x = 1200;
        var y = 200;
        var loop = function() {
            x -= 2;
            y-=0.2;
            hero.animation.drawCurrent( ctx, x, y );

            requestAnimationFrame( loop );
        };

        requestAnimationFrame( loop );
    };

    img.src = 'img/fly.png';
});
