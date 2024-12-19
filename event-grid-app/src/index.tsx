import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import io from 'socket.io-client';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Failed to find root element');
}

const rootReactElement = ReactDOM.createRoot(root);

if (rootReactElement) {
  rootReactElement.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find root element');
}

 // if (socket === null) {
    // console.log("[ws] Socket was null so we need to create one")
    const newSocket = io('http://localhost:3001');
    newSocket.on('connect_error', (err: any) => {
      console.error('Connection error:', err.message);
      console.error('Error description:', err.description);
      console.error('Error context:', err.context);
    });

    console.log('[ws] registered for connect event')
    console.log('this is my new socket ', newSocket);
    newSocket.on('connect', () => {
      console.log('[ws] connected to server');
    });

    console.log('[ws] registered for message event')
    newSocket.on('message', (msg: string) => {
      console.log('[ws] message from server: ' + msg);
    });
    
    // console.log('[ws] registered for disconnect event')
    // newSocket.on('disconnect', () => {
    //   console.log('[ws] disconnected from server');
    // });
    /// setSocket(newSocket);
  // }