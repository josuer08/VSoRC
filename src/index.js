const express = require('express'); // pide express sea requerido
const path = require('path'); // pide que path sea requerido
// inicializaciones
const app = express();

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
