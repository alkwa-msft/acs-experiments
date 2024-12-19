import express from 'express';
import path from 'path';
import { CommunicationIdentityClient } from '@azure/communication-identity';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const settings = require('../appsettings.json');

const connectionString = process.env.ACS_CONNECTION_STRING || settings.resourceConnectionString;

if (connectionString === undefined) {
  console.error('Please set up an ACS Connection String in /appSettings.json');
}

let identityClient = new CommunicationIdentityClient(connectionString);

const app = express();
const port = process.env.PORT || 3001;
// Use express.json() middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));
const server = createServer(app);
const io = new Server(server, {
   cors: { origin: '*', methods: ['GET', 'POST'] },
   
});

io.on('connection', (socket) => {
  console.log('[ws] A user connected');
  socket.on('message', (message) => {
    console.log('[ws] Received message:', message);
    // Broadcast the message to all connected clients
  });
  socket.on('close', () => {
    console.log('[ws] A user disconnected');
  });
});
console.log('[ws] I have registered all of my events for my wssocket server');


setInterval(()=>{
  if(io.engine.clientsCount > 0){
    io.emit('message', 'Hello from the server');
    io.send('[ws] Hello from the server', io.engine.clientsCount);
  }
}, 5000);

app.post('/token', async (req, res) => {
  try {
    const userAndToken = await identityClient.createUserAndToken(["voip"]);
    res.json({
      userId: userAndToken.user.communicationUserId,
      token: userAndToken.token
    })
  } catch (error) {
    console.error('Error minting token:', error);
    res.status(501).send('Error minting token');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
server.listen(port, () => console.info(`Listening on port ${port}.`));
