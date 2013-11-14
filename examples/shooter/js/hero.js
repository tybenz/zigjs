define( 'hero', [ 'entity', 'vector', 'vector-utils', 'key-handler', 'mouse-handler', 'bullet', 'bang' ],
function ( Entity, Vector, VectorUtils, Keys, Mouse, Bullet, Bang ) {
    var Hero = Entity.extend({
        type: 'Hero',

        drawLayer: 2,

        defaultState: 'walking-right',

        walkingVelocity: VectorUtils.mph2ppf( 0.08 ),

        bulletVelocity: VectorUtils.mph2ppf( 0.2 ),

        init: function ( x , y, animations ) {
            this.initStates( animations );

            this._super( x, y, animations );

            this.allAnimations = animations;
            this.width = 32;
            this.height = 32;
        },

        initStates: function ( animations ) {
            this.states = {
                'walking-right': {
                    animation: animations[ 'astronaut-green-walking-right' ]
                },
                'walking-down': {
                    animation: animations[ 'astronaut-green-walking-down' ]
                },
                'walking-left': {
                    animation: animations[ 'astronaut-green-walking-left' ]
                },
                'walking-up': {
                    animation: animations[ 'astronaut-green-walking-up' ]
                },
                'standing-right': {
                    animation: animations[ 'astronaut-green-standing-right' ]
                },
                'standing-down': {
                    animation: animations[ 'astronaut-green-standing-down' ]
                },
                'standing-left': {
                    animation: animations[ 'astronaut-green-standing-left' ]
                },
                'standing-up': {
                    animation: animations[ 'astronaut-green-standing-up' ]
                }
            };
        },

        update: function ( timeDiff ) {
            var angle = Mouse.angle( this.pos.x + ( this.width / 2 ), this.pos.y + ( this.height / 2 ) ),
                changed = false;

            if ( angle >= -45 && angle < 45 ) {
                this.changeState( this.activeState.replace( /down|up|left|right/, 'right' ) );
                changed = true;
            }
            if ( angle >= 45 && angle < 135 ) {
                this.changeState( this.activeState.replace( /down|up|left|right/, 'down' ) );
                changed = true;
            }
            if ( angle >= 135 || angle < -135 ) {
                this.changeState( this.activeState.replace( /down|up|left|right/, 'left' ) );
                changed = true;
            }
            if ( angle >= -135 && angle < -45 ) {
                this.changeState( this.activeState.replace( /down|up|left|right/, 'up' ) );
                changed = true;
            }

            if ( Keys.isDown( 'S' ) ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.velocity.y = this.walkingVelocity;
            } else if ( Keys.isDown( 'W' ) ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.velocity.y = 0 - this.walkingVelocity;
            } else {
                this.velocity.y = 0;
            }

            if ( Keys.isDown( 'D' ) ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.velocity.x = this.walkingVelocity;
            } else if ( Keys.isDown( 'A' ) ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.velocity.x = 0 - this.walkingVelocity;
            } else {
                this.velocity.x = 0;
            }

            if ( !Keys.isDown( 'W' ) && !Keys.isDown( 'A' ) && !Keys.isDown( 'S' ) && !Keys.isDown( 'D' ) ) {
                switch ( this.activeState ) {
                    case 'walking-up':
                    case 'walking-left':
                    case 'walking-right':
                    case 'walking-down':
                        this.changeState( this.activeState.replace( /walking/, 'standing' ) );
                        break;
                    default: break;
                }
            }

            if ( Mouse.isDown( 'LEFT_MOUSE' ) ) {
                console.log('FIRE');
                Mouse.lock( 'LEFT_MOUSE', 500 );
                this.fire();
            }

            return changed;
        },

        setCrosshair: function ( crosshair ) {
            this.crosshair = crosshair;
        },

        fire: function () {
            var x = this.crosshair.pos.x + 16,
                y = this.crosshair.pos.y + 16,
                center = new Vector( this.pos.x + this.width / 2, this.pos.y + this.height / 2 ),
                crosshairPos = new Vector( x, y ),
                angle = VectorUtils.angle( center, crosshairPos ),
                bulletType,
                velocity;

            velocity = VectorUtils.angleMag2Vector( angle, this.bulletVelocity );

            if ( angle >= -22.5 && angle < 22.5 ) {
                bulletType = 'bullet-red-horizontal';
            }
            if ( angle >= 22.5 && angle < 67.5 ) {
                bulletType = 'bullet-red-se';
            }
            if ( angle >= 67.5 && angle < 112.5 ) {
                bulletType = 'bullet-red-vertical';
            }
            if ( angle >= 112.5 && angle < 157.5 ) {
                bulletType = 'bullet-red-sw';
            }
            if ( angle >= 157.5 || angle < -157.5 ) {
                bulletType = 'bullet-red-horizontal';
            }
            if ( angle >= -157.5 && angle < -112.5 ) {
                bulletType = 'bullet-red-nw';
            }
            if ( angle >= -112.5 && angle < -67.5 ) {
                bulletType = 'bullet-red-vertical';
            }
            if ( angle >= -67.5 && angle < -22.5 ) {
                bulletType = 'bullet-red-ne';
            }
            console.log(angle, bulletType);

            if ( this.activeState.indexOf( 'right' ) != -1 ) {
                x = this.pos.x + this.width;
                y = this.pos.y + 12;
            }

            if ( this.activeState.indexOf( 'left' ) != -1 ) {
                x = this.pos.x - 8;
                y = this.pos.y + 12;
            }

            if ( this.activeState.indexOf( 'up' ) != -1 ) {
                x = this.pos.x + 4;
                y = this.pos.y + 4;
            }

            if ( this.activeState.indexOf( 'down' ) != -1 ) {
                x = this.pos.x + this.width - 8;
                y = this.pos.y + 20;
            }

            // var bang = new Bang( x - 4, y - 4, this.allAnimations, undefined, this );
            var bullet = new Bullet( x, y, this.allAnimations, bulletType );

            bullet.velocity = velocity;

            this.trigger( 'entity-added', bullet );
            // this.trigger( 'entity-added', bang );
        }
    });

    Entity.Hero = Hero;

    return Hero;
});
