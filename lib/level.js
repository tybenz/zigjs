define( 'level', [ 'class', 'entity' ], function ( Class, Entity ) {
    // Capitalize only the first letters in a string
    // passing in a delimiters means each "word" will be capitalized
    String.prototype.capitalize = function( delim ) {
        var arr, i;
        if ( !delim ) {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
        arr = this.split( delim );
        for ( i in arr ) {
            arr[ i ] = arr[ i ].capitalize();
        }
        return arr.join( delim );
    };

    return Class.extend({
        init: function ( grid ) {
            this.entities = [];
            this.drawLayers = [];
            this.grid = grid;
            this.toBeDestroyed = [];
        },

        load: function ( animations ) {
            var tilesize = 32,
                grid = this.grid,
                drawLayers = this.drawLayers,
                entities = this.entities,
                i, j, k,
                l1, l2, l3;

            for ( i = 0, l1 = grid.length; i < l1; i++ ) {
                // A row can be represented as a string
                // Ex: 'blank*20|hero.man*1|interactable.rock*1|blank*10|enemy.monster*1|blank*100'
                // Here, we turn those strings into a normal array
                if ( typeof grid[i] == 'string' ) {
                    var types = grid[i].split('|');
                    grid[i] = [];
                    for ( j = 0, l2 = types.length; j < l2; j++ ) {
                        var type = types[j].split( '*' )[0],
                            num = parseInt( types[j].split( '*' )[1] );
                        for ( var h = 0; h < num; h++ ) {
                            grid[i].push( type );
                        }
                    }
                }
            }

            for ( i = 0, l1 = grid.length; i < l1; i++ ) {
                var row = grid[i];

                for ( j = 0, l2 = row.length; j < l2; j++ ) {
                    var ents = row[j].split( ',' );

                    for ( k = 0, l3 = ents.length; k < l3; k++ ) {
                        var entityStr = ents[k];

                        var spriteMatch = entityStr.match( /\{([^\{\}]*)\}/ ),
                            spriteName = spriteMatch ? spriteMatch[1] : null;

                        entityStr = entityStr.replace( /\{[^\{\}]*\}/, '' );
                        if ( entityStr != 'blank' ) {
                            var className = eval( 'Entity.' + entityStr.capitalize( '.' ) );

                            var entity = new className( j * tilesize, i * tilesize, animations, spriteName );

                            this.addEntity( entity );
                        }
                    }
                }
            }
        },

        addEntity: function ( entity ) {
            var entities = this.entities,
                drawLayers = this.drawLayers,
                drawLayer = entity.drawLayer,
                self = this;

            entity.bind( 'entity-added', function ( evt, ent ) {
                self.addEntity( ent );
                self.trigger( 'entity-added', ent );
            });

            entity.bind( 'destroy-entity', function ( evt, ent ) {
                self.toBeDestroyed.push( ent );
            });

            entities.push( entity );

            while ( drawLayers.length - 1 <= drawLayer ) {
                drawLayers.push( [] );
            }

            drawLayers[ drawLayer ].push( entity );
        },

        removeEntities: function () {
            var toBeDestroyed = this.toBeDestroyed,
                entities = this.entities,
                drawLayers = this.drawLayers;

            for ( var i = toBeDestroyed.length - 1; i >= 0; i-- ) {
                drawLayer = drawLayers[ toBeDestroyed[ i ].drawLayer ];
                for ( var j = entities.length - 1; j >= 0; j-- ) {
                    if ( entities[j] == toBeDestroyed[i] ) {
                        entities[j].invalidateRect();
                        entities.splice( j, 1 ); 
                    }
                }
                for ( var j = drawLayer.length - 1; j >= 0; j-- ) {
                    if ( drawLayer[j] == toBeDestroyed[i] ) {
                        drawLayer.splice( j, 1 );
                    }
                }
                toBeDestroyed.splice( i, 1 );
            }
        }
    });

});
