define( 'animation', [ 'class', 'sprite' ], function ( Class, Sprite ) {
    return Class.extend({
        init: function ( animationObj ) {
            var path = 'sprites/' + animationObj.name,
                self = this;

            this.sprite = new Sprite( path );
            this.frameDelta = animationObj.delta;
            this.frames = animationObj.sprites;
            this.framesLoaded = 0;

            for ( var i = 0, len = this.frames.length; i < len; i++ ) {
                var frame = this.frames[i],
                    xOffset = 0 - frame[0],
                    yOffset = 0 - frame[1],
                    width = frame[2],
                    height = frame[3],
                    rotate = frame[4],
                    tempCanvas = document.createElement( 'canvas' ),
                    tempContext = tempCanvas.getContext( '2d' );

                tempCanvas.width = width;
                tempCanvas.height = height;

                if ( rotate ) {
                    tempContext.rotate(90*Math.PI / 180);
                    tempContext.drawImage( this.sprite, xOffset, yOffset - 32 );
                } else {
                    tempContext.drawImage( this.sprite, xOffset, yOffset );
                }

                frame.sprite = new Sprite( tempCanvas.toDataURL( 'image/png' ), function loaded() {
                    self.frameLoaded();
                });
            }
        },

        frameLoaded: function () {
            this.framesLoaded++;

            if ( this.framesLoaded >= this.frames.length ) {
                this.trigger( 'animation-loaded' );
            }
        },

        render: function ( ctx, x, y ) {
            var frame = this.currentFrame(),
                sprite = frame.sprite;
                width = frame[2],
                height = frame[3];

            if ( frame ) {
                ctx.save();
                ctx.beginPath();
                ctx.rect( x, y, width, height );
                ctx.clip();
                ctx.closePath();

                ctx.drawImage( sprite, x, y );
                ctx.restore();
            }
        },

        currentFrame: function () {
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
