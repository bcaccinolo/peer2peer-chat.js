var express = require('express');
var app = express();
const WebSocket = require('ws');

// command line arguments
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

// Connection ports
ws_server_port = process.argv[2];
web_server_port = Number(ws_server_port) + 1;

wss = new WebSocket.Server({port:ws_server_port, clientTracking:true});
console.log('\n**********************************************************');
console.log("websocket server listening on port ", ws_server_port);
let sockets = [];

const listenMessage = (message, ws) => {
console.log('\n**********************************************************');
console.log('in listen message with data', message);

  json = JSON.parse(message);

  // New Peer Broadcast
  if (json.type === 'newPeerBroadcast') {
    // broadcasting to other peers
    sockets.forEach((socket) => {
      message = {type: 'newPeer', port: json.port};
      socket.send(JSON.stringify(message));
    })
    ws.send(JSON.stringify({type: 'message', data:'From: '+ ws_server_port +' hello new peer'}));
    console.log('New peer node added ', json.port);
    sockets.push(ws);

    message = {type: 'addMe', port: json.port};
    ws.send(JSON.stringify(message));
  }

  // Add New Peer request
  if (json.type === 'newPeer') {

    url = "ws://localhost:"+json.port;
    console.log(url);

    ws = new WebSocket(url);
    ws.on('open', function open() {
      console.log('connection new peer simple');

      message = {type: 'addMe', port: json.port};
      ws.send(JSON.stringify(message));

      ws.on('message', function(data){
        console.log(data);
      })

      sockets.push(ws);
    })
  }

  // Add the peer
  if (json.type === 'addMe') {
    sockets.push(ws);

    message = {type: 'message', data: "From " + ws_server_port + " ok i added you"};
    ws.send(JSON.stringify(message));
  }

}

wss.on('connection', function connection(ws) {
  console.log('connection');

  ws.on('message', function incoming(data) {
    listenMessage(data, ws);
  })

})


app.get('/', function(req, res) {
  res.send('hello');
})

app.get('/message', (req, res) => {
  message = req.query.message;
  console.log("the message is ", message);

  sockets.forEach((socket) => {
    message = {type: 'message', data: message};
    socket.send(JSON.stringify(message));
  })

  res.send('sending message: ' + message);

})

app.get('/listPeers', function(req, res) {
  console.log(sockets);

  res.send('sockets listing');
})

app.get('/addPeer', function(req, res) {

  url = "ws://localhost:"+req.query.port;
  console.log(url);

  ws = new WebSocket(url);
  ws.on('open', function open() {

    message = {
      type: 'newPeerBroadcast',
      port: ws_server_port
    }
    ws.send(JSON.stringify(message));

    ws.on('message', (msg) => {
      console.log('message', msg);
      listenMessage(msg, ws);
    })

  });

  ws.on('close', () => {
    console.log('connection closed');

  })

  res.send('add peer');
})

app.listen(web_server_port);
console.log("Web server listening on port ", web_server_port);