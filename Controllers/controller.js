const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tapetestmail@gmail.com',
            pass: 'qawerty22'
        }
    }
);

let mailOptions = {
    from: 'tapetestmail@gmail.com',
    to: 'tomail her',
    subject: 'Vagtsalg',
    text: 'Din vagt er blevet solgt'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error)
    } else {
        console.log('Email sent: '+ info.response);
    }
})



const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

mongoose.Promise = Promise;


const Begivenhed = require('../models/Begivenhed');
const Vagt = require('../models/Vagt');
const Bruger = require('../models/Bruger');


function newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed) {
    const vagt = new Vagt({
        startTid,
        fravær,
        fraværsBeskrivelse,
        status,
        vagtType,
        bruger,
        begivenhed
    });
    return vagt.save();
};

function newBegivenhed(navn, dato, beskrivelse, antalFrivillige, vagter) {
    const begivenhed = new Begivenhed({
        navn,
        dato,
        beskrivelse,
        antalFrivillige,
        vagter
    });
    return begivenhed.save();
}
function newBruger(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email, vagter) {
    const bruger = new Bruger({
        fornavn,
        efternavn,
        telefonnummer,
        brugernavn,
        password,
        brugertype,
        tilstand,
        email,
        vagter
    });
    return bruger.save();
}

function getVagter(options){
    return Vagt.find(options)
}

function getBegivenheder(options){
    return Begivenhed.find(options)
}

function addVagtToBegivenhed(begivenhed, vagt) {
    vagt.begivenhed = begivenhed;
    begivenhed.vagter.push(vagt);
    return Promise.all([vagt.save(), begivenhed.save()]);
}

function addVagtToBruger(bruger, vagt) {
    vagt.bruger = bruger;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

async function main() {
    let tid = new Date('1995-12-17T03:24:00');
    let tomvagt = undefined;
    let bruger = await newBruger("Jens", 'Brouw', '88888888', 'jenni89', '1234', 1, 1, 'jens@jens.com', undefined);
    let v1 = await newVagt(tid, false, undefined, 1, 1, bruger, undefined);
    console.log('Vagt: ' + v1);
    let b1 = await newBegivenhed('Darkest Entries', tid, 'Kedeligt show', 5, undefined);
    console.log('Begivenhed: ' + b1);
    await addVagtToBruger(bruger, v1);
    await addVagtToBegivenhed(b1, v1);
}
//main();
module.exports = {getBegivenheder:getBegivenheder, getVagter: getVagter}
