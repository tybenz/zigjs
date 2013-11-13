define( 'land', [ 'entity', 'sprite-list', 'animation', 'key-handler' ],
function ( Entity, SpriteList, Animation, KeyHandler ) {
    return Entity.extend({
        defaultState: 'still',

        states: {
            still: { animation: null }
        },

        init: function ( x, y, animations, sprite ) {
            this._super( x, y );

            this.width = 32;
            this.height = 32;

            this.animation = animations[ sprite ];
        }
    });
});
