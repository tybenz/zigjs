define([
    'class',
    'vector',
    'sprite',
    'animation'
], function( Class, Vector, Sprite ) {
    return Class.extend({
        type: 'Entity',
        height: 10,
        width: 10,
        getSprite: function() {
            if ( this.animation ) {
                return this.animation.currentFrame();
            }
        },
    });
});
