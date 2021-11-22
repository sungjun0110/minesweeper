/*----- constants -----*/
// Define constants: board size, number of mines
const boardLookup = {
    easy: {
        boardSize: 10,
        mines: 20,
    },
    normal: {
        boardSize: 20,
        mines: 100,
    },
    hard: {
        boardSize: 30,
        mines: 250,
    }
}

/*----- app's state (variables) -----*/
// Define constants: board size, number of mines
let board, winner, difficulty, numOfMines, boardSize, mineTiles, flagTiles;

/*----- cached element references -----*/
// Cached elements: timer, num of mines, board, message
const timer = $('#timer');
const numOfMinesScreen = $('#numOfMines');
const gameBoard = $('#board');
const difficultyBtn = $('.difficultyBtn');

/*----- event listeners -----*/
// Event Listeners: click event on board, difficulty button
difficultyBtn.on('click', function() {
    difficulty = $(this).text().toLowerCase();
    numOfMines = boardLookup[difficulty].mines;
    boardSize = boardLookup[difficulty].boardSize;
    $('#difficultyBtns').css('display', 'none');
    init();
});

gameBoard.on('click', 'div', function() {
    openTile($(this));
});

gameBoard.on('contextmenu', 'div', function() {
    flagTile($(this));
    return false;
});

/*----- functions -----*/
/*

    Initialize the game — function
    Generate bombs and distribute randomly — function
    Generate numbered tiles — function 
    Check if tile is bomb — function
    Generate message if player wins - function
    Render the DOM — function

*/

function init() {
    board = [];
    generateBoard(boardSize);
    generateBombs();
    generateNumberedTiles();
    generateFlagTiles();
    updateNumberOfMines();
    renderBoard();
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

function generateBombs() {
    mineTiles = {};
    let mineTilesLength = 0;
    let row, col;

    for ( let i = 0; i < boardSize; i++ ){
        mineTiles[i] = [];
    }
    while ( mineTilesLength < numOfMines ) {
        row = Math.floor(Math.random() * boardSize);
        col = Math.floor(Math.random() * boardSize);
        if ( !mineTiles[row].some(num => num === col) ) {
            mineTiles[row].push(col);
        }
        mineTilesLength = 0; 
        for ( let i = 0; i < boardSize; i++ ) {
            mineTilesLength += mineTiles[i].length;
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

// [-1,-1], [-1, 0], [-1, +1], [0, -1], [0, +1], [+1, -1], [+1, 0], [+1, +1]
function generateNumberedTiles() {
    for ( let row = 0; row < boardSize; row++ ) {
        mineTiles[row].forEach(col => {
            addNumber(row, col);
        });
    }
}

function addNumber(row, col) {
    if ( board[row-1] ) {
        if ( board[row-1][col-1] && board[row-1][col-1] !== 'mine' ) 
            board[row-1][col-1] = parseInt(board[row-1][col-1]) + 1;
        
        if ( board[row-1][col] !== 'mine' ) 
            board[row-1][col] = parseInt(board[row-1][col]) + 1;

        if ( board[row-1][col+1] && board[row-1][col+1] !== 'mine') 
            board[row-1][col+1] = parseInt(board[row-1][col+1]) + 1;
    }

    if ( board[row][col-1] && board[row][col-1] !== 'mine' ) 
        board[row][col-1] = parseInt(board[row][col-1]) + 1;
    
    if ( board[row][col+1] && board[row][col+1] !== 'mine' )
        board[row][col+1] = parseInt(board[row][col+1]) + 1;
    
    if ( board[row+1] ) {
        if ( board[row+1][col-1] && board[row+1][col-1] !== 'mine' )
            board[row+1][col-1] = parseInt(board[row+1][col-1]) + 1;
        
        if ( board[row+1][col] !== 'mine' )
            board[row+1][col] = parseInt(board[row+1][col]) + 1;
        
        if ( board[row+1][col+1] && board[row+1][col+1] !== 'mine' )
            board[row+1][col+1] = parseInt(board[row+1][col+1]) + 1;
    }
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
    if ( tile.length === 0 ) return;
    const tileClass = tile.attr('class').split(' ');
    const tileType = tileClass[0];
    const tilePos = tile.attr('class').split(' ')[1].split('-');
    const row = parseInt(tilePos[0]), col = parseInt(tilePos[1]);
    
    if ( tileClass.find(elem => elem === 'open' || elem === 'flagged')) return;
    
    if ( tileType === 'mine' ) {
        triggerMine();
    }

    if ( tileType === 'empty' ) {
        tileOpenHandler(tile);
        openAdjacentTiles([row, col]);
        return;
    }
    tileOpenHandler(tile);
}

function tileOpenHandler(tile) {
    tile.removeClass('hidden');
    tile.attr('class', tile.attr('class').split(' ')[0] + ' open');
}

function openAdjacentTiles(pos) {
    const row = pos[0], col = pos[1];

    for ( let i = -1; i <= 1 ; i++ ) {
        if ( board[row+i] ) {
            for ( let j = -1; j<= 1; j++ ) {
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
    if ( tileClass.split(' ')[1] === 'open' ) return;
    const tilePos = tileClass.split(' ')[1].split('-');
    const row = parseInt(tilePos[0]), col = parseInt(tilePos[1]);
    if ( flagTiles[row].find(elem => elem === col) ){
        numOfMines++;
        flagTiles[row] = flagTiles[row].filter(elem => {
            return elem !== col;
        });
    }
    else {
        flagTiles[row].push(col);
        numOfMines--;
    }
    tile.toggleClass('flagged');
    render();
}

function triggerMine() {

}

function render() {
    updateNumberOfMines();
}
