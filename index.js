const express        = require('express');
const app            = express();
const http           = require('http');
const server         = http.createServer(app);
const { Server }     = require("socket.io");
const io             = new Server(server);
const bodyParser     = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  // console.log(socket.id)
  io.emit('display message', 'a user connected');
  console.log('a user connected');

  socket.on('disconnect', () => {
    io.emit('display message', 'user disconnected');
    console.log('user disconnected')
  });

  socket.on('display message', (msg) => {
    io.emit('display message', msg);
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
