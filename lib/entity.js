define( 'entity', [ 'class', 'vector', 'sprite', 'animation' ], function( Class, Vector, Sprite ) {
    var Entity = Class.extend({
        type: 'Entity',

        drawLayer: 0,

        init: function ( x, y, animations, sprite ) {
            this.pos = new Vector( x, y );
            this.oldPos = new Vector( x, y );
            this.velocity = new Vector( 0, 0 );
            this.width = 10;
            this.height = 10;

            if ( animations && sprite ) {
                this.animation = animations[ sprite ];
            } else {
                this.changeState( this.defaultState );
            }
        },

        changeState: function ( newState ) {
            this.activeState = newState;
            this.animation = this.states[ newState ].animation;
        },

        render: function ( ctx ) {
            if ( this.animation ) {
                this.animation.render( ctx, this.pos.x, this.pos.y );
            }
        },

        setAnimation: function ( animation ) {
            if ( animation ) {
                this.animation = animation;
            }
        },

        _update: function ( timeDiff ) {
            var oldX = this.pos.x,
                oldY = this.pos.y,
                changed = this.update( timeDiff );

            // Change position based on velocity
            var positionChange = this.velocity.multiply( timeDiff );
            this.pos = this.pos.add( positionChange );

            changed = changed || ( this.pos.x != oldX || this.pos.y != oldY );

            this.oldPos = new Vector( oldX, oldY );

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

            var newX = this.pos.x,
                newY = this.pos.y,
                oldX = this.oldPos.x,
                oldY = this.oldPos.y,
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
