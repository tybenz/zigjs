define( 'entity', [ 'class', 'vector', 'sprite', 'animation' ], function( Class, Vector, Sprite ) {
    return Class.extend({
        type: 'Entity',

        height: 10,

        width: 10,

        init: function ( x, y ) {
            this.x = x;
            this.y = y;

            this.changeState( this.defaultState );
        },

        changeState: function ( newState ) {
            this.activeState = newState;
            this.animation = this.states[ newState ].animation;
            this.trigger( 'invalidate-rect', { x: this.x, y: this.y, width: this.width, height: this.height } );
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
