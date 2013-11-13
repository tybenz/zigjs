define( 'level', [ 'entity' ], function ( Entity ) {

    return Class.extend({
        init: function( grid ) {
            var ents = {},
                i, j, k,
                len1, len2,
                entity;

            this.entities = [];
            this.grid = grid;
            for ( i = 0, len1 = this.grid.length; i < len1; i++ ) {
                // A row can be represented as a string
                // Ex: 'blank*20|hero.man*1|interactable.rock*1|blank*10|enemy.monster*1|blank*100'
                // Here, we turn those strings into a normal array
                if ( typeof this.grid[i] == 'string' ) {
                    var types = this.grid[i].split('|');
                    this.grid[i] = [];
                    for ( var k = 0, len2 = types.length; k < len2; k++ ) {
                        var type = types[k].split( '*' )[0],
                            num = parseInt( types[k].split( '*' )[1] );
                        for ( var h = 0; h < num; h++ ) {
                            this.grid[i].push( type );
                        }
                    }
                }
                for ( j = 0, len2 = this.grid[ i ].length; j < len2; j++ ) {
                    entity = this.grid[ i ][ j ];
                    if ( !( entity in ents ) ) {
                        ents[ entity ] = entity;
                        this.entityCount++;
                    }
                }
            }
        }
    });

})( Game, Settings, window, document );
