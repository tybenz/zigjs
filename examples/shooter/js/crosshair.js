define( 'crosshair', [ 'entity', 'mouse-handler' ],
function ( Entity, Mouse ) {
    var Crosshair = Entity.extend({
        type: 'Crosshair',

        defaultState: 'still',

        drawLayer: 4,

        init: function ( x, y, animations, sprite ) {
            this.states = {
                'still': { animation: animations[ 'crosshair' ] }
            };

            this._super( x, y, animations, sprite );

            this.width = 32;
            this.height = 32;
        },

        update: function ( timeDiff ) {
            var x = Math.round( ( Mouse.pos.x - 16 ) / 32 ) * 32,
                y = Math.round( ( Mouse.pos.y - 16 ) / 32 ) * 32;

            if ( x > ( 768 - 96 ) ) {
                x = 768 - 96;
            }

            if ( x < 64 ) {
                x = 64;
            }

            if ( y > 512 - 96 ) {
                y = 512 - 96;
            }

            if ( y < 64 ) {
                y = 64;
            }

            this.pos.x = x;

            this.pos.y = y;
        }
    });

    Entity.Crosshair = Crosshair;

    return Crosshair;
});
