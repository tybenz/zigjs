define( 'vector-utils', [ 'vector' ], function ( Vector ) {
    return {
        angle: function ( v1, v2 ) {
            var dy = v2.y - v1.y,
                dx = v2.x - v1.x,
                theta = Math.atan2( dy, dx );

            return theta * ( 180 / Math.PI );
        },

        angleMag2Vector: function ( angle, mag ) {
            angle *= Math.PI / 180;
            return new Vector( mag * Math.cos( angle ), mag * Math.sin( angle ) );
        },

        mph2ppf: function ( mph ) {
            return mph * ( 675840 / 216000 );
        },

        ppf2mph: function ( ppf ) {
            return ppf / ( 675840 / 216000 );
        },

        getIntersection: function ( p1, p2, p3, p4 ) {
            var m1, c1, m2, c2,
                intersectionX, intersectionY;

            // HACK - avoid infinite and zero slopes
            if ( !( p2.x - p1.x ) ) {
                p2.x += 0.001;
            }
            if ( !( p4.x - p3.x ) ) {
                p4.x += 0.001;
            }
            if ( !( p2.y - p1.y ) ) {
                p2.y += 0.001;
            }
            if ( !( p4.y - p3.y ) ) {
                p4.y += 0.001;
            }

            m1 = ( p2.y - p1.y ) / ( p2.x - p1.x );
            c1 = p1.y - m1 * p1.x;


            m2 = ( p4.y - p3.y ) / ( p4.x - p3.x );
            c2 = p3.y - m2 * p3.x;

            if ( !( m1 - m2 ) ) {
                return null;
            } else {
                intersectionX = ( c2 - c1 ) / ( m1 - m2 );
                intersectionY = m1 * intersectionX + c1;

                return new Game.Vector( intersectionX, intersectionY );
            }
        },

        isOnSegment: function ( xi, yi, xj, yj, xk, yk ) {
            return (xi <= xk || xj <= xk) && (xk <= xi || xk <= xj) &&
                (yi <= yk || yj <= yk) && (yk <= yi || yk <= yj);
        },

        computeDirection: function ( xi, yi, xj, yj, xk, yk ) {
            var a = (xk - xi) * (yj - yi),
                b = (xj - xi) * (yk - yi);
            return a < b ? -1 : a > b ? 1 : 0;
        },

        checkIntersection: function ( p1, p2, p3, p4 ) {
            var x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y,
                x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y,
                d1 = Game.computeDirection(x3, y3, x4, y4, x1, y1),
                d2 = Game.computeDirection(x3, y3, x4, y4, x2, y2),
                d3 = Game.computeDirection(x1, y1, x2, y2, x3, y3),
                d4 = Game.computeDirection(x1, y1, x2, y2, x4, y4);

            return (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
                ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) ||
                (d1 == 0 && Game.isOnSegment(x3, y3, x4, y4, x1, y1)) ||
                (d2 == 0 && Game.isOnSegment(x3, y3, x4, y4, x2, y2)) ||
                (d3 == 0 && Game.isOnSegment(x1, y1, x2, y2, x3, y3)) ||
                (d4 == 0 && Game.isOnSegment(x1, y1, x2, y2, x4, y4));
        }
    };
});
