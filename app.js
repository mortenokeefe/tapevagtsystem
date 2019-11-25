

const controller = require('./Controllers/controller');
//express
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





//POST endpoints
app.post('/opretBruger' , async (req, res) =>{
    const {fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email} = req.body;
    controller.newBruger(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email, undefined);
    res.send({ok:true}); // fix fejlsikring senere
});

app.post('/opretBegivenhed' , async (req, res) =>{
    const {navn, dato, beskrivelse, antalFrivillige} = req.body;
    controller.newBegivenhed(navn, dato, beskrivelse, antalFrivillige, undefined);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('/opretVagt', async(req,res)=> {
    //hvor meget skal vi egentlig have fra userinterface?
    const {startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed} = req.body;
    controller.newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('/tilfoejVagtTilBruger', async(req,res) =>{
    const {vagt, bruger} = req.body;
    controller.addVagtToBruger(bruger, vagt);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('tilfoejVagtTilBegivenhed', async(req,res) =>{
    const {vagt, begivenhed} = req.body;
    controller.addVagtToBegivenhed(begivenhed, vagt);
    res.send({ok:true}); // fix fejlsikring senere
});



console.log('Listening on port ' + port + ' ...');


