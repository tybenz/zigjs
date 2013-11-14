define( 'floor', [ 'entity', 'sprite-list', 'animation', 'key-handler' ],
function ( Entity ) {
    var Floor = Entity.extend({
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

    Entity.Floor = Floor;

    return Floor;
});
