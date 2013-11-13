define( 'hero', [ 'entity', 'sprite-list', 'animation', 'key-handler' ],
function ( Entity, SpriteList, Animation, KeyHandler ) {
    return Entity.extend({
        defaultState: 'walking-right',

        init: function ( x , y ) {
            this._super( x, y );

            this.width = 32;
            this.height = 32;
        },

        states: {
            'walking-right': {
                animation: new Animation( SpriteList[ 'astronaut-blue-walking-right' ] )
            },
            'walking-down': {
                animation: new Animation( SpriteList[ 'astronaut-blue-walking-down' ] )
            },
            'walking-left': {
                animation: new Animation( SpriteList[ 'astronaut-blue-walking-left' ] )
            },
            'walking-up': {
                animation: new Animation( SpriteList[ 'astronaut-blue-walking-up' ] )
            },
            'standing-right': {
                animation: new Animation( SpriteList[ 'astronaut-blue-standing-right' ] )
            },
            'standing-down': {
                animation: new Animation( SpriteList[ 'astronaut-blue-standing-down' ] )
            },
            'standing-left': {
                animation: new Animation( SpriteList[ 'astronaut-blue-standing-left' ] )
            },
            'standing-up': {
                animation: new Animation( SpriteList[ 'astronaut-blue-standing-up' ] )
            }
        },

        update: function () {

            if ( KeyHandler.keysDown[ 'D' ] ) {
                this.changeState( 'walking-right' );
                this.x += 2.5;
            } else if ( KeyHandler.keysDown[ 'A' ] ) {
                this.changeState( 'walking-left' );
                this.x -= 2.5;
            } else if ( KeyHandler.keysDown[ 'S' ] ) {
                this.changeState( 'walking-down' );
                this.y += 2.5;
            } else if ( KeyHandler.keysDown[ 'W' ] ) {
                this.changeState( 'walking-up' );
                this.y -= 2.5;
            } else {
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
        }
    });
});
