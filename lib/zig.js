define( 'zig', [
    'entity',
    'level',
    'animation',
    'image-loader',
    'sprite',
    'game-manager',
], function ( Entity, Level, Animation, ImageLoader, Sprite, GameManager ) {
    var Zig = {
      Entity: Entity,

      Level: Level,

      Animation: Animation,

      ImageLoader: ImageLoader,

      Sprite: Sprite,

      GameManager: GameManager
    };

    return Zig;
});
