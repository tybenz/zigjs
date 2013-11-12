define( 'entity', [ 'class', 'vector', 'sprite', 'animation' ], function( Class, Vector, Sprite ) {
    return Class.extend({
        type: 'Entity',

        height: 10,

        width: 10,

        init: function ( x, y ) {
            this.x = x;
            this.y = y;
        },

        render: function ( ctx ) {
            if ( this.animation ) {
                this.animation.render( ctx, this.x, this.y );
            }
        },

        setAnimation: function ( animation ) {
            if ( animation ) {
                this.animation = animation;
            }
        }
    });
});
