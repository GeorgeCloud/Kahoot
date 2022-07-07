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

users = []

rooms = {
  // roomId: hostId
}

io.engine.generateId = (req) => {
  return uuid.v4(); // must be unique across all Socket.IO servers
}

function createUser(id, username, roomId){
  user = {userId: id, username: username, roomId: roomId};

  return user;
}

///////  MAIN ROUTES  /////////
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/host', (req, res) => {
  const roomId = uuid.v4().slice(-4);

  res.render('host', { roomId });
});

app.post('/host', (req, res) => {
  // Create io server
  const roomId = req.body.roomId;

  res.redirect(`/room/${roomId}`);
});

app.get('/join', (req, res) => {
  res.render('join');
});

app.post('/join', (req, res) => {
  const roomId = req.body.roomId;

  res.redirect(`/room/${roomId}`)
});

app.get('/room/:roomId', (req, res) => {
  // If room does NOT have host don't render page
  const roomId = req.params.roomId
  if (rooms[roomId]){
    res.render('game', { roomId });
  } else {
    res.send(`room ${roomId} does not exist`)
  }
});

///////  SOCKET ROUTES  ///////
io.on('connection', (socket) => {
  socket.on('create-room', (roomId) => {
    const currentId = socket.id
    const username = null

    // If room does not exist create room
    if (!rooms[roomId]){
      // set host to owner of room
      rooms[roomId] = currentId

      user = createUser(currentId, username, roomId)
      users.push(user);

      socket.join(roomId)
      console.log(`${currentId} created room: ${roomId}`)

    } else {
      console.log('Error: room with this ID already exists')
    }
  });

  socket.on("join-room", (data) => {
    const roomId   = data['roomId'];
    const username = data['username'];

    if (roomId in rooms){
      const currentId = socket.id

      user = createUser(currentId, username, roomId)

      users.push(user);
      socket.join(roomId)

      console.log(`${username} joined room: ${roomId}`)

    } else {
      console.log('room does not exist | socket side')
    }
  });
});


server.listen(3000, () => {
  console.log('listening on *:3000');
});
