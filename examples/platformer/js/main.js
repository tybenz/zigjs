require.config({
    urlArgs: "bust=" + Date.now(),
    paths: {
        'class': '../../../src/class',
        'vector': '../../../src/vector',
        'vector-utils': '../../../src/vector-utils',
        'sprite': '../../../src/sprite',
        'entity': '../../../src/entity',
        'animation': '../../../src/animation',
        'image-loader': '../../../src/image-loader',
        'game-manager': '../../../src/game-manager',
        'jquery': '../../../bower_components/jquery/jquery'
    }
});

require([
    'entity',
    'hero',
    'land',
    'animation',
    'image-loader',
    'sprite',
    'game-manager'
], function ( Entity, Hero, Land, Animation, ImageLoader, Sprite, GameManager ) {
    var flyPath = 'img/fly.png',
        walkerPath = 'img/walker.png';

    var MyGame = GameManager.extend({
        gameReady: function () {
            var fly = new Hero( 100, 0 ),
                walker = new Hero( 0, 0 ),
                flySprite = new Sprite( flyPath ),
                walkerSprite = new Sprite( walkerPath ),
                canvas = document.createElement( 'canvas' ),
                ctx = canvas.getContext( '2d' );

            document.body.appendChild( canvas );

            walker.setAnimation( new Animation( walkerSprite, 8, walker.width, walker.height, 100 ) );
            fly.setAnimation( new Animation( flySprite, 2, 69, 32, 200 ) );

            canvas.width = 1500;
            canvas.height = 200;

            this.setContext( ctx );
            this.loadLevel( { entities: [ fly, walker ] } );

            this.start();
        }
    });

    var game = new MyGame( [ flyPath, walkerPath ] );
});
