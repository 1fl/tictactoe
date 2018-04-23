const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let players = [];
let activePlayer;
let winner;
let endGame = false;
const board = `
| 1 | 2 | 3 |
| 4 | 5 | 6 |
| 7 | 8 | 9 |
`;
const startGameMsg = `
---------------------------
Game has been started!
------------Rules----------
You can use 1 to 9 to select your position. check example board for position reference
Except 1 to 9 their are few allowed values for your help and these are:
board - to view example board
gameboard - to view current gameboard
----------------------------${board}----------------------------
`;
let game = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

const drawGameBoard = () => `
| ${game[0]} | ${game[1]} | ${game[2]} |
| ${game[3]} | ${game[4]} | ${game[5]} |
| ${game[6]} | ${game[7]} | ${game[8]} |
`;
const switchPlayer = () => activePlayer === players[0] ? activePlayer = players[1] : activePlayer = players[0];
const placeSymbol = () => activePlayer === players[0] ? 'x' : 'o';
const checkGame = () => {
  const finish = game.filter(x => x === 'x' || x === 'o');
  if (finish.length === 9) {
    endGame = true;
  }
}
const checkValue = (x, y, z) => {
  if (x === 'x' && y === 'x' && z === 'x') {
    return true;
  }
  if (x === 'o' && y === 'o' && z === 'o') {
    return true;
  }
};
const gameStatus = () => {
  if (checkValue(game[0], game[4], game[8])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[0], game[3], game[6])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[0], game[1], game[2])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[1], game[4], game[7])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[2], game[4], game[6])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[2], game[5], game[8])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[3], game[4], game[5])) {
    endGame = true;
    winner = activePlayer.name;
  } else if (checkValue(game[6], game[7], game[8])) {
    endGame = true;
    winner = activePlayer.name;
  }
};

io.on('connection', (socket) => {
  socket.on('sayHello', (data) => {
    players.push(data);
  });

  socket.emit('isFirstUser', io.engine.clientsCount);

  socket.on('startGame', (name) => {
    activePlayer = players[0];
    io.emit('gameOn', startGameMsg);
    io.emit('gameOn', `${players[0].name} move first!`);
    io.emit('gameStart', true);
    io.emit('move', activePlayer.id);
  });

  socket.on('play', (move) => {
    if (move === 'board') {
      socket.emit('board', board);
      socket.emit('move', activePlayer.id);
      return;
    }
    if (move === 'gameboard') {
      const board = drawGameBoard();
      socket.emit('gameboard', board);
      socket.emit('move', activePlayer.id);
      return;
    }
    let no = Math.floor(parseInt(move, 10));
    if (no > 0 && no < 10) {
      if (game[no - 1] !== 'x' && game[no - 1] !== 'o') {
        game[no - 1] = placeSymbol();
        checkGame();
        gameStatus();

        if (endGame) {
          const board = drawGameBoard();
          io.emit('gameboard', board);
          io.emit('endgame', winner);
          io.emit('disconnect');
          players = [];
          game = [];
        } else {
          switchPlayer();
          const board = drawGameBoard();
          io.emit('gameboard', board);
          io.emit('move', activePlayer.id);
        }
      } else {
        socket.emit('usedspace');
        const board = drawGameBoard();
        socket.emit('gameboard', board);
        socket.emit('move', activePlayer.id);
        return;
      }
    } else {
      socket.emit('invalid');
      io.emit('move', activePlayer.id);
      return;
    }
  });

  socket.on('disconnect', () => {
    console.log('User was disconnected!')
  });
});



http.listen(5050);
