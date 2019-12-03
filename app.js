
const controller = require('./Controllers/controller');
//express
const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs').promises;
app.use(express.static('public'));
app.use(express.json());
app.use(session({secret: 'hemmelig', saveUninitialized: true, resave: true}));
app.use(express.static('private'));


// MONGODB & MONGOOSE SETUP
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect("mongodb+srv://TapeProjekt:tape123@tape-yxunw.gcp.mongodb.net/Tape?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

// START THE SERVER
const port = process.env.PORT || 8080
app.listen(port);

//GET endpoints

app.get('/fravær/:brugernavn', async  (req,res) =>{
    let brugernavn = req.params.brugernavn;
    let fraværsprocent = await controller.getFraværForBruger(brugernavn);
    res.send(fraværsprocent);
});


app.get('/sebegivenhed/:begivenhedsid', async (req, res) => {
    let id = req.params.begivenhedsid;
    let begivenhedsinfo = await controller.seBegivenhed(id);
    res.send(begivenhedsinfo);
});

app.get('/begivenheder' , async (req, res )=>{
    let events = await controller.getBegivnheder();
   // console.log( events);
    res.send(events)

});
app.get('/brugere', async (req, res) =>{
    let brugere = await controller.getBrugere();
    res.send(brugere);
});
app.get('/getbruger/:brugerid', async (req, res) => {
    // console.log('prøver at hente bruger');
   let brugerid = req.params.brugerid;
   let bruger = await controller.getBrugerFraId(brugerid);
   let mitbrugernavn = req.session.brugernavn;
   let minbruger = await controller.getBruger(mitbrugernavn);
   let o = {bruger: bruger, minbruger: minbruger};
   console.log(o);
   res.send(o);
});
app.get('/brugertype', async (req, res) =>
{
    let bruger = await controller.getBrugerFraId(req.session.brugernavn);
    let brugertype = {brugertype: bruger.brugertype};
    res.send(brugertype);
});
app.get('/vagter', async (req, res)=> {
   let vagter //= controller.getVagter();
    res.send(vagter);
});
app.get('/mineVagter', async (req, res) => {
    let vagter = await controller.getVagterFraBruger(req.session.brugernavn);
    let vagterView = [];
    for (let vagt of vagter) {
        let samlet = {dato: 'dato', begivenhed: 'begivenhed', id: 'id', status: 'status'};
        dateConverted = vagt.startTid;
        samlet.dato = new Date(dateConverted).toLocaleDateString();
        let begivenhed = await controller.getBegivenhed(vagt.begivenhed);
        samlet.begivenhed = begivenhed.navn;
        samlet.id = vagt._id;
        samlet.status = vagt.status;
        vagterView.push(samlet);
    }
    res.send(vagterView);
});

app.get('/calendar', async function(req, res){
    res.sendFile(__dirname+'/public/calendar/calendar.html')
})


app.get('/calendar/api/event', async function(req, res){
    const events = await controller.getCalendarEvents({})
    const vagter = await controller.getCalendarVagt({})
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
    console.log(req.body);
    const {fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email} = req.body;
    controller.newBruger(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email, undefined);
    res.sendStatus(201);
});

app.post('/opretBegivenhed' , async (req, res) =>{
    console.log("opretter begivenhed");

    const {navn, dato, beskrivelse, antalFrivillige} = req.body;
    console.log(navn + dato + beskrivelse + antalFrivillige);
   await controller.newBegivenhed(navn, dato, beskrivelse, antalFrivillige, undefined);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('/opretVagt', async(req,res)=> {
    //hvor meget skal vi egentlig have fra userinterface?
    const {startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed} = req.body;
   await controller.newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed);
    res.send({ok:true}); // fix fejlsikring senere
});

app.post('/tilmeldmigbegivenhed', async(req,res) =>{
    let begivenhedsid = req.body.id;
    let brugernavn = req.session.brugernavn;
    console.log('prøver at tilmelde');
    await controller.tilmeldBegivenhed(brugernavn, begivenhedsid);
    // res.send({ok:true}); // fix fejlsikring senere
});

app.post('/tilfoejVagtTilBruger', async(req,res) =>{
    const {vagt, bruger} = req.body;
   await controller.addVagtToBruger(bruger, vagt);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('/tilfoejVagtTilBegivenhed', async(req,res) =>{
    const {vagt, begivenhed} = req.body;
   await controller.addVagtToBegivenhed(begivenhed, vagt);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('/saetVagtTilSalg', async (req, res) => {
    const id = req.body.vagtID;
    console.log("vagt til salg "+id)
    await controller.setVagtStatus(id,2);
    res.send({ok:true});
});

app.post('/overtagvagt', async (req, res) =>{
   let brugerloggedind = req.session.brugernavn;
   let vagtid = req.body.id;
   // console.log(brugerloggedind + ' ønsker at overtage vagten med id: ' + vagtid);
    let email = await controller.getEmailFraVagtId(vagtid);

   await controller.overtagVagt(brugerloggedind, vagtid)
       .then(res.send({ok: true})).then(controller.sendmail(email));

});



app.post('/update', async (req,res) => {
console.log('jaja');
});

//login

app.post('/login', async (request, response) => {
    const {brugernavn, password} = request.body;
    const check = await controller.getBruger(brugernavn);

    if (check == null)
        response.send({ok: false});
    else {

        if (password === check.password && brugernavn) {
            request.session.brugernavn = brugernavn;
            request.session.brugertype = check.brugertype;
            response.send({ok: true, type: 'admin'});
        } else {
            response.send({ok: false});
        }
    }

});

app.get('/mineVagter', async (req, res) =>{
    let vagter = await controller.getVagterFraBruger(req.session.brugernavn);
    let vagterView = [];
    for (let vagt of vagter)
    {
        let samlet = {dato: 'dato', begivenhed : 'begivenhed', id : 'id'};
        dateConverted = vagt.startTid;
        samlet.dato = new Date(dateConverted).toLocaleDateString();
        let begivenhed = await controller.getBegivenhed(vagt.begivenhed);
        samlet.begivenhed = begivenhed.navn;
        samlet.id = vagt._id;
        vagterView.push(samlet)
    }
    res.send(vagterView);

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
app.get('/vagtertilsalg', async (req, res) => {
   let vagter = await controller.getVagterTilSalg();
   res.send(vagter);
});



// app.get('/session', async (request, response) => {
//     const brugernavn = request.session.brugernavn;
//     const brugertype = request.session.brugertype;
//     if (brugernavn && brugertype ===0) {
//        let sti = __dirname + '/private/forside.html';
//       // let template = await fs.readFile(sti,'utf8');
//         //response.send(template);
//         response.sendFile(sti);
//     }
//     else if (brugernavn && brugertype ===1)
//     {
//         let sti = __dirname + '/private/forside.html';
//         // let template = await fs.readFile(sti,'utf8');
//         // response.send(template);
//         response.sendFile(sti);
//
//     }
//     else if (brugernavn && brugertype ===2)
//     {
//         let sti = __dirname + '/private/forside.html';
//         // let template = await fs.readFile(sti,'utf8');
//         // response.send(template);
//         response.sendFile(sti);
//     }
//     else {
//         let sti = __dirname + '/private/ingenAdgang.html';
//         let template = await fs.readFile(sti,'utf8');
//         response.send(template);
//
//     }
// });
// app.get('/forside', async (request, response) =>{
//     const brugernavn = request.session.brugernavn;
//     const brugertype = request.session.brugertype;
//     if (brugernavn && brugertype ===0) {
//         response.redirect('/forside.html');
//     }
//     else if (brugernavn && brugertype ===1)
//     {
//         //fix redirect til afvikler
//         response.redirect('/forside.html');
//     }
//     else if (brugernavn && brugertype ==2)
//     {
//         //fix redirect til frivillig
//         response.redirect('/forside.html');
//     }
//     else {
//         response.redirect('/ingenAdgang.html');
//     }
// })




console.log('Listening on port ' + port + ' ...');


