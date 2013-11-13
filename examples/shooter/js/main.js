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
    'sprite-list',
    'game-manager',
    'hero',
    'land'
], function ( Entity, Animation, ImageLoader, Sprite, spriteList, GameManager, Hero, Land ) {
    var MyGame = GameManager.extend({
        gameReady: function ( game, animations ) {
            var canvas = document.createElement( 'canvas' );

            var entities = [
                new Land( 32, 32, animations, 'wall-white-corner-tl' ),
                new Land( 64, 32, animations, 'wall-white-horizontal-normal' ),
                new Land( 96, 32, animations, 'wall-white-horizontal-normal' ),
                new Land( 128, 32, animations, 'wall-white-horizontal-normal' ),
                new Land( 160, 32, animations, 'wall-white-corner-tr' ),
                new Land( 32, 64, animations, 'wall-white-vertical-normal' ),
                new Land( 160, 64, animations, 'wall-white-vertical-normal' ),
                new Land( 32, 96, animations, 'wall-white-vertical-normal' ),
                new Land( 160, 96, animations, 'wall-white-vertical-normal' ),
                new Land( 32, 128, animations, 'wall-white-corner-bl' ),
                new Land( 64, 128, animations, 'wall-white-corner-tr' ),
                new Land( 128, 128, animations, 'wall-white-corner-tl' ),
                new Land( 160, 128, animations, 'wall-white-corner-br' ),
                new Land( 64, 64, animations, 'floor-lightblue' ),
                new Land( 96, 64, animations, 'floor-lightblue' ),
                new Land( 128, 64, animations, 'floor-lightblue' ),
                new Land( 64, 96, animations, 'floor-lightblue' ),
                new Land( 96, 96, animations, 'floor-lightblue' ),
                new Land( 128, 96, animations, 'floor-lightblue' ),
                new Land( 96, 128, animations, 'floor-lightblue' ),
                new Land( 96, 160, animations, 'floor-lightblue' ),
                new Land( 96, 192, animations, 'floor-lightblue' ),
                new Land( 64, 160, animations, 'wall-white-vertical-normal' ),
                new Land( 128, 160, animations, 'wall-white-vertical-normal' ),
                new Land( 64, 192, animations, 'wall-white-vertical-normal' ),
                new Land( 128, 192, animations, 'wall-white-vertical-normal' ),
                new Hero( 64, 64, animations )
            ];

            canvas.width = 1000;
            canvas.height = 512;

            var ctx = canvas.getContext( '2d' );

            document.body.appendChild( canvas );

            game.setContext( ctx );
            game.loadLevel( { entities: entities } );
            game.start();
        }
    });

    var game = new MyGame([
        'sprites/alien-ships.png',
        'sprites/aliens.png',
        'sprites/floor.png',
        'sprites/human-ships.png',
        'sprites/humans.png',
        'sprites/misc.png',
        'sprites/special-floor.png',
        'sprites/walls.png',
        'sprites/weapons-items.png'
    ], spriteList );
});
