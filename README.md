# Peer to Peer Chat
A minimalist peer to peer implementation to learn how it works.
This implementation is limited, all the nodes runs on the same server
but they use different ports.

## Dependencies
The package [ws](https://www.npmjs.com/package/ws) is used to manage websocket between nodes.

## What it does
- When connecting to one node, this node informs all the nodes of the network of the presence
of a new node. All the nodes of the network connects to the new one.
- When a node goes down, all the nodes removes it from their nodes list.
- When sending a message, the message is broadcasted to every node.

## Launching 2 nodes

Let's launch 2 nodes:

```
node app.js 3000
```
A websocket server will be launched on 3000 port.

A webserver will be launched on 3001 port.

In another terminal
```
node app.js 4000
```
A websocket server will be launched on 4000 port.

A webserver will be launched on 4001 port.

## Connecting the nodes
To connect the 2 nodes, let's use the web interface.
```
http://localhost:3001/addPeer?port=4000
```

The node 3000 is asking the node 4000 for connection.

If the node 4000 was already connected to other nodes, it would inform
the nodes of the new one.

## List the existing nodes
```
http://localhost:3001/listPeers
```
This will dump the known sockets of this node.

## Send a message
```
http://localhost:3001/message?message='hello world'
```
This will broadcast the message to all the nodes of the network.

## Resources
- https://github.com/websockets/ws/blob/master/doc/ws.md

## Todo
- DONE add a server express
- DONE add the url add peer
- DONE send a message
- DONE when the client connects, send its port
- DONE as a client, when I receive a message 'newPeer', I send a request to it.
- DONE switch functions to fat arrow
- DONE if one node is DOWN, the node is removed from the list.
