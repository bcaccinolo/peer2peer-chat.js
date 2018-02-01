const express = require('express')
const app = express()
const { P2P } = require('./p2p')

// Connection ports
const wsServerPort = process.argv[2]
const webServerPort = Number(wsServerPort) + 1

const p2p = new P2P(wsServerPort)
p2p.createServer()

app.get('/', function(req, res) {
  res.send('hello')
})

app.get('/addPeer', function(req, res) {
  p2p.newConnection(req.query.port)
  res.send('add peer')
})

app.get('/listPeers', function(req, res) {
  console.log(p2p.sockets)
  res.send('sockets listing')
})

app.get('/message', (req, res) => {
  p2p.sendMessage(req.query.message)
  res.send('sending message: ' + req.query.message)
})

app.listen(webServerPort)
console.log('Web server listening on port', webServerPort)
