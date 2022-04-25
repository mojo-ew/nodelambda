var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var cors = require('cors');
var bodyparser = require('body-parser');
var swaggerUi = require('swagger-ui-express');
var swaggerJSDoc = require('swagger-jsdoc');
var methodOverride = require('method-override');


 const swaggerDefinition = {
  info: {
    title: 'Cron API',
    version: '1.0.0',
    description: 'Endpoints to test the user registration routes'
  },
 
    //host: 'localhost:3002', 
     host: 'u9rqxlbq5b.execute-api.us-east-1.amazonaws.com/dev/',
      
  basePath: '/',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'authorization',
      scheme: 'bearer',
      in: 'header',
    },
  },

};
const options = {
  swaggerDefinition,
  apis: ['./routes/controller/*.js']
};

const cron=require('./routes/controller/cron');

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(methodOverride()); 
app.use(express.static(path.join(__dirname, 'public')));


app.use('/Cron',cron);


const swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
}); 

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); 

app.get('/', (req, res) => {
  res.send('404-Page Not Found');
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//all other requests are not implemented.
app.use((err, req, res) => {
  res.status(err.status || 501);
  res.json({
    error: {
      code: err.status || 501,
      message: err.message
    }
  });
});

module.exports = app;

const port = process.env.port || 3002;

//Create server with exported express app
const server = http.createServer(app);
server.listen(port);

