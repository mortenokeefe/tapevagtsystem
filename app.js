const controller = require('./Controllers/controller');
const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
app.use(express.static('public'));
app.use(express.json());
app.use(session({secret: 'hemmelig', saveUninitialized: true, resave: true}));
app.use(express.static('private'));


// MONGODB & MONGOOSE SETUP
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect("mongodb+srv://TapeProjekt:tape123@tape-yxunw.gcp.mongodb.net/Tape?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// START THE SERVER
const port = process.env.PORT || 8080
app.listen(port);

//GET endpoints

app.get('/fravaer/:brugernavn', async  (req,res) =>{
    let brugernavn = req.params.brugernavn;
    let fraværsprocent = await controller.getFraværForBruger(brugernavn);
    res.send(fraværsprocent.toString());
});


app.get('/sebegivenhed/:begivenhedsid', async (req, res) => {
    let id = req.params.begivenhedsid;
    let begivenhedsinfo = await controller.seBegivenhed(id);
    res.send(begivenhedsinfo);
});

app.get('/begivenheder' , async (req, res )=>{
    let events = await controller.getBegivenheder({});
    res.send(events)

});
app.get('/frivillige', async (req, res) => {
   let frivillige = await controller.getBrugere({brugertype:2});
   res.send(frivillige);
});
app.get('/brugere', async (req, res) =>{
    let brugere = await controller.getBrugere({});
    res.send(brugere);
});
app.get('/getbruger/:brugerid', async (req, res) => {
   let brugerid = req.params.brugerid;
   let bruger = (await controller.getBrugere({_id:brugerid}))[0];
   let mitbrugernavn = req.session.brugernavn;
   let minbruger = (await controller.getBrugere({brugernavn:mitbrugernavn}))[0];
   let o = {bruger: bruger, minbruger: minbruger};
   res.send(o);
});
app.get('/brugertype', async (req, res) =>
{
    let bruger = (await controller.getBrugere({brugernavn:req.session.brugernavn}))[0];
    let brugertype = {brugertype: bruger.brugertype};
    res.send(brugertype);
});

app.get('/getbrugeridforbrugerloggetind', async (req,res) => {
    let brugernavn = req.session.brugernavn;
    let bruger = await (controller.getBrugere({brugernavn:brugernavn}))[0];
    res.send(bruger._id);
});

app.get('/mineVagter', async (req, res) => {
    let vagter = await controller.getVagter({bruger:(await controller.getBrugere({brugernavn:req.session.brugernavn}))[0]._id});
    let vagterView = [];
    if(vagter.length >0) {
        for (let vagt of vagter) {
            let samlet = {dato: 'dato', begivenhed: 'begivenhed', id: 'id', status: 'status', tidSlut : 'tidSlut'};
            samlet.dato = new Date(vagt.startTid) //new Date(dateConverted).toLocaleDateString();
            samlet.tidSlut = new Date(vagt.slutTid);
            let begivenhed = await controller.getBegivenhed(vagt.begivenhed);
            samlet.begivenhed = begivenhed.navn;
            samlet.id = vagt._id;
            samlet.status = vagt.status;

            let nu = new Date(Date.now());
            if (vagt.startTid > nu) {
                vagterView.push(samlet)
            }

        }
    }
    res.send(vagterView);
});

app.get('/calendar', async function(req, res){
    res.sendFile(__dirname+'/public/calendar/calendar.html')
});


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
});

app.get('/vagter/api/ledigevagter/:eventId', async function (req, res) {
    const vagter = await controller.getVagter({begivenhed: mongoose.mongo.ObjectId(req.params.eventId)})
    const ledigeVagter = []
    vagter.map(element => {
        if (element.status == 1) {
            ledigeVagter.push(element)
        }
    })
    res.json(ledigeVagter)
});
app.get('/afviklere', async(req, res)=> {
    const afviklere = await controller.getAfviklere();
    res.send(afviklere);
});

app.get('/getAfvikerVagtFraBegivenhed/:begivenhedsid', async (req,res) => {
    let id = req.params.begivenhedsid;
   let afvikler = await controller.getAfvikerVagtFraBegivenhed(id);
   res.send(afvikler);
});

app.get('/checkForLedigeVagter/:begivenhedsid/:antal', async (req,res) => {
    let id = req.params.begivenhedsid;
    let antal = req.params.antal;
    let svar = await controller.checkForLedigeVagter(id, antal);
    res.send(svar);
});

app.get('/FrivilligeDerIkkeHarEnVagtPaaBegivenhed/:begivenhedsid', async (req, res) => {
    let id = req.params.begivenhedsid;
    let frivillige = await controller.findFrivilligeDerIkkeHarEnVagtPåBegivenhed(id);
    res.send(frivillige);
})

app.get('/bruger/api/getCurrentBrugernavn', async (req, res)=>{
    res.send({brugernavn: req.session.brugernavn})
})

//POST endpoints
app.post('/opretBruger' , async (req, res) =>{
    const {fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email} = req.body;
    let salt = await bcrypt.hash(password, bcrypt.genSaltSync(12)).then(function(hashedPassword) {
        controller.newBruger(fornavn, efternavn, telefonnummer, brugernavn, hashedPassword, brugertype, tilstand, email, undefined);
    })
    res.sendStatus(201);
});

app.put('/redigerBegivenhed', async (req,res) => {
   const {begivenhedsid, navn, dato, beskrivelse, logbog, antalfrivillige, starttid, sluttid} = req.body;
   await controller.redigerBegivenhed(begivenhedsid, navn, dato, beskrivelse, logbog, antalfrivillige, starttid, sluttid);
    res.sendStatus(200);
});

app.put('/updateBruger/:brugernavn' , async (req, res) =>{
    const {fornavn, efternavn, telefonnummer, password, brugertype, tilstand, email} = req.body;
    const filterbrugernavn = req.params.brugernavn;
    if (password) {
    await bcrypt.hash(password, bcrypt.genSaltSync(12)).then( async function(hashedPassword) {
        await controller.updateBruger(fornavn, efternavn, telefonnummer,  hashedPassword, brugertype, tilstand, email, filterbrugernavn);
    })}
    else {
        await controller.updateBruger(fornavn, efternavn, telefonnummer,  password, brugertype, tilstand, email, filterbrugernavn);
    }
    res.sendStatus(200);
});


app.post('/opretBegivenhed' , async (req, res) =>{
    console.log("opretter begivenhed");

    const {navn, dato, beskrivelse, antalFrivillige, afvikler, starttid, sluttid} = req.body;
    console.log(navn + dato + beskrivelse + antalFrivillige);
   await controller.newBegivenhed(navn, dato, beskrivelse, antalFrivillige, undefined, afvikler, starttid, sluttid);
    res.send({ok:true});
});
app.post('/opretVagt', async(req,res)=> {
    const {startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed} = req.body;
   await controller.newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed);
    res.send({ok:true});
});

app.post('/tilmeldmigbegivenhed', async(req,res) =>{
    let begivenhedsid = req.body.id;
    let brugernavn = req.session.brugernavn;
    await controller.tilmeldBegivenhed(brugernavn, begivenhedsid);
     res.send({ok:true});
});

app.post('/adminTilfoejVagtTilBruger', async(req,res) =>{
    const vagt = req.body.vagtid;
    const frivillig = req.body.frivilligid;
    await controller.adminAddVagtToBruger(frivillig, vagt);
    res.send({ok:true});
});

app.get('/getDenneMaanedsVagter/:begivenhedsid/:frivilligid',  async(req,res) =>{
    const begivenhedsid = req.params.begivenhedsid;
    let id = req.params.frivilligid;
    let frivillig = (await controller.getBrugere({_id:id}))[0];
    let antal = await controller.getDenneMaanedsVagter(begivenhedsid, frivillig.brugernavn);
    res.send({antalvagter: antal});
});

app.post('/tilfoejVagtTilBruger', async(req,res) =>{
    const {vagt, bruger} = req.body;
   await controller.addVagtToBruger(bruger, vagt);
    res.send({ok:true});
});
app.post('/tilfoejVagtTilBegivenhed', async(req,res) =>{
    const {vagt, begivenhed} = req.body;
   await controller.addVagtToBegivenhed(begivenhed, vagt);
    res.send({ok:true});
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
    let email = await controller.getEmailFraVagtId(vagtid);
   await controller.overtagVagt(brugerloggedind, vagtid)
       .then(res.send({ok: true})).then(controller.sendmail(email));

});

app.post('/fjernfrivilligfravagt', async (req, res) => {
   let vagtid = req.body.vagtid;
   await controller.fjernFrivilligFraVagt(vagtid);
    res.send({ok:true});
});

app.put('/setFravaer', async (req, res) =>{
    let vagtId = req.body.vagtId;
    await controller.setFravær(vagtId);
    res.send({ok:true});

});

//login
app.post('/login', async (request, response) => {
    const {brugernavn, password} = request.body;
    const check = (await controller.getBrugere({brugernavn:brugernavn}))[0];

    if (check == null)
        response.send({ok: false});
    else {
        if (bcrypt.compareSync(password, check.password) && brugernavn) {
            request.session.brugernavn = brugernavn;
            request.session.brugertype = check.brugertype;
            response.send({ok: true, type: 'admin'});
        } else {
            response.send({ok: false});
        }
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

app.delete('/clearDatabase/' , async (req, res) =>{
    await controller.clearDatabase();
    res.send({ok:true});
});

app.delete('/sletbegivenhed/:begivenhedsid', async (req, res) => {
    let id = req.params.begivenhedsid;
   await controller.sletBegivenhed(id);
});

app.get('/vagtertilsalg', async (req, res) => {
   let vagter = await controller.getVagterTilSalg();
   res.send(vagter);
});




console.log('Listening on port ' + port + ' ...');


