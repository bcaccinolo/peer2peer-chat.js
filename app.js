const express = require('express');
const app = express();
const WebSocket = require('ws');

// command line arguments
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

// Connection ports
const ws_server_port = process.argv[2];
const web_server_port = Number(ws_server_port) + 1;

// P2P class
class P2P {

  constructor(port) {
    this.port = port;
    this.sockets = [];
  }

  createServer() {
    this.server = new WebSocket.Server({port:this.port});
    console.log("P2P: server listening on port ", this.port);

    this.server.on('connection', (ws) => {
      console.log('connection');
      ws.on('message', (data) => {
        this.listenMessage(data, ws);
      })
    })
  }

  createMessage(json) {
    return JSON.stringify(json);
  }

  sendMessage(message) {
    this.sockets.forEach((socket) => {
      socket.send(this.createMessage({type: 'message', data: message}));
    })
  }

  addSocket(ws) {
    console.log('### Adding new socket in the list');
    ws.send(this.createMessage({type: 'message', data: "From " + ws_server_port + " ok i added you"}));
    this.sockets.push(ws);
  }

  listenMessage(message, ws) {

    console.log('\n**********************************************************');
    console.log('in listen message with data', message);

    let json = JSON.parse(message);

    // New Peer Broadcast
    if (json.type === 'newPeerBroadcast') {

      this.sockets.forEach((socket) => {
        socket.send(this.createMessage({type: 'newPeer', port: json.port}));
      })

      console.log('New peer node added ', json.port);
      this.addSocket(ws);

      ws.send(this.createMessage({type: 'addMe', port: json.port}));
    }

    // Add New Peer request
    if (json.type === 'newPeer') {

      let url = "ws://localhost:"+json.port;
      console.log(url);

      let ws = new WebSocket(url);
      ws.on('open',  () => {
        console.log('connection new peer simple');
        ws.send(this.createMessage({type: 'addMe', port: json.port}));
        ws.on('message', function(data){
          console.log(data);
        })
        this.addSocket(ws);
      })
    }

    // Add the peer
    if (json.type === 'addMe') {
      this.addSocket(ws);
    }

  }

  newConnection(port) {
    let url = "ws://localhost:" + port;
    let ws = new WebSocket(url);

    ws.on('open', () => {
      ws.send(this.createMessage({ type: 'newPeerBroadcast', port: ws_server_port }));
      ws.on('message', (msg) => {
        this.listenMessage(msg, ws);
      })
    });

    ws.on('close', () => {
      console.log('connection closed');
    })
  }
}
// End P2P class

const p2p = new P2P(ws_server_port);
p2p.createServer();

app.get('/', function(req, res) {
  res.send('hello');
})

app.get('/addPeer', function(req, res) {
  p2p.newConnection(req.query.port);
  res.send('add peer');
})

app.get('/listPeers', function(req, res) {
  console.log(p2p.sockets);
  res.send('sockets listing');
})

app.get('/message', (req, res) => {
  p2p.sendMessage(req.query.message);
  res.send('sending message: ' + req.query.message);
})

app.listen(web_server_port);
console.log("Web server listening on port ", web_server_port);