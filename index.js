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

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set('view engine', 'handlebars');
app.set("views", "./views");

app.get('/', (req, res) => {
  res.render('index');
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
