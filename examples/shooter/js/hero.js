define( 'hero', [ 'entity', 'sprite-list', 'animation', 'key-handler' ],
function ( Entity, SpriteList, Animation, KeyHandler ) {
    return Entity.extend({
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
            if ( KeyHandler.keysDown[ 'S' ] ) {
                if ( this.activeState != 'walking-down' ) {
                    this.changeState( 'walking-down' );
                }
                this.y += 3;
            }
            if ( KeyHandler.keysDown[ 'W' ] ) {
                if ( this.activeState != 'walking-up' ) {
                    this.changeState( 'walking-up' );
                }
                this.y -= 3;
            }
            if ( KeyHandler.keysDown[ 'D' ] ) {
                if ( this.activeState != 'walking-right' ) {
                    this.changeState( 'walking-right' );
                }
                this.x += 3;
            }
            if ( KeyHandler.keysDown[ 'A' ] ) {
                if ( this.activeState != 'walking-left' ) {
                    this.changeState( 'walking-left' );
                }
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

            return false;
        }
    });
});
