define( 'wall', [ 'entity' ],
function ( Entity ) {
    var Wall = Entity.extend({
        type: 'Wall',

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
