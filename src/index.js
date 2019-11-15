const express = require('express'); // pide express sea requerido
const path = require('path'); // pide que path sea requerido
const pty = require('node-pty'); ////////////////ASKS FOR NODE-PTY
// inicializaciones
const app = express();
const expressWs = require('express-ws')(app);///////////////////ASK FOR THE WEBSOCKET FROM EXPRESS
//////////////////////////////////////////////////////////////////////////////////////////////////
// Instantiate shell and set up data handlers
expressWs.app.ws('/shell', (ws, req) => {
  // Spawn the shell
  const shell = pty.spawn('/bin/bash', [], {
    name: 'xterm-color',
    cwd: process.env.PWD,
    env: process.env
  });
  // For all shell data send it to the websocket
  shell.on('data', (data) => {
    ws.send(data);
  });
  // For all websocket data send it to the shell
  ws.on('message', (msg) => {
    shell.write(msg);
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////////





//configuraciones
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//intermedio
app.use(express.urlencoded({
  extended: false
}));
app.use(express.json());
//para que la ruta de estilos y js sea visible
app.use('/styles', express.static('styles'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));
app.use('/node_modules', express.static('node_modules'));
//rutas
app.use(require('./routes/index'));
// Configurar cabeceras y cors
//inicia el servidor
app.listen(app.get('port'), () => {
  console.log("Servidor escuchando en el puerto", app.get('port'))
});
