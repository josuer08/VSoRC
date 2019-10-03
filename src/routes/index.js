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
  var exec = require('child_process').spawn;
  var child;
  chlid = spawn('python', ['-f','./../pypy.py']);

    pyProg.stdout.on('data', function(data) {

        console.log(data.toString());
        res.write(data);
        res.end('end');
  });
});
module.exports = router;
