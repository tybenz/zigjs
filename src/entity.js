define( 'entity', [ 'class', 'vector', 'vector-utils', 'sprite', 'animation' ], function( Class, Vector, VectorUtils, Sprite, Animation ) {
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

        //Two entities -> collision object or false if no collision
        getCollisions: function( entity, self ) {
            self = self || this;
            var src = {
                    top: Math.round( self.pos.y ),
                    bottom: Math.round( self.pos.y + self.height ),
                    left: Math.round( self.pos.x ),
                    right: Math.round( self.pos.x + self.width ),
                    oldTop: Math.round( self.oldPos.y ),
                    oldBototm: Math.round( self.oldPos.y + self.height ),
                    oldLeft: Math.round( self.oldPos.x ),
                    oldRight: Math.round( self.oldPos.x + self.width ),
                    oldCenter: {
                        x: Math.round ( self.oldPos.x + ( self.width / 2 ) ),
                        y: Math.round ( self.oldPos.y + ( self.height / 2 ) ),
                    },
                    center: {
                        x: Math.round ( self.pos.x + ( self.width / 2 ) ),
                        y: Math.round ( self.pos.y + ( self.height / 2 ) ),
                    }
                },
                target = {
                    top: Math.round( entity.pos.y ),
                    bottom: Math.round( entity.pos.y + entity.height ),
                    left: Math.round( entity.pos.x ),
                    right: Math.round( entity.pos.x + entity.width ),
                    oldTop: Math.round( entity.oldPos.y ),
                    oldBototm: Math.round( entity.oldPos.y + entity.height ),
                    oldLeft: Math.round( entity.oldPos.x ),
                    oldRight: Math.round( entity.oldPos.x + entity.width ),
                    oldCenter: {
                        x: Math.round ( entity.oldPos.x + ( entity.width / 2 ) ),
                        y: Math.round ( entity.oldPos.y + ( entity.height / 2 ) ),
                    },
                    center: {
                        x: Math.round ( entity.pos.x + ( entity.width / 2 ) ),
                        y: Math.round ( entity.pos.y + ( entity.height / 2 ) ),
                    }
                },

                betweenLeftAndRight = ( src.left < target.right && src.left > target.left ) ||
                    ( src.right < target.right && src.right > target.left ),
                betweenTopAndBottom = ( src.top < target.bottom && src.top > target.top ) ||
                    ( src.bottom < target.bottom && src.bottom > target.top ),
                leftAligned = src.left == target.left,
                rightAligned = src.right == target.right,
                leftAndRightAligned = ( leftAligned && rightAligned ),
                topAligned = src.top == target.top,
                bottomAligned = src.bottom == target.bottom,
                topAndBottomAligned = ( topAligned && bottomAligned ),

                movingRight = src.oldRight < src.right,
                movingLeft = src.oldLeft > src.left,
                movingUp = src.oldTop > src.top,
                movingDown = src.oldBottom < src.bottom,

                intersection = VectorUtils.checkIntersection( src.oldCenter, src.center, target.oldCenter, target.center ),

                skipRight = ( betweenTopAndBottom || topAndBottomAligned ) && src.right < target.left && 
                    ( src.left > target.oldRight || src.right >= target.oldLeft ),
                skipLeft = ( betweenTopAndBottom || topAndBottomAligned ) && src.left > target.right && 
                    ( src.right < target.oldLeft || src.left <= target.oldRight ),
                skipDown = ( betweenLeftAndRight || leftAndRightAligned ) && src.bottom < target.top && 
                    ( src.top > target.oldBottom || src.bottom >= target.oldTop ),
                skipUp = ( betweenLeftAndRight || leftAndRightAligned ) && src.top > target.bottom && 
                    ( src.bottom < target.oldTop || src.top <= target.oldBottom ),

                // The problem with only allowing collisions when self is moving, is that what happens when
                // self is NOT moving and it gets hit? The offending entity must be able to handle 
                // the behavior of self too!
                collisions = {
                    exact: leftAndRightAligned && topAndBottomAligned,
                    almostExact: leftAligned && topAndBottomAligned || rightAligned && topAndBottomAligned ||
                        topAligned && leftAndRightAligned || bottomAligned && leftAndRightAligned,
                    overlapping: ( betweenTopAndBottom || topAligned || bottomAligned ) && ( betweenLeftAndRight || leftAligned || rightAligned ),
                    overlappingVertical: leftAndRightAligned && ( betweenTopAndBottom || skipDown || skipUp ),
                    overlappingHorizontal: topAndBottomAligned && ( betweenLeftAndRight || skipRight || skipLeft )
                };

            if ( !intersection && self.oldPos.x == self.pos.x && self.oldPos.y == self.pos.y ) {
                if ( target.oldTop <= target.top ) {
                    intersection = VectorUtils.checkIntersection( { x: self.pos.x, y: self.pos.y },
                            { x: self.pos.x + self.width, y: self.pos.y + self.height },
                            target.oldCenter, target.center );
                } else {
                    intersection = VectorUtils.checkIntersection( { x: self.pos.x + self.width, y: self.pos.y },
                            { x: self.pos.x, y: self.pos.y + self.height },
                            target.oldCenter, target.center );
                }

                if ( !collisions.overlapping ) {
                    collisions.overlapping = ( betweenTopAndBottom && betweenLeftAndRight ) || intersection
                }
            }

            // If there are any collisions we build an object of only those that are true
            // If none, we return false
            var returnCollisions = {},
                count = 0;
            for ( var i in collisions ) {
                if ( collisions[i] ) {
                    returnCollisions.entity = entity;
                    returnCollisions[i] = collisions[i];
                    count++;
                }
            }
            if ( count ) {
                return returnCollisions;
            }

            return false;
        },

        collideWith: function ( entity, collisions ) {
        }
    });

    return Entity;
});
