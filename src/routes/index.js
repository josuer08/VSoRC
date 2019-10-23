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

router.get('/listswitch', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("curl localhost:8080/data?list=switches", function(error, stdout, stderr) {
    console.log("listswitch");
    console.log(stdout);
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
  var child0;//needs a mkfifo named fifo to exist
  var child1;
  var child2;
  var answer;
  //controlar que solo se haga un arranque por vez y agregar el exec 3>fifo
  child0 = exec("cd /home/pi && mkfifo fifo && touch aichivo", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });
  child1 = exec("exec 3>fifo", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });//add disown?
  child2 = exec("cd /home/pi && cat fifo | sudo ./clusterGRE.py > aichivo 2>&1 &", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });
  res.send(answer);
});

router.get('/stopvsorc', (req,res) =>{
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  child = exec("cd /home/pi && exec 3>&- && rm fifo aichivo", function(error, stdout, stderr) {
    console.log(stdout);
    res.send(stdout);
  });//esto cierra el fifo, lo cual cierra el programa
});
module.exports = router;
