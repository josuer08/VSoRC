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
    let value = JSON.parse(stdout)

    res.send(value);
  });
});

router.get('/status', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  console.log(req.query.status+req.query.dpid);
  child = exec("curl \"localhost:8080/status?status="+req.query.status+"&dpid="+req.query.dpid+"\"", function(error, stdout, stderr) {
    console.log("statusFlows");
    console.log(stdout);
    let value = JSON.parse(stdout)

    res.send(value);
  });
});


router.get('/startcontroller', (req, res) => {
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child;
  //cd /home/pi && setsid $(cat /home/pi/ejecutarcontroller.sh | grep sudo) >/dev/null 2>&1 < /dev/null &
  child = exec("cd /home/pi && ./ejecutarcontroller.sh > /dev/null 2>&1 < /dev/null &", function(error, stdout, stderr) {
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
  var child3;
  var answer;
  request = JSON.parse(req.query.topology)
  console.log("Topology is : \n"+ request);
  //controlar que solo se haga un arranque por vez y agregar el exec 3>fifo
  child0 = exec("cd /home/pi && echo \""+request+"\" > data", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });
  child1 = exec("cd /home/pi && mkfifo fifo && rm aichivo && touch aichivo", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });
  child2 = exec("exec 3>fifo", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });
  //child3 uses tail so it can read from fifo even after a EOF
  child3 = exec("cd /home/pi && tail -n +1 -f fifo | sudo ./clusterGRE.py > aichivo 2>&1 &", function(error, stdout, stderr) {
    console.log(stdout + stderr);
    answer+=stdout;
  });
  res.send(answer);
});

router.get('/stopvsorc', (req,res) =>{
  var sys = require('sys')
  var exec = require('child_process').exec;
  var child1;
  var child2;
  var child3;
  var payload
  child1 = exec("cd /home/pi && exec 3>&- && rm fifo", function(error, stdout, stderr) {
    console.log(stdout);
    console.log("rm done");
    payload+="rm done\n\n"+stdout;
  });//esto cierra el fifo, lo cual cierra el programa

  //sudo kill $(ps aux | grep GRE| grep sudo|awk {'print $2'}) && cd /home/pi && ./multissh.sh sudo -E mn -c; sudo -E mn -c
  child2 = exec("sudo kill $(ps aux | grep GRE| grep sudo|awk {'print $2'})", function(error, stdout, stderr) {
    console.log(stdout);
    console.log("killed");
    payload+="killed\n\n"+stdout;
  });
  child3 = exec("cd /home/pi && ./multissh.sh sudo -E mn -c; sudo -E mn -c", function(error, stdout, stderr) {
    console.log(stdout);
    console.log("multisshed");
    payload+="Multisshed\n\n"+stdout;
  });
  res.send(payload);
});
module.exports = router;
