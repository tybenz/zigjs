define( 'key-handler', {
    init: function () {
        var self = this;

        $( document ).on( 'keydown', function ( evt ) {
            self.keysDown[ self.keysByCode[ evt.keyCode ] ] = true;
        });

        $( document ).on( 'keyup', function ( evt ) {
            delete self.keysDown[ self.keysByCode[ evt.keyCode ] ];
        });
    },

    keysDown: {},

    keysByValue: {
        'W': 87,
        'A': 65,
        'S': 83,
        'D': 68,
        'SPACE': 32,
        'ENTER': 13,
        'LEFT': 37,
        'TOP': 38,
        'RIGHT': 39,
        'BOTTOM': 40
    },

    keysByCode: {
        87: 'W',
        65: 'A',
        83: 'S',
        68: 'D',
        32: 'SPACE',
        13: 'ENTER',
        37: 'LEFT',
        38: 'TOP',
        39: 'RIGHT',
        40: 'BOTTOM'
    }
});
