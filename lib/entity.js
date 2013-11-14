define( 'entity', [ 'class', 'vector', 'sprite', 'animation' ], function( Class, Vector, Sprite ) {
    var Entity = Class.extend({
        type: 'Entity',

        drawLayer: 0,

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
        },

        _update: function ( timeDiff ) {
            var oldX = this.x,
                oldY = this.y,
                changed = this.update( timeDiff );

            changed = changed || ( this.x != oldX || this.y != oldY );

            this.oldX = oldX;
            this.oldY = oldY;

            if ( changed ) {
                this.invalidateRect( 0 - 32, 0 + 32, 0 + 32, 0 - 32 );
            }
        },

        // To be overridden
        update: function ( timeDiff ) {
            return false;
        },

        invalidateRect: function( offsetTop, offsetRight, offsetBottom, offsetLeft ) {
            // optional
            offsetTop = offsetTop || 0;
            offsetRight = offsetRight || 0;
            offsetBottom = offsetBottom || 0;
            offsetLeft = offsetLeft || 0;

            var newX = this.x,
                newY = this.y,
                oldX = this.oldX,
                oldY = this.oldY,
                width = this.width,
                height = this.height,
                top = oldY <= newY ? oldY + offsetTop : newY + offsetTop,
                left = oldX <= newX ? oldX + offsetLeft : newX + offsetLeft,
                bottom = ( oldY + height ) >= ( newY + height ) ? oldY + height + offsetBottom : newY + height + offsetBottom,
                right = ( oldX + width ) >= ( newX + width ) ? oldX + width + offsetRight : newX + width + offsetRight;

            //Pass a rect (position/dimensions) to the global invalidRect
            this.trigger( 'invalidate-rect', { top: top, right: right, bottom: bottom, left: left } );
        },
    });

    return Entity;
});
