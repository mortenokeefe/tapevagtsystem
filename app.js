const express = require('express');

const app = express();
app.use(express.static('public'));
app.use(express.json());

// MONGODB & MONGOOSE SETUP
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect("mongodb+srv://TapeProjekt:tape123@tape-yxunw.gcp.mongodb.net/test?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

// START THE SERVER
const port = process.env.PORT || 8080
app.listen(port);


//GET endpoints

app.get('/event' , async (req, res )=>{
    let events; // = controller get events
    res.send(events)
});



app.get('/jokes', async (request, response) => {
    let jokes = await controller.getJokes();
    response.send(jokes);
});

//POST endpoints
app.post('/createUser' , async (req, res) =>{
    const {fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email} = req.body();
    
});


console.log('Listening on port ' + port + ' ...');


