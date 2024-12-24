const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3003 });

server.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('message', (message) => {
    console.log('Received:', message);
    socket.send(`Echo: ${message}`);
  });
});
