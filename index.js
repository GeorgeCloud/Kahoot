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

questions = [
  {question: 'What color is the sky', answer: 'blue', answers: ['red', 'blue']}
]

users = [
  // (currentId, username, roomId)
]

rooms = {
  // 'H3hf': 2309423,
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
    // ensure client side is connected to correct room
  } else {
    res.send(`room ${roomId} does not exist`)
  }
});

app.post('/room/:roomId/admin', (req, res) => {
  // If room does NOT have host don't render page
  const roomId = req.params.roomId
  const ownerId = rooms[roomId];

  if (rooms[roomId]){
    res.render('admin', { ownerId });
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

    // Check if room exists before creating user
    if (roomId in rooms){
      const currentId = socket.id

      user = createUser(currentId, username, roomId)

      users.push(user);
      socket.join(roomId)

      // TODO: Implement sesssions after joining room

      console.log(`${username} joined room: ${roomId}`)

      console.log('all rooms', rooms)
      console.log('all users:', users)
    } else {
      console.log('room does not exist | socket side')
    }
  });

  socket.on("start game", (msg) => {

  });

  socket.on("chat message", (msg) => {
    io.emit('chat message', msg);
  });

  socket.on("connect user", (username) => {
    console.log('looking for user');

    // TODO: Refactor array to use username as key
    for (let i=0; i < users.length; i++){
      console.log(users[i]);
      if (users[i]['username'] == username){
        io.emit('connect user', users[i]['userId']);
      }
    }
  });

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
