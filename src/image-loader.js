define( 'image-loader', [ 'jquery', 'class' ], function ( $, Class ) {
    // Each request is assigned a request id to provide a stable sort.
    var nextRequestId = 1;

    return Class.extend({
        init: function( options ) {
            var self = this;

            this.options = $.extend( {}, this.defaultOptions, options );
            this._currentEntry = null;
            this._queue = [];
            this._needsSort = false;
            this._isRunning = false;

            this._loader = new Image();
            this._loadFunc = function() { self._handleLoad(); };
            this._loadErrorFunc = function() { self._handleError(); };
            this._timeoutFunc = function() {
                self.trigger( "image-loader-timeout", this._currentEntry );
                self._loadNext();
            };
        },

        bind: function( name, callback, data ) {
            return $( this ).on( name, callback, data );
        },

        unbind: function( name, callback ) {
            return $( this ).unbind( name, callback );
        },

        trigger: function( name, data ) {
            // We want to give the caller access to the preventDefault and/or
            // stopPropagation status of the event they just triggered, so we
            // create a custom event, use it to dispatch the notification, then
            // return the event object itself from this method.

            var e = $.Event( name );
            $( this ).trigger( e, data );
            return e;
        },

        defaultOptions: {
            createNewImageOnReset: false,
            timeoutInterval: 0
        },

        add: function( url, options ) {
            if ( url ) {
                // The add() method can actually be called with a single URL or an
                // array of URLs. Normalize things so that we are always dealing with
                // an array.

                urls = $.isArray( url ) ? url : [ url ];

                for ( var i = 0; i < urls.length; i++ ) {
                    // Push the request into the queue.

                    var entry = $.extend( { reqId: nextRequestId++, src: urls[ i ], width: 0, height: 0, priority: 50, callback: null, data: null }, options );
                    this._queue.push( entry );

                    // We've added a new request to the queue. We'll need to resort
                    // the queue by priority when the next request is fired-off.

                    this._needsSort = true;

                    // Tell our listeners that a new entry has been added to the queue.

                    this.trigger( "image-loader-add", entry );
                }

                // If the loader is running, and we aren't waiting for a request,
                // go ahead and load whatever is on the top of the queue.

                if ( this._isRunning && !this._currentEntry ) {
                    this._loadNext();
                }
            }
        },

        start: function() {
            if ( !this._isRunning ) {
                // Set _isRunning to true so that subsequent calls to start() will
                // be ignored.

                this._isRunning = true;

                // Kick-off a request for the first item in our queue.

                this._loadNext();

                // Tell our listeners that the loader was started.

                this.trigger( "image-loader-start" );
            }
        },

        stop: function() {
            if ( this._isRunning ) {
                // If we're in the midst of attempting to load something,
                // place it back into the queue.

                if ( this._currentEntry ) {
                    this._queue.unshift( this._currentEntry );
                }

                // Reset our loader so that any pending requests are killed.

                this._resetLoader();

                // Set _isRunning to false so that a call to start() will
                // actually allow it to kick-start loading.

                this._isRunning = false;

                // Tell our listeners that the loader was stopped.

                this.trigger( "image-loader-stop" );
            }
        },

        clearQueue: function() {
            // If we're running note it so we can restart
            // loader when we're done.

            var isRunning = this._isRunning;

            // Stop any pending requests.

            this.stop();

            // Clear the queue by truncating it with a zero length.

            this._queue.length = 0;

            // If the loader was running, restart it so that it
            // is ready to service any new requests immediately.

            if ( isRunning ) {
                this.start();
            }
        },

        _loadNext: function() {
            // Before we attempt to load the next request in the queue,
            // reset our image loader object so that when we set its src
            // property, a request is actually made.

            this._resetLoader();

            var q = this._queue;

            if ( q.length ) {
                // If the queue needs sorting, sort it now.

                if ( this._needsSort ) {
                    q = this._queue = q.sort(function( a, b ) {
                        // Sort by priority. If the priorities
                        // are the same, sort by the request-id.

                        var result = a.priority - b.priority;
                        return result ? result : a.reqId - b.reqId;
                    });

                    this._needsSort = false;
                }

                // Grab the next request from the queue.

                var entry = q.shift();
                this._currentEntry = entry;

                // Fire-off the load timeout timer.

                if ( this.options.timeoutInterval > 0 ) {
                    this.timeoutTimerId = setTimeout( this._timeoutFunc, this.options.timeoutInterval );
                }

                // Fire-off the request.

                var loader = this._loader;
                loader.onload = this._loadFunc;
                loader.onerror = this._loadErrorFunc;
                loader.src = entry.src;
            } else {
                this.trigger( "image-loader-empty" );
            }
        },

        _resetLoader: function() {
            // We re-use the same image object to load all images.
            // Some image implementations will only trigger a load
            // if you set the src property to something that is
            // different than what its current value is. For this
            // reason, we need to clear the src attribute between
            // requests, just in case the user attempts to reload
            // the same URL in the case of a "retry" when the initial
            // request failed. Before clearing the src property,
            // we set the load and error properties to NULL because
            // some implementations, like Safari, will attempt to load
            // the current document if you set the src to null or an
            // empty string. Un-hooking the load and error handlers
            // prevents us from entering a circular pattern of continuous
            // attempts to load the document, triggering the error handler,
            // which then in turn clears the src, triggering the cycle to
            // start over.

            var loader = this._loader;
            loader.onload = null;
            loader.onerror = null;
            loader.src = null;

            // If the same image object is used to load different URLs,
            // IE9 eventually starts reporting bogus image width/height
            // dimensions. For this reason, we provide an option where
            // the caller can specify that they want a new image object
            // to be used for each request.

            if ( this.options.createNewImageOnReset ) {
                this._loader = new Image();
            }

            // Clear the current entry.

            this._currentEntry = null;

            // Kill any load timeout timer that may be pending.

            if ( this._timeoutTimerId ) {
                clearTimeout( this._timeoutTimerId );
                this._timeoutTimerId = 0;
            }
        },

        _handleLoad: function() {
            var loader = this._loader,
            entry = this._currentEntry;

            // Clear the _currentEntry property here. We don't
            // want a call to stop(), from any callbacks, to
            // re-queue this request.

            this._currentEntry = null;

            // Set the width and height properties for the entry so that
            // listeners can access them when we fire off the success notification.

            entry.width = loader.width;
            entry.height = loader.height;

            // Fire-off any callback associated with this entry.

            if ( entry.callback ) {
                entry.callback( entry.src, entry.width, entry.height, entry.data );
            }

            // Tell listeners that this entry has loaded successfully.

            this.trigger( "image-loader-load-success", entry );

            // Attempt to load the next request in the queue.

            this._loadNext();
        },

        _handleError: function() {
            // Tell listeners the current entry failed to load.

            this.trigger( "image-loader-load-error", this._currentEntry );

            // Attempt to load the next request in the queue.

            this._loadNext();
        }
    });
});
