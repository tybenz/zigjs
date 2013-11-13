define( 'game-manager', [ 'class', 'entity', 'sprite', 'image-loader', 'key-handler' ],
function ( Class, Entity, Sprite, ImageLoader, KeyHandler ) {
    return Class.extend({
        init: function ( assets, options ) {
            var self = this;

            this.loader = new ImageLoader();
            this.loader.add( assets );
            this.loader.bind( 'image-loader-empty', function () {
                KeyHandler.init();
                self.gameReady( self );
            });
            this.loader.start();
        },

        gameReady: function ( game ) {
            // To be overridden by derived class
        },

        setContext: function ( ctx ) {
            this.ctx = ctx;
            this.viewportWidth = this.ctx.canvas.width;
            this.viewportHeight = this.ctx.canvas.height;
        },

        loadLevel: function ( level ) {
            this.currentLevel = level;
        },

        start: function () {
            var self = this,
                entities = this.currentLevel.entities,
                handleInvalidateRect = function ( evt, data ) {
                    self.invalidateRect( data );
                };

            this.invalidRect = { top: 0, left: 0, bottom: self.viewportHeight, right: self.viewportWidth };

            for ( var i = 0, len = entities.length; i < len; i++  ) {
                var entity = entities[i];
                entity.bind( 'invalidate-rect', handleInvalidateRect );
            }

            requestAnimationFrame( function () {
                self.loop();
            });
        },

        loop: function () {
            var self = this;

            this.update();

            this.render();

            requestAnimationFrame( function () {
                self.loop();
            });
        },

        render: function () {
            var invalidRect = this.invalidRect;

            if ( invalidRect ) {
                var ctx = this.ctx,
                    entities = this.currentLevel.entities,
                    invalidLeft = this.invalidRect.left,
                    invalidTop = this.invalidRect.top,
                    invalidWidth = this.invalidRect.right - invalidLeft,
                    invalidHeight = this.invalidRect.bottom - invalidTop;

                ctx.fillStyle = '#333';
                ctx.fillRect( 0, 0, this.viewportWidth, this.viewportHeight );

                //Save canvas context before setting clip
                ctx.save();
                ctx.beginPath();
                ctx.rect( invalidLeft, invalidTop, invalidWidth, invalidHeight );
                //Set the clip to the invalidRect's position/dimensions
                ctx.clip();
                ctx.closePath();

                for ( var i = 0, len = entities.length; i < len; i++ ) {
                    entities[i].render( ctx );
                }

                ctx.restore();
                this.invalidRect = null;
            }
        },

        update: function () {
            // To be overridden

            var entities = this.currentLevel.entities;

            for ( var i = 0, len = entities.length; i < len; i++ ) {
                entities[i].update();
            }
        },

        invalidateRect: function( data ) {
            var left = data.x,
                top = data.y,
                right = left + data.width,
                bottom = top + data.height;

            if ( !this.invalidRect ) {
                this.invalidRect = { top: top, right: right, bottom: bottom, left: left };
                return;
            }
            var invalidTop = this.invalidRect.top,
                invalidBottom = this.invalidRect.bottom,
                invalidLeft = this.invalidRect.left,
                invalidRight = this.invalidRect.right;

            if ( invalidTop > top ) {
                this.invalidRect.top = top;
            }
            if ( invalidBottom < bottom ) {
                this.invalidRect.bottom = bottom;
            }
            if ( invalidLeft > left ) {
                this.invalidRect.left = left;
            }
            if ( invalidRight < right ) {
                this.invalidRect.right = right;
            }
        }
    });
});
