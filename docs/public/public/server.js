const { application, json } = require('express');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const port = 3000;

app.use(express.static('public'));

let ip;
let counter = 0;

app.get("/", function (req, res) {
    ip = req.ip.substring(7,req.ip.length);
    if(ip != '192.168.1.1' && ip != '127.0.0.1'){
        console.log(++counter + `: ` + ip);
    }
    res.sendFile(__dirname + "/public/index.html");
});

io.on('connection', (socket) => {
  /*
    let socketId = socket.id;
    let clientIp = '' + socket.request.connection.remoteAddress;
    clientIp = clientIp.substring(7, clientIp.length);

    clients++;
    console.log('User with ID: ' + socketId + ' with IP: ' + clientIp);
    console.log('Users: ' + clients);1
*/
    socket.on('disconnect', (socket) => {
    });

    socket.on('move', (data) =>{
        console.log(data);
        socket.broadcast.emit('playerdata', data);
    });
});

server.listen(port, ()=>{
    console.log(`Server gestartet`);
    console.log(`Erreichbar unter http://localhost:${port}`);
    });