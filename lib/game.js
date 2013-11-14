/* vim: set tabstop=4 softtabstop=4 shiftwidth=4 expandtab: */

(function( Settings, window, document, undefined ) {

var TILESIZE = Settings.tileSize,
    VIEWPORT_SHIFT_BOUNDARY = Settings.viewportShiftBoundary,
    MENU_WIDTH = Settings.menuWidth,
    MENU_HEIGHT = Settings.menuHeight,
    MENU_LINE_WIDTH = Settings.menuLineWidth,
    LEFT_KEY = Settings.leftKey,
    RIGHT_KEY = Settings.rightKey,
    DOWN_KEY = Settings.downKey,
    UP_KEY = Settings.upKey,
    ACTION_KEY = Settings.actionKey,
    JUMP_KEY = Settings.jumpKey,
    PAUSE_KEY = Settings.pauseKey,
    QUESTLOG_KEY = Settings.questlogKey,
    MAP_KEY = Settings.mapKey,
    INVENTORY_KEY = Settings.inventoryKey,
    ENTER_KEY = Settings.enterKey,
    DEBUG_INVALID_RECT = Settings.debugInvalidRect,
    DEBUG_INVALID_RECT_COLOR = Settings.debugInvalidRectColor,
    GOD_MODE = Settings.godMode,
    LAND_BACKGROUND = Settings.landBackground,
    SEA_BACKGROUND = Settings.seaBackground,
    LEVEL_NAME_COLOR = Settings.levelNameColor,
    LEVEL_NAME_FONT_SIZE = Settings.levelNameFontSize;

var Game = {
    //Array of entities that should be destroyed on the following update
    toBeDestroyed: [],
    //Dictionary to lookup which keys are pressed on each update
    keysDown: {},
    //Image count for loading sprites
    imageCount: 1,
    paused: false,
    init: function( level ) {
        //Initialize viewport size
        Game.viewportWidth = Game.viewportTileWidth * TILESIZE;
        Game.viewportHeight = Game.viewportTileHeight * TILESIZE;
        Game.viewportOffset = 0;
        Game.viewportShiftBoundary = {
            left: Math.floor( Game.viewportTileWidth / 2 ) * TILESIZE + ( VIEWPORT_SHIFT_BOUNDARY * TILESIZE ),
            right: Math.floor( Game.viewportTileWidth / 2 ) * TILESIZE - ( VIEWPORT_SHIFT_BOUNDARY * TILESIZE )
        };

        //Initialize map
        Game.Map.init();

        //Initialize pause menu
        var pauseMenuWidth = TILESIZE * MENU_WIDTH,
            pauseMenuHeight = TILESIZE * MENU_HEIGHT,
            pauseMenuLineWidth = MENU_LINE_WIDTH;
        Game.pauseMenu = new Game.Menu.Pause( ( Game.viewportWidth - pauseMenuWidth ) / 2, ( Game.viewportHeight - pauseMenuHeight ) / 2, pauseMenuWidth, pauseMenuHeight, pauseMenuLineWidth );

        //Initialize map menu
        Game.mapMenu = new Game.Menu.Map( ( Game.viewportWidth - pauseMenuWidth ) / 2, ( Game.viewportHeight - pauseMenuHeight ) / 2, pauseMenuWidth, pauseMenuHeight, pauseMenuLineWidth, Game.Map.locationNames() );

        //Initialize questlog menu
        Game.questlogMenu = new Game.Menu.Questlog( ( Game.viewportWidth - pauseMenuWidth ) / 2, ( Game.viewportHeight - pauseMenuHeight ) / 2, pauseMenuWidth, pauseMenuHeight, pauseMenuLineWidth );

        //Initialize transform menu
        Game.transformMenu = new Game.Menu.Transform( ( Game.viewportWidth - pauseMenuWidth ) / 2, ( Game.viewportHeight - pauseMenuHeight ) / 2, pauseMenuWidth, pauseMenuHeight, pauseMenuLineWidth );

        //Initialize game over menu
        Game.gameOverMenu = new Game.Menu.GameOver( ( Game.viewportWidth - pauseMenuWidth ) / 2, ( Game.viewportHeight - pauseMenuHeight ) / 2, pauseMenuWidth, pauseMenuHeight, pauseMenuLineWidth );

        //Prepare canvas
        Game.canvas = document.createElement( 'canvas' );
        Game.canvas.width = Game.viewportWidth;
        Game.canvas.height = Game.viewportHeight;
        document.getElementById( 'game' ).appendChild( Game.canvas );
        Game.ctx = Game.canvas.getContext( '2d' );

        //Initialize sprites
        Game.initSprites();

        if ( Game.clickStep ) {
            document.onclick = Game.nextGameFrame;
        }

        if ( !Game.skipResize ) {
            Game.resize();
        }

        Game.keysLocked = false;

        Game.Questlog.push( 'main', 'initial' );

        //Initialize drawLayers
        Game.initDrawLayers();

        //Load level and sprites
        Game.currentLevel = Game.Levels[ level ];
        Game.viewportShiftBuffer = Game.currentLevel.width - Game.viewportWidth;
        Game.loadLevel();

        // Initialize cutscene if the level has one
        var oldScene = Game.currentLevel.scene;
        if ( oldScene ) {
            Game.currentLevel.scene = new Game.Scene( oldScene.actors, oldScene.actions );
        }

        // If level has a cutscene - lock the keys and let it play
        if ( Game.currentLevel.scene ) {
            Game.currentLevel.scene.play();
        }
    },
    initSprites: function() {
        Game.totalSprites = 0;

        //Same init as Game.Entity
        for ( var i in Game.Bitmaps ) {
            Game.Sprites[i] = Game.Sprite( Game.convertBitmapToSprite( Game.Bitmaps[i], TILESIZE / 9 ) );
            Game.totalSprites++;
        }

        var heroList = {
            'block': Game.Bitmaps[ 'block' ],
            'man-right': Game.Bitmaps[ 'man-right' ],
            'boat-right': Game.Bitmaps[ 'boat-right' ],
            'frog-right': Game.Bitmaps[ 'frog-right' ],
            'plane-right': Game.Bitmaps[ 'plane-right' ],
            'jellyfish': Game.Bitmaps[ 'jellyfish' ],
            'clock': Game.Bitmaps[ 'clock-1' ],
            'flame': Game.Bitmaps[ 'flame-big' ],
            'restart': Game.Bitmaps[ 'restart' ],
            'exit': Game.Bitmaps[ 'exit' ],
            'friend-man-closeup': Game.Bitmaps[ 'friend-man-closeup' ],
            'friend-monster-closeup': Game.Bitmaps[ 'friend-monster-closeup' ],
            'kid-closeup': Game.Bitmaps[ 'kid-closeup' ]
        };

        for ( var i in heroList ) {
            Game.Sprites[i + '-double'] = Game.Sprite( Game.convertBitmapToSprite( heroList[i], TILESIZE / 4.5 ) );
            Game.totalSprites++;
        }
    },
    convertBitmapToSprite: function( bitmap, rectSize ) {
        var i, j,
            tempCanvas, tempContent;

        tempCanvas = document.createElement( 'canvas' );
        tempCanvas.width = bitmap[0].length * rectSize;
        tempCanvas.height = bitmap.length * rectSize;
        tempContext = tempCanvas.getContext( '2d' );
        for ( i in bitmap ) {
            for ( j in bitmap[ i ] ) {
                tempContext.fillStyle = bitmap[ i ][ j ];
                tempContext.fillRect( j * rectSize, i * rectSize, rectSize, rectSize );
            }
        }
        return tempCanvas.toDataURL( 'image/png' );
    },
    initDrawLayers: function() {
        //Layers for rendering - specified by each entity
        Game.drawLayers = [
            //Bullets,
            [],
            //Terrain
            [],
            //Interactables
            [],
            //Enemies
            [],
            //Hero
            [],
            //Water
            []
        ];
    },
    startLoop: function() {
        //Start event listeners and main loop
        addEventListener( 'keydown', Game.keyDownListener, false );
        addEventListener( 'keyup', Game.keyUpListener, false );
        if ( Modernizr.touch ) {
            Game.initTouchButtons();
        }

        //Background
        Game.ctx.fillStyle = Game.background;
        Game.ctx.fillRect( 0, 0, Game.viewportWidth, Game.viewportHeight );

        // Initial render
        // Make sure all entities get rendered on first render.
        Game.invalidateRect( 0, 0, Game.viewportWidth, Game.viewportHeight );
        for ( var i in Game.currentLevel.entities ) {
            Game.currentLevel.entities[i].render();
        }

        // Set last update to null so a pause/unpause doesn't
        // result in a jump on the screen
        Game.lastUpdate = null;
        //Start the actual loop
        Game.requestID = requestAnimationFrame( Game.loop ); 
    },
    initTouchButtons: function() {
        $( 'body' ).addClass( 'touch' );

        //Prepare touch buttons
        Game.$leftButton = $( 'button.direction.left' );
        Game.$upButton = $( 'button.direction.up' );
        Game.$rightButton = $( 'button.direction.right' );
        Game.$actionButton = $( 'button.action' );
        Game.$pauseButton = $( 'button.pause' );

        // right button
        Game.$rightButton.on( 'vmousedown', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: RIGHT_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyDownListener( evt );
        });
        Game.$rightButton.on( 'vmouseup', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: RIGHT_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyUpListener( evt );
        });

        // left button
        Game.$leftButton.on( 'vmousedown', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: LEFT_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyDownListener( evt );
        });
        Game.$leftButton.on( 'vmouseup', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: LEFT_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyUpListener( evt );
        });

        // up button
        Game.$upButton.on( 'vmousedown', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: JUMP_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyDownListener( evt );
        });
        Game.$upButton.on( 'vmouseup', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: JUMP_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyUpListener( evt );
        });

        // pause button
        Game.$pauseButton.on( 'vmousedown', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: PAUSE_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyDownListener( evt );
        });
        Game.$pauseButton.on( 'vmouseup', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: PAUSE_KEY,
                preventDefault: function( evt ) {}
            };
            Game.keyUpListener( evt );
        });

        // action button
        Game.$actionButton.on( 'vmousedown', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: 88,
                preventDefault: function( evt ) {}
            };
            Game.keyDownListener( evt );
        });
        Game.$actionButton.on( 'vmouseup', function( evt ) {
            evt.preventDefault();
            var evt = {
                keyCode: 88,
                preventDefault: function( evt ) {}
            };
            Game.keyUpListener( evt );
        });
    },
    loop: function( timestamp ) {
        //We update and render each loop
        var timeDiff;
        if ( Game.lastUpdate ) {
            if ( !Game.clickStep ) {
                timeDiff = timestamp - Game.lastUpdate;
            } else {
                timeDiff = 300;
            }
            Game.update( timeDiff );
            Game.render( timeDiff );
        }
        Game.lastUpdate = timestamp;
        if ( !Game.clickStep ) {
            if ( ( !Game.stopLoop && !Game.startTransform && !Game.showSign ) && !Game.paused ) {
                Game.requestID = requestAnimationFrame( Game.loop ); 
            } else if ( Game.startTransform ) {
                Game.showTransformMenu();
            } else if ( Game.showSign ) {
                Game.showSignMenu();
            } else if ( Game.switchToLevel ) {
                Game.performLevelSwitch();
            }
        }
    },
    nextWalkthrough: function() {
        if ( Game.currentLevel.walkthroughs && Game.currentLevel.walkthroughs[ Game.lastWalkthrough + 1 ] ) {
            Game.lastWalkthrough++;
            Game.activeWalkthrough = Game.currentLevel.walkthroughs[ Game.lastWalkthrough ];
        } else {
            Game.activeWalkthrough = null;
        }
    },
    update: function( timeDiff ) {
        if ( 73 in Game.keysDown && Game.keysDown[ 73 ] != 'locked' ) {
            // "I" key for inventory
            // show inventory menu
        }

        if ( Game.currentLevel.scene && Game.currentLevel.scene.playing ) {
            var scene = Game.currentLevel.scene;
            scene.next();
        }

        if ( Game.transforming ) {
            Game.hero.generateNextCoords( timeDiff );
            Game.hero.invalidateRect();
            for ( var i = 0; i < Game.currentLevel.entities.length; i++ ) {
                var collisions = Game.hero.getCollisions( Game.currentLevel.entities[i] );
                if ( collisions ) {
                    Game.hero.collideWith( Game.currentLevel.entities[i], collisions );
                }
            }
        } else {
            if ( Game.hero.pos.x >= ( Game.currentLevel.width - Game.hero.width ) && Game.currentLevel.next ) {
                Game.currentLevel.loadNextLevel();
                return;
            }

            var entities = Game.currentLevel.entities;

            //Destroy entities that are queued for removal
            for ( var i = Game.toBeDestroyed.length - 1; i >= 0; i-- ) {
                drawLayer = Game.drawLayers[Game.toBeDestroyed[i].drawLayer];
                for ( var j = entities.length - 1; j >= 0; j-- ) {
                    if ( entities[j] == Game.toBeDestroyed[i] ) {
                        entities[j].invalidateRect();
                        entities.splice( j, 1 ); 
                    }
                }
                for ( var j = drawLayer.length - 1; j >= 0; j-- ) {
                    if ( drawLayer[j] == Game.toBeDestroyed[i] ) {
                        drawLayer.splice( j, 1 );
                    }
                }
                Game.toBeDestroyed.splice( i, 1 );
            }

            // Generate each entity's next coordinates.
            for ( var i = 0; i < entities.length; i++ ) {
                entities[ i ].generateNextCoords( timeDiff );
            }

            ////////// Collision Detection ////////

            // Keep entity list sorted on x, ascending.
            entities.sort( function( a, b ) { return a.pos.x - b.pos.x } );

            // List of entities to check entities[ i ] against
            var activeList = new Array( entities[ 0 ] );

            // List of possible collisions
            var possibleCollisions = new Array();

            for ( var i = 1; i < entities.length; i++ ) {
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

            // Fine-grained collision detection.
            for ( var i = 0; i < possibleCollisions.length; i++ ) {
                var entityPair = possibleCollisions[ i ];
                if ( entityPair[ 0 ] instanceof Game.Entity && entityPair[ 1 ] instanceof Game.Entity ) {
                    Game.collider( entityPair[ 0 ], entityPair[ 1 ] );
                }
            }

            for ( var i = 0; i < entities.length; i++ ) {
                var ent = entities[ i ];
                if ( Game.still ) {
                    ent.pos.x = ent.oldPos.x;
                    ent.pos.y = ent.oldPos.y;
                }
                if ( ent.pos.x != ent.oldPos.x || ent.pos.y != ent.oldPos.y || ent.animated || ent.detached || ent.attached ) {
                    ent.invalidateRect();
                }
            }

            //Shift viewport if hero's pos is past the shift boundary
            if ( Game.currentLevel.type == 'sky' ) {
                if ( Game.viewportOffset < Game.viewportShiftBuffer ) {
                    Game.lastShift = Date.now();
                    Game.hero.pos.x += TILESIZE / 18;
                    Game.viewportShiftBoundary.left = Game.hero.pos.x - TILESIZE / 18;
                    Game.shiftViewport( 'left' );
                }
            } else {
                if ( Game.hero.pos.x > Game.viewportShiftBoundary.left && Game.viewportOffset < Game.viewportShiftBuffer ) {
                    Game.shiftViewport( 'left' );
                } else if ( Game.hero.pos.x < Game.viewportShiftBoundary.right && Game.viewportOffset ) {
                    Game.shiftViewport( 'right' );
                }
            }
        }
    },
    shiftViewport: function( direction ) {
        if ( direction == 'left' ) {
            Game.viewportShiftLeft = Game.hero.pos.x - Game.viewportShiftBoundary.left;
            if ( Game.viewportShiftLeft + Game.viewportOffset > Game.viewportShiftBuffer ) {
                Game.viewportShiftLeft = Game.viewportShiftBuffer - Game.viewportOffset;
            }
            Game.viewportShiftBoundary.left += Game.viewportShiftLeft;
            Game.viewportShiftBoundary.right += Game.viewportShiftLeft;
            Game.viewportOffset += Game.viewportShiftLeft;

            Game.lastAddedColumn = Game.lastAddedColumn || Game.viewportTileWidth - 1;

            // Load entities in
            var i, j,
                entity,
                tileOffset = Math.ceil( Game.viewportOffset / TILESIZE ),
                column = Game.viewportTileWidth + tileOffset;

            for ( i = Game.lastAddedColumn + 1; i <= column; i++ ) {
                for ( j = 0; j < Game.currentLevel.entityGrid.length; j++ ) {
                    entity = Game.currentLevel.entityGrid[ j ][ i ];
                    if ( entity ) {
                        Game.currentLevel.entities.push( entity );
                    }
                }
            }
            Game.lastAddedColumn = column;

        } else {
            Game.viewportShiftRight = Game.viewportShiftBoundary.right - Game.hero.pos.x;
            Game.viewportShiftBoundary.left -= Game.viewportShiftRight;
            Game.viewportShiftBoundary.right -= Game.viewportShiftRight;
            if ( Game.viewportOffset - Game.viewportShiftRight >= 0 ) {
                Game.viewportOffset -= Game.viewportShiftRight;
            }
        }
    },
    //The collider is where entities interact
    //Pass it two entities - if they have collisions we call
    //each of their collision handlers
    collider: function( a, b ) {
        // Obtain collision dictionaries for the two objects.
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
    },
    //Add entity to the removal queue
    destroyEntity: function( entity ) {
        Game.toBeDestroyed.push( entity );
    },
    //Used in rendering - anytime an entities animates or moves position
    //We add them to the invalidRect for that update
    invalidateRect: function( top, right, bottom, left ) {
        if ( !Game.invalidRect ) {
            Game.invalidRect = { top: top, right: right, bottom: bottom, left: left };
            return;
        }
        var invalidTop = Game.invalidRect.top,
            invalidBottom = Game.invalidRect.bottom,
            invalidLeft = Game.invalidRect.left,
            invalidRight = Game.invalidRect.right;

        if ( invalidTop > top ) {
            Game.invalidRect.top = top;
        }
        if ( invalidBottom < bottom ) {
            Game.invalidRect.bottom = bottom;
        }
        if ( invalidLeft > left ) {
            Game.invalidRect.left = left;
        }
        if ( invalidRight < right ) {
            Game.invalidRect.right = right;
        }
    },
    displayInvalidRect: function() {
        var left = $( Game.canvas ).offset().left + Game.invalidRect.left - Game.viewportOffset,
            top = $( Game.canvas ).offset().top + Game.invalidRect.top,
            width = Game.invalidRect.right - Game.invalidRect.left,
            height = Game.invalidRect.bottom - Game.invalidRect.top,
            box = $( '#invalid-rect' );
        if ( box.length ) {
            box.css( 'left', left + 'px' );
            box.css( 'top', top + 'px' );
            box.width( width );
            box.height( height );
        } else {
            box = $( '<div id="invalid-rect" style="border: 1px solid ' + DEBUG_INVALID_RECT_COLOR + ';position:absolute;left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px"></div>' );
            $( 'body' ).append( box );
        }
    },
    //Called every update - uses the invalidRect to set a clip
    //so we only re-render entities that have changed
    render: function() {
        var i, j, imageData,
            invalidLeft, invalidTop,
            invalidWidth, invalidHeight;

        if ( Game.invalidRect ) {
            invalidLeft = Game.invalidRect.left - Game.viewportOffset;
            invalidTop = Game.invalidRect.top;
            invalidWidth = Game.invalidRect.right - Game.viewportOffset - invalidLeft;
            invalidHeight = Game.invalidRect.bottom - invalidTop;

            // Handle viewport shift
            if ( Game.viewportShiftLeft ) {
                // Blit pixels
                var top = 0,
                    left = Game.viewportShiftLeft,
                    width = Game.viewportWidth - left,
                    height = Game.viewportHeight;

                imageData = Game.ctx.getImageData( left, top, width, height );
                Game.ctx.putImageData( imageData, 0, 0 );
                Game.ctx.clearRect( width, top, left, height );

                invalidTop = 0;
                invalidLeft = 0;
                invalidWidth = Game.viewportWidth;
                invalidHeight = Game.viewportHeight;

                Game.viewportShiftLeft = false;
            } else if ( Game.viewportShiftRight ) {
                // Blit pixels
                var top = 0,
                    left = 0,
                    width = Game.viewportWidth - Game.viewportShiftRight,
                    height = Game.viewportHeight;

                imageData = Game.ctx.getImageData( left, top, width, height );
                Game.ctx.putImageData( imageData, Game.viewportShiftRight, 0 );
                Game.ctx.clearRect( 0, 0, Game.viewportShiftRight, height );

                invalidTop = 0;
                invalidLeft = 0;
                invalidWidth = Game.viewportWidth;
                invalidHeight = Game.viewportHeight;

                Game.viewportShiftRight = false;
            }

            if ( DEBUG_INVALID_RECT ) {
                Game.displayInvalidRect();
            }

            //Save canvas context before setting clip
            Game.ctx.save();
            Game.ctx.beginPath();
            Game.ctx.rect( invalidLeft, invalidTop, invalidWidth, invalidHeight );
            //Set the clip to the invalidRect's position/dimensions
            Game.ctx.clip();
            Game.ctx.closePath();
            Game.ctx.fillStyle = Game.background;
            Game.ctx.fillRect( 0, 0, Game.viewportWidth, Game.viewportHeight );

            //When we render all entities only pixels that actually
            //get redrawn are the ones within the clip
            for ( i = 0; i < Game.drawLayers.length; i++ ) {
                for ( j = 0; j < Game.drawLayers[i].length; j++ ) {
                    Game.drawLayers[i][j].render();
                }
            }

            Game.ctx.restore();
            Game.invalidRect = null;
        }

        //Drawing health meter
        //TODO - refactor HUD rendering
        if ( !Game.HUDOff ) {

            for ( i = 0; i < Game.Inventory.maxHealth; i++ ) {
                if ( i % 2 == 0 && i < Game.Inventory.health ) {
                    Game.ctx.drawImage( Game.Sprites[ 'heart' ], Math.floor( i / 2 ) * TILESIZE + TILESIZE / 2, TILESIZE / 2 );
                } else if ( i == Game.Inventory.health && i % 2 == 1 ) {
                    Game.ctx.drawImage( Game.Sprites[ 'half-heart' ], Math.floor( i / 2 ) * TILESIZE + TILESIZE / 2, TILESIZE / 2 );
                } else if ( i % 2 == 0 ) {
                    Game.ctx.drawImage( Game.Sprites[ 'empty-heart' ], Math.floor( i / 2 ) * TILESIZE + TILESIZE / 2, TILESIZE / 2 );
                }
            }

            var levelName = Game.currentLevel.title;

            if ( levelName ) {
                Game.ctx.fillStyle = Game.background;

                Game.ctx.font = 'normal ' + LEVEL_NAME_FONT_SIZE + 'px uni05';
                Game.ctx.textAlign = 'right';

                Game.ctx.fillText( levelName, Game.viewportWidth - 10, TILESIZE );

                Game.ctx.fillStyle = LEVEL_NAME_COLOR;
                Game.ctx.fillText( levelName, Game.viewportWidth - 10, TILESIZE );
            }

            if ( Game.activeWalkthrough ) {
                var check = Game.activeWalkthrough.callback();

                if ( !check ) {
                    Game.invalidateRect( 0 - TILESIZE, Game.viewportWidth + 2 * TILESIZE, Game.viewportHeight + 2 * TILESIZE, 0 - TILESIZE );
                } else {
                    Game.activeWalkthrough.render();
                }
            }

        }
    },
    //Iterate through level grid and instantiate all entities based on class name
    loadLevel: function() {
        var entities,
            entityString,
            offsetMatch,
            offset,
            signMatch,
            signName,
            linkMatch,
            links = [],
            toLevel;

        if ( Game.currentLevel.type == 'sea' ) {
            Game.background = SEA_BACKGROUND;
        } else {
            Game.background = LAND_BACKGROUND;
        }

        Game.hero = null;
        Game.currentLevel.entities = [];

        Game.terrainGroup = null;
        Game.terrainGroupType = '';

        Game.currentLevel.entityGrid = [];
        for ( var i = 0; i < Game.currentLevel.grid.length; i++ ) {
            Game.currentLevel.entityGrid[i] = [];
            for ( var j = 0; j < Game.currentLevel.grid[i].length; j++ ) {
                entities = Game.currentLevel.grid[i][j].split( '|' );
                for ( k = 0; k < entities.length; k++ ) {
                    entityString = entities[k].split( ':' )[0];

                    offsetMatch = entityString.match( /\[([^\[\]]*)\]/ );
                    offset = offsetMatch ? offsetMatch[1] : 0;

                    linkMatch = entityString.match( /\(([^\(\)]*)\)/ );
                    linkIndex = linkMatch ? linkMatch[1] : null;

                    signMatch = entityString.match( /\{([^\{\}]*)\}/ );
                    signName = signMatch ? signMatch[1] : null;

                    entityString = entityString.replace( /\[[^\[\]]*\]/, '' ).replace( /\([^\(\)]*\)/, '' ).replace( /\{[^\{\}]*\}/, '' );
                    toLevel = entities[k].split( ':' )[1];
                    if ( entityString != 'blank' ) {
                        // Each entity gets initialized and put into our level's entity list
                        entity = eval( 'new Game.Entity.' + entityString.capitalize( '.' ) + '( ' + j * TILESIZE + ', ' + ( i * TILESIZE + offset * ( TILESIZE / 9 ) ) + ' )' );

                        if ( linkIndex ) {
                            links[ linkIndex ] = links[ linkIndex ] || [];
                            links[ linkIndex ].push( entity );
                        }
                        if ( signName ) {
                            if ( entity.type.indexOf( 'Friend' ) === 0 ) {
                                entity.setContent( Game.Dialog[ signName ] );
                            } else {
                                entity.setContent( Game.Signs[ signName ] );
                            }
                        }
                        if ( toLevel ) {
                            entity.toLevel = toLevel;
                        }
                        if ( entityString == 'terrain.land' || entityString == 'terrain.water' ) {
                            if ( Game.terrainGroup && entityString == Game.terrainGroupType ) {
                                Game.terrainGroup.attach( [ entity ] );
                            } else {
                                Game.terrainGroup = entity;
                                Game.terrainGroupType = entityString;
                                Game.currentLevel.entities.push( entity );
                            }
                        } else {
                            if ( Game.terrainGroup || j < Game.viewportTileWidth ) {
                                Game.currentLevel.entities.push( entity );
                            }
                            Game.terrainGroup = null;
                        }
                        if ( entityString.indexOf( 'hero' ) != -1 ) {
                            Game.hero = entity;
                        }
                        Game.currentLevel.entityGrid[i][j] = entity;
                    } else {
                        Game.terrainGroup = null;
                        Game.currentLevel.entityGrid[i][j] = null;
                    }
                }
            }
            // One last call for the end of the level
            Game.terrainGroup = null;
        }

        var buttonIndex,
            button,
            linkGroup;

        for ( var i = 0, l1 = links.length; i < l1; i++ ) {
            linkGroup = links[i]

            if ( linkGroup ) {
                for ( var j = 0, len = linkGroup.length; j < len; j++ ) {
                    if ( linkGroup[j] && linkGroup[j].type == 'Interactable.Switch' ) {
                        button = linkGroup[j];
                        buttonIndex = j;
                        break;
                    }
                }

                linkGroup.splice( j, 1 );
                button.setDoors( linkGroup );
            }
        }

        if ( Game.currentLevel.walkthroughs && Game.currentLevel.walkthroughs.length ) {
            Game.activeWalkthrough = Game.currentLevel.walkthroughs[0];
            Game.lastWalkthrough = 0;
        }
    },
    keyDownListener: function( evt ) {
        //Prevent default on up and down so the
        //browser doesn't attempt to scroll the page
        if ( evt.keyCode == JUMP_KEY || evt.keyCode == DOWN_KEY ) {
            evt.preventDefault();
        }
        if ( evt.keyCode == PAUSE_KEY ) {
            if ( !Game.paused ) {
                Game.keysDown[ PAUSE_KEY ] = 'locked';
                Game.pause( 'pause' );
            }
        } else if ( evt.keyCode == QUESTLOG_KEY ) {
            if ( !Game.paused ) {
                Game.keysDown[ QUESTLOG_KEY ] = 'locked';
                Game.pause( 'questlog' );
            }
        } else if ( evt.keyCode == MAP_KEY ) {
            if ( !Game.paused ) {
                Game.keysDown[ MAP_KEY ] = 'locked';
                Game.pause( 'map' );
            }
        }
        if ( Game.keysDown[ evt.keyCode ] != 'locked' ) {
            Game.keysDown[ evt.keyCode ] = true;
        }
    },
    keyUpListener: function( evt ) {
        delete Game.keysDown[ evt.keyCode ];
    },
    pause: function( menu ) {
        if ( menu == 'pause' ) {
            Game.pauseMenu.show();
        } else if ( menu == 'map' ) {
            Game.mapMenu.show();
        } else if ( menu == 'questlog' ) {
            Game.questlogMenu.show();
        }
        Game.paused = true;
        cancelAnimationFrame( Game.requestID );
    },
    resume: function() {
        Game.paused = false;
        Game.lastUpdate = null;
        Game.invalidateRect( 0, Game.viewportWidth, Game.viewportHeight, 0 );
        Game.requestID = requestAnimationFrame( Game.loop ); 
    },
    showTransformMenu: function() {
        Game.keyUpListener( { keyCode: ACTION_KEY } );
        Game.transformMenu.show();
        Game.startTransform = false;
    },
    openTransformMenu: function() {
        if ( Game.Questlog.inLog( 'man' ) || Game.godMode ) {
            Game.startTransform = true;
            return true;
        }
        // Can't transform - play sound
        return false;
    },
    openSign: function( content ) {
        var menuWidth = TILESIZE * MENU_WIDTH,
            menuHeight = TILESIZE * MENU_HEIGHT,
            menuLineWidth = MENU_LINE_WIDTH;

        Game.keyUpListener( { keyCode: ACTION_KEY } );
        Game.currentSign = new Game.Menu.Sign( ( Game.viewportWidth - menuWidth ) / 2, ( Game.viewportHeight - menuHeight ) / 2, menuWidth, menuHeight, menuLineWidth, content );
        Game.showSign = true;
    },
    openDialog: function( content ) {
        var menuWidth = TILESIZE * MENU_WIDTH,
            menuHeight = TILESIZE * MENU_HEIGHT,
            menuLineWidth = MENU_LINE_WIDTH;

        Game.keyUpListener( { keyCode: ACTION_KEY } );
        Game.currentSign = new Game.Menu.Dialog( ( Game.viewportWidth - menuWidth ) / 2, ( Game.viewportHeight - menuHeight ) / 2, menuWidth, menuHeight, menuLineWidth, content );
        Game.showSign = true;
    },
    showSignMenu: function() {
        Game.paused = true;
        Game.currentSign.show();
        Game.showSign = false;
    },
    startTransformAnimation: function( newType ) {
        Game.startTransform = false;
        Game.transforming = true;
        Game.keysLocked = true;
        Game.hero.transform( newType );
        Game.lastUpdate = null;
        Game.invalidateRect( 0, Game.viewportWidth + Game.viewportOffset, Game.viewportHeight, Game.viewportOffset );
        Game.render( 0 );
        Game.requestID = requestAnimationFrame( Game.loop );
    },
    doneTransforming: function() {
        Game.paused = false;
        Game.transforming = false;
        Game.keysLocked = false;
        Game.startTransform = false;
    },
    imageLoaded: function( img ) {
        if ( Game.imageCount < Game.totalSprites ) {
            Game.imageCount++;
            return;
        }
        if ( !Game.hasStarted ) {
            Game.hasStarted = true;
            Game.startLoop();
        }
    },
    stop: function() {
        cancelAnimationFrame( Game.requestID );
        Game.initDrawLayers();
        Game.hasStarted = false;
    },
    resize: function() {
        var $game = $( '#game' );
        $game.width( Game.viewportWidth )
        $game.height( Game.viewportHeight );
        $game.css( 'top', '-' + Game.viewportHeight / 2 + 'px' );
    },
    nextGameFrame: function() {
        Game.requestID = requestAnimationFrame( Game.loop ); 
    },
    gameOver: function() {
        Game.gameOverMenu.show();
        Game.paused = true;
    },
    switchLevel: function( levelID ) {
        Game.stopLoop = true;
        Game.switchToLevel = levelID;
    },
    performLevelSwitch: function() {
        Game.stop();
        Game.init( Game.switchToLevel );
        Game.stopLoop = false;
        Game.keysLocked = false;
        Game.switchToLevel = null;
    },
    //Draws four sides of a rectangle to make it hollow
    //path's stroke did not render colors well
    drawRectangle: function( left, top, width, height, lineWidth, color ) {
        var right = left + width,
            bottom = top + height;

        width += lineWidth;
        height += lineWidth;

        Game.ctx.fillStyle = color;
        // TL -> TR
        Game.ctx.fillRect( left, top, width, lineWidth );
        // TR -> BR
        Game.ctx.fillRect( right, top, lineWidth, height );
        // BL -> BR
        Game.ctx.fillRect( left, bottom, width, lineWidth );
        // TL -> BL
        Game.ctx.fillRect( left, top, lineWidth, height );
    },
    wrapText: function ( context, text, x, y, maxWidth, lineHeight, measureOnly ) {
        var words = text.split(' '),
            line = '',
            startY = y,
            largestWidth = 0;

        for( var n = 0; n < words.length; n++ ) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText( testLine );
            var testWidth = metrics.width;
            if ( testWidth > maxWidth && n > 0 ) {
                var width = context.measureText( line ).width;
                if ( width > largestWidth ) largestWidth = width;
                if ( !measureOnly ) {
                    context.fillText( line, x, y );
                }
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        width = context.measureText( line ).width;
        if ( width > largestWidth ) largestWidth = width;
        if ( !measureOnly ) {
            context.fillText(line, x, y);
        }

        return { width: largestWidth, height: ( y - startY ), bottom: y + lineHeight * 2 };
    },
    godMode: GOD_MODE
};
Game.viewportTileWidth = Settings.defaultViewportWidth;
Game.viewportTileHeight = Settings.defaultViewportHeight;
window.Game = Game;

$(function() {
    $( window ).on( 'resize', Game.resize );
});

})( Settings, window, document );
