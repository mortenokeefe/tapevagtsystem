
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

/*transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error)
    } else {
        console.log('Email sent: '+ info.response);
    }
})*/



const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

mongoose.Promise = Promise;
//mongoose.connect('mongodb+srv://TapeProjekt:tape123@tape-yxunw.gcp.mongodb.net/Tape?retryWrites=true&w=majority', {useNewUrlParser: true});

const Begivenhed = require('../models/Begivenhed');
const Vagt = require('../models/Vagt');
const Bruger = require('../models/Bruger');


exports.newVagt = function newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed) {
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

exports.newBegivenhed = async function newBegivenhed(navn, dato, beskrivelse, antalFrivillige, vagter) {
    const begivenhed = new Begivenhed({
        navn,
        dato,
        beskrivelse,
        antalFrivillige,
        vagter
    });
    begivenhed.save();
    //beværk at kl 19 er den 20. time i døgnet, derfor hours = 20
    let tid = dato.setHours('20', '00');
    for (let i = 0; i < antalFrivillige; i++) {
        begivenhed.vagter.push(await exports.newVagt(tid, undefined, undefined, 1, 1, undefined, begivenhed));
    }
    return begivenhed;
}

exports.newBruger = function newBruger(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand, email, vagter) {
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

exports.addVagtToBegivenhed = function addVagtToBegivenhed(begivenhed, vagt) {
    vagt.begivenhed = begivenhed;
    begivenhed.vagter.push(vagt);
    return Promise.all([vagt.save(), begivenhed.save()]);
}

exports.getBegivnheder = async function getBegivenheder() {
    let datenow = new Date(Date.now());
    let month1 = datenow.getMonth();
    let year1 = datenow.getFullYear();
    let startofnextmonth = new Date(year1, month1+1, 1,1,0,0);
    let endofnextmonth = new Date(year1, month1+2, 0,1,0 );

    return Begivenhed.find(({"dato": {"$gte": startofnextmonth, "$lt": endofnextmonth}})).exec();
}

exports.addVagtToBruger = function addVagtToBruger(bruger, vagt) {
    vagt.bruger = bruger;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

async function main() {
    let tid = new Date('2019-12-17T03:24:00');
    let tomvagt = undefined;
    let bruger = await exports.newBruger("Jens", 'Brouw', '88888888', 'jenni89', '1234', 1, 1, 'jens@jens.com', undefined);
    let v1 = await exports.newVagt(tid, false, undefined, 1, 1, bruger, undefined);
    console.log('Vagt: ' + v1);
    let b1 = await exports.newBegivenhed('Darkest Entries', tid, 'Kedeligt show', 5, undefined);
    console.log('Begivenhed: ' + b1);
    await exports.addVagtToBruger(bruger, v1);
    await exports.addVagtToBegivenhed(b1, v1);
}
 // main();
async function main2() {
    console.log(await exports.getBegivnheder());
}
 // main2();