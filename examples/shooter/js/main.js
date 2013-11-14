require.config({
    urlArgs: "bust=" + Date.now(),
    paths: {
        'class': '../../../lib/class',
        'vector': '../../../lib/vector',
        'sprite': '../../../lib/sprite',
        'entity': '../../../lib/entity',
        'level': '../../../lib/level',
        'animation': '../../../lib/animation',
        'image-loader': '../../../lib/image-loader',
        'game-manager': '../../../lib/game-manager',
        'key-handler': '../../../lib/key-handler',
        'mouse-handler': '../../../lib/mouse-handler',
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
    'floor'
], function ( Entity, Level, Animation, ImageLoader, Sprite, spriteList, GameManager, Hero, Wall, Floor ) {
    var MyGame = GameManager.extend({
        gameReady: function ( game, animations ) {
            var canvas = document.createElement( 'canvas' ),
                level = new Level([
                    'blank*16',
                    'blank*1|wall{wall-white-corner-tl}*1|wall{wall-white-horizontal-normal}*20|wall{wall-white-corner-tr}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|hero,floor{floor-lightblue}*1|floor{floor-lightblue}*19|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*19|floor{floor-lightblue},floor{floor-stairs-right}*1|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-vertical-normal}*1|floor{floor-lightblue}*20|wall{wall-white-vertical-normal}*1|blank*1',
                    'blank*1|wall{wall-white-corner-bl}*1|wall{wall-white-horizontal-normal}*20|wall{wall-white-corner-br}*1|blank*1',
                    'blank*16'
                ]);

            canvas.width = 768;
            canvas.height = 512;

            var ctx = canvas.getContext( '2d' );

            document.body.appendChild( canvas );

            game.setContext( ctx );
            game.loadLevel( level, animations );
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
