const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

function mailOptions(request) {
    let mail = {
        from: 'tapetestmail@gmail.com',
        to: request,
        subject: 'Solgt valgt',
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

exports.sendmail = function sendmail (mail) {
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


exports.newVagt = function newVagt(startTid, fravær, fraværsBeskrivelse, status, vagtType, bruger, begivenhed, slutTid) {
    const vagt = new Vagt({
        startTid,
        fravær,
        fraværsBeskrivelse,
        status,
        vagtType,
        bruger,
        begivenhed,
        slutTid
    });
    return vagt.save();
};

exports.newBegivenhed = async function newBegivenhed(navn, dato, beskrivelse, antalFrivillige, vagter, afvikler,starttidspunkt, sluttidspunkt) {

   // console.log(dato + "controller");
    console.log(dato, "dato", starttidspunkt, "starttid", sluttidspunkt, "sluttidspunkt");
    let realDate = new Date(dato); // wtf hvorfor skal man convertere det til en date 2 gange? det virker ikke ellers
    let realDateStart = new Date(starttidspunkt);
    let realDateSlut = new Date(sluttidspunkt);
    //beværk at kl 19 er den 20. time i døgnet, derfor hours = 20
    let starttidhours= realDateStart.getHours()-1;
    let starttidminutes = realDateStart.getMinutes();
    let sluttidhours = realDateSlut.getHours()-1;
    let sluttidminutes = realDateSlut.getMinutes();
    let tid = realDate.setHours(starttidhours, starttidminutes);
    console.log(tid, "tid", realDate,"realdate", dato, "date");
    let tidSlut = new Date(realDate);
    if(sluttidhours < starttidhours) //hvis event slutter efter kl 24:00
    {

        tidSlut.setHours(sluttidhours, sluttidminutes);
        tidSlut.setDate(realDate.getDate()+1);
    }
    else {
            tidSlut.setHours(sluttidhours, sluttidminutes);
    }
    console.log(tidSlut, "tidslut");
    dato= realDate;
    const begivenhed = new Begivenhed({
        navn,
        dato,
        beskrivelse,
        antalFrivillige,
        vagter,
        tidSlut
    });

    for (let i = 0; i < antalFrivillige; i++) {
        begivenhed.vagter.push(await exports.newVagt(tid, false, undefined, 0, 0, undefined, begivenhed, tidSlut));
    }
    if(afvikler){
     begivenhed.vagter.push(await exports.newVagt(tid, false, undefined, 0, 1, afvikler, begivenhed,tidSlut));
     }
    else {
        begivenhed.vagter.push(await exports.newVagt(tid, false, undefined, 0, 1, undefined, begivenhed,tidSlut));
    }
    begivenhed.save();

    let afviklerVagt = begivenhed.vagter[begivenhed.vagter.length-1];

 //   console.log(afviklerVagt, "controller metode add afvikler");
    if(afvikler) {
        await exports.addVagtToBruger(afvikler.brugernavn, afviklerVagt);
    }
    return begivenhed;
}

exports.clearDatabase = async function clearDatabase() {
    console.log ("enter clearDatabase");
    let date = Date.now();
    let begivenheder = await exports.getBegivenheder();
    for (let b of begivenheder) {
        if (date > b.dato) {
            console.log(b._id, "begivenhed ID");
            let vagter = await exports.getVagterFraBegivenhed(b._id);
            console.log(vagter.length, "vager længde");
            for (let v of vagter) {
                console.log(b._id,"begivenhed", v._id,"vagt");
                await exports.fjernFrivilligFraVagt(v._id)
            }
            for (let v of vagter) {
                await exports.sletVagt(v._id);
            }
            await Begivenhed.deleteOne(b);
        }
    }
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

exports.updateBruger = async function newBruger(fornavn, efternavn, telefonnummer,  password, brugertype, tilstand, email, filterbrugernavn) {
    const filter = filterbrugernavn;
    const bruger = await exports.getBruger(filter);
    bruger.fornavn = fornavn;
    bruger.efternavn = efternavn;
    bruger.telefonnummer = telefonnummer;
    if(password){
        bruger.password = password;
    }
    bruger.brugertype = brugertype;
    bruger.tilstand = tilstand;
    bruger.email = email;
    await bruger.save();
}

exports.addVagtToBegivenhed = function addVagtToBegivenhed(begivenhed, vagt) {
    vagt.begivenhed = begivenhed;
    begivenhed.vagter.push(vagt);
    return Promise.all([vagt.save(), begivenhed.save()]);
}

exports.getFraværForBruger = async function getFraværForBruger(brugernavn) {

    let vagter = await exports.getVagterFraBruger(brugernavn);
    let counter = 0;
    for (let vagt of vagter) {
        if (vagt.fravær) {
            counter++;
        }
    }
    if (counter > 0)
        return 100 / (vagter.length / counter);
    else
        return 0;
}

exports.getBegivenheder = async function getBegivenheder() {
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

exports.adminAddVagtToBruger = async function adminAddVagtToBruger(brugerid, vagtid) {
    vagt = await exports.getVagtFraId(vagtid);
    bruger = await exports.getBrugerFraId(brugerid);
    vagt.bruger = bruger;
    vagt.status = 1;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

exports.getVagtFraId = async function getVagtFraId(id) {
    return Vagt.findOne({_id: id}).exec();
}


exports.getDenneMaanedsVagter = async function getDenneMaanedsVagter(begivenhedsid, brugernavn) {
    // console.log('kører getDenneMaanedsVagter i controller');
    let count = 0;
    let begivenhed = await exports.getBegivenhed(begivenhedsid);
    let d = begivenhed.dato;
    let begivenhedmaaned = new Date(d);
    let vagter = await exports.getVagterFraBruger(brugernavn);

    for (let vagt of vagter) {
        let vagtdato = vagt.startTid;
        let vagtmåned = vagtdato.getMonth();
        if (vagt.startTid.getMonth() === begivenhedmaaned.getMonth()) {
            count++;
        }
    }
    return count;
}

exports.addVagtToBruger = async function addVagtToBruger(brugernavn, id) {
    const vagt = await exports.getVagtFraId(id._id);
    const bruger = await exports.getBruger(brugernavn);
    //console.log(vagt, "vagt")
   // console.log(bruger, "bruger")
    vagt.bruger = bruger;
    vagt.status = 1;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

exports.fjernFrivilligFraVagt = async function fjernFrivilligFraVagt(vagtid) {
    let vagt = await exports.getVagtFraId(vagtid);
    if(vagt) {
        if (vagt.status === 1) {
            let bruger = await exports.getBrugerFraId(vagt.bruger);
            vagt.bruger = undefined;
            vagt.status = 0;
            await bruger.update({$pull: {vagter: vagtid}});
            bruger.save();
            vagt.save();
        }
    }
    }


exports.tilmeldBegivenhed = async function tilmeldBegivenhed(brugernavn, begivenhedsid) {
    begivenhed = await exports.getBegivenhed(begivenhedsid);
     vagter = await exports.getVagterFraBegivenhed(begivenhedsid);
     let found = false;
     let index = 0;
     while (!found) {
         if (vagter[index].status == 0) {
          //   console.log(vagter[index]);
            // console.log(brugernavn);
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

exports.getFrivillige = async function getFrivillige() {
    let brugere = await Bruger.find().exec();
    let frivillige = [];
    for (let bruger of brugere) {
        if (bruger.brugertype == 2) {
            frivillige.push(bruger);
        }
    }
    return frivillige;
}


exports.getVagterFraBruger = async function getVagterFraBruger(brugernavn) {
    let bruger = await exports.getBruger(brugernavn);
    let vagtermedid = await Vagt.find({"bruger" : bruger}).exec();
    return vagtermedid;
}
exports.getBegivenhed = async function getBegivenhed(id)
{
    return Begivenhed.findOne({_id : id}, function(err, begivenhed){}).exec();
}

exports.getBrugerFraId = async function getBrugerMedId(id) {
    return Bruger.findOne({_id: id}).exec();
}

exports.getEmailFraVagtId = async function getEmailFraVagtId(id)
{
    let vagt = await exports.getVagtFraId(id);
    let bruger = await exports.getBrugerFraId(vagt.bruger);
    return bruger.email;
}

exports.setFravær = async function setFravær(vagtId){
    const filter = {_id : vagtId};
    let vagt = await exports.getVagtFraId(vagtId);
    const update = {fravær : !vagt.fravær};
    console.log(vagt.fravær, "vagt fravær");
    return  await Vagt.findOneAndUpdate(filter, update);
}



exports.getVagterTilSalg = async function getVagterTilSalg() {
    //henter vagtejer, begivenhed og dato
    //alle vagter med status 2 = til salg
    let vagter = await Vagt.find({"status" : 2}).exec();
    let vagtermedinfo = [];

    for (let vagt of vagter) {

       // console.log(vagt, "vagt");
        let begivenhed = await exports.getBegivenhed(vagt.begivenhed);
        // console.log(begivenhed, "begivenhed");
        let dato = new Date(vagt.startTid);
        // console.log(dato);
        let frivillig = await exports.getBrugerFraId(vagt.bruger);
        // console.log(frivillig, "frivillig");
        let o = {vagt: vagt, begivenhed: begivenhed.navn, bruger: frivillig.fornavn + ' ' + frivillig.efternavn, dato: dato, tidSlut : vagt.slutTid};
        //console.log(o, "o");
        if(vagt.startTid >= new Date(Date.now()))
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



exports.redigerBegivenhed = async function redigerBegivenhed(begivenhedsid, navn, dato, beskrivelse, logbog, antalfrivillige, starttidspunkt, sluttidspunkt) {
    let begivenhed = await exports.getBegivenhed(begivenhedsid);
    //let vagter = await exports.getVagterFraBegivenhed(begivenhedsid);
    const filter = {_id: begivenhedsid};
    let realDate = new Date(dato);
    console.log(dato, "dato", realDate, "realDate");

    let realDateStart = new Date(starttidspunkt);
    let realDateSlut = new Date(sluttidspunkt);
    //beværk at kl 19 er den 20. time i døgnet, derfor hours = 20
    let starttidhours= realDateStart.getHours()-1;
    let starttidminutes = realDateStart.getMinutes();
    let sluttidhours = realDateSlut.getHours()-1;
    let sluttidminutes = realDateSlut.getMinutes();
    let tidSlut = new Date(realDate);
    if(sluttidhours < starttidhours) //hvis event slutter efter kl 24:00
    {

        tidSlut.setHours(sluttidhours, sluttidminutes);
        tidSlut.setDate(realDate.getDate()+1);
    }
    else {
        tidSlut.setHours(sluttidhours, sluttidminutes);
    }
    let tid = realDate.setHours(starttidhours, starttidminutes);

    //hvis antalfrivillige er blevet forøget
    if (begivenhed.antalFrivillige < antalfrivillige) {
        let ektravagter = antalfrivillige - begivenhed.antalFrivillige;
        for (let index = ektravagter; index > 0; index--) {

            let v = await exports.newVagt(tid, false, undefined, 0, 0, undefined, begivenhed, tidSlut)
            await exports.addVagtToBegivenhed(begivenhed, v);
        }
        const update = {navn: navn, dato: realDate, beskrivelse: beskrivelse, antalFrivillige: antalfrivillige, logbog :logbog, tidSlut: tidSlut};
        return await Begivenhed.findOneAndUpdate(filter, update);
    }
    //hvis antalfrivillige er blevet mindre
    else if (begivenhed.antalFrivillige > antalfrivillige) {
        console.log(antalfrivillige, ' skal fjernes fra event');
        let vagterderskalfjernes = begivenhed.antalFrivillige - antalfrivillige;
        while (vagterderskalfjernes > 0) {
            await exports.fjerneNæsteLedigeVagtFraBegivenhed(begivenhedsid);
            vagterderskalfjernes--;
    }
        const update = {navn: navn, dato: realDate, beskrivelse: beskrivelse, logbog:logbog, tidSlut :tidSlut, antalfrivillige : antalfrivillige};
        return await Begivenhed.findOneAndUpdate(filter, update);
    }
    //hvis antalfrivillige er uændret
    else {
        const update = {navn: navn, dato: realDate, beskrivelse: beskrivelse, logbog:logbog, tidSlut: tidSlut, antalfrivillige :antalfrivillige};
        return await Begivenhed.findOneAndUpdate(filter, update);
    }
}

exports.getVagterFraBegivenhed = async function getVagterFraBegivenhed(begivenhedsid) {
    let vagter = await Vagt.find({"begivenhed" : begivenhedsid}).exec();
    return vagter;
}

exports.updateBegivenhed = async function updateBegivenhed(id, updatedValues){
     return Begivenhed.update({_id: id},
        {
            $set: updatedValues
        })
}

exports.seBegivenhed = async function seBegivenhed(id) {
    let begivenhed = await exports.getBegivenhed(id);
    let vagter = await exports.getVagterFraBegivenhed(begivenhed);
    let afvikler;
    let frivillige = [];
    for (let vagt of vagter) {
        if(vagt.vagtType == 1) {
           let o = await Bruger.find({"_id" : vagt.bruger}).exec();
            afvikler =o; //o.fornavn + ' ' + o.efternavn;
       //     console.log(afvikler);

        }
        else {
            frivillige.push(vagt);
        }
    }
    let o = [begivenhed, frivillige, afvikler];
  //  console.log('controller');
   // console.log(o);
    return o;
}

exports.deleteBruger = async function deleteBruger(brugernavn) {
    let vagter = await exports.getVagterFraBruger(brugernavn);
    for (let i = 0; i < vagter.length; i++) {
        await exports.fjernFrivilligFraVagt(vagter[i]._id)
    }
    return Bruger.deleteOne({brugernavn: brugernavn});
};

exports.sletVagt = async function sletVagt(vagtid) {
    return Vagt.deleteOne({_id: vagtid});
}

exports.sletBegivenhed = async function sletBegivenhed(id) {
    let vagter = await exports.getVagterFraBegivenhed(id);
    for (let vagt of vagter) {
        await exports.fjernFrivilligFraVagt(vagt._id);
    }
    for (let v of vagter) {
        await exports.sletVagt(v._id);
    }
    return Begivenhed.deleteOne({_id: id});
}

exports.getCalendarEvents = function getCalendarEvents(options){
    return Begivenhed.find(options)
}

exports.getCalendarVagt = function getCalendarVagt(options){
    return Vagt.find(options)
}
exports.getAfviklere = async function getAfviklere(){
    return await Bruger.find({brugertype : 1});

}

exports.getAfvikerVagtFraBegivenhed = async function getAfvikerVagtFraBegivenhed(begivenhedsid) {
    let afvikler;
   let vagter = await exports.getVagterFraBegivenhed(begivenhedsid);
   for (let vagt of vagter) {
       if (vagt.vagtType == 1) {
           afvikler = vagt;
       }
   }
   return afvikler;
}

exports.checkForLedigeVagter = async function checkForLedigeVagter(begivenhedsId, antal){
    let begivenhed = await exports.getBegivenhed(begivenhedsId);

    let counter =0;
    let antalVagterDerSkalVæreLedige = (begivenhed.vagter.length-1)-antal;
    for(let vagt of begivenhed.vagter)
    {
    let v = await exports.getVagtFraId(vagt);
        if (v.status ==0 && v.vagtType ==0)
        {
            counter++;
            if(counter == antalVagterDerSkalVæreLedige)
            break;
        }
    }

    if(counter >= antalVagterDerSkalVæreLedige)
    return true;
    else
        return false;
}
exports.fjerneNæsteLedigeVagtFraBegivenhed = async function fjerneNæsteLedigeVagtFraBegivenhed(begivenhedsId)
{
    console.log('fjernenæste');
    let begivenhed = await exports.getBegivenhed(begivenhedsId);
    let fjernet = false;
    for(let vagt of begivenhed.vagter)
    {
        console.log('for loop');
        let v = await exports.getVagtFraId(vagt);
        if (v.status ==0 && v.vagtType ==0)
        {
            console.log('if')
            await begivenhed.update({$pull: {vagter: v._id}});
            begivenhed.antalFrivillige--;
            await Vagt.deleteOne(v);
            begivenhed.save();
            fjernet = true;
            break;

        }
    }
    return fjernet;
}

exports.findFrivilligeDerIkkeHarEnVagtPåBegivenhed = async function findFrivilligeDerIkkeHarEnVagtPåBegivenhed(begivenhedId){
    let brugere = await exports.getBrugere();
    let list = [];
    for(let b of brugere)
    {
        if(b.brugertype ==2) {
            let harvagt = false;
            for (let v of b.vagter) {
                let vagt = await exports.getVagtFraId(v);
                if (vagt.begivenhed.toString() == begivenhedId.toString()) {
                    harvagt = true;
                    break;
                }
            }
            if (!harvagt) {
                list.push(b);
            }
        }
    }
    return list;


}



async function main() {
    let salt = await bcrypt.hash("admin", bcrypt.genSaltSync(12)).then(async function(hashedPassword) {
        let admin = await exports.newBruger('Admin2', 'Jensen', '88888888', 'admin2', hashedPassword, 0, 0, 'admin@tapeaarhus.dk', undefined);
    });
}

main()