

const controller = require('./Controllers/controller');
//express
const express = require('express');
const app = express();
const session = require('express-session');
app.use(express.static('public'));
app.use(express.json());
app.use(session({secret: 'hemmelig', saveUninitialized: true, resave: true}));
app.use(express.static('public'));

// MONGODB & MONGOOSE SETUP
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect("mongodb+srv://TapeProjekt:tape123@tape-yxunw.gcp.mongodb.net/Tape?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

// START THE SERVER
const port = process.env.PORT || 8080
app.listen(port);


//GET endpoints



app.get('/begivenheder' , async (req, res )=>{
    let events = await controller.getBegivnheder();
   // console.log( events);
    res.send(events)
});
app.get('/brugere', async (req, res) =>{
    let brugere = await controller.getAllBrugere();
    res.send(brugere);
});
app.get('/vagter', async (req, res)=> {
   let vagter //= controller.getVagter();
    res.send(vagter);
});

app.get('/calendar', async function(req, res){
    res.sendFile(__dirname+'/public/calendar/calendar.html')
})


app.get('/calendar/api/event', async function(req, res){
    const events = await controller.getBegivenheder({})
    const vagter = await controller.getVagter({})
    const eventsReformatted = []
    events.map(async function(element){

        eventsReformatted.push({title: element.navn,
            start: element.dato,
            description: element.beskrivelse,
            antalLedigeVagter: vagter.filter(vagt => vagt.begivenhed.equals(element._id)&& vagt.status==0).length ,
            complete: element})
    })
    res.json(eventsReformatted)
})

app.get('/vagter/api/ledigevagter/:eventId', async function(req, res){
    console.log(req.params.eventId)
    const vagter = await controller.getVagter({begivenhed:mongoose.mongo.ObjectId(req.params.eventId)})
    const ledigeVagter = []
    vagter.map(element => {
        if(element.status == 1){
            ledigeVagter.push(element)
        }
    })
    res.json(ledigeVagter)
})


//POST endpoints
app.post('/opretBruger' , async (req, res) =>{
    const {fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email} = req.body;
    controller.newBruger(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email, undefined);
    res.sendStatus(201);
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

//login

app.post('/login', async (request, response) => {
    const {brugernavn, password} = request.body;
    const check = controller.getBruger(brugernavn);
    if (password === check.password && navn) {
        request.session.navn = navn;
        response.send({ok: true});
    } else {
        response.send({ok: false});
    }
});

app.get('/session', async (request, response) => {
    const navn = request.session.navn;
    if (navn) {

        response.send('/index.html');
    } else {
        response.redirect('/ingenAdgang.html');
    }
});

app.get('/logout', (request, response) => {
        request.session.destroy((err) => {
            if (err) {
                console.log(err);
            } else {
                response.redirect('/');
            }
        });
    }
);

app.delete('/deleteBruger/:brugernavn' , async (req, res) =>{
    const brugernavn = req.params.brugernavn;
    await controller.deleteBruger(brugernavn);
    res.sendStatus(200);
});


console.log('Listening on port ' + port + ' ...');


