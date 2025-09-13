window.onload = function () {
    'use strict';

    var win = window;
    var document = win.document;
    var body = document.body;
    var root = null;
    var Math = win.Math;

    var PI = Math.PI;
    var sqrt = Math.sqrt;
    var rand = Math.random;

    var YES = true;
    var NO = false;

    
    
    

    var SCALE = 1;
    var HORIZON_Y = 100 * SCALE;
    var SIZE = 400 * SCALE;
    var NUM_CELLS = 8;
    var CELL_SIZE = SIZE / NUM_CELLS;
    var NUM_CELLS_DISPLAYED = NUM_CELLS * 2 + 3;

    var DIALOG_MARGIN = 6;

    var screenWidth;
    var screenHeight;
    var screenMinSize;

    var bgCanvas = makeCanvas(SIZE, SIZE, 'bg');
    var bgCtx = getContext(bgCanvas);

    var shadowCanvas = makeCanvas(SIZE, SIZE, 'shadow');
    var shadowCtx = getContext(shadowCanvas);

    var skyCanvas = makeCanvas(SIZE, 2 * SIZE, 'sky');
    var skyCtx = getContext(skyCanvas);

    
    
    

    var now = 0; 
    var lastTime;
    var MS_TO_S = 1 / 1000;

    var killCount = 0;
    var checkMateCount = 0;
    var checkCount = 0;

    var winScreen = null;
    var gameOverScreen = null;
    var gameIsOver = false;
    var autoMove = false;
    var progress = 0; 
    var progressPerSec = 1; 
    var checkBoard = null;
    var checkPoints = null;
    var topRowDisplayed = -1;
    var raf = true;
    var removedPieces = [];
    var lastRowIndex;

    var player = null;
    var playerAnimDuration = 0.05;
    var playerInvalidDuration = 0.5;

    var pressSpaceText = null;
    var pauseText = null;
    var introScreen = null;
    var intro = true;
    var introStartTime;
    var introDurationSec = 5;
    var perspectiveProgress = 0;
    var introProgress = 0;
    var introStep = -1;

    var dialogBox;
    var dialogSpeakerText;
    var dialogText;
    var dialogHint;

    var checkText;

    
    var HERO_KING = 'h';
    var ENEMY_KING = 'e';
    var PAWN = 'p';
    var ROOK = 'r';
    var BISHOP = 'b';
    var KNIGHT = 'k';
    var LAND_MINE = 'l';
    var WAR_BEAR = 'w';
    var CASTLE = 'c';
    var QUEEN = 'q';

    
    var ENEMY_FILTER = 'ef';
    var CHECK_TEXT = 'ct';
    var CHECK_GRADIENT = 'cg';

    var DANGER = '*';
    var CHECK_POINT = '#';

    
    
    

    function init() {
        root = document.createElement('div');
        root.id = 'root';
        body.appendChild(root);
        var style = root.style;
        style.position = 'absolute';
        style.left = '50%';
        style.top = '0';
        style.marginLeft = -SIZE / 2 + 'px ';

        initCheckBoardCanvas();
        initSkyCanvas();
        initSvg();
        initShadowCanvas();

        
        initCheckBoard(0);

        
        window.__pauseCount = 0;

        
        var canPlay = true;
        try {
            canPlay = !!localStorage.getItem('cp_player_name_v1');
        } catch (e) {
            canPlay = true;
        }
        if (canPlay) {
            tic();
        } else {
            window.__startGameIfBlocked = function () {
                try {
                    if (localStorage.getItem('cp_player_name_v1')) {
                        tic();
                        delete window.__startGameIfBlocked;
                    }
                } catch (e) {}
            };
        }

        
    }

    
    
    

    function restart() {
        
        var checkPointIndex = checkPoints.length - 1;
        for (var i = 0; i < checkPoints.length; i++) {
            if (progress < checkPoints[i]) {
                if (i > 0) {
                    checkPointIndex = i - 1;
                }
                break;
            }
        }
        
        initCheckBoard(checkPointIndex);
        
        lastTime = null;
        topRowDisplayed = -1;
        checkMateCount++;
    }

    function initCheckBoard(startCheckPointIndex) {
        if (checkBoard) {
            destroyCheckBoard();
        }
        checkBoard = [];
        checkPoints = [0];
        var CHECK_POINT_HEIGHT = 5;
        var currentRowIndex = 0;

        
        block(
            { intro: true },
            '',
            '',
            '',
            intro ? '  reqr' : '',
            intro ? '   kk' : '',
            '',
            '',
            '',
            '',
            '',
            '',
            'kkkkkkkk'
        );

        
        block({ showThreat: 'p' }, '', '', '    p', '', '', '', '', '');

        
        block('  pppp', '  pppp', '', '  p', '', '     p', '', ' p');

        
        block('', 'pppppp', '', '  pppppp', '', 'pppppp', '', '');

        
        block('', 'pp   ppp', '  p p', '   p', '', '', '', '');

        
        block('', '   pp', 'p p  p p', ' p    p', '', '', '', '');

        
        block('', '    ppp', '     p', 'ppp', ' p   ppp', '      p', '', '');

        
        checkPoint();

        
        block({ showThreat: 'r' }, '', '   p', '', '   r', '', '   p', '', '');

        
        block('', '', 'r', ' r', '  r', '   r', '    r', '     r', 'pppppp');

        
        block('', '', '', '       p', '    rp r', '', '', 'pp', 'r   p  p', 'p');

        
        block('', 'p     r', 'r     p', 'r    p', '', '   p', '   p', 'p  ppppp', '');

        
        checkPoint();

        
        block({ showThreat: 'b' }, '', '', '', '', '...b', '', '', '', '');

        
        block('', ' p p p', 'b b b b', '', '', '', '', '', '');

        
        block('', 'r.p..p.r', 'p......p', '', 'b      b', 'pp....pp', '', '');

        
        block('', 'r', ' r  p..b', '     ..r', '....p', '...p', '..p', 'pp.....p');

        
        checkPoint();

        
        block({ showThreat: 'k' }, '', '', '   k', '', '', '', '', '');

        
        block('p', 'r.....p', '', '', '......kk', '', 'pkk', '');

        
        block('p   pppp', 'r    b r', '   p b p', '', '', '', ' k', '', '', '');

        
        checkPoint();

        
        block({ showThreat: 'l' }, '', '', '', '   l', '', '', '', '');

        
        block(
            'l.llllll',
            'l.l....l',
            '..l.llll',
            '.ll.l   ',
            'l...l l ',
            'l.lll l ',
            'l.    l ',
            'lllllll '
        );

        
        block(' p  pll', ' l p   l', 'lpl p p ', '     lp', 'll ll l', ' l  l', '', '');

        
        block(
            '',
            '  r',
            '  llk',
            '     .',
            '   l ..',
            '   p  pb',
            '  . .  l',
            '  p  l',
            '',
            '',
            '',
            '',
            ''
        );

        
        checkPoint();

        block('', 'c', '', '', '', '', '');
        lastRowIndex = currentRowIndex;

        if (startCheckPointIndex === 0) {
            
            player = addPieceAt(HERO_KING, 5, 4).piece;
            progress = 2; 
        } else {
            progress = checkPoints[startCheckPointIndex];
            player = addPieceAt(HERO_KING, progress, 3).piece;
            progress -= 4;
        }

        function checkPoint() {
            var center = Math.ceil(CHECK_POINT_HEIGHT / 2);
            checkPoints.push(currentRowIndex + center);
            for (var i = 0; i < CHECK_POINT_HEIGHT; i++) {
                checkBoard[currentRowIndex] = [];
                if (i == center) {
                    for (var j = 0; j < NUM_CELLS; j++) {
                        checkBoard[currentRowIndex][j] = { checkPoint: true };
                    }
                }
                currentRowIndex++;
            }
        }

        
        function block() {
            var hasStars = false;
            var piece;
            var args = Array.prototype.slice.call(arguments);
            var options;
            if (typeof args[0] == 'object') {
                options = args.shift();
            } else {
                options = {};
            }
            var showThreatCell;
            var doAdd = startCheckPointIndex < checkPoints.length;
            var startRowIndex = currentRowIndex;
            var row, i, j;
            for (i = args.length - 1; i >= 0; i--) {
                row = args[i];
                if (row.length > NUM_CELLS) throw new Error();

                checkBoard[currentRowIndex] = [];
                if (doAdd) {
                    if (row !== '') {
                        for (j = 0; j < row.length; j++) {
                            var char = row.charAt(j);
                            if (char !== ' ' && char !== '.') {
                                var lowerChar = char.toLowerCase();
                                var pieceCell = addPieceAt(lowerChar, currentRowIndex, j);
                                if (options.showThreat == lowerChar) {
                                    showThreatCell = checkBoard[currentRowIndex][j];
                                }
                                if (char != lowerChar) {
                                    
                                }
                                if (options.intro) {
                                    pieceCell.piece.intro = true;
                                }
                            }
                        }
                    }
                }
                currentRowIndex++;
            }
            if (showThreatCell) {
                showThreatCell.piece.showThreat = true;
                for (i = startRowIndex; i < currentRowIndex; i++) {
                    row = checkBoard[i];
                    for (j = 0; j < NUM_CELLS; j++) {
                        var cell = getThreateningCell(i, j);
                        if (cell && cell.piece == showThreatCell.piece) {
                            if (!checkBoard[i][j]) {
                                checkBoard[i][j] = {};
                            }
                            checkBoard[i][j].showThreat = true;
                        }
                    }
                }
            }
        }
    }

    function destroyCheckBoard() {
        for (var row in checkBoard) {
            if (checkBoard[row]) {
                for (var col in checkBoard[row]) {
                    var cell = checkBoard[row][col];
                    if (cell && cell.piece) {
                        removeSvgShape(cell.piece);
                    }
                }
            }
        }
    }

    function addPieceAt(type, row, col) {
        var piece = {
            shape: null,
            type: type,
            row: row,
            col: col,
            showThreat: false,
        };
        if (!checkBoard[row]) {
            checkBoard[row] = [];
        }
        if (!checkBoard[row][col]) {
            if (typeof window !== 'undefined' && window.Board && window.Board.ensureCell) {
                window.Board.ensureCell(checkBoard, row, col);
            } else {
                checkBoard[row][col] = {};
            }
        }
        checkBoard[row][col].piece = piece;

        
        if (type == CASTLE) {
            for (var i = 0; i < NUM_CELLS; i++) {
                if (i != 3 && i != 4) {
                    if (!checkBoard[row][i]) {
                        checkBoard[row][i] = {};
                    }
                    checkBoard[row][i].wall = true;
                }
            }
        }

        return checkBoard[row][col];
    }

    function movePlayer(row, col) {
        var oldCol = player.col;
        var oldRow = player.row;

        if (col < 0) {
            col = 0;
        } else if (col >= NUM_CELLS) {
            col = NUM_CELLS - 1;
        }
        var rowMin = Math.floor(progress);
        var rowMax = topRowDisplayed - 2;
        if (row < rowMin) {
            row = rowMin;
        } else if (row >= rowMax) {
            row = rowMax;
        }
        if (col != oldCol || row != oldRow) {
            var oldCell = checkBoard[oldRow][oldCol];
            if (!checkBoard[row]) {
                checkBoard[row] = [];
            }
            var cell = checkBoard[row][col];
            if (!cell) {
                cell = {};
                checkBoard[row][col] = cell;
            }
            if (!cell.wall) {
                
                var threateningCell = getThreateningCell(row, col);
                if (threateningCell) {
                    aa.play('check');
                    
                    player.invalid = true;
                    player.invalidCol = col;
                    player.invalidRow = row;
                    player.threateningPiece = threateningCell.piece;
                    col = oldCol;
                    row = oldRow;
                    checkCount++;
                } else {
                    player.invalid = false;
                    if (cell.piece) {
                        
                        destroyPiece(cell.piece);
                        killCount++;
                        aa.play('capture');
                    } else {
                        aa.play('move');
                    }
                    
                    oldCell.piece = null;
                    cell.piece = player;
                }
                player.oldCol = oldCol;
                player.oldRow = oldRow;
                player.anim = true;
                player.animStartTime = now;
                player.col = col;
                player.row = row;

                if (row >= lastRowIndex) {
                    setGameIsOver(true, true);
                }
            }
        }
    }

    function getThreateningCell(row, col) {
        if (typeof window !== 'undefined' && window.Collisions && window.Collisions.checkThreat) {
            return window.Collisions.checkThreat(getCellWithPieceAt, row, col, NUM_CELLS, {
                LAND_MINE: LAND_MINE,
                PAWN: PAWN,
                ROOK: ROOK,
                BISHOP: BISHOP,
                KNIGHT: KNIGHT,
            });
        }
        var threateningCell;
        
        threateningCell = getCellWithPieceAt(row, col, LAND_MINE);
        if (threateningCell) {
            return threateningCell;
        }
        
        threateningCell =
            getCellWithPieceAt(row + 1, col - 1, PAWN) ||
            getCellWithPieceAt(row + 1, col + 1, PAWN);
        if (threateningCell) {
            return threateningCell;
        }
        
        var i, j, cell;
        
        for (j = col - 1; j >= 0; j--) {
            cell = getCellWithPieceAt(row, j);
            if (cell && cell.piece) {
                if (cell.piece.type == ROOK) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        for (j = col + 1; j <= NUM_CELLS; j++) {
            cell = getCellWithPieceAt(row, j);
            if (cell && cell.piece) {
                if (cell.piece.type == ROOK) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        for (i = row + 1; i <= row + NUM_CELLS; i++) {
            cell = getCellWithPieceAt(i, col);
            if (cell && cell.piece) {
                if (cell.piece.type == ROOK) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        for (i = row - 1; i >= row - NUM_CELLS; i--) {
            cell = getCellWithPieceAt(i, col);
            if (cell && cell.piece) {
                if (cell.piece.type == ROOK) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        
        for (j = col - 1, i = row - 1; j >= 0; j--, i--) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == BISHOP) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        for (j = col + 1, i = row - 1; j < NUM_CELLS; j++, i--) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == BISHOP) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        for (j = col - 1, i = row + 1; j >= 0; j--, i++) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == BISHOP) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        
        for (j = col + 1, i = row + 1; j < NUM_CELLS; j++, i++) {
            cell = getCellWithPieceAt(i, j);
            if (cell && cell.piece) {
                if (cell.piece.type == BISHOP) {
                    return cell;
                } else {
                    break;
                }
            }
        }
        threateningCell =
            getCellWithPieceAt(row + 2, col - 1, KNIGHT) ||
            getCellWithPieceAt(row - 2, col - 1, KNIGHT) ||
            getCellWithPieceAt(row + 2, col + 1, KNIGHT) ||
            getCellWithPieceAt(row - 2, col + 1, KNIGHT) ||
            getCellWithPieceAt(row + 1, col - 2, KNIGHT) ||
            getCellWithPieceAt(row - 1, col - 2, KNIGHT) ||
            getCellWithPieceAt(row + 1, col + 2, KNIGHT) ||
            getCellWithPieceAt(row - 1, col + 2, KNIGHT);

        return threateningCell;
    }

    function getCellWithPieceAt(row, col, type) {
        if (typeof window !== 'undefined' && window.Board && window.Board.getCellWithPieceAt) {
            return window.Board.getCellWithPieceAt(checkBoard, row, col, type);
        }
        var rowArray = checkBoard[row];
        if (rowArray) {
            var cell = rowArray[col];
            if (cell && cell.piece && (!type || cell.piece.type == type)) {
                return cell;
            }
        }
    }

    function destroyPiece(piece) {
        removedPieces.push(piece);
        piece.removedTime = now;
        piece.justRemoved = true;

        if (piece.showThreat) {
            
            for (var i = piece.row - NUM_CELLS; i < piece.row + NUM_CELLS; i++) {
                var rowContent = checkBoard[i];
                if (rowContent) {
                    for (var j = piece.col - NUM_CELLS; j < piece.col + NUM_CELLS; j++) {
                        if (rowContent[j]) {
                            rowContent[j].showThreat = false;
                        }
                    }
                }
            }
        }
    }

    
    
    

    function tic() {
        if (window.stb) stb(); 

        if (gameIsOver) {
            if (keys.space === 0 || mouse.click) {
                setGameIsOver(false);
                keys.space = -1;
            }
        } else {
            if (!intro) {
                processInput();
                update();
            } else {
                if (introStep >= 0) {
                    if (keys.space === 0 || mouse.click) {
                        keys.space = -1;
                        nextIntroStep();
                    }
                }
                updateIntro();
            }
            
            render();
            
        }
        mouse.click = false;

        if (window.ste) ste();

        if (raf) {
            requestAnimationFrame(tic);
        }
    }

    function setGameIsOver(val, win) {
        if (win) {
            raf = false;
            gameIsOver = true;
            winScreen.style.display = 'block';
        } else {
            if (val != gameIsOver) {
                gameIsOver = val;

                if (gameIsOver) {
                    gameOverScreen.style.display = 'block';
                } else {
                    gameOverScreen.style.display = 'none';
                    restart();
                }
            }
        }
    }

    
    
    

    
    var KEY_LATENCY = 6;
    var KEY_DONE = -1;
    var keysBlockedUntilAllUp = false;
    var mouse = {};
    var mouseRow = -1;
    var mouseCol = -1;
    function processInput() {
        if (topRowDisplayed <= 0) {
            return;
        }
        if (player.invalid || intro) {
            
            return;
        }

        var dx = 0;
        var dy = 0;
        if (!keysBlockedUntilAllUp) {
            
            
            if (keys.down == KEY_LATENCY || keys.down === 0) {
                dy = -1;
            }
            if (keys.up == KEY_LATENCY || keys.up === 0) {
                dy = 1;
            }
            if (keys.left == KEY_LATENCY || keys.left === 0) {
                dx = -1;
            }
            if (keys.right == KEY_LATENCY || keys.right === 0) {
                dx = 1;
            }
            
            if (keys.upLeft == KEY_LATENCY || keys.upLeft === 0) {
                dx = -1;
                dy = 1;
            }
            if (keys.upRight == KEY_LATENCY || keys.upRight === 0) {
                dx = 1;
                dy = 1;
            }
            if (keys.downLeft == KEY_LATENCY || keys.downLeft === 0) {
                dx = -1;
                dy = -1;
            }
            if (keys.downRight == KEY_LATENCY || keys.downRight === 0) {
                dx = 1;
                dy = -1;
            }

            if (dx || dy) {
                
                if (!dx && !dy) {
                    if (keys.left <= KEY_LATENCY && keys.left > 0) {
                        dx = -1;
                    }
                    if (keys.right <= KEY_LATENCY && keys.right > 0) {
                        dx = 1;
                    }
                } else if (!dy) {
                    if (keys.up <= KEY_LATENCY && keys.up > 0) {
                        dy = 1;
                    }
                    if (keys.down <= KEY_LATENCY && keys.down > 0) {
                        dy = -1;
                    }
                }
                
                movePlayer(player.row + dy, player.col + dx);

                keysBlockedUntilAllUp = true;
            }
        }

        var keyName;
        if (keysBlockedUntilAllUp) {
            var allUp = true;
            for (keyName in keyBoolMap) {
                if (keyBoolMap[keyName]) {
                    allUp = false;
                    break;
                }
            }
            keysBlockedUntilAllUp = !allUp;
        }

        
        for (keyName in keys) {
            if (keys[keyName] >= 1) {
                keys[keyName]++;
            } else if (keys[keyName] > KEY_DONE) {
                keys[keyName]--;
            }
        }

        
        if (
            !player.anim &&
            mouse.x > 0 &&
            mouse.x < SIZE &&
            mouse.y > HORIZON_Y &&
            mouse.y < SIZE + HORIZON_Y
        ) {
            var mouseX = mouse.x / SIZE;
            var mouseY = (mouse.y - HORIZON_Y) / SIZE;
            reverseProject(mouseX, mouseY);
            mouseCol = Math.floor(reverseProject.res.x * NUM_CELLS);
            mouseRow = Math.floor(reverseProject.res.y * NUM_CELLS + progress);
            dx = mouseCol - player.col;
            dy = mouseRow - player.row;
            if (dx > 1) {
                dx = 1;
            } else if (dx < -1) {
                dx = -1;
            }
            if (dy > 1) {
                dy = 1;
            } else if (dy < -1) {
                dy = -1;
            }
            mouseRow = player.row + dy;
            mouseCol = player.col + dx;
            if (mouse.click && (dx || dy)) {
                movePlayer(mouseRow, mouseCol);
            }

            
        } else {
            mouseCol = -1;
            mouseRow = -1;
        }
    }

    function update() {
        now = Date.now();
        if (lastTime) {
            progress += progressPerSec * (now - lastTime) * MS_TO_S;
        }

        if (player.row < progress - 0.9) {
            
            if (autoMove) {
                
                if (!getThreateningCell(player.row + 1, player.col)) {
                    movePlayer(player.row + 1, player.col);
                } else if (!getThreateningCell(player.row + 1, player.col + 1)) {
                    movePlayer(player.row + 1, player.col + 1);
                } else if (!getThreateningCell(player.row + 1, player.col - 1)) {
                    movePlayer(player.row + 1, player.col - 1);
                } else {
                    setGameIsOver(true);
                    return;
                }
            } else {
                setGameIsOver(true);
            }
            aa.play('checkmate');
        }

        
        var topRow = Math.floor(progress) + NUM_CELLS_DISPLAYED;
        if (!lastTime || topRowDisplayed < topRow) {
            var row, colIndex, changes;
            
            for (
                var i = topRow - NUM_CELLS_DISPLAYED - 5;
                i > topRowDisplayed - NUM_CELLS_DISPLAYED - 5;
                i--
            ) {
                row = checkBoard[i];
                if (row) {
                    changes = true;
                    
                    for (colIndex = 0; colIndex < NUM_CELLS; colIndex++) {
                        if (row[colIndex] && row[colIndex].piece) {
                            removeSvgShape(row[colIndex].piece);
                        }
                    }
                }
            }

            
            for (i = topRowDisplayed + 1; i <= topRow; i++) {
                row = checkBoard[i];
                if (row) {
                    changes = true;
                    
                    for (colIndex = 0; colIndex < NUM_CELLS; colIndex++) {
                        
                        var index = NUM_CELLS / 2;
                        if (colIndex % 2 === 0) {
                            index += colIndex / 2;
                        } else {
                            index -= (colIndex + 1) / 2;
                        }
                        if (row[index] && row[index].piece) {
                            addSvgShape(row[index].piece);
                        }
                    }
                }
            }
            
            topRowDisplayed = topRow;
        }

        lastTime = now;
    }

    
    
    

    var introTweens;
    function updateIntro() {
        var whiteKing = checkBoard[8][3].piece;
        var blackKing = player;

        
        var i, j, cell, row;
        now = Date.now();
        var init = !introStartTime;
        if (init) {
            
            introStartTime = now;
            skipIntroTweens();
            if (whiteKing) {
                whiteKing.talking = false;
                whiteKing.talkingStarTime = now;
            }
            blackKing.talking = false;
            blackKing.talkingStarTime = now;
        }

        if (introStep == -1) {
            shadowCanvas.style.opacity = 0;
            skyCanvas.style.opacity = 0;
            perspectiveProgress = 0;
            
            update();
            lastTime = null;
            introStep = 0;
        } else if (introStep === 0) {
            
        } else if (introStep == 1) {
            if (init) {
                showDialog(true, [
                    'Surrender Black King !',
                    'Your army is defeated, and your Queen is mine !',
                ]);
                whiteKing.talking = true;
            }
        } else if (introStep == 2) {
            if (init) {
                hideDialog();
                
                for (j = 0; j < NUM_CELLS; j++) {
                    cell = checkBoard[0][j];
                    addIntroTween(
                        cell.piece,
                        { row: 2, col: j + (j % 2 === 0 ? 1 : -1) },
                        j * 0.1,
                        0.5
                    );
                }
            }
        } else if (introStep == 3) {
            if (init) {
                showDialog(true, [
                    "You thought I'd only bring two knights to battle ?",
                    'You are surrounded,',
                    'admit defeat now and I shall be merciful.',
                ]);
                whiteKing.talking = true;
            }
        } else if (introStep == 4) {
            if (init) {
                showDialog(false, ['Never !']);
                blackKing.talking = true;
            }
            
        } else if (introStep == 5) {
            if (init) {
                showDialog(true, [
                    'As you wish...',
                    'I am taking the prisoner back to the castle.',
                    'Knights, capture him, I want him alive.',
                ]);
                whiteKing.talking = true;
            }
        } else if (introStep == 6) {
            if (init) {
                hideDialog();
                
                for (j = 2; j <= 5; j++) {
                    cell = checkBoard[8][j];
                    if (cell) {
                        addIntroTween(cell.piece, { row: 9 }, 0, 0.5);
                        addIntroTween(cell.piece, { row: 10 }, 1, 0.5);
                    }
                }
                addIntroTween(checkBoard[7][3].piece, { row: 8, col: 1 }, 0.5, 0.5);
                addIntroTween(checkBoard[7][3].piece, { row: 10, col: 2 }, 1.5, 0.5);
                addIntroTween(checkBoard[7][4].piece, { row: 8, col: 6 }, 0.5, 0.5);
                addIntroTween(checkBoard[7][4].piece, { row: 10, col: 5 }, 1.5, 0.5);
            }
        } else if (introStep == 7) {
            if (init) {
                var anim =
                    '<animate attributeType="CSS" attributeName="fill" from="red" to="orange" dur="0.5s" repeatCount="indefinite"/>';
                showDialog(false, [
                    'It looks like our roles are <tspan fill="red" font-family="impact">REVERSED' +
                        anim +
                        '</tspan> my Queen.',
                    'Today, it is my turn to protect you !',
                ]);
                blackKing.talking = true;

                
                for (i = 1; i < 2 * NUM_CELLS; i++) {
                    row = checkBoard[i];
                    if (row) {
                        for (j = 0; j < NUM_CELLS; j++) {
                            cell = row[j];
                            if (cell && cell.piece && cell.piece.intro) {
                                removeSvgShape(cell.piece);
                                row[j] = {};
                            }
                        }
                    }
                }
            }
        } else if (introStep == 8) {
            if (init) {
                hideDialog();
                pressSpaceText.style.display = 'none';
            }
            
            introProgress = (now - introStartTime) / (4 * 1000);
            if (introProgress > 1) {
                introStep = 9;
            } else {
                introProgress = Math.sin((introProgress * PI) / 2);

                perspectiveProgress = (introProgress - 0.2) / 0.6;
                if (perspectiveProgress < 0) {
                    perspectiveProgress = 0;
                } else if (perspectiveProgress > 1) {
                    perspectiveProgress = 1;
                }
                shadowCanvas.style.opacity = perspectiveProgress;
                if (introProgress > 0.8) {
                    introScreen.style.opacity = (1 - introProgress) / 0.2;
                    skyCanvas.style.opacity = 1 - introScreen.style.opacity;
                }
            }
        }

        if (init) {
            if (!introTweens.length) {
                pressSpaceText.style.opacity = 1;
            } else {
                pressSpaceText.style.opacity = 0;
                var hasText = introTweens[0].e == dialogBox && introTweens[0].to._y == dialogOpenY;
                var lastTween = introTweens[introTweens.length - 1];
                var delay = lastTween.du + lastTween.de;
                if (hasText) {
                    addIntroTween(pressSpaceText.style, { opacity: 1 }, delay + 2, 0.1);
                } else if (introStep > 1 && introStep < 8) {
                    addIntroCallback(nextIntroStep, delay);
                }
            }
        }
        updateIntroTweens();

        if (introStep == 9) {
            intro = false;
            perspectiveProgress = 1;
            introScreen.style.display = 'none';
            shadowCanvas.style.opacity = 1;
            skyCanvas.style.opacity = 1;
            pressSpaceText.style.display = 'none';
            hideDialog();
            player.talking = false;
        }

        lastTime = now;
    }

    function nextIntroStep() {
        introStep++;
        introStartTime = null;
    }

    function addIntroTween(element, props, delay, duration) {
        introTweens.push({ e: element, to: props, de: delay || 0, du: duration });
    }

    function addIntroCallback(callback, duration) {
        introTweens.push({ cb: callback, de: 0, du: duration });
    }

    function skipIntroTweens() {
        if (introTweens) {
            for (var i = 0; i < introTweens.length; i++) {
                var t = introTweens[i];
                if (t.e) {
                    for (var key in t.to) {
                        t.e[key] = t.to[key];
                    }
                }
            }
        }
        introTweens = [];
    }

    function updateIntroTweens() {
        var time = (now - introStartTime) * MS_TO_S;
        var key;
        for (var i = 0; i < introTweens.length; i++) {
            var tween = introTweens[i];
            if (time <= tween.de) {
                
            } else if (time >= tween.de + tween.du) {
                
                if (tween.cb) {
                    tween.cb();
                    tween.cb = null;
                }
            } else {
                if (tween.e) {
                    if (!tween.from) {
                        tween.from = {};
                        for (key in tween.to) {
                            tween.from[key] = tween.e[key];
                        }
                    }
                    var p = (time - tween.de) / tween.du;
                    
                    p = Math.sin((p * PI) / 2);
                    for (key in tween.to) {
                        tween.e[key] = tween.from[key] * (1 - p) + tween.to[key] * p;
                    }
                }
            }
        }
        dialogBox.setAttributeNS(null, 'y', dialogBox._y);
    }

    
    
    

    var BG_COLOR = '#0B1220';
    var CELL_COLOR_1 = '#E5E7EB';
    var CELL_COLOR_2 = '#CBD5E1';
    var STROKE_COLOR = '#D1D5DB';
    var ROLLOVER_COLOR = 'rgba(96, 165, 250, 0.45)';
    var PIECE_FILL_COLOR = '#F3F4F6';
    var PIECE_STROKE_COLOR = '#374151';
    var INVALID_CELL_COLOR_RGB = '200,60,60';
    var CHECK_POINT_COLOR = 'rgba(125, 211, 252, 0.30)';
    var ADJACENT_TILE_COLOR = 'rgba(100, 149, 237, 0.25)';

    function render() {
        
        

        
        var pieceAfterPlayer;
        var row;
        for (
            var rowIndex = topRowDisplayed - NUM_CELLS_DISPLAYED - 5;
            rowIndex <= topRowDisplayed;
            rowIndex++
        ) {
            row = checkBoard[rowIndex];
            if (row) {
                for (var colIndex = 0; colIndex < NUM_CELLS; colIndex++) {
                    if (row[colIndex] && row[colIndex].piece) {
                        var piece = row[colIndex].piece;
                        computeCellPos(piece.row, piece.col, piece);

                        if (piece.talking) {
                            var bounce =
                                -Math.abs(Math.sin(((now - piece.talkingStarTime) * PI) / 800)) *
                                CELL_SIZE *
                                0.2;
                            piece.y += bounce;
                        }

                        updatePieceStyle(piece);
                        if (
                            piece.y > player.y &&
                            (!pieceAfterPlayer || pieceAfterPlayer.y > piece.y)
                        ) {
                            pieceAfterPlayer = piece;
                        }
                    }
                }
            }
        }

        
        var playerAnimProgress;
        if (player.anim) {
            if (!player.invalid) {
                playerAnimProgress = (MS_TO_S * (now - player.animStartTime)) / playerAnimDuration;
            } else {
                playerAnimProgress =
                    (MS_TO_S * (now - player.animStartTime)) / playerInvalidDuration;
            }
            if (playerAnimProgress < 0 || playerAnimProgress >= 1) {
                player.anim = false;
                if (player.invalid && player.threateningPiece) {
                    player.threateningPiece.shape.style.filter = 'none';
                }
                player.invalid = false;
            } else {
                playerAnimProgress = Math.sin(playerAnimProgress * PI * 0.5); 
                if (player.invalid) {
                    computeCellPos(player.row, player.col);
                    var shakeAmplitude =
                        0.4 *
                        (playerAnimProgress < 0.5 ? playerAnimProgress : 1 - playerAnimProgress) *
                        CELL_SIZE;
                    var shake = Math.sin(6 * playerAnimProgress * PI) * shakeAmplitude;
                    player.x += shake;
                    updatePieceStyle(player);
                    
                    player.threateningPiece.shape.style.filter = 'url(#' + ENEMY_FILTER + ')';
                } else {
                    
                    computeCellPos(player.oldRow, player.oldCol);
                    
                    player.opacity =
                        playerAnimProgress * player.opacity +
                        (1 - playerAnimProgress) * computeCellPos.res.opacity;
                    player.scale =
                        playerAnimProgress * player.scale +
                        (1 - playerAnimProgress) * computeCellPos.res.scale;
                    player.x =
                        playerAnimProgress * player.x +
                        (1 - playerAnimProgress) * computeCellPos.res.x;
                    player.y =
                        playerAnimProgress * player.y +
                        (1 - playerAnimProgress) * computeCellPos.res.y;
                    updatePieceStyle(player);
                }
            }
        }

        
        for (i = 0, len = removedPieces.length; i < len; i++) {
            var removedPiece = removedPieces[i];
            var removedPieceProgress = (now - removedPiece.removedTime) / 1000;

            if (removedPieceProgress > 1) {
                
                removeSvgShape(removedPiece);
                removedPieces[i] = removedPieces[len - 1];
                len--;
                i--;
                removedPieces = removedPieces.slice(0, len);
                
            } else {
                if (removedPiece.justRemoved) {
                    removedPiece.justRemoved = false;
                    removedPiece.removedX = removedPiece.x;
                    removedPiece.removedY = removedPiece.y;
                }
                if (removedPiece.x < SIZE * 0.5) {
                    removedPiece.x = removedPiece.removedX - removedPieceProgress * SIZE;
                } else {
                    removedPiece.x = removedPiece.removedX + removedPieceProgress * SIZE;
                }
                removedPiece.y =
                    removedPiece.removedY - Math.sin(removedPieceProgress * PI) * SIZE * 0.4;
                updatePieceStyle(removedPiece);

                
            }
        }

        
        if (typeof window !== 'undefined' && window.Perf && window.Perf.flush) {
            window.Perf.flush();
        }

        
        if (player.anim && player.invalid) {
            if (!checkText) {
                checkText = {
                    onTop: true,
                    type: CHECK_TEXT,
                };
            }
            if (!checkText.shape) {
                addSvgShape(checkText);
                checkText.row = player.invalidRow;
                checkText.col = player.invalidCol;
            }
            computeCellPos(player.invalidRow, player.invalidCol, checkText);
            checkText.scale = 1;
            checkText.y -= playerAnimProgress * checkText.scale * CELL_SIZE * 0.2;
            checkText.opacity =
                playerAnimProgress < 0.8 ? 1 : 1 - (playerAnimProgress - 0.8) / (1 - 0.8);
            updatePieceStyle(checkText);
        } else if (checkText && checkText.shape) {
            removeSvgShape(checkText);
        }

        if (
            pieceAfterPlayer &&
            pieceAfterPlayer.shape &&
            player.shape &&
            player.shape.nextSibling != pieceAfterPlayer.shape
        ) {
            
            svgPiecesLayer.insertBefore(player.shape, pieceAfterPlayer.shape);
        }

        

        
        bgCtx.save();
        bgCtx.translate(0, HORIZON_Y);
        bgCtx.fillStyle = BG_COLOR;
        bgCtx.beginPath();
        bgCtx.rect(0, 0, SIZE, SIZE);
        bgCtx.fill();
        bgCtx.clip();

        var progressIndex = Math.floor(progress);
        var di = -(progress - Math.floor(progress));
        var p1 = {},
            p2 = {},
            p3 = {},
            p4 = {};
        var i, j, len;
        for (i = -1; i < NUM_CELLS_DISPLAYED; i++) {
            for (j = 0; j < NUM_CELLS; j++) {
                project(j / NUM_CELLS, (i + di) / NUM_CELLS, p1);
                project(j / NUM_CELLS, (i + 1 + di) / NUM_CELLS, p4);
                project((j + 1) / NUM_CELLS, (i + 1 + di) / NUM_CELLS, p3);
                project((j + 1) / NUM_CELLS, (i + di) / NUM_CELLS, p2);

                bgCtx.beginPath();
                bgCtx.moveTo(p1.x * SIZE, p1.y * SIZE);
                bgCtx.lineTo(p2.x * SIZE, p2.y * SIZE);
                bgCtx.lineTo(p3.x * SIZE, p3.y * SIZE);
                bgCtx.lineTo(p4.x * SIZE, p4.y * SIZE);
                bgCtx.closePath();
                bgCtx.lineWidth = 1;
                

                if (
                    mouseRow != -1 &&
                    mouseCol != -1 &&
                    i + progressIndex == mouseRow &&
                    j == mouseCol
                ) {
                    
                    bgCtx.fillStyle = ROLLOVER_COLOR;
                } else {
                    if ((i + j + progressIndex) % 2 === 0) {
                        bgCtx.fillStyle = CELL_COLOR_1;
                    } else {
                        bgCtx.fillStyle = CELL_COLOR_2;
                    }
                }
                bgCtx.fill();

                row = checkBoard[i + progressIndex];
                if (row && row[j]) {
                    var cell = row[j];
                    if (cell.showThreat) {
                        bgCtx.fillStyle = 'rgba(' + INVALID_CELL_COLOR_RGB + ',0.5)';
                        bgCtx.fill();
                    }
                    if (cell.checkPoint) {
                        bgCtx.fillStyle = CHECK_POINT_COLOR;
                        bgCtx.fill();
                    }
                }

                
                if (!player.anim) {
                    var isAdjacent =
                        Math.abs(j - player.col) <= 1 &&
                        Math.abs(i + progressIndex - player.row) <= 1 &&
                        !(j === player.col && i + progressIndex === player.row);
                    if (isAdjacent) {
                        bgCtx.fillStyle = ADJACENT_TILE_COLOR;
                        bgCtx.fill();
                    }
                }

                if (
                    player.invalid &&
                    player.invalidCol == j &&
                    player.invalidRow == i + progressIndex
                ) {
                    
                    var invalidOpacity =
                        1.5 *
                        (playerAnimProgress < 0.5 ? playerAnimProgress : 1 - playerAnimProgress);
                    bgCtx.fillStyle = 'rgba(' + INVALID_CELL_COLOR_RGB + ',' + invalidOpacity + ')';
                    bgCtx.fill();
                }
            }
        }
        bgCtx.restore();
    }

    var THRESHOLD_DOWN = -0.02;
    var THRESHOLD_UP = 0.02;
    computeCellPos.res = {};
    function computeCellPos(row, col, res) {
        res = res || computeCellPos.res;
        project((col + 0.5) / NUM_CELLS, (row - progress + 0.5) / NUM_CELLS);
        var thresholdDown = -0.02;
        var thresholdUp = 0.02;
        var opacity = 1;
        if (project.res.y < THRESHOLD_DOWN) {
            opacity = 0;
        } else if (project.res.y < THRESHOLD_UP) {
            opacity = 1 - (thresholdUp - project.res.y) / (THRESHOLD_UP - THRESHOLD_DOWN);
        }
        res.opacity = opacity;
        res.x = project.res.x * SIZE;
        res.y = project.res.y * SIZE + HORIZON_Y;
        res.scale = project.res.scaleX;
        return res;
    }

    function updatePieceStyle(piece) {
        if (typeof window !== 'undefined' && window.SvgLayer && window.SvgLayer.updatePieceStyle) {
            var apply = function () {
                window.SvgLayer.updatePieceStyle(piece);
            };
            if (typeof window !== 'undefined' && window.Perf && window.Perf.defer) {
                window.Perf.defer(apply);
            } else {
                apply();
            }
            return;
        }
        if (piece.shape) {
            var applyFallback = function () {
                piece.shape.style.opacity = piece.opacity;
                if (piece.scale > 0) {
                    piece.shape.setAttributeNS(
                        null,
                        'transform',
                        'scale(' +
                            piece.scale +
                            ') translate(' +
                            piece.x / piece.scale +
                            ',' +
                            piece.y / piece.scale +
                            ')'
                    );
                }
            };
            if (typeof window !== 'undefined' && window.Perf && window.Perf.defer) {
                window.Perf.defer(applyFallback);
            } else {
                applyFallback();
            }
        }
    }

    
    
    

    
    
    
    var A_Y = 3 / 16;
    var B_Y = -14 / 16;
    var C_Y = 1;
    
    var A_S = -2.5 / 16;
    var B_S = 0 / 16;
    var C_S = 1;

    
    project.res = {};
    function project(x, y, res) {
        res = res || project.res;
        if (typeof window !== 'undefined' && window.Projection && window.Projection.api) {
            
            window.Projection.api.project(x, y, res);
            if (intro) {
                res.x = perspectiveProgress * res.x + (1 - perspectiveProgress) * x;
                res.y = perspectiveProgress * res.y + (1 - perspectiveProgress) * (1 - y);
                res.scaleX = perspectiveProgress * res.scaleX + (1 - perspectiveProgress) * 1;
                res.scaleY = res.scaleX;
            }
            return res;
        }

        res.y = quadraticEq(y, A_Y, B_Y, C_Y);
        res.scaleX = quadraticEq(y, A_S, B_S, C_S);
        res.scaleY = res.scaleX;
        res.x = (1 - res.scaleX) / 2 + x * res.scaleX;

        if (intro) {
            res.x = perspectiveProgress * res.x + (1 - perspectiveProgress) * x;
            res.y = perspectiveProgress * res.y + (1 - perspectiveProgress) * (1 - y);
            res.scaleX = perspectiveProgress * res.scaleX + (1 - perspectiveProgress) * 1;
            res.scaleY = res.scaleX;
        }

        return res;
    }

    function ellipseEq(x, a, b) {
        
        
        return Math.sqrt((1 - (x * x) / (a * a)) * b * b);
    }

    reverseProject.res = {};
    function reverseProject(x, y, res) {
        res = res || reverseProject.res;
        if (typeof window !== 'undefined' && window.Projection && window.Projection.api) {
            return window.Projection.api.reverseProject(x, y, res);
        }
        res.y = reverseQuadraticEq(y, A_Y, B_Y, C_Y, false);
        var scale = quadraticEq(res.y, A_S, B_S, C_S);
        res.x = (x - (1 - scale) / 2) / scale;
        return res;
    }

    function quadraticEq(x, a, b, c) {
        return a * x * x + b * x + c;
    }

    function reverseQuadraticEq(y, a, b, c, pos) {
        if (pos) {
            return (-b + Math.sqrt(b * b - 4 * a * (c - y))) / (2 * a);
        } else {
            return (-b - Math.sqrt(b * b - 4 * a * (c - y))) / (2 * a);
        }
    }

    
    
    

    function initCheckBoardCanvas() {
        root.appendChild(bgCanvas);
        bgCanvas.width = SIZE;
        bgCanvas.height = SIZE + HORIZON_Y;
    }

    function initShadowCanvas() {
        var ctx = shadowCtx;
        
        var grd = ctx.createLinearGradient(0, 0, 0, SIZE);
        var c = 'rgba(10,20,25,';
        var c2 = ')';
        grd.addColorStop(0, c + 0 + c2);
        grd.addColorStop(0.2, c + 0 + c2);
        
        grd.addColorStop(1, c + 0.5 + c2);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, SIZE, SIZE);
        ctx.restore();

        shadowCanvas.style.top = HORIZON_Y + 'px';
        shadowCanvas.style.pointerEvents = 'none';
        root.appendChild(shadowCanvas);
    }

    function initSkyCanvas() {
        var shadowSize = SIZE * 0.02;
        skyCanvas.width = SIZE;
        skyCanvas.height = HORIZON_Y + shadowSize;

        var ctx = skyCtx;
        ctx.clearRect(0, 0, SIZE, SIZE);

        ctx.save();
        
        ctx.fillStyle = '#FF8601';
        ctx.beginPath();
        ctx.rect(0, 0, SIZE, HORIZON_Y);
        ctx.fill();
        ctx.clip();
        
        ctx.fillStyle = '#FFE7CA';
        var sunRadius = SIZE / 4;
        ctx.beginPath();
        ctx.arc(SIZE / 2, HORIZON_Y + 0.3 * sunRadius, sunRadius, 0, PI, true);
        ctx.fill();
        ctx.restore();
        
        ctx.beginPath();
        ctx.fillStyle = 'rgb(10,20,25)';

        var mountainMaxHeight = 40;
        var points = [
            0, 0.7, 0.1, 0.3, 0.2, 1, 0.3, 0.5, 0.35, 0.8, 0.42, 0.5, 0.55, 0.9, 0.7, 0.45, 0.8,
            1.1, 0.88, 0.4, 1, 0.8,
        ];
        var mountainX = 0;
        for (var i = 0; i < points.length; i += 2) {
            var x = points[i] * SIZE;
            var y = HORIZON_Y - mountainMaxHeight * points[i + 1];
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.lineTo(SIZE, HORIZON_Y);
        ctx.lineTo(0, HORIZON_Y);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.translate(0, HORIZON_Y);
        var grd = ctx.createLinearGradient(0, 0, 0, shadowSize);
        var c = 'rgba(10,20,25,';
        var c2 = ')';
        grd.addColorStop(0, c + 1 + c2);
        grd.addColorStop(1, c + 0 + c2);

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, SIZE, shadowSize);
        ctx.restore();

        root.appendChild(skyCanvas);
    }

    function makeCanvas(width, height, id) {
        var canvas = document.createElement('canvas');
        if (id) canvas.id = id;
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function getContext(canvas) {
        return canvas.getContext('2d');
    }

    function style(ctx, fill, stroke, lineWidth) {
        if (fill) ctx.fillStyle = fill;
        if (stroke) ctx.strokeStyle = stroke;
        if (lineWidth) ctx.lineWidth = lineWidth;
    }

    
    function fillRect(ctx, x, y, w, h, c) {
        if (c) {
            if (c.width) {
                c = ctx.createPattern(c, 'repeat');
            }
            style(ctx, c);
        }
        ctx.fillRect(x, y, w, h);
    }

    
    
    

    var svgMakeUse;
    var svgElem;
    var svgPiecesLayer = null;
    var svgCache = {};

    function addSvgShape(piece) {
        var shape;
        if (!svgCache[piece.type]) {
            svgCache[piece.type] = [];
        }
        if (svgCache[piece.type].length) {
            shape = svgCache[piece.type].pop();
        } else {
            shape = svgMakeUse(piece.type);
        }
        
        
        if (svgPiecesLayer.firstChild && !piece.onTop) {
            svgPiecesLayer.insertBefore(shape, svgPiecesLayer.firstChild);
        } else {
            svgPiecesLayer.appendChild(shape);
        }

        if (piece.shape) {
            throw new Error();
        }
        piece.shape = shape;
        shape.style.filter = 'none';
    }

    function removeSvgShape(piece) {
        if (piece.shape) {
            svgCache[piece.type].push(piece.shape);
            svgPiecesLayer.removeChild(piece.shape);
            piece.shape = null;
        }
    }

    function initSvg() {
        svgMakeUse = makeUse;
        var xmlns = 'http://www.w3.org/2000/svg';
        var xlinkns = 'http://www.w3.org/1999/xlink';
        var boxWidth = SIZE;
        var boxHeight = SIZE + HORIZON_Y;

        svgElem = document.createElementNS(xmlns, 'svg');
        svgElem.setAttribute('xmlns', xmlns);
        svgElem.setAttributeNS(null, 'viewBox', '0 0 ' + boxWidth + ' ' + boxHeight);
        svgElem.setAttributeNS(null, 'width', boxWidth);
        svgElem.setAttributeNS(null, 'height', boxHeight);
        root.appendChild(svgElem);

        var defs = document.createElementNS(xmlns, 'defs');
        svgElem.appendChild(defs);

        
        svgPiecesLayer = document.createElementNS(xmlns, 'g');
        svgElem.appendChild(svgPiecesLayer);

        makeIntroScreen();
        makeFilter(ENEMY_FILTER);
        makeCheckTextDef(CHECK_TEXT, 'CHECK');
        makeGameOverScreen();
        makeDialogBox();
        makePressSpaceText();
        makePauseText();
        makeWinScreen();

        
        
        var OX = 5;
        var OY = 8;
        svgStyle(
            makeDef(PAWN, [
                makePath(['M', [2, 8], 'Q', [5, 10], [8, 8], 'L', [5, 3], 'L', [2, 8]]),
                makeCircle(5, 3, 2),
            ]),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );
        svgStyle(
            makeDef(ENEMY_KING, [
                makePath([
                    'M',
                    [4.6, 1.4],
                    'L',
                    [5.4, 1.4],
                    'L',
                    [5.4, -0.6],
                    'L',
                    [6.4, -0.6],
                    'L',
                    [6.4, -1.4],
                    'L',
                    [5.4, -1.4],
                    'L',
                    [5.4, -2.4],
                    'L',
                    [4.6, -2.4],
                    'L',
                    [4.6, -1.4],
                    'L',
                    [3.6, -1.4],
                    'L',
                    [3.6, -0.6],
                    'L',
                    [4.6, -0.6],
                    'L',
                    [4.6, 1.4],
                ]),
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [6, 3],
                    'L',
                    [7, 1],
                    'Q',
                    [5, 0],
                    [3, 1],
                    'L',
                    [4, 3],
                    'L',
                    [2, 8],
                ]),
            ]),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );
        svgStyle(
            makeDef(KNIGHT, [
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [7, 6],
                    'Q',
                    [8, 3],
                    [7, 0],
                    'L',
                    [6, 1],
                    'L',
                    [5, 1],
                    'L',
                    [2, 4],
                    'L',
                    [3, 5],
                    'L',
                    [5, 4],
                    'L',
                    [2, 8],
                ]),
            ]),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );
        svgStyle(
            makeDef(ROOK, [
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [6.5, 3],
                    'L',
                    [8, 2],
                    'L',
                    [8, 0],
                    'L',
                    [7, 0],
                    'L',
                    [7, 1],
                    'L',
                    [6, 1],
                    'L',
                    [6, 0],
                    'L',
                    [4, 0],
                    'L',
                    [4, 1],
                    'L',
                    [3, 1],
                    'L',
                    [3, 0],
                    'L',
                    [2, 0],
                    'L',
                    [2, 2],
                    'L',
                    [3.5, 3],
                    'L',
                    [2, 8],
                ]),
            ]),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );
        svgStyle(
            makeDef(BISHOP, [
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [6, 4],
                    'Q',
                    [8, 1.1],
                    [5, 0],
                    'Q',
                    [2, 1.1],
                    [4, 4],
                    'L',
                    [2, 8],
                ]),
                makeCircle(5, 0, 0.7),
                makePath(['M', [3.8, 0.8], 'L', [4.4, 2.5]], { 'stroke-width': 2 }),
            ]),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );
        svgStyle(
            makeDef(WAR_BEAR, [
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [8.5, 6],
                    'L',
                    [7, 7],
                    'L',
                    [7, 5],
                    'L',
                    [6, 6],
                    'L',
                    [5, 4.5],
                    'L',
                    [4, 6],
                    'L',
                    [3, 5],
                    'L',
                    [3, 7],
                    'L',
                    [1.5, 6],
                    'L',
                    [2, 8],
                ]),
            ]),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );

        function makePike(x, y) {
            return makePath(['M', [x, y], 'L', [x + 1, y], 'L', [x + 0.5, y - 3], 'L', [x, y]]);
        }
        svgStyle(
            makeDef(
                LAND_MINE,
                [
                    
                    makePike(2, 9.5),
                    makePike(5, 9),
                    makePike(8, 10),
                    makePike(7, 8),
                    makePike(4, 7.5),
                    makePike(1, 8.5),
                ],
                true
            ),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );
        
        svgStyle(
            makeDef(HERO_KING, [
                makePath([
                    'M',
                    [4.6, 1.4],
                    'L',
                    [5.4, 1.4],
                    'L',
                    [5.4, -0.6],
                    'L',
                    [6.4, -0.6],
                    'L',
                    [6.4, -1.4],
                    'L',
                    [5.4, -1.4],
                    'L',
                    [5.4, -2.4],
                    'L',
                    [4.6, -2.4],
                    'L',
                    [4.6, -1.4],
                    'L',
                    [3.6, -1.4],
                    'L',
                    [3.6, -0.6],
                    'L',
                    [4.6, -0.6],
                    'L',
                    [4.6, 1.4],
                ]),
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [6, 3],
                    'L',
                    [7, 1],
                    'Q',
                    [5, 0],
                    [3, 1],
                    'L',
                    [4, 3],
                    'L',
                    [2, 8],
                ]),
            ]),
            '#002',
            '#333',
            0
        );
        svgStyle(
            makeDef(QUEEN, [
                makeCircle(5, 0.4, 0.6),
                makePath([
                    'M',
                    [2, 8],
                    'Q',
                    [5, 10],
                    [8, 8],
                    'L',
                    [6, 3],
                    'L',
                    [7.5, 1],
                    'L',
                    [5.8, 1.5],
                    'L',
                    [5, 0.8],
                    'L',
                    [4.2, 1.5],
                    'L',
                    [2.5, 1],
                    'L',
                    [4, 3],
                    'L',
                    [2, 8],
                ]),
            ]),
            '#002',
            '#333',
            0
        );

        OX = 2.5;
        OY = 50;
        svgStyle(
            makeDef(
                CASTLE,
                [
                    makePath([
                        'M',
                        [25, 30],
                        'L',
                        [50, 30],
                        'L',
                        [50, 5],
                        'L',
                        [45, 5],
                        'L',
                        [45, 10],
                        'L',
                        [40, 10],
                        'L',
                        [40, 5],
                        'L',
                        [35, 5],
                        'L',
                        [35, 10],
                        'L',
                        [30, 10],
                        'L',
                        [30, 5],
                        'L',
                        [25, 5],
                        'L',
                        [25, 30],
                    ]),
                    makePath([
                        'M',
                        [0, 50],
                        'L',
                        [0, 50],
                        'L',
                        [27.5, 50],
                        'L',
                        [27.5, 35],
                        'L',
                        [47.5, 35],
                        'L',
                        [47.5, 50],
                        'L',
                        [75, 50],
                        'L',
                        [75, 20],
                        'L',
                        [70, 20],
                        'L',
                        [70, 25],
                        'L',
                        [65, 25],
                        'L',
                        [65, 20],
                        'L',
                        [60, 20],
                        'L',
                        [60, 25],
                        'L',
                        [55, 25],
                        'L',
                        [55, 20],
                        'L',
                        [50, 20],
                        'L',
                        [50, 25],
                        'L',
                        [45, 25],
                        'L',
                        [45, 20],
                        'L',
                        [40, 20],
                        'L',
                        [40, 25],
                        'L',
                        [35, 25],
                        'L',
                        [35, 20],
                        'L',
                        [30, 20],
                        'L',
                        [30, 25],
                        'L',
                        [25, 25],
                        'L',
                        [25, 20],
                        'L',
                        [20, 20],
                        'L',
                        [20, 25],
                        'L',
                        [15, 25],
                        'L',
                        [15, 20],
                        'L',
                        [10, 20],
                        'L',
                        [10, 25],
                        'L',
                        [5, 25],
                        'L',
                        [5, 20],
                        'L',
                        [0, 20],
                        'L',
                        [0, 50],
                    ]),
                ],
                true
            ),
            PIECE_FILL_COLOR,
            PIECE_STROKE_COLOR,
            0
        );

        function makeDef(id, shapes, skipShadow) {
            var def = document.createElementNS(xmlns, 'g');
            def.setAttributeNS(null, 'id', id);

            if (!skipShadow) def.appendChild(makeShadow());
            for (var i = 0; i < shapes.length; i++) {
                var shape = shapes[i];
                if (shape.getAttributeNS(null, 'x')) {
                    
                    
                    
                } else {
                    shape.setAttributeNS(null, 'x', -CELL_SIZE / 2);
                    shape.setAttributeNS(null, 'y', -CELL_SIZE);
                }
                def.appendChild(shape);
            }

            defs.appendChild(def);
            return def;
        }

        function makeFilter(id) {
            var def = document.createElementNS(xmlns, 'filter');
            def.setAttributeNS(null, 'id', id);
            svgAttrs(def, {
                x: '0',
                y: '0',
                width: '100%',
                height: '100%',
                'color-interpolation-filters': 'sRGB',
            });

            svgInnerHtml(
                def,
                '<feFlood flood-color="rgba(255,0,0,0.3)" result="COLOR"></feFlood>' +
                    '<feComposite operator="atop" in="COLOR" in2="SourceGraphic"></feComposite>'
            );

            defs.appendChild(def);
            return def;
        }

        function makeShadow() {
            var shadow = makeEllipse(5, 8, 3.1, 1.8);
            svgStyle(shadow, 'rgba(0,0,0,0.2)', 'none');
            return shadow;
        }

        function makeCircle(cx, cy, r) {
            var circle = document.createElementNS(xmlns, 'circle');
            svgAttrs(circle, {
                cx: svgFloat(cx - OX),
                cy: svgFloat(cy - OY),
                r: svgFloat(r),
            });
            return circle;
        }

        function makeRect(x, y, w, h) {
            var rect = document.createElementNS(xmlns, 'rect');
            svgAttrs(rect, {
                x: svgFloat(x - OX),
                y: svgFloat(y - OY),
                width: svgFloat(w),
                height: svgFloat(h),
            });
            return rect;
        }

        function makeEllipse(cx, cy, rx, ry) {
            var ellipse = document.createElementNS(xmlns, 'ellipse');
            svgAttrs(ellipse, {
                cx: svgFloat(cx - OX),
                cy: svgFloat(cy - OY),
                rx: svgFloat(rx),
                ry: svgFloat(ry),
            });
            return ellipse;
        }

        function makePath(list, style) {
            var path = document.createElementNS(xmlns, 'path');
            path.setAttributeNS(null, 'd', makePathString(list));
            if (style) {
                svgAttrs(path, style);
            }
            return path;
        }

        function makePathString(list) {
            var path = '';
            for (var i = 0; i < list.length; i++) {
                var e = list[i];
                if (typeof e == 'object') {
                    e = svgFloat(e[0] - OX) + ',' + svgFloat(e[1] - OY);
                }
                path += e + ' ';
            }
            return path;
        }

        function makeUse(id, attrs) {
            var use = document.createElementNS(xmlns, 'use');
            svgAttrs(use, attrs);
            use.setAttributeNS(xlinkns, 'xlink:href', '#' + id);
            use.setAttribute('xmlns:xlink', xlinkns);
            return use;
        }

        function svgFloat(f) {
            return Math.round(CELL_SIZE * f) * 0.1;
        }

        function makeCheckTextDef(id, text) {
            /*
			
			var def = document.createElementNS (xmlns, 'linearGradient');
			def.setAttributeNS (null, 'id', CHECK_GRADIENT);
			svgAttrs(def, { x1:'0', x2:'0', y1:'0', y2:'100%', height:'100%', 'gradientUnits':'userSpaceOnUse' });
			def.innerHTML =
                  '<stop stop-color="#FF5B99" offset="0%"></stop>' +
                  '<stop stop-color="#FF5447" offset="50%"></stop>' +
                  '<stop stop-color="#FF7B21" offset="100%"></stop>';
            defs.appendChild(def);
            */

            var def = document.createElementNS(xmlns, 'text');
            def.setAttributeNS(null, 'id', id);
            svgAttrs(def, {
                x: '-40',
                'font-size': '28',
                fill: 'red',
                stroke: 'black',
                'stroke-width': '1',
                'font-family': 'Impact',
            });
            svgInnerHtml(def, text);
            defs.appendChild(def);
        }

        function makeGameOverScreen() {
            gameOverScreen = document.createElementNS(xmlns, 'g');
            gameOverScreen.style.display = 'none';
            svgElem.appendChild(gameOverScreen);

            var rect = document.createElementNS(xmlns, 'rect');
            svgAttrs(rect, { x: 0, y: 0, width: '100%', height: '100%', fill: 'rgba(0,0,0,0.5)' });
            gameOverScreen.appendChild(rect);

            var text = document.createElementNS(xmlns, 'text');
            svgAttrs(text, {
                x: '50%',
                y: '50%',
                'font-size': '48px',
                fill: 'orange',
                stroke: 'red',
                'stroke-width': '2px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(text, 'CHECKMATE !');
            gameOverScreen.appendChild(text);

            text = document.createElementNS(xmlns, 'text');
            svgAttrs(text, {
                x: '50%',
                y: '60%',
                'font-size': '22px',
                fill: 'white',
                stroke: 'black',
                'stroke-width': '1px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(
                text,
                '<tspan x="50%">Press <tspan style="fill:orange;">SPACE</tspan> or <tspan style="fill:orange;">CLICK</tspan></tspan>' +
                    '<tspan x="50%" dy="1.5em">to restart from the last checkpoint.</tspan>'
            );
            gameOverScreen.appendChild(text);
        }

        function makeIntroScreen() {
            introScreen = document.createElementNS(xmlns, 'g');
            svgElem.appendChild(introScreen);

            var rect = document.createElementNS(xmlns, 'rect');
            svgAttrs(rect, {
                x: 0,
                y: 0,
                width: '100%',
                height: HORIZON_Y,
                fill: BG_COLOR,
                stroke: '#000',
            });
            introScreen.appendChild(rect);

            var text = document.createElementNS(xmlns, 'text');
            svgAttrs(text, {
                x: '50%',
                y: '60',
                'font-size': '48px',
                fill: 'orange',
                stroke: 'red',
                'stroke-width': '2px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(text, 'REVERSE <tspan style="font-style:italic;">MATE</tspan>');
            introScreen.appendChild(text);
        }

        function makePressSpaceText() {
            pressSpaceText = document.createElementNS(xmlns, 'text');
            svgAttrs(pressSpaceText, {
                x: '50%',
                y: HORIZON_Y + SIZE - 10,
                'font-size': '22px',
                fill: 'white',
                stroke: 'black',
                'stroke-width': '1px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(
                pressSpaceText,
                'Press <tspan style="fill:orange;">SPACE</tspan> or <tspan style="fill:orange;">CLICK</tspan>'
            );
            svgElem.appendChild(pressSpaceText);
        }

        function makePauseText() {
            pauseText = document.createElementNS(xmlns, 'text');
            svgAttrs(pauseText, {
                x: '50%',
                y: '50%',
                'font-size': '32px',
                fill: 'orange',
                stroke: 'black',
                'stroke-width': '1px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(pauseText, 'PAUSED');
            pauseText.style.display = 'none';
            svgElem.appendChild(pauseText);
        }

        function makeDialogBox() {
            var width = SIZE - 2 * DIALOG_MARGIN;
            var height = 0.3 * SIZE - 2 * DIALOG_MARGIN;
            dialogCloseY = SIZE + HORIZON_Y;
            dialogOpenY = HORIZON_Y + SIZE - height - DIALOG_MARGIN;
            dialogBox = document.createElementNS(xmlns, 'svg');
            dialogBox._y = dialogCloseY; 
            svgAttrs(dialogBox, {
                x: DIALOG_MARGIN,
                y: dialogCloseY,
                width: width,
                height: height,
            });
            svgElem.appendChild(dialogBox);

            var rect = document.createElementNS(xmlns, 'rect');
            svgAttrs(rect, {
                width: '100%',
                height: '100%',
                fill: 'rgba(0,0,0,0.8)',
                stroke: '#fff',
                'stroke-width': 2,
            });
            dialogBox.appendChild(rect);

            dialogSpeakerText = document.createElementNS(xmlns, 'text');
            svgAttrs(dialogSpeakerText, {
                x: 10,
                y: 20,
                'font-size': '18px',
                fill: '#fff',
                'text-anchor': 'left',
                'font-family': 'Impact',
            });
            dialogBox.appendChild(dialogSpeakerText);

            dialogText = document.createElementNS(xmlns, 'text');
            svgAttrs(dialogText, {
                x: 10,
                y: 40,
                'font-size': '16px',
                fill: '#fff',
                'text-anchor': 'left',
                'font-family': 'sans-serif',
            });
            dialogBox.appendChild(dialogText);
        }

        function makeWinScreen() {
            winScreen = document.createElementNS(xmlns, 'g');
            winScreen.style.display = 'none';
            svgElem.appendChild(winScreen);

            var rect = document.createElementNS(xmlns, 'rect');
            svgAttrs(rect, { x: 0, y: 0, width: '100%', height: '100%', fill: 'rgba(0,0,0,0.5)' });
            winScreen.appendChild(rect);

            var text = document.createElementNS(xmlns, 'text');
            svgAttrs(text, {
                x: '50%',
                y: '50%',
                'font-size': '48px',
                fill: '#5f7',
                stroke: 'black',
                'stroke-width': '2px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(text, 'YOU WIN !');
            winScreen.appendChild(text);

            text = document.createElementNS(xmlns, 'text');
            svgAttrs(text, {
                x: '50%',
                y: '60%',
                'font-size': '22px',
                fill: 'white',
                stroke: 'black',
                'stroke-width': '1px',
                'text-anchor': 'middle',
                'font-family': 'Impact',
            });
            svgInnerHtml(text, 'Alas, your Queen is in another castle...');
            winScreen.appendChild(text);
        }
    }

    var dialogOpenY;
    var dialogCloseY;
    function showDialog(whiteKing, texts) {
        if (whiteKing) {
            svgInnerHtml(dialogSpeakerText, 'White King :');
        } else {
            svgInnerHtml(dialogSpeakerText, 'Black King :');
        }
        var txt = '';
        for (var i = 0; i < texts.length; i++) {
            txt += '<tspan x="10" ' + (i === 0 ? '' : 'dy="1.2em"') + '>' + texts[i] + '</tspan>';
        }
        svgInnerHtml(dialogText, txt);

        addIntroTween(dialogBox, { _y: dialogOpenY }, 0, 0.5);
    }

    function hideDialog() {
        addIntroTween(dialogBox, { _y: dialogCloseY }, 0, 0.5);
    }

    var svgInnerHtmlElement = document.createElement('div');
    function svgInnerHtml(svg, html) {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }
        var svgText = '<svg>' + html + '</svg>';
        svgInnerHtmlElement.innerHTML = svgText;
        var nodes = Array.prototype.slice.call(svgInnerHtmlElement.childNodes[0].childNodes);
        nodes.forEach(function (el) {
            svg.appendChild(el);
        });
    }

    function svgAttrs(el, attrs) {
        if (attrs) {
            for (var key in attrs) {
                el.setAttributeNS(null, key, attrs[key]);
            }
        }
        return el;
    }

    function svgStyle(svgElem, fill, stroke, strokeWidth) {
        var attrs = {};
        if (typeof fill != 'undefined') {
            attrs.fill = fill;
        }
        if (typeof stroke != 'undefined') {
            attrs.stroke = stroke;
        }
        if (typeof strokeWidth != 'undefined') {
            attrs.strokeWidth = strokeWidth;
        }
        svgAttrs(svgElem, attrs);
        return svgElem;
    }

    
    
    

    var keyMap =
        typeof window !== 'undefined' && window.InputKeys && window.InputKeys.keyMap
            ? window.InputKeys.keyMap
            : {
                  65: 'left', 
                  81: 'left', 
                  
                  90: 'up', 
                  87: 'up', 
                  83: 'down', 
                  
                  68: 'right', 
                  81: 'upLeft', 
                  69: 'upRight', 
                  90: 'downLeft', 
                  67: 'downRight', 
                  32: 'space',
                  27: 'esc',
                  13: 'enter',
              };
    
    var keyBoolMap = {};
    
    var keys = {};
    
    function onkey(isDown, e) {
        if (!e) e = window.e;
        var c = e.keyCode;
        if (e.charCode && !c) c = e.charCode;

        var keyName = keyMap[c];
        if (keyName) {
            
            if (keyBoolMap[keyName] !== isDown) {
                keyBoolMap[keyName] = isDown;
                if (typeof keys[keyName] == 'undefined') {
                    keys[keyName] = -1;
                }
                if (isDown) {
                    if (keys[keyName] < 1) {
                        
                        keys[keyName] = 1;
                    }
                } else {
                    if (keys[keyName] > 0) {
                        
                        keys[keyName] = 0;
                    }
                }
            }
        }
    }
    document.onkeyup = function (e) {
        
        if (!intro && keyBoolMap.enter && !gameIsOver) {
            raf = !raf;
            pauseText.style.display = raf ? 'none' : 'block';
            if (!raf) {
                window.__pauseCount = (window.__pauseCount || 0) + 1;
            }
            if (raf) {
                lastTime = Date.now();
                tic();
            }
        }

        onkey(false, e);
    };
    document.onkeydown = function (e) {
        onkey(true, e);
    };

    function onmouse(isClick, e) {
        mouse.click = isClick;
        document.onmousemove(e);
    }
    document.onmousedown = function (e) {
        onmouse(true, e);
    };
    document.onmousemove = function (e) {
        mouse.x = e.clientX - root.offsetLeft;
        mouse.y = e.clientY;
    };

    /*
	document.oncontextmenu = function(e){
		return false;
	};
	*/

    
    document.addEventListener(
        'touchstart',
        function (e) {
            if (e.touches && e.touches.length) {
                var t = e.touches[0];
                mouse.x = t.clientX - root.offsetLeft;
                mouse.y = t.clientY;
                mouse.click = true;
            }
        },
        { passive: true }
    );
    document.addEventListener(
        'touchmove',
        function (e) {
            if (e.touches && e.touches.length) {
                var t = e.touches[0];
                mouse.x = t.clientX - root.offsetLeft;
                mouse.y = t.clientY;
            }
        },
        { passive: true }
    );

    init();
};
