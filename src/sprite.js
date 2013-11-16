define( function () {

    return function ( path, fn ) {
        var image = new Image();
        image.onload = function() {
            // Fire an event
        };
        image.onload = fn;
        image.src = path;
        return image;
    };

});
