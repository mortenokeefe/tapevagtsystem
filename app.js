

const controller = require('./Controllers/controller');
//express
const express = require('express');
const app = express();
const session = require('express-session');
const fs = require('fs').promises;
app.use(express.static('public'));
app.use(express.json());
app.use(session({secret: 'hemmelig', saveUninitialized: true, resave: true}));


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
    let brugere = await controller.getBrugere();
    res.send(brugere);
});
app.get('/vagter', async (req, res)=> {
   let vagter //= controller.getVagter();
    res.send(vagter);
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




//POST endpoints
app.post('/opretBruger' , async (req, res) =>{
    const {fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email} = req.body;
   await controller.newBruger(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email, undefined);
    res.send({ok:true}); // fix fejlsikring senere
});

app.post('/opretBegivenhed' , async (req, res) =>{
    const {navn, dato, beskrivelse, antalFrivillige} = req.body;
   await controller.newBegivenhed(navn, dato, beskrivelse, antalFrivillige, undefined);
    res.send({ok:true}); // fix fejlsikring senere
});
app.post('/opretVagt', async(req,res)=> {
    //hvor meget skal vi egentlig have fra userinterface?
    const {startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed} = req.body;
   await controller.newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed);
    res.send({ok:true}); // fix fejlsikring senere
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

update();
console.log('Listening on port ' + port + ' ...');




