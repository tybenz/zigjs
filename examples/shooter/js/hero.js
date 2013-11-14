define( 'hero', [ 'entity', 'key-handler', 'mouse-handler' ],
function ( Entity, KeyHandler, MouseHandler ) {
    var Hero = Entity.extend({
        type: 'Hero',

        drawLayer: 1,

        defaultState: 'walking-right',

        init: function ( x , y, animations ) {
            this.initStates( animations );

            this._super( x, y, animations );

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

        update: function () {
            var angle = MouseHandler.angle( this.x, this.y ),
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

            if ( KeyHandler.keysDown[ 'S' ] ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.y += 3;
            }
            if ( KeyHandler.keysDown[ 'W' ] ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.y -= 3;
            }
            if ( KeyHandler.keysDown[ 'D' ] ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.x += 3;
            }
            if ( KeyHandler.keysDown[ 'A' ] ) {
                this.changeState( this.activeState.replace( /standing/, 'walking' ) );
                this.x -= 3;
            }
            if ( !KeyHandler.keysDown[ 'W' ] && !KeyHandler.keysDown[ 'A' ] && !KeyHandler.keysDown[ 'S' ] && !KeyHandler.keysDown[ 'D' ] ) {
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

            if ( MouseHandler.isDown( 'LEFT_MOUSE' ) ) {
                console.log('FIRE');
                MouseHandler.lock( 'LEFT_MOUSE', 500 );
            }

            return changed;
        }
    });

    Entity.Hero = Hero;

    return Hero;
});
