const prompt = require('prompt-sync')();
const io = require('socket.io-client');
const socket = io.connect('http://localhost:5050');

const webLink = process.argv[2];
const port = process.argv[3];

const players = [];

if (!webLink && !port) {
  console.log('Please enter web address & port number correctly!');
} else if (webLink !== '127.0.0.1') {
  console.log('You can only access to 127.0.0.1');
} else if (port !== '5050') {
  console.log('You can only access to port no 5050');
} else {
  socket.on('connect', () => {
    const name = prompt('Enter your name: ');
    const id = socket.io.engine.id;

    socket.emit('sayHello', { name, id });
    socket.on('isFirstUser', (count) => {
      if (count === 1) {
        console.log(`${name}, you are first player. Wait for second player to join.`);
      } else if (count === 2) {
        console.log(`${name}, you are second player. Let's begin the game.`);
        socket.emit('startGame', name);
      } else {
        console.log('Sorry the room is full!');
      }
    });

    socket.on('gameOn', (msg) => {
      console.log(msg);
    });

    socket.on('move', (currentId) => {
      if (currentId === id) {
        const move = prompt('Please enter 1 to 9 to play: ');
        socket.emit('play', move);
      } else {
        console.log('waiting for another player\'s move!')
      }
    });

    socket.on('board', board => console.log(board));
    socket.on('gameboard', gameBoard => console.log(gameBoard));
    socket.on('invalid', () => console.log('That was an invalid option!'));
    socket.on('usedspace', () => console.log('Space already in use. Try again!'));
    socket.on('endgame', (name) => {
      if (name) {
        console.log(`${name}, won!`);
      } else {
        console.log('Game draw!');
      }
    })
  });

  socket.on('disconnect', () => {
    console.log('You are disconnected from server!');
  });
}
