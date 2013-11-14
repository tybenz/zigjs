define( 'bullet', [ 'entity' ],
function ( Entity ) {
    var Bullet = Entity.extend({
        type: 'Bullet',

        defaultState: 'horizontal',

        drawLayer: 1,

        init: function ( x, y, animations, sprite ) {
            this.states = {
                'horizontal': { animation: animations[ 'bullet-horizontal-red' ] },
                'vertical': { animation: animations[ 'bullet-vertical-red' ] },
                'ne': { animation: animations[ 'bullet-ne-red' ] },
                'se': { animation: animations[ 'bullet-se-red' ] },
                'sw': { animation: animations[ 'bullet-sw-red' ] },
                'nw': { animation: animations[ 'bullet-nw-red' ] }
            };

            this._super( x, y, animations, sprite );

            this.width = 8;
            this.height = 8;
        }
    });

    Entity.Bullet = Bullet;

    return Bullet;
});
