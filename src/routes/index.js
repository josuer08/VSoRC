const {
  Router
} = require('express');
const router = new Router();


//renders de las paginas web
router.get("/", (req, res) => {
  res.render("index")
});

router.get("/access", (req, res) => {
  res.render("access")
});

router.get("/starter", (req, res) => {
  res.render("starter")
});

router.get("/stats", (req, res) => {
  res.render("stats")
});

router.get("/topology", (req, res) => {
  res.render("topology")
});

router.get("/topologyMaker", (req, res) => {
  res.render("topologyMaker")
});
//en lo adelante se encuentran las peticiones de datos
router.get('/free', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("free -b | grep Mem |  awk  '{print $7}'", function(error, stdout, stderr) {
    console.log("free");
    res.send(stdout);
  });
});


router.get('/mpstat', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("mpstat 1 1| grep all | awk '{print $13}'", function(error, stdout, stderr) {
    console.log("mpstat");
    res.send(stdout);
  });
});


router.get('/ifstat', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("ifstat -n -b -i wlp2s0  0.3 1 | grep [0-9]$", function(error, stdout, stderr) {
    console.log("ifstat");
    res.send(stdout);
  });
});

router.get('/gettopo', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("curl localhost:8080/topology", function(error, stdout, stderr) {
    console.log("gettopo");
    res.send(stdout);
  });
});


router.get('/startcontroller', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("cd /home/pi/ryu && setsid $(cat /home/pi/ryu/ejecutarcontroller.sh | grep sudo) >/dev/null 2>&1 < /dev/null &", function(error, stdout, stderr) {
    console.log("controller started");
    res.send(stdout);
  });
});

router.get('/stopcontroller', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("sudo kill $(ps aux | grep python | grep ryu | awk {'print $2'})", function(error, stdout, stderr) {
    console.log("controller stopped");
    res.send(stdout);
  });
});

router.get('/startvsorc', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("setsid /home/pi/lol.py", function(error, stdout, stderr) {
    console.log(stdout);
    res.send(stdout);
  });
});


var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  console.log('Se conecto '+request.origin);
  // This is the most important callback for us, we'll handle
  // all messages from users here.

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // process WebSocket message
      console.log('Recibido');
      console.log(message);
      connection.sendUTF("hola");

    }
  });

  connection.on('close', function(connection) {
    // close user connection
  });
});


module.exports = router;
