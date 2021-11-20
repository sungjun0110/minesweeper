/*----- constants -----*/
// Define constants: board size, number of mines
const board = {
    easy: {
        boardSize: 10,
        noOfMines: 15,
    },
    normal: {
        boardSize: 20,
        noOfMines: 50,
    },
    hard: {
        boardSize: 30,
        noOfMines: 150,
    }
}

/*----- app's state (variables) -----*/
// Define constants: board size, number of mines
let board, winner;

/*----- cached element references -----*/
// Cached elements: timer, num of mines, board, message


/*----- event listeners -----*/
// Event Listeners: click event on board, difficulty button

/*----- functions -----*/
/*

    Initialize the game — function
    Generate bombs and distribute randomly — function
    Generate numbered tiles — function 
    Check if tile is bomb — function
    Generate message if player wins - function
    Render the DOM — function

*/