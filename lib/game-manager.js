define( 'game-manager', [ 'class', 'entity', 'sprite', 'animation', 'image-loader', 'key-handler' ],
function ( Class, Entity, Sprite, Animation, ImageLoader, KeyHandler ) {
    return Class.extend({
        init: function ( assets, spriteList, options ) {
            KeyHandler.init();

            var self = this;

            this.loader = new ImageLoader();
            this.loader.add( assets );
            this.loader.bind( 'image-loader-empty', function () {
                self.loadAnimations( spriteList );
            });
            this.loader.start();
        },

        loadAnimations: function ( spriteList ) {
            var totalAnimations = 0;
            for ( var i in spriteList ) { totalAnimations++; }

            var animations = {},
                self = this,
                loaded = 0,
                animationLoaded = function () {
                    loaded++;

                    if ( loaded >= totalAnimations ) {
                        self.gameReady( self, animations );
                    }
                };

            for ( var i  in spriteList ) {
                animations[ i ] = new Animation( spriteList[i] );
                animations[ i ].bind( 'animation-loaded', animationLoaded );
            }
        },

        gameReady: function ( game ) {
            // To be overridden by derived class
        },

        setContext: function ( ctx ) {
            this.ctx = ctx;
            this.viewportWidth = this.ctx.canvas.width;
            this.viewportHeight = this.ctx.canvas.height;
        },

        loadLevel: function ( level, animations ) {
            level.load( animations );
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
                    drawLayers = this.currentLevel.drawLayers,
                    invalidLeft = this.invalidRect.left,
                    invalidTop = this.invalidRect.top,
                    invalidWidth = this.invalidRect.right - invalidLeft,
                    invalidHeight = this.invalidRect.bottom - invalidTop;


                //Save canvas context before setting clip
                ctx.imageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.save();
                ctx.beginPath();
                ctx.rect( invalidLeft, invalidTop, invalidWidth, invalidHeight );
                //Set the clip to the invalidRect's position/dimensions
                ctx.clip();
                ctx.closePath();

                ctx.fillStyle = '#111';
                ctx.fillRect( 0, 0, this.viewportWidth, this.viewportHeight );

                for ( var i = 0, l1 = drawLayers.length; i < l1; i++ ) {
                    for ( var j = 0, l2 = drawLayers[i].length; j < l2; j++ ) {
                        drawLayers[i][j].render( ctx );
                    }
                }

                ctx.restore();
                this.invalidRect = null;
            }
        },

        update: function () {
            // To be overridden

            var entities = this.currentLevel.entities;

            for ( var i = 0, len = entities.length; i < len; i++ ) {
                entities[i]._update();
            }
        },

        invalidateRect: function( data ) {
            var left = data.left,
                top = data.top,
                right = data.right,
                bottom = data.bottom;

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
