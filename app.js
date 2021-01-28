/* Import statements */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080;

const { home, calculate } = require('./route');



// Config
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views');    // view folder config
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // parse formdata client

// App routes
app.get('/', home);
app.post('/calculate', calculate);

// Set the port the app will listen on
app.listen(process.env.port || port, () => {
    console.log(`Proceed to http://localhost:${process.env.port || port} to view app.`);
});