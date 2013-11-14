define( 'wall', [ 'entity', 'sprite-list', 'animation', 'key-handler' ],
function ( Entity, SpriteList, Animation, KeyHandler ) {
    var Wall = Entity.extend({
        defaultState: 'still',

        states: {
            still: { animation: null }
        },

        init: function ( x, y, animations, sprite ) {
            this._super( x, y, animations, sprite );

            this.width = 32;
            this.height = 32;
        }
    });

    Entity.Wall = Wall;

    return Wall;
});
