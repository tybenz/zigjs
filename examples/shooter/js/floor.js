define( 'floor', [ 'entity', 'sprite-list', 'animation', 'key-handler' ],
function ( Entity ) {
    var Floor = Entity.extend({
        type: 'Floor',

        defaultState: 'still',

        states: {
            still: { animation: null }
        },

        init: function ( x, y, animations, sprite ) {
            this._super( x, y, animations, sprite );

            this.width = 32;
            this.height = 32;
        },

        render: function ( ctx ) {
            if ( this.animation && this.animation.currentFrame ) {
                var img = this.animation.currentFrame().sprite,
                    pattern = ctx.createPattern( img, 'repeat' );

                ctx.save();
                ctx.beginPath();
                ctx.rect( this.pos.x, this.pos.y, this.width, this.height );
                ctx.closePath();

                ctx.fillStyle = pattern;
                ctx.fill();

                ctx.restore();
            }
        }
    });

    Entity.Floor = Floor;

    return Floor;
});
