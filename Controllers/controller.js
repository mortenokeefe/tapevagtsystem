const nodemailer = require('nodemailer');

function mailOptions(request) {
    let mail = {
        from: 'tapetestmail@gmail.com',
        to: request,
        subject: 'Test',
        text: 'Din vagt er blevet solgt'
    }
    return mail;
};

const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'tapetestmail@gmail.com',
            pass: 'qawerty22'
        }
    }
);

function sendmail(mail) {
    transporter.sendMail(mailOptions(mail), function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
};


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

mongoose.Promise = Promise;


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

    //beværk at kl 19 er den 20. time i døgnet, derfor hours = 20
    let tid = dato.setHours('20', '00');
    for (let i = 0; i < antalFrivillige; i++) {
        begivenhed.vagter.push(await exports.newVagt(tid, undefined, undefined, 0, 0, undefined, begivenhed));
    }
    begivenhed.vagter.push(await exports.newVagt(tid, undefined, undefined, 0, 1, undefined, begivenhed));
    return begivenhed.save();
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

exports.getFraværForBruger = function getFraværForBruger(brugernavn){

    vagter = exports.getVagterFraBruger(brugernavn);
    let counter =0;
    for(let vagt of vagter)
    {
        if(vagt.fravær)
        {
            counter++;
        }
    }
    if(counter >0)
    return 100/(vagter.length/counter);
    else
        return 0;
}

exports.getBegivnheder = async function getBegivenheder() {
    //henter begivenheder for næste måned
    // let datenow = new Date(Date.now());
    // let month1 = datenow.getMonth();
    // let year1 = datenow.getFullYear();
    // let startofnextmonth = new Date(year1, month1+1, 1,1,0,0);
    // let endofnextmonth = new Date(year1, month1+2, 0,1,0 );
    //
    // return Begivenhed.find(({"dato": {"$gte": startofnextmonth, "$lt": endofnextmonth}})).exec();

    //finder alle brugere
    return Begivenhed.find().exec();
}

exports.getBrugere = async function getBrugere() {
    return Bruger.find().exec();
}

exports.addVagtToBruger = async function addVagtToBruger(brugernavn, id) {
    vagt = await exports.getVagtFraId(id.id);
    bruger = await exports.getBruger(brugernavn);
    vagt.bruger = bruger;
    vagt.status = 1;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

exports.tilmeldBegivenhed = async function tilmeldBegivenhed(brugernavn, begivenhedsid) {
    begivenhed = await exports.getBegivenhed(begivenhedsid);
     vagter = await exports.getVagterFraBegivenhed(begivenhedsid);
     let found = false;
     let index = 0;
     while (!found) {
         if (vagter[index].status == 0) {
             console.log(vagter[index]);
             console.log(brugernavn);
              await exports.addVagtToBruger(brugernavn, vagter[index]);
             found = true;
         }
         index++;
     }
}

exports.getBruger = async function getBruger(brugernavn) {
    return Bruger.findOne({"brugernavn" : brugernavn}, function (err, bruger) {}).exec();
}
exports.getBrugere = async function getBrugere() {
    return Bruger.find().exec();
}


exports.getVagterFraBruger = async function getVagterFraBruger(brugernavn) {
    let bruger = await exports.getBruger(brugernavn);
    let vagtermedid = Vagt.find({"bruger" : bruger}).exec();
    return vagtermedid;
}
exports.getBegivenhed = async function getBegivenhed(id)
{
    return Begivenhed.findOne({_id : id}, function(err, begivenhed){}).exec();
}

exports.getBrugerFraId = async function getBrugerMedId(id) {
    return Bruger.findOne({_id: id}).exec();
}
exports.getVagtFraId = async function getVagtFraId(id) {
    return Vagt.findOne({_id: id}).exec();
}

exports.getVagterTilSalg = async function getVagterTilSalg() {
    //henter vagtejer, begivenhed og dato
    //alle vagter med status 2 = tile salg
    let vagter = await Vagt.find({"status" : 2}).exec();
    let vagtermedinfo = [];

    for (let vagt of vagter) {
        //console.log(vagt);
        let begivenhed = await exports.getBegivenhed(vagt.begivenhed);
        // console.log(begivenhed);
        let dato = new Date(vagt.startTid).toLocaleDateString();
        // console.log(dato);
        let frivillig = await exports.getBrugerFraId(vagt.bruger);
        // console.log(frivillig);
        let o = {vagt: vagt, begivenhed: begivenhed.navn, bruger: frivillig.fornavn + ' ' + frivillig.efternavn, dato: dato};
        vagtermedinfo.push(o);
    }
    // console.log(vagtermedinfo);
    return vagtermedinfo;
}

exports.overtagVagt = async function overtagVagt(bruger, vagtid) {
    let b = await exports.getBruger(bruger);
    let vagt = await exports.getVagtFraId(vagtid);
    vagt.bruger = b;
    vagt.status = 1;
    vagt.save();
}

exports.setVagtStatus = async function setVagtStatus(id, newStatus)
{
    const filter = {_id : id};
    const update = {status : newStatus};
    return  await Vagt.findOneAndUpdate(filter, update);

}

exports.getVagterFraBegivenhed = async function getVagterFraBegivenhed(begivenhedsid) {
    let vagter = await Vagt.find({"begivenhed" : begivenhedsid}).exec();
    return vagter;
}

exports.seBegivenhed = async function seBegivenhed(id) {
    let begivenhed = await exports.getBegivenhed(id);
    let vagter = await exports.getVagterFraBegivenhed(begivenhed);
    let afvikler;
    let frivillige = [];
    for (let vagt of vagter) {
        if(vagt.vagtType == 1) {
            let o = await Bruger.find({"_id" : vagt.begivenhed}).exec();
            afvikler = o.fornavn + ' ' + o.efternavn;
        }
        else {
            frivillige.push(vagt);
        }
    }
    let o = [begivenhed, frivillige, afvikler];
    console.log('controller');
    console.log(o);
    return o;
}

exports.deleteBruger = function deleteBruger(brugernavn) {
    return Bruger.deleteOne({brugernavn: brugernavn});
};

exports.getCalendarEvents = function getCalendarEvents(options){
    return Begivenhed.find(options)
}

exports.getCalendarVagt = function getCalendarVagt(options){
    return Vagt.find(options)
}



async function main() {
    let tid = new Date('2019-12-17T03:24:00');
    let tomvagt = undefined;
    let b1 = await exports.newBegivenhed('Darkest Entries', tid, 'Kedeligt show', 5, undefined);
    //let b1 = await exports.newBegivenhed('Darkest Entries', tid, 'Kedeligt show', 5, undefined);
    let bruger = await exports.newBruger("Jens", 'Brouw', '88888888', 'jaja', 'jaja', 1, 1, 'jens@jens.com', undefined);
    // let v1 = await exports.newVagt(tid, false, undefined, 1, 1, undefined, undefined);
    // let v2 = await exports.newVagt(tid, false, undefined, 2, 1, undefined, undefined);

    let bruger2 = await exports.newBruger('Thomas', 'Mee', '88888888', 'tmtheboss', 'jaja', 2, 1, 'tm@tapeaarhus.dk', undefined);
    // console.log('Vagt: ' + v1);
    //
    // console.log('Begivenhed: ' + b1);

    // await exports.addVagtToBruger(bruger, v1);
    // await exports.addVagtToBruger(bruger2, v2);
    // await exports.addVagtToBegivenhed(b1, v1);
    // await exports.addVagtToBegivenhed(b1, v2);
    // await exports.addVagtToBruger(bruger, v2);
}
    // main();

    main();
async function main2() {

}
