class Cell {
  constructor(board, y, x) {
    this.board = board; // board object
    this.y = y;
    this.x = x;
    this.id = `r${y}c${x}`;
    this.mine = false; // is this a mine?
    this.revealed = false; // is this cell revealed?
    this.number = 0; // Number of mine neighbors
    this.flagged = false; // to tell if cell is flagged from user or not
  }

  neighbors() {
    let out = [];
    for (let xdelta = -1; xdelta <= 1; xdelta++) {
      for (let ydelta = -1; ydelta <= 1; ydelta++) {
        if (xdelta === 0 && ydelta === 0) continue;
        let newX = this.x + xdelta;
        let newY = this.y + ydelta;
        if (
          newX >= 0 &&
          newX < this.board.width &&
          newY >= 0 &&
          newY < this.board.height
        )
          out.push(this.board.cells[newY][newX]);
      }
    }
    return out;
  }

  handleClick() {
    // check if cell if flagged
    // need to set prev board before checking neighbors?
    if (!this.flagged) {
      this.board.game.prevBoard = this.board.cells.map(b => b.map(c => c))
      this.revealAndCheckNeighbors();
      console.log(this.board.numCells);
      // check if mine and end game if true also add logic for win condition
      if (this.mine) {
        return this.board.game.endGame('Lose');
      } else if (this.board.numCells === 0) {
        return this.board.game.endGame('Winner');
      }
    }
  }

  // adding function to handle right click
  handleRightClick(evt) {
    evt.preventDefault();
    // changing flagged to opposite
    // changing class name
    this.flagged
      ? document.getElementById(this.id).classList.remove('flagged')
      : (document.getElementById(this.id).className = 'flagged');
    this.flagged = !this.flagged;
    return false;
  }

  revealAndCheckNeighbors() {
    // everytime show is ran should keep track of how how many clickable cells are left
    // logic is that if there are none you win
    this.show();

    let toCheck = [this];
    const seen = new Set();

    while (toCheck.length > 0) {
      const cell = toCheck.pop();
      if (seen.has(cell)) continue;
      seen.add(cell.id);

      // add logic to handle flagged cells
      if (!cell.mine && !cell.revealed && !cell.flagged) {
        cell.revealed = true;
        // get undefined, false added false so you can see it better but before was left empty
        cell.show(false);
        // here you are also subtracting for each neighbor you are revealing
        this.board.numCells -= 1;
        if (cell.number === 0) {
          toCheck.push(...cell.neighbors());
        }
      }
    }
  }

  // this will get the number to display inside the cell
  // this is assigning a class name to the cell
  getContent(showMines) {
    if (!showMines && !this.revealed) {
      // should be empty string instead of null???
      return '';
    } else if (this.mine) {
      return 'mine';
    } else {
      return 'n' + this.number;
    }
  }
  // assign class 
  show(showMines) {
    document.getElementById(this.id).className = this.getContent(showMines);
  }
}

class Board {
  constructor(game, width, height) {
    this.game = game; // game object
    this.width = width;
    this.height = height;
    this.cells = [];
    // adding total num of cells
    this.numCells = width * height;
    // this is making the cells, cells = [[{board, y, x}, {b, y, x}, etc...], [{}], [{}]]
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        row.push(new Cell(this, y, x));
      }
      this.cells.push(row);
    }
  }

  placeMines(numMines) {
    let placed = 0;
    while (placed < numMines) {
      const y = Math.floor(Math.random() * this.height);
      const x = Math.floor(Math.random() * this.width);
      const cell = this.cells[y][x];
      // since randomly placing mine you have to chec k if it's a mine already
      // then place mine if cell is NOT a mine
      if (!cell.mine) {
        cell.mine = true;
        placed += 1;
        // when you place mine this is where you get the count of neighbors
        for (let n of cell.neighbors()) {
          n.number += 1;
        }
      }
    }
    // num of cells that are NOT mines left
    this.numCells = this.numCells - numMines;
  }

  makeBoard() {
    // making a table and this.cells is from above
    // [[], []]
    const board = document.getElementById('board');
    for (let row of this.cells) {
      // looping through each array which is a row of cells
      const trow = document.createElement('tr');
      // looping through each cell {}
      for (let cell of row) {
        const tcell = document.createElement('td');
        tcell.id = cell.id;
        tcell.className = cell.getContent(false);
        tcell.addEventListener('click', cell.handleClick.bind(cell));
        tcell.addEventListener('contextmenu', cell.handleRightClick.bind(cell));
        trow.appendChild(tcell);
      }
      board.appendChild(trow);
    }
  }
  
  // in order to show current board
  showBoard() {
    // need to dump old board
    var board = document.getElementById('board');
    while (board.firstChild) {
      board.removeChild(board.firstChild);
    }
    // array of cells
    for (let row of this.cells) {
      const trow = document.createElement('tr');
      for (let cell of row) {
        const tcell = document.createElement('td');
        tcell.id = cell.id;
        cell.show(false).call(cell);
        tcell.addEventListener('click', cell.handleClick.bind(cell));
        tcell.addEventListener('contextmenu', cell.handleRightClick.bind(cell));
        trow.appendChild(tcell);
      }
      board.appendChild(trow);
    }
  }
}

class Game {
  constructor(width, height, numMines) {
    // create new instance of board, pass in game to board
    this.board = new Board(this, width, height);
    // to allow undo feature you would need
    this.prevBoard = this.board.cells.map(b => b.map(c => c))
    // place mine
    this.board.placeMines(numMines);
    // draw the css of board
    this.board.makeBoard();
  }

  endGame(condition) {
    // showing the mines
    for (let row of this.board.cells) {
      for (let cell of row) {
        cell.show(true);
      }
    }
    // condition to check
    if (condition === 'Lose') {
      alert('You lose');
    } else if (condition === 'Winner') {
      alert('You WINNN');
    }
  }

  // undo() {
  //   this.board.cells = this.prevBoard;
  //   this.board.showBoard();
  // }
}

const game = new Game(11, 11, 3);
document.getElementById('undo').addEventListener('click', game.undo.bind(game));
