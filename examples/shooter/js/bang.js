define( 'bang', [ 'entity' ],
function ( Entity ) {
    var Bang = Entity.extend({
        type: 'Bang',

        defaultState: 'red',

        drawLayer: 3,

        init: function ( x, y, animations, sprite, hero ) {
            this.states = {
                'red': { animation: animations[ 'bang-red' ] }
            };

            this._super( x, y, animations, sprite );

            this.width = 12;
            this.height = 12;
            this.hero = hero;
            this.lifeSpan = 0.03 * 1000;
            this.created = Date.now();
            this.duration = Date.now();
        },

        update: function ( timeDiff ) {
            this.duration += timeDiff;

            if ( this.duration - this.created >= this.lifeSpan ) {
                this.trigger( 'destroy-entity', this );
                return true;
            }

            var hero = this.hero;


            return false;
        },
    });

    Entity.Bang = Bang;

    return Bang;
});
