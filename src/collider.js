define( 'collider', [ 'vector', 'vector-utils', 'entity' ],
function ( Vector, VectorUtils, Entity ) {
    return {
        detect: function ( entities ) {
            // Keep entity list sorted on x, ascending.
            entities.sort( function( a, b ) { return a.pos.x - b.pos.x } );

            // List of entities to check entities[ i ] against
            var activeList = [ entities[0] ],
                // List of possible collisions
                possibleCollisions = [];

            for ( var i = 1, len = entities.length; i < len; i++ ) {
                for ( var j = activeList.length - 1; j >= 0; j-- ) {
                    if ( entities[ i ].pos.x > ( activeList[ j ].pos.x + activeList[ j ].width ) ) {
                        // The current entity is past this activeList entity -- we know it
                        // won't collide with the rest of the entities.
                        activeList.splice( j, 1 );
                        continue;
                    } else if ( entities[ i ] != activeList[ j ] ) {
                        // It's possible that there is a collision (their x coordinates are close).
                        possibleCollisions.push( [ entities[ i ], activeList[ j ] ] );
                    }
                }
                // Place the current entity into activeList.
                activeList.push(entities[ i ]);
            }

            for ( var i = 0; i < possibleCollisions.length; i++ ) {
                var entityPair = possibleCollisions[ i ],
                    ent1 = entityPair[ 0 ],
                    ent2 = entityPair[ 1 ];

                if ( ent1 instanceof Entity && ent2 instanceof Entity ) {
                    this.check( ent1, ent2 );
                }
            }
        },

        check: function ( a, b ) {
            // Obtain collision objects for the two objects.
            var aCollisions = a.getCollisions( b ),
                bCollisions = b.getCollisions( a );

            // Adjust the objects because of collision.
            if ( aCollisions ) {
                a.collideWith( b, aCollisions );
                b.collideWith( a, bCollisions );
            } else if ( bCollisions ) {
                b.collideWith( a, bCollisions );
                a.collideWith( b, aCollisions );
            }
        }
    };
});
