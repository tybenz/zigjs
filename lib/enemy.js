/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

(function( Game, Settings, window, document, undefined ) {

var TILESIZE = Settings.tileSize,
    TURRET_INTERVAL = Settings.turretInterval,
    QUICK_TURRET_INTERVAL = Settings.quickTurretInterval,
    SMART_TURRET_INTERVAL = Settings.smartTurretInterval,
    TURRET_SPEED = Settings.turretSpeed,
    QUICK_TURRET_SPEED = Settings.quickTurretSpeed,
    SMART_TURRET_SPEED = Settings.smartTurretSpeed,
    SUBMARINE_SPEED = Settings.submarineSpeed,
    BALLOON_SPEED = Settings.balloonSpeed,
    BATTLESHIP_SPEED = Settings.battleshipSpeed,
    BIRD_VELOCITY = Settings.birdVelocity,
    SPIDER_VELOCITY = Settings.spiderVelocity,
    SPIDER_CLIMBING_VELOCITY = Settings.spiderClimbingVelocity,
    BALLOON_HORIZONTAL_VELOCITY = Settings.balloonHorizontalVelocity,
    BALLOON_VERTICAL_VELOCITY = Settings.balloonVerticalVelocity,
    BALLOON_VERTICAL_BOUNDARY = Settings.balloonVerticalBoundary,
    MONSTER_WALKING_INTERVAL = Settings.monsterWalkingInterval;

Game.Entity.Enemy = Game.Entity.extend({
    type: 'Enemy',
    drawLayer: 3,
    states: {
        'dying': {
            animation: {
                delta: 40,
                sequence: [ 'enemy-dying-1', 'enemy-dying-2', 'enemy-dying-3', 'enemy-dying-4', 'enemy-dying-5', 'enemy-dying-6', 'enemy-dying-7', 'enemy-dying-8', 'enemy-dying-9' ],
                times: 1
            }
        }
    },
    generateNextCoords: function( timeDiff ) {
        this._super( timeDiff );
    },
    collideWith: function( entity, collisionTypes ) {
        if ( ( entity.type == 'Interactable.Rock' && ( entity.velocity.x > 0 || entity.velocity.y > 0 ) && collisionTypes )
            || ( entity.type == 'Hero.Block' && entity.velocity.y > 0 && entity.oldPos.y < this.pos.y )
            || ( entity.type == 'Hero.Clock' && entity.velocity.y > 0 && entity.oldPos.y < this.pos.y )
            || entity.type == 'Interactable.Bullet' || entity.type == 'Interactable.Tongue' || entity.type == 'Interactable.Lightning' || entity.type == 'Interactable.Heat' ) {

            this.changeState( 'dying' );
        }
        this._super( entity, collisionTypes );
    }
});

Game.Entity.Enemy.Turret = Game.Entity.Enemy.extend({
    type: 'Enemy.Turret',
    bulletSpeed: TURRET_SPEED,
    initialSprite: 'turret',
    rightSprite: 'turret',
    leftSprite: 'turret',
    initialState: 'shooting',
    states: {
        'dying': Game.Entity.Enemy.prototype.states.dying,
        'shooting': {
            animation: null,
            actions: [{
                delta: TURRET_INTERVAL,
                action: function() { this.shoot(); }
            }]
        }
    },
    init: function( x, y ) {
        this._super( x, y );
        this.lastShot = Date.now();
    },
    generateNextCoords: function( timeDiff ) {
        this._super( timeDiff );

        if ( this.activeSprite == 'enemy-dying-9' ) {
            this.visible = false;
            Game.destroyEntity( this );
        }
    },
    lockTarget: function() {
        var heroX = Game.hero.pos.x,
            myX = this.pos.x;

        if ( heroX > myX ) {
            this.activeSprite = this.rightSprite;
            this.direction = 'right';
        } else if ( heroX < myX ) {
            this.activeSprite = this.leftSprite;
            this.direction = 'left';
        }
        this.animated = true;
    },
    shoot: function() {
        this.createBullet( this.pos.x, this.pos.y, this.bulletSpeed, 0 );
    },
    createBullet: function( x, y, xVelocity, yVelocity ) {
        var bullet = new Game.Entity.Enemy.Bullet( x, y );
        Game.currentLevel.entities.push( bullet );
        bullet.velocity = new Game.Vector( xVelocity, yVelocity );
    }
});

Game.Entity.Enemy.Turret.Quick = Game.Entity.Enemy.Turret.extend({
    bulletSpeed: QUICK_TURRET_SPEED,
    initialSprite: 'turret-quick-left',
    rightSprite: 'turret-quick-right',
    leftSprite: 'turret-quick-left',
    states: {
        'dying': Game.Entity.Enemy.prototype.states.dying,
        'shooting': {
            animation: null,
            actions: [{
                delta: QUICK_TURRET_INTERVAL,
                action: function() { this.shoot(); }
            }]
        }
    },
    shoot: function() {
        this.lockTarget();
        if ( this.direction == 'left' ) {
            this.createBullet( this.pos.x, this.pos.y, this.bulletSpeed, 0 );
        } else {
            this.createBullet( this.pos.x, this.pos.y, 0 - this.bulletSpeed, 0 );
        }
    }
});

Game.Entity.Enemy.Turret.Smart = Game.Entity.Enemy.Turret.extend({
    bulletSpeed: SMART_TURRET_SPEED,
    initialSprite: 'turret-smart-left',
    rightSprite: 'turret-smart-right',
    leftSprite: 'turret-smart-left',
    states: {
        'dying': Game.Entity.Enemy.prototype.states.dying,
        'shooting': {
            animation: null,
            actions: [{
                delta: SMART_TURRET_INTERVAL,
                action: function() { this.shoot(); }
            }]
        }
    },
    shoot: function() {
        this.lockTarget();

        var heroX = Game.hero.pos.x,
            heroY = Game.hero.pos.y,
            myX = this.pos.x - ( this.width / 2 ),
            myY = this.pos.y - ( this.height / 2 ),
            xDiff = heroX - myX,
            yDiff = heroY - myY,
            ratio = yDiff / xDiff,
            xVelocity = this.direction == 'left' ? this.bulletSpeed : 0 - this.bulletSpeed,
            yVelocity = ratio * xVelocity;

        if ( Math.abs( yVelocity ) <= Math.abs( xVelocity ) ) {
            this.createBullet( this.pos.x, this.pos.y, xVelocity, yVelocity );
        }
    }
});

Game.Entity.Enemy.Monster = Game.Entity.Enemy.extend({
    type: 'Enemy.Monster',
    initialSprite: 'monster-open',
    initialState: 'walking',
    states: {
        'dying': Game.Entity.Enemy.prototype.states.dying,
        'walking': {
            animation: {
                delta: 150,
                sequence: [ 'monster-open', 'monster-open', 'monster-open', 'monster-open', 'monster-open', 'monster-closing', 'monster-closed', 'monster-closed', ],
                times: 'infinite'
            },
            actions: [
                {
                    delta: MONSTER_WALKING_INTERVAL,
                    action: function() { this.pos.x -= TILESIZE; },
                    until: function() {
                        return this.adjacentTo( 'Terrain.Land', 'left' ) || this.adjacentToLevelEdge( 'left' );
                    }
                },
                {
                    delta: MONSTER_WALKING_INTERVAL,
                    action: function() { this.pos.x += TILESIZE; },
                    until: function() {
                        return this.adjacentTo( 'Terrain.Land', 'right' ) || this.adjacentToLevelEdge( 'right' );
                    }
                }
            ]
        }
    },
    generateNextCoords: function( timeDiff ) {
        this._super( timeDiff );
        if ( this.activeSprite == 'enemy-dying-9' ) {
            this.visible = false;
            Game.destroyEntity( this );
        }
    }
});

Game.Entity.Enemy.Monster.Cautious = Game.Entity.Enemy.Monster.extend({
    type: 'Enemy.Monster.Cautious',
    states: {
        dying: Game.Entity.Enemy.prototype.states.dying,
        'walking': {
            animation: {
                delta: 150,
                sequence: [ 'monster-open', 'monster-open', 'monster-open', 'monster-open', 'monster-open', 'monster-closing', 'monster-closed', 'monster-closed', ],
                times: 'infinite'
            },
            actions: [
                {
                    delta: MONSTER_WALKING_INTERVAL,
                    action: function() { this.pos.x -= TILESIZE; },
                    until: function() {
                        if ( this.adjacentToLevelEdge( 'left' ) ) return true;

                        var land = this.adjacentTo( 'Terrain.Land', 'bottom' ).entity || this.adjacentTo( 'Terrain.Trapdoor', 'bottom' ).entity,
                            edgePiece;

                        if ( land ) {
                            edgePiece = !land.adjacentTo( 'Terrain.Land', 'left' ) && !land.adjacentTo( 'Terrain.Trapdoor', 'left' ) && !land.adjacentToLevelEdge( 'left' );
                            if ( ( edgePiece && this.pos.x <= land.pos.x ) || this.adjacentTo( 'Terrain.Land', 'left') ) {
                                return true;
                            }
                            return false;
                        }
                        return true;
                    }
                },
                {
                    delta: MONSTER_WALKING_INTERVAL,
                    action: function() { this.pos.x += TILESIZE; },
                    until: function() {
                        if ( this.adjacentToLevelEdge( 'right' ) ) return true;

                        var land = this.adjacentTo( 'Terrain.Land', 'bottom' ).entity || this.adjacentTo( 'Terrain.Trapdoor', 'bottom' ).entity,
                            edgePiece;

                        if ( land ) {
                            edgePiece = !land.adjacentTo( 'Terrain.Land', 'right' ) && !land.adjacentTo( 'Terrain.Trapdoor', 'right' ) && !land.adjacentToLevelEdge( 'right' );
                            if ( ( edgePiece && this.pos.x >= land.pos.x + land.width - this.width ) || this.adjacentTo( 'Terrain.Land', 'right' ) ) {
                                return true;
                            }
                            return false;
                        }
                        return true;
                    }
                }
            ]
        }
    }
});

Game.Entity.Enemy.Bird = Game.Entity.Enemy.extend({
    type: 'Enemy.Bird',
    count: 0,
    initialSprite: 'bird-wings-up',
    initialState: 'flying',
    states: {
        'dying': Game.Entity.Enemy.prototype.states.dying,
        'flying': {
            animation: {
                delta: 200,
                sequence: [ 'bird-wings-up', 'bird-wings-down' ],
                times: 'infinite'
            },
            actions: [{
                delta: 500,
                action: function() {
                    this.dropEgg();
                },
                until: function() { return false }
            }]
        }
    },
    init: function( x, y ) {
        this._super( x, y );
        this.ignoreGravity = true;
        this.velocity.x = BIRD_VELOCITY;
    },
    dropEgg: function() {
        if ( Math.abs( Game.hero.pos.x - this.pos.x ) < TILESIZE * 4 ) {
            var eggWidth = Game.Entity.Interactable.Egg.prototype.width,
                x = this.pos.x + ( TILESIZE - eggWidth ) / 2,
                y = this.pos.y + this.height,
                xVelocity = this.velocity.x,
                yVelocity = 0,
                egg = new Game.Entity.Interactable.Egg( x, y );

            Game.currentLevel.entities.push( egg );
            egg.velocity = new Game.Vector( xVelocity, yVelocity );
        }
    },
    generateNextCoords: function( timeDiff ) {
        if ( this.state == 'dying' ) {
            this.ignoreGravity = false;
        }
        if ( this.state == 'dying' && this.adjacentTo( 'Terrain.Land', 'bottom' ) ) {
            this.visible = false;
            Game.destroyEntity( this );
        }
        this._super( timeDiff );
    },
    collideWith: function( entity, collisionTypes ) {
        this._super( entity, collisionTypes );
        if ( entity.type == 'Terrain.Land' && this.state != 'dying' ) {
            this.pos.x = entity.pos.x + entity.width;
            this.velocity.x = 0;
            this.changeState( 'dying' );
        }
    }
});

Game.Entity.Enemy.Spider = Game.Entity.Enemy.extend({
    type: 'Enemy.Spider',
    dropFor: 2000,
    initialSprite: 'spider-walking-left-1',
    initialState: 'walking-left',
    states: {
        'dying': Game.Entity.Enemy.prototype.states.dying,
        'walking-left': {
            animation: {
                delta: 180,
                sequence: [ 'spider-walking-left-1', 'spider-walking-left-2', 'spider-walking-left-3', 'spider-walking-left-4' ],
                times: 'infinite'
            },
            actions: [{
                delta: 0,
                action: function() {
                    this.velocity.x = 0 - SPIDER_VELOCITY;
                },
                until: function() {
                    var land = this.adjacentTo( 'Terrain.Land', 'top' ).entity,
                        edgePiece;

                    if ( !land ) {
                        land = this.adjacentTo( 'Terrain.Trapdoor', 'top' ).entity;
                    }

                    if ( !land || land.type == 'Terrain.Trapdoor' && land.state == 'dying' ) {
                        this.changeState( 'dying' );
                        this.ignoreGravity = false;
                        this.activeSprite = 'spider-falling';
                        return true;
                    }

                    if ( land ) {
                        edgePiece = ( !land.adjacentTo( 'Terrain.Land', 'left' ) && !land.adjacentTo( 'Terrain.Trapdoor', 'left' ) ) || land.adjacentToLevelEdge( 'left' ) ;
                        if ( ( edgePiece && this.pos.x <= land.pos.x ) ) {
                            this.changeState( 'walking-right' );
                            return true;
                        }
                        return false;
                    }
                    return true;
                }
            }]
        },
        'walking-right': {
            animation: {
                delta: 180,
                sequence: [ 'spider-walking-right-1', 'spider-walking-right-2', 'spider-walking-right-3', 'spider-walking-right-4' ],
                times: 'infinite'
            },
            actions: [{
                delta: 0,
                action: function() {
                    this.velocity.x = SPIDER_VELOCITY;
                },
                until: function() {
                    var land = this.adjacentTo( 'Terrain.Land', 'top' ).entity,
                        edgePiece;

                    if ( !land ) {
                        land = this.adjacentTo( 'Terrain.Trapdoor', 'top' ).entity;
                    }

                    if ( !land || land.type == 'Terrain.Trapdoor' && land.state == 'dying' ) {
                        this.changeState( 'dying' );
                        this.ignoreGravity = false;
                        this.activeSprite = 'spider-falling';
                        return true;
                    }

                    if ( land ) {
                        edgePiece = ( !land.adjacentTo( 'Terrain.Land', 'right' ) && !land.adjacentTo( 'Terrain.Trapdoor', 'right' ) ) || land.adjacentToLevelEdge( 'right' ) ;
                        if ( ( edgePiece && this.pos.x >= land.pos.x + land.width - this.width ) ) {
                            this.pos.x = land.pos.x + land.width - this.width;
                            this.changeState( 'walking-left' );
                            return true;
                        }
                        return false;
                    }
                    return true;
                }
            }]
        },
        'falling': {
            animation: 'spider-falling',
            actions: [{
                delta: 100,
                action: function() {
                    this.ignoreGravity = false;
                    this.velocity.x = 0
                },
                until: function() {
                    this.fellOn = this.fellOn || Date.now();
                    if ( ( Date.now() - this.fellOn ) > this.dropFor ) {
                        this.changeState( 'climbing' );
                        this.fellOn = null;
                    }
                    return false;
                } 
            }],
        },
        'climbing': {
            animation: 'spider-falling',
            actions: [{
                delta: 100,
                action: function() {
                    this.velocity.y = SPIDER_CLIMBING_VELOCITY;
                    this.ignoreGravity = true;
                },
                until: function() {
                    if ( this.pos.y <= this.initialY ) {
                        this.changeState( 'walking-left' );
                    }
                    return false;
                }
            }]
        }
    },
    render: function() {
        if ( this.visible ) {
            Game.ctx.drawImage( Game.Sprites[ this.activeSprite ], this.pos.x - Game.viewportOffset, this.pos.y );
            if ( this.state == 'falling' || this.state == 'climbing' ) {
                for ( var i = this.initialY; i < this.pos.y; i++ ) {
                    Game.ctx.drawImage( Game.Sprites[ 'spider-web' ], this.pos.x + ( TILESIZE / 9 ) * 4 - Game.viewportOffset, i );
                }
            }
        }
    },
    init: function( x, y ) {
        this._super( x, y );
        this.ignoreGravity = true;
        this.initialY = y;
    },
    generateNextCoords: function( timeDiff ) {
        this._super( timeDiff );

        if ( Math.abs( Game.hero.pos.x - this.pos.x ) < 2 * TILESIZE && this.pos.y < Game.hero.pos.y ) {
            this.pos.x = Math.round( this.pos.x / TILESIZE ) * TILESIZE;
            this.changeState( 'falling' );
            this.fellOn = Date.now();
        }

        if ( this.state == 'falling' || this.state == 'dying' ) {
            Game.invalidateRect( this.initialY, this.pos.x + this.width, this.pos.y + this.height, this.pos.x );
        }

        if ( this.state == 'dying' ) {
            if ( this.velocity.y < 0 ) {
                this.velocity.y = 0;
            }
            this.ignoreGravity = false;
        }

        if ( this.state == 'dying' && this.adjacentTo( 'Terrain.Land', 'bottom' ) ) {
            this.visible = false;
            Game.destroyEntity( this );
        }
    },
    collideWith: function( entity, collisionTypes ) {
        if ( this.velocity.x != 0 && entity.pos.y == this.pos.y && entity.type == 'Terrain.Land' || entity.type == 'Terrain.Trapdoor' ) {
            if ( this.velocity.x < 0 ) {
                this.pos.x = entity.pos.x + entity.width;
                this.changeState( 'walking-right' );
            } else {
                this.pos.x = entity.pos.x - this.width;
                this.changeState( 'walking-left' );
            }
        }

        this._super( entity, collisionTypes );
    }
});

Game.Entity.Enemy.Bullet = Game.Entity.Enemy.extend({
    type: 'Enemy.Bullet',
    initialSprite: 'bullet-red',
    drawLayer: 0,
    width: 4,
    height: 4,
    states: Game.Entity.prototype.states,
    invalidateRect: function() {
        var offsetTop = 0 - this.height,
            offsetRight = this.width,
            offsetBottom = this.height,
            offsetLeft = 0 - this.width,
            newX = this.pos.x - this.width,
            newY = this.pos.y - this.height,
            oldX = this.oldPos.x - this.width,
            oldY = this.oldPos.y - this.height,
            width = this.width + this.width * 2,
            height = this.height + this.height * 2,
            top = oldY <= newY ? oldY + offsetTop : newY + offsetTop,
            left = oldX <= newX ? oldX + offsetLeft : newX + offsetLeft,
            bottom = ( oldY + height ) >= ( newY + height ) ? oldY + height + offsetBottom : newY + height + offsetBottom,
            right = ( oldX + width ) >= ( newX + width ) ? oldX + width + offsetRight : newX + width + offsetRight;

        //Pass a rect (position/dimensions) to the global invalidRect
        Game.invalidateRect( top, right, bottom, left );
    },
    init: function( x, y ) {
        this._super( x, y );
        this.ignoreGravity = true;
    },
    collideWith: function( entity, collisionTypes ) {
        if ( entity.type == 'Terrain.Land' || entity.type == 'Interactable.Lightning' ) {
            Game.destroyEntity( this );
        }
    }
});

Game.Entity.Enemy.Battleship = Game.Entity.Enemy.extend({
    type: 'Enemy.Battleship',
    initialSprite: 'battleship-left',
    rightSprite: 'battleship-right',
    leftSprite: 'battleship-left',
    width: TILESIZE * 3,
    height: TILESIZE,
    bulletSpeed: BATTLESHIP_SPEED,
    initialState: 'cruising-left',
    states: {
        'cruising-right': {
            animation: 'battleship-right',
            actions: [{
                delta: TURRET_INTERVAL,
                action: function() {
                    this.shoot();
                }
            }]
        },
        'cruising-left': {
            animation: 'battleship-left',
            actions: [{
                delta: TURRET_INTERVAL,
                action: function() {
                    this.shoot();
                }
            }]
        },
        'dying': {
            animation: {
                delta: 40,
                sequence: [ 'battleship-dying-1', 'battleship-dying-2', 'battleship-dying-3', 'battleship-dying-4', 'battleship-dying-5', 'battleship-dying-6', 'battleship-dying-7', 'battleship-dying-8', 'battleship-dying-9' ],
                times: 1
            }
        }
    },
    generateNextCoords: function( timeDiff ) {
        this._super( timeDiff );

        if ( this.activeSprite == 'battleship-dying-9' ) {
            this.visible = false;
            Game.destroyEntity( this );
        }
    },
    lockTarget: function() {
        var heroX = Game.hero.pos.x,
            myX = this.pos.x;

        if ( heroX > myX ) {
            this.changeState( 'cruising-right' );
            this.direction = 'right';
        } else if ( heroX < myX ) {
            this.changeState( 'cruising-left' );
            this.direction = 'left';
        }
    },
    shoot: function() {
        this.lockTarget();
        if ( this.direction == 'left' ) {
            this.createBullet( this.pos.x, this.pos.y + ( TILESIZE / 9 ) * 5, this.bulletSpeed, 0 );
        } else {
            this.createBullet( this.pos.x, this.pos.y + ( TILESIZE / 9 ) * 5, 0 - this.bulletSpeed, 0 );
        }
    },
    createBullet: function( x, y, xVelocity, yVelocity ) {
        var bullet = new Game.Entity.Enemy.Bullet( x, y );
        Game.currentLevel.entities.push( bullet );
        bullet.velocity = new Game.Vector( xVelocity, yVelocity );
    },
    collideWith: function( entity, collisionTypes ) {
        this._super( entity, collisionTypes );
        if ( entity.type == 'Terrain.Water' ) {
            if ( this.velocity.y > 0 && collisionTypes ) {
                this.velocity.y = 0;
                this.pos.y = entity.pos.y - entity.height;
            }
        }
    },
    applyGravity: function( timeDiff ) {
        if ( !this.adjacentTo( 'Terrain.Water', 'bottom' ) && !this.adjacentTo( 'Terrain.Land', 'bottom' ) ) {
            var gravitationalForce = this.gravity.multiply( timeDiff );
            this.velocity = this.velocity.add( gravitationalForce );
        }
    }
});

// TODO - need a dying animation for a 2x2 enemy
Game.Entity.Enemy.Balloon = Game.Entity.Enemy.extend({
    type: 'Enemy.Balloon',
    width: TILESIZE * 2,
    height: TILESIZE * 2,
    bulletSpeed: BALLOON_SPEED,
    initialSprite: 'balloon',
    initialState: 'floating',
    init: function( x, y ) {
        this._super( x, y );
        this.ignoreGravity = true;
        this.startY = y;
        this.velocity.x = BALLOON_HORIZONTAL_VELOCITY;
        this.direction = 'left';
    },
    states: {
        'floating': {
            actions: [
                {
                    delta: TURRET_INTERVAL,
                    action: function() {
                        this.velocity.y = BALLOON_VERTICAL_VELOCITY;
                        this.shoot();
                    },
                    until: function() { return this.pos.y - this.startY >= BALLOON_VERTICAL_BOUNDARY; }
                },
                {
                    delta: TURRET_INTERVAL,
                    action: function() {
                        this.velocity.y = 0 - BALLOON_VERTICAL_VELOCITY;
                        this.shoot();
                    },
                    until: function() { return this.pos.y - this.startY <= 0 - BALLOON_VERTICAL_BOUNDARY; }
                }
            ]
        },
        'dying': {
            animation: 'transparent'
        }
    },
    shoot: function() {
        var heroX = Game.hero.pos.x - Game.hero.width / 2,
            heroY = Game.hero.pos.y - Game.hero.height / 2,
            myX = this.pos.x - ( this.width / 2 ),
            myY = this.pos.y - ( this.height / 2 ),
            xDiff = heroX - myX,
            yDiff = heroY - myY,
            ratio = yDiff / xDiff,
            xVelocity = this.direction == 'left' ? this.bulletSpeed : 0 - this.bulletSpeed,
            yVelocity = ratio * xVelocity;

        if ( Math.abs( yVelocity ) <= Math.abs( xVelocity ) && this.pos.x > heroX ) {
            this.createBullet( this.pos.x, this.pos.y, xVelocity, yVelocity );
        }
    },
    createBullet: function( x, y, xVelocity, yVelocity ) {
        var bullet = new Game.Entity.Enemy.Bullet( x, y );
        Game.currentLevel.entities.push( bullet );
        bullet.velocity = new Game.Vector( xVelocity, yVelocity );
    }
});

Game.Entity.Enemy.Submarine = Game.Entity.Enemy.Balloon.extend({
    type: 'Enemy.Submarine',
    width: TILESIZE * 2,
    height: TILESIZE * 2,
    bulletSpeed: SUBMARINE_SPEED,
    initialSprite: 'submarine',
    initialState: 'floating'
});

})( Game, Settings, window, document );
