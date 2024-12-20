import express from 'express';
import path from 'path';
import { CommunicationIdentityClient } from '@azure/communication-identity';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const settings = require('../appsettings.json');

const connectionString = process.env.ACS_CONNECTION_STRING || settings.resourceConnectionString;
const groupId = process.env.GROUP_ID || settings.groupId;

if (connectionString === undefined) {
  console.error('Please set up an ACS Connection String in /appSettings.json');
}

if (groupId === undefined) {
  console.error('Please set up a groupId in /appSettings.json');
}

let identityClient = new CommunicationIdentityClient(connectionString);

const app = express();

// make sure to include https as well
const addr = `https://${process.env.CODESPACE_NAME}` || 'localhost'
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

app.get('/eventgridsetup', async(req, res) => {
  res.json({
    url: `${process.env.CODESPACE_NAME}-${port}.app.github.dev/`,
    addr: process.env.CODESPACE_NAME,
    port
  })
})

app.get('/groupId', async(req, res) => {
  res.json({
    groupId 
  })
})

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

app.post('/eventgrid', async (req, res) => {
  try {
    const events = req.body;
    // Handle subscription validation
    if (events[0].eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
      const validationCode = events[0].data.validationCode;
      res.status(200).json({ validationResponse: validationCode });
    } else {
      // filtering for events only for our group id
      if (groupId === events[0].data.group.id) {
        console.log('[ws] server: ', events[0].eventType, 'eventTime ', events[0].eventTime)
        io.emit('message', `${events[0].eventType} eventTime:${events[0].eventTime} `);
      }
      res.status(200).send('Events processed');
    }
  } catch (error) {
    console.error('Error processing events:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// important! must listen from `server`, not `app`, otherwise socket.io won't function correctly
server.listen(port, () => console.info(`Listening on port ${port}.`));