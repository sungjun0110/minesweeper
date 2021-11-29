/*----- constants -----*/
// Define constants: board size, number of mines
const boardLookup = {
    easy: {
        boardSize: 10,
        mines: 20,
    },
    normal: {
        boardSize: 15,
        mines: 50,
    },
    hard: {
        boardSize: 20,
        mines: 100,
    }
}

/*----- app's state (variables) -----*/
// Define constants: board size, number of mines
let board, gameOver, difficulty, numOfMines, boardSize, mineTiles, flagTiles, time, firstClick = true;

/*----- cached element references -----*/
// Cached elements: timer, num of mines, board, message, replay
const timer = $('#timer');
const numOfMinesScreen = $('#numOfMines');
const gameBoard = $('#board');
const difficultyBtn = $('.difficultyBtn');
const message = $('#message');
const replay = $('#replay');
const howToPlay = $('#howToPlay');
const header = $('header');
const difficultyBtns = $('#difficultyBtns');
const infobar = $('#infobar');
const section = $('section');

/*----- event listeners -----*/
// Event Listeners: click event on board, difficulty button
difficultyBtn.on('click', function() {
    difficulty = $(this).text().toLowerCase();
    numOfMines = boardLookup[difficulty].mines;
    boardSize = boardLookup[difficulty].boardSize;
    init();
});

gameBoard.on('click', 'div', function(evt) {
    if ( firstClick ) {
        distributeMines($(this));
        return;
    }
    if ( evt.ctrlKey ) {
        flagTile($(this));
    }
    openTile($(this));
});

gameBoard.on('contextmenu', 'div', function() {
    flagTile($(this));
    return false;
});

replay.on('click', function() {
    location.reload();
})

/*----- functions -----*/
/*

    Initialize the game — function
    Generate bombs and distribute randomly — function
    Generate numbered tiles — function 
    Check if tile is bomb — function
    Generate message if player wins - function
    Destroy tiles once a mine is triggered -function
    Render the DOM — function

*/

function init() {
    board = [];
    time = boardSize * boardSize *2;
    gameOver = false;
    replay.css('display', 'block');
    howToPlay.css('display', 'block');
    difficultyBtns.css('display', 'none');
    gameBoard.css('display', 'grid');
    infobar.css('display', 'flex');
    header.css({'position': 'relative','top': '0%', 'transform': 'translate(-50%)'});
    section.css('opacity', '1');

    generateBoard(boardSize);
    updateNumberOfMines();
    updateTimer();
    startTimer();
    renderBoard();
}

function distributeMines(tile) {
    firstClick = false;
    generateBombs(tile);
    generateNumberedTiles();
    generateFlagTiles();
    renderBoard();
    const pos = getTilePos(tile);
    const newTile = $(`.${pos[0]}-${pos[1]}`);
    openTile(newTile);
}

function generateBoard(boardSize) {
    for ( let i = 0; i < boardSize; i++ ) {
        board.push([]);
        for ( let j = 0; j < boardSize; j++ ) {
            board[i].push([0]);
        }
    }
}

function updateNumberOfMines() {
    numOfMinesScreen.text(numOfMines);
}

function updateTimer() {
    timer.text(time);
}

function generateBombs(tile) {
    mineTiles = {};
    let mineTilesLength = 0;
    let row, col;
    const pos = getTilePos(tile);

    for ( let i = 0; i < boardSize; i++ ) mineTiles[i] = [];

    while ( mineTilesLength < numOfMines ) {
        row = Math.floor(Math.random() * boardSize);
        col = Math.floor(Math.random() * boardSize);
        if ( pos[0] !== row || pos[1] !== col ) {
            if ( !mineTiles[row].some(num => num === col) ) {
                mineTiles[row].push(col);
                mineTiles[row].sort();
            }
            mineTilesLength = 0; 
            for ( let i = 0; i < boardSize; i++ ) {
                mineTilesLength += mineTiles[i].length;
            }
        }
    }
    for ( let i = 0; i < boardSize; i++ ) {
        if ( mineTiles[i].length > 0 ) {
            for ( let j = 0; j < mineTiles[i].length; j++ ) {
                board[i][mineTiles[i][j]] = 'mine';
            }
        }
    }
}

function generateFlagTiles() {
    flagTiles = {};
    for ( let i = 0; i < boardSize; i++ ){
        flagTiles[i] = [];
    }
}

function generateNumberedTiles() {
    for ( let row = 0; row < boardSize; row++ ) {
        mineTiles[row].forEach(col => {
            addNumber(row, col);
        });
    }
}

// [-1,-1] = top left, [-1, 0] = top, [-1, +1] = top right, [0, -1] = left, [0, +1] = right, [+1, -1] = bottom left, [+1, 0] = bottom, [+1, +1] = bottom right
function addNumber(row, col) {
    for ( let i = -1; i <= 1 ; i++ ) {
        if ( board[row+i] ) {
            for ( let j = -1; j <= 1; j++ ) {
                if ( board[row+i][col+j] && board[row+i][col+j] !== 'mine' ) {
                    board[row+i][col+j] = parseInt(board[row+i][col+j]) + 1;
                }
            }
        }
    }
}

function startTimer() {
    if ( time === 0 ) {
        triggerMine($(`.${boardSize/2}-${boardSize/2}`));
    }
    setTimeout(() => {
        if (gameOver) return;
        time--;
        updateTimer();
        startTimer();
    }, 1000);
}

function renderBoard() {
    let boardHTML = '';
    for ( let i = 0; i < boardSize; i++ ) {
        for ( let j = 0; j < boardSize; j++ ) {
            if ( board[i][j] == 0 )
                boardHTML += `<div class="empty ${i}-${j} hidden"></div>`;

            else if ( board[i][j] === 'mine' )
                boardHTML += `<div class="mine ${i}-${j} hidden"></div>`;

            else
                boardHTML += `<div class="number ${i}-${j} hidden">${board[i][j]}</div>`;
        }
    }
    gameBoard.html(boardHTML);
    gameBoard.css({'gridTemplateColumns': `repeat(${boardSize}, 1fr)`, 'gridTemplateRows': `repeat(${boardSize}, 1fr)`});
}

function openTile(tile) {
    const tileClass = tile.attr('class').split(' ');
    const tileType = tileClass[0];
    const pos = getTilePos(tile);
    
    if ( tileClass.find(elem => elem === 'open' || elem === 'flagged')) return;
    
    if ( tileType === 'mine' ) triggerMine(tile);

    if ( tileType === 'empty' ) {
        tileOpenHandler(tile);
        openAdjacentTiles(pos);
        return;
    }

    tileOpenHandler(tile);
}

function tileOpenHandler(tile) {
    tile.removeClass('hidden');
    tile.addClass('open');
}

function openAdjacentTiles(pos) {
    const row = pos[0], col = pos[1];

    for ( let i = -1; i <= 1 ; i++ ) {
        if ( board[row+i] ) {
            for ( let j = -1; j <= 1; j++ ) {
                if ( board[row+i][col+j] ) {
                    const adjacentTile = $(`.${row+i}-${col+j}`);
                    if( i !== 0 || j !== 0 && adjacentTile) {
                        openTile(adjacentTile);
                    }
                }
            }
        }
    }
}

function flagTile(tile) {
    const tileClass = tile.attr('class');
    if ( tileClass.split(' ').find(elem => elem === 'open') ) return;
    const pos = getTilePos(tile);
    const row = pos[0], col = pos[1];
    if ( flagTiles[row].some(elem => elem === col) ){
        numOfMines++;
        flagTiles[row] = flagTiles[row].filter(elem => {
            return elem !== col;
        });
    }
    else {
        flagTiles[row].push(col);
        flagTiles[row].sort();
        numOfMines--;
    }
    tile.toggleClass('flagged');
    if ( numOfMines === 0 ) console.log(checkWin());
    render();
}

function checkWin() {
    for ( let i = 0; i < boardSize; i++ ) {
        if ( mineTiles[i].join() !== (flagTiles[i]).join() ){
            return;
        }
    }
    message.css('transform', 'translate(-50%, -50%) scale(1, 1)');
    message.text('You Win!');
    gameOver = true;
}

function triggerMine(tile) {
    gameOver = true;
    destroyTiles(tile);
    setTimeout(() => {
        message.css('transform', 'translate(-50%, -50%) scale(1, 1)');
        message.text('You Lose!');
    }, 1000);
}

function destroyTiles(tile) {
    if (tile.attr('class').split(' ').find(elem => elem === 'destroyed')) return;

    tile.removeClass('hidden');
    tile.removeClass('flagged');
    tile.addClass('destroyed');

    const pos = getTilePos(tile);
    const row = pos[0], col = pos[1];

    if ( board[row-1] ) destroyNextTile($(`.${row-1}-${col}`));
    if ( board[row+1] ) destroyNextTile($(`.${row+1}-${col}`));
    if ( board[row][col-1] ) destroyNextTile($(`.${row}-${col-1}`));
    if ( board[row][col+1] ) destroyNextTile($(`.${row}-${col+1}`));
}

function destroyNextTile(tile) {
    setTimeout(()=> {
        destroyTiles(tile);
    }, 100);
}

function getTilePos(tile) {
    const tilePos = tile.attr('class').split(' ')[1].split('-');
    const row = parseInt(tilePos[0]), col = parseInt(tilePos[1]);
    return [row, col];
}

function render() {
    updateNumberOfMines();
}
