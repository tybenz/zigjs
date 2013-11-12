define( 'animation', [ 'class' ], function ( Class ) {
    return Class.extend({
        init: function( img, totalFrames, spriteWidth, spriteHeight, frameDelta ) {
            this.frames = [];
            this.totalFrames = totalFrames;
            this.frameDelta = frameDelta;
            this.spriteWidth = spriteWidth;
            this.spriteHeight = spriteHeight;
            this.img = img;

            var sheetWidth = img.width,
                sheetHeight = img.height,
                frameCount = 0;

            for ( var i = 0; i < sheetHeight; i += spriteHeight ) {
                for ( var j = 0; j < sheetWidth; j += spriteWidth ) {
                    if ( frameCount < totalFrames ) {
                        this.frames.push( { xOffset: 0 - j, yOffset: 0 - i } );
                        frameCount++;
                    }
                }
            }
        },

        render: function( ctx, x, y ) {
            var frame = this.currentFrame();

            if ( frame ) {
                ctx.save();
                ctx.beginPath();
                ctx.rect( x, y, this.spriteWidth, this.spriteHeight );
                ctx.clip();
                ctx.closePath();

                ctx.drawImage( this.img, x + frame.xOffset, y + frame.yOffset );
                ctx.restore();
            }
        },

        currentFrame: function() {
            this.currentFrameIndex = this.currentFrameIndex || 0;
            this.lastFrame = this.lastFrame || Date.now();

            var next = ( this.currentFrameIndex + 1 ) % this.totalFrames,
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
