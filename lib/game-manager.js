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
        },

        loadLevel: function ( level ) {
            this.currentLevel = level;
        },

        start: function () {
            var self = this;

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
                    invalidRight = this.invalidRect.right - invalidLeft,
                    invalidBottom = this.invalidRect.bottom - invalidTop,
                    invalidWidth = invalidRight - invalidLeft,
                    invalidHeight = invalidBottom - invalidTop;

                ctx.fillStyle = '#333';
                ctx.fillRect( 0, 0, 1500, 512 );

                //Save canvas context before setting clip
                ctx.save();
                ctx.beginPath();
                ctx.rect( invalidLeft, invalidTop, invalidWidth, invalidHeight );
                //Set the clip to the invalidRect's position/dimensions
                ctx.clip();
                ctx.closePath();
                ctx.fillStyle = this.background;
                ctx.fillRect( 0, 0, this.viewportWidth, this.viewportHeight );

                for ( var i = 0, len = entities.length; i < len; i++ ) {
                    entities[i].render( ctx );
                }

                ctx.restore();
                this.invalidRect = null;
            }
        },

        update: function () {
            // To be overridden
            this.invalidRect = { top: 0, left: 0, bottom: 512, right: 1500 };

            var entities = this.currentLevel.entities;

            for ( var i = 0, len = entities.length; i < len; i++ ) {
                entities[i].update();
            }
        }
    });
});
