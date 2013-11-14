define( 'mouse-handler', {
    pos: {},

    init: function () {
        var self = this;

        $( document ).on( 'mousemove', function ( evt ) {
            self.pos = {
                x: evt.pageX,
                y: evt.pageY
            };
        });

        $( document ).on( 'mousedown', function ( evt ) {
            self.buttonsDown[ self.buttonsByCode[ evt.which ] ] = true;
        });

        $( document ).on( 'mouseup', function ( evt ) {
            delete self.buttonsDown[ self.buttonsByCode[ evt.which ] ];
        });
    },

    lock: function ( button, time ) {
        var self = this;

        this.buttonsDown[ button ] = 'locked';

        setTimeout( function () {
            delete self.buttonsDown[ button ];
        }, time );
    },

    isDown: function ( button, ignoreLock ) {
        if ( ignoreLock ) {
            return this.buttonsDown[ button ];
        } else {
            return this.buttonsDown[ button ] && this.buttonsDown[ button ] != 'locked';
        }
    },

    angle: function ( x, y ) {
        x = $( 'canvas' ).offset().left + x;
        y = $( 'canvas' ).offset().top + y;

        var dy = this.pos.y - y,
            dx = this.pos.x - x,
            theta = Math.atan2( dy, dx );

        return theta * ( 180 / Math.PI );
    },

    buttonsDown: {},

    buttonsByCode: {
        1: 'LEFT_MOUSE',
        2: 'RIGHT_MOUSE'
    },

    buttonsByValue: {
        'LEFT_MOUSE': 1,
        'RIGHT_MOUSE': 2
    }
});
