import express from 'express';
import path from 'path';
import { CommunicationIdentityClient } from '@azure/communication-identity';
import cors from 'cors';
const settings = require('../appsettings.json');

const app = express();
const port = process.env.PORT || 3001;

const connectionString = process.env.ACS_CONNECTION_STRING || settings.resourceConnectionString;

if (connectionString === undefined) {
  console.error('Please set up an ACS Connection String in /appSettings.json');
}

let identityClient = new CommunicationIdentityClient(connectionString);

// Use express.json() middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
