const {
  Router
} = require('express');
const router = new Router();

let alumnos = [];

router.get("/", (req, res) => {
  res.render("index", {
    alumnos
  })
});

router.get("/flex", (req, res) => {
  res.render("flex")
});

router.get('/web', (req, res) => {
  res.render('web')
});

router.post('/web', (req, res) => {
  let {
    nombre,
    documento
  } = req.body;
  let nuevoRegistro = {
    nombre,
    documento,
    fecha: new Date()
  };
  alumnos.push(nuevoRegistro);
  res.redirect("/");
});

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


module.exports = router;
