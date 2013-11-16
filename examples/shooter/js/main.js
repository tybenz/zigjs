require.config({
    urlArgs: "bust=" + Date.now(),
    paths: {
        'class': '../../../src/class',
        'vector': '../../../src/vector',
        'vector-utils': '../../../src/vector-utils',
        'sprite': '../../../src/sprite',
        'entity': '../../../src/entity',
        'level': '../../../src/level',
        'animation': '../../../src/animation',
        'image-loader': '../../../src/image-loader',
        'game-manager': '../../../src/game-manager',
        'key-handler': '../../../src/key-handler',
        'mouse-handler': '../../../src/mouse-handler',
        'collider': '../../../src/collider',
        'jquery': '../../../bower_components/jquery/jquery'
    }
});

require([
    'entity',
    'level',
    'animation',
    'image-loader',
    'sprite',
    'sprite-list',
    'game-manager',
    'hero',
    'wall',
    'floor',
    'crosshair'
], function ( Entity, Level, Animation, ImageLoader, Sprite, spriteList, GameManager, Hero, Wall, Floor, Crosshair ) {
    var MyGame = GameManager.extend({
        gameReady: function ( game, animations ) {
            var canvas = document.createElement( 'canvas' ),
                level = new Level([
                    'blank*16',
                    'blank*1|wall{wall-white-corner-tl}*1|wall{wall-white-horizontal-normal}*20|wall{wall-white-corner-tr}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|hero,floor{floor-lightblue}(20x12)*1|blank*19|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|blank*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-corner-bl}*1|wall{wall-white-horizontal-normal}*20|wall{wall-white-corner-br}*1|blank*1',
                    'blank*16'
                ]);

            canvas.width = 768;
            canvas.height = 512;

            var ctx = canvas.getContext( '2d' ),
                crosshair = new Crosshair( 0, 0, animations );

            document.body.appendChild( canvas );

            game.setContext( ctx );
            game.loadLevel( level, animations );

            var entities = game.currentLevel.entities,
                hero;

            for ( var i = 0, len = entities.length; i < len; i++ ) {
                if ( entities[i].type == 'Hero' ) {
                    hero = entities[i];
                    break;
                }
            }
            hero.setCrosshair( crosshair );

            game.currentLevel.addEntity( crosshair );

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
