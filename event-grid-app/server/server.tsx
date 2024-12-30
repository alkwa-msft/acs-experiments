import express from 'express';
import path from 'path';
import { CommunicationIdentityClient } from '@azure/communication-identity';
// import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import bodyParser from '@koa/bodyparser';
import koaCors from '@koa/cors';
import Koa from 'koa';
import Router from 'koa-router';
import serve from 'koa-static';
import send from 'koa-send';

let settings;

// If the bits are deployed then use a fake config object
if(process.env.IS_DEPLOYED) {
  settings = {
    resourceConnectionString: process.env.ACS_CONNECTION_STRING,
    groupId: process.env.GROUP_ID
  }
} else {
  // If the bits are local and you are doing an npm run start
  settings = require('../appsettings.json');
}

const connectionString = settings.resourceConnectionString;
const groupId = settings.groupId;

if (connectionString === undefined) {
  console.error('Please set up an ACS Connection String in /appSettings.json');
}

if (groupId === undefined) {
  console.error('Please set up a groupId in /appSettings.json');
}

let identityClient = new CommunicationIdentityClient(connectionString);

// const app = express();
const koaApp = new Koa();
const router = new Router();

const port = process.env.PORT || 3001;
const socketIOConnectionUrl = process.env.CODESPACE_NAME ? `https://${process.env.CODESPACE_NAME}-${port}.app.github.dev` : `http://localhost:${port}`;

koaApp.use(bodyParser());
koaApp.use(router.routes());
koaApp.use(router.allowedMethods());
koaApp.use(koaCors());
koaApp.use(serve(path.join(__dirname, '../build')));

const koaServer = createServer(koaApp.callback());

const koaIo = new Server(koaServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

koaIo.on('connection', (socket) => {
  console.log('[ws] A user connected');
  socket.on('message', (message) => {
    console.log('[ws] Received message:', message);
    // Broadcast the message to all connected clients
  });
  socket.on('close', () => {
    console.log('[ws] A user disconnected');
  });
});

router.get('/eventgridsetup', async (ctx, next) => {
  ctx.status = 200;
  ctx.body = {
    url: socketIOConnectionUrl
  }
});

router.get('/groupId', async(ctx, next) => {
  ctx.status = 200;
  ctx.body = {
    groupId
  }
});

router.post('/token', async (ctx, next) => {
  try {
    const userAndToken = await identityClient.createUserAndToken(["voip"]);
    ctx.status = 200;
    ctx.body = {
      userId: userAndToken.user.communicationUserId,
      token: userAndToken.token
    }
  } catch (error) {
    console.error('Error minting token:', error);
    ctx.status = 501;
    ctx.body = 'Error minting token';
  }
});

router.post('/eventgrid', async (ctx, next) => {
  try {
    const events = ctx.request.body as any;
    if (events[0].eventType === 'Microsoft.EventGrid.SubscriptionValidationEvent') {
      const validationCode = events[0].data.validationCode;
      ctx.status = 200;
      ctx.body = { validationResponse: validationCode }
    } else {
      // filtering for events only for our group id
      if (groupId === events[0].data.group.id) {
        console.log('[ws] server: ', events[0].eventType, 'eventTime ', events[0].eventTime)
        koaIo.emit('message', `${events[0].eventType} eventTime:${events[0].eventTime} `);
      }
      ctx.status = 200;
      ctx.body = 'Events processed';
    }
  } catch (error) {
    console.error('Error processing events:', error);
    ctx.status = 500;
    ctx.body = 'Internal Server Error';
  }
})

router.get('/', async (ctx, next) => {
  if(process.env.IS_DEPLOYED) { // when deployed in an app service
    send(ctx, path.join(__dirname, '..', 'index.html'));
  }
  else { // when running locally or in a codespace
    send(ctx, path.join(__dirname, '../build', 'index.html'));
  }
})

koaApp.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})