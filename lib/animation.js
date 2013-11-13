define( 'animation', [ 'class', 'sprite' ], function ( Class, Sprite ) {
    return Class.extend({
        init: function ( animationObj ) {
            var path = 'sprites/' + animationObj.name;
            this.sprite = new Sprite( path );
            this.frameDelta = animationObj.delta;
            this.frames = animationObj.sprites;
        },

        render: function( ctx, x, y ) {
            var frame = this.currentFrame(),
                xOffset = 0 - frame[0],
                yOffset = 0 - frame[1],
                width = frame[2],
                height = frame[3];

            if ( frame ) {
                ctx.save();
                ctx.beginPath();
                ctx.rect( x, y, width, height );
                ctx.clip();
                ctx.closePath();

                ctx.drawImage( this.sprite, x + xOffset, y + yOffset );
                ctx.restore();
            }
        },

        currentFrame: function() {
            this.currentFrameIndex = this.currentFrameIndex || 0;
            this.lastFrame = this.lastFrame || Date.now();

            var next = ( this.currentFrameIndex + 1 ) % this.frames.length,
                frame = this.frames[ this.currentFrameIndex ];

            if ( this.frames[ next ] && ( Date.now() - this.lastFrame > this.frameDelta ) ) {
                current = next;
                frame = this.frames[ current ];
                this.currentFrameIndex = current;
                this.lastFrame = Date.now();
            }

            return frame ? frame : null;
        }
    });
});
