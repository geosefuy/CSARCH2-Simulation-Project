/* Import statements */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 8080; 

const { home } = require('./route');



// Config
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views');    // view folder config
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); // parse formdata client

// App routes
app.get('/', home);
app.post('/one_table/getquery1', oneQuery1);

// Set the port the app will listen on
app.listen(port, () => {
    console.log(`Proceed to http://localhost:${port} to view app.`);
});