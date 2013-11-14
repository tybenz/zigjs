define( 'mouse-handler', {
    pos: {},

    init: function ( canvas ) {
        var self = this,
            $canvas = $( canvas ),
            lastUpdated = Date.now(),
            updateThreshold = 20;

        $canvas.on( 'mousemove', function ( evt ) {
            if ( Date.now() - lastUpdated >= updateThreshold ) {
                var offset = $canvas.offset();

                self.pos = {
                    x: evt.pageX - offset.left,
                    y: evt.pageY - offset.top
                };
                lastUpdated = Date.now();
            }
        });

        $canvas.on( 'mousedown', function ( evt ) {
            self.buttonsDown[ self.buttonsByCode[ evt.which ] ] = true;
        });

        $canvas.on( 'mouseup', function ( evt ) {
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
