const express        = require('express');
const Handlebars     = require('handlebars')
const exphbs         = require('express-handlebars');
const app            = express();
const http           = require('http');
const server         = http.createServer(app);
const { Server }     = require("socket.io");
const io             = new Server(server);
const bodyParser     = require('body-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const uuid = require("uuid");

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.get('/', (req, res) => {
  res.render('index');
});

io.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}

// User connected
io.on('connection', (socket) => {
  // Host creates server
  socket.on('host game', () => {
    const server_id = uuid.v4();

    io.emit('server_id', server_id);
  });

  socket.on('join game', () => {
    // connect user to correct io server
    // io.emit('server_id', server_id);
  });

  // User disconnected
  socket.on('disconnect', () => {
    io.emit('display message', 'user disconnected');
    console.log('user disconnected')
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
















// socket.on('disconnect', () => {
//   io.emit('display message', 'user disconnected');
//   console.log('user disconnected')
// });
// io.emit('display message', 'a user connected');
// console.log('a user connected');
