define( 'bullet', [ 'entity' ],
function ( Entity ) {
    var Bullet = Entity.extend({
        type: 'Bullet',

        defaultState: 'horizontal',

        drawLayer: 1,

        init: function ( x, y, animations, sprite ) {
            this.states = {
                'horizontal': { animation: animations[ 'bullet-red-horizontal' ] },
                'vertical': { animation: animations[ 'bullet-red-veritcal' ] },
                'ne': { animation: animations[ 'bullet-red-ne' ] },
                'se': { animation: animations[ 'bullet-red-se' ] },
                'sw': { animation: animations[ 'bullet-red-sw' ] },
                'nw': { animation: animations[ 'bullet-red-nw' ] }
            };

            this._super( x, y, animations, sprite );

            this.width = 8;
            this.height = 8;
        }
    });

    Entity.Bullet = Bullet;

    return Bullet;
});
