require.config({
    urlArgs: "bust=" + Date.now(),
    paths: {
        'class': '../../../lib/class',
        'vector': '../../../lib/vector',
        'sprite': '../../../lib/sprite',
        'entity': '../../../lib/entity',
        'animation': '../../../lib/animation',
        'image-loader': '../../../lib/image-loader',
        'game-manager': '../../../lib/game-manager',
        'key-handler': '../../../lib/key-handler',
        'jquery': '../../../bower_components/jquery/jquery'
    }
});

require([
    'entity',
    'animation',
    'image-loader',
    'sprite',
    'game-manager',
    'hero'
], function ( Entity, Animation, ImageLoader, Sprite, GameManager, Hero ) {
    var MyGame = GameManager.extend({
        gameReady: function ( game ) {
            var hero = new Hero( 0, 480 ),
                canvas = document.createElement( 'canvas' ),
                ctx = canvas.getContext( '2d' );

            canvas.width = 1000;
            canvas.height = 512;

            document.body.appendChild( canvas );

            game.setContext( ctx );
            game.loadLevel( { entities: [ hero ] } );
            game.start();
        }
    });

    var game = new MyGame();
});
