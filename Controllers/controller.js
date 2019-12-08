const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

function mailOptions(request) {
    return  {
        from: 'tapetestmail@gmail.com',
        to: request,
        subject: 'Solgt valgt',
        text: 'Din vagt er blevet solgt'
    };
}

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

mongoose.Promise = Promise;


const Begivenhed = require('../models/Begivenhed');
const Vagt = require('../models/Vagt');
const Bruger = require('../models/Bruger');


exports.newVagt = function newVagt(startTid, fravaer, fravaersBeskrivelse, status, vagtType, bruger, begivenhed, slutTid) {
    const vagt = new Vagt({
        startTid,
        fravaer,
        fravaersBeskrivelse,
        status,
        vagtType,
        bruger,
        begivenhed,
        slutTid
    });
    return vagt.save();
};

exports.newBegivenhed = async function newBegivenhed(navn, dato, beskrivelse, antalFrivillige, vagter, afvikler,starttidspunkt, sluttidspunkt) {
    let realDate = new Date(dato); // wtf hvorfor skal man convertere det til en date 2 gange? det virker ikke ellers
    let realDateStart = new Date(starttidspunkt);
    let realDateSlut = new Date(sluttidspunkt);
    //bemærk at kl 19 er den 20. time i døgnet, derfor hours = 20
    let starttidhours= realDateStart.getHours()-1;
    let starttidminutes = realDateStart.getMinutes();
    let sluttidhours = realDateSlut.getHours()-1;
    let sluttidminutes = realDateSlut.getMinutes();
    let tid = realDate.setHours(starttidhours, starttidminutes);
    let tidSlut = new Date(realDate);
    if(sluttidhours < starttidhours) //hvis event slutter efter kl 24:00
    {
        tidSlut.setHours(sluttidhours, sluttidminutes);
        tidSlut.setDate(realDate.getDate()+1);
    }
    else {
            tidSlut.setHours(sluttidhours, sluttidminutes);
    }
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

    if(afvikler) {
        await exports.addVagtToBruger(afvikler.brugernavn, afviklerVagt);
    }
    return begivenhed;
}

exports.clearDatabase = async function clearDatabase() {
    let date = new Date();
    date.setDate(date.getDate()-1)
    await Begivenhed.deleteMany({dato:{$lt: date}})
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

exports.updateBruger = async function updateBruger(fornavn, efternavn, telefonnummer,  password, brugertype, tilstand, email, filterbrugernavn) {
    const bruger = (await exports.getBrugere({brugernavn:filterbrugernavn}))[0];
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

    let vagter = await exports.getVagter({bruger:(await exports.getBrugere({brugernavn:brugernavn}))[0]._id});
    let counter = 0;
    for (let vagt of vagter) {
        if (vagt.fravær) {
            counter++;
        }
    }
    return counter > 0? 100/ (vagter.length/counter) : 0
}

exports.getBegivenheder = async function getBegivenheder(filter) {
    return Begivenhed.find(filter).exec();
}

exports.getBrugere = async function getBrugere(filter) {
    return Bruger.find(filter).exec();
}

exports.adminAddVagtToBruger = async function adminAddVagtToBruger(brugerid, vagtid) {
    vagt = (await exports.getVagter({_id:vagtid}))[0];
    bruger = (await exports.getBrugere({_id:brugerid}))[0];
    vagt.bruger = bruger;
    vagt.status = 1;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

exports.getVagter = async function getVagter(filter) {
    return Vagt.find(filter).exec();
}


exports.getDenneMaanedsVagter = async function getDenneMaanedsVagter(begivenhedsid, brugernavn) {
    let begivenhed = (await exports.getBegivenheder({_id:begivenhedsid}))[0];
    let begivenhedsDato = new Date(begivenhed.dato);
    let fromDate = new Date(begivenhedsDato.getFullYear(), begivenhedsDato.getMonth(), 1)
    let toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0);
    let vagter = await exports.getVagter({bruger: (await exports.getBrugere({brugernavn: brugernavn}))[0], startTid:{$gte: fromDate, $lte:toDate}});
    return vagter.length;
}

exports.addVagtToBruger = async function addVagtToBruger(brugernavn, id) {
    const vagt = (await exports.getVagter({_id:id._id}))[0];
    const bruger = (await exports.getBrugere({brugernavn:brugernavn}))[0];
    vagt.bruger = bruger;
    vagt.status = 1;
    bruger.vagter.push(vagt);
    return Promise.all([vagt.save(), bruger.save()]);
}

exports.fjernFrivilligFraVagt = async function fjernFrivilligFraVagt(vagtid) {
    let vagt = (await exports.getVagter({_id:vagtid}))[0];
    if(vagt) {
        if (vagt.status === 1) {
            let bruger = (await exports.getBrugere({_id:vagt.bruger}))[0];
            vagt.bruger = undefined;
            vagt.status = 0;
            await bruger.update({$pull: {vagter: vagtid}});
            bruger.save();
            vagt.save();
        }
    }
    }


exports.tilmeldBegivenhed = async function tilmeldBegivenhed(brugernavn, begivenhedsid) {
    begivenhed = (await exports.getBegivenheder({_id:begivenhedsid}))[0];
     vagter = await exports.getVagter({begivenhed:begivenhedsid});
     let found = false;
     let index = 0;
     while (!found) {
         if (vagter[index].status == 0) {
              await exports.addVagtToBruger(brugernavn, vagter[index]);
             found = true;
         }
         index++;
     }
}

exports.getBrugere = async function getBrugere(filter) {
    return Bruger.find(filter).exec();
}


exports.getBegivenhed = async function getBegivenhed(id)
{
    return Begivenhed.findOne({_id : id}, function(err, begivenhed){}).exec();
}

exports.getEmailFraVagtId = async function getEmailFraVagtId(id)
{
    let vagt = await exports.getVagtFraId(id);
    let bruger = (await exports.getBrugere({_id:vagt.bruger}))[0];
    return bruger.email;
}

exports.setFravær = async function setFravær(vagtId){
    const filter = {_id : vagtId};
    let vagt = await exports.getVagtFraId(vagtId);
    const update = {fravær : !vagt.fravær};
    return  await Vagt.findOneAndUpdate(filter, update);
}



exports.getVagterTilSalg = async function getVagterTilSalg() {
    //henter vagtejer, begivenhed og dato
    //alle vagter med status 2 = til salg
    let vagter = await Vagt.find({"status" : 2}).exec();
    let vagtermedinfo = [];

    for (let vagt of vagter) {

        let begivenhed = (await exports.getBegivenheder({_id:vagt.begivenhed}))[0];

        let dato = new Date(vagt.startTid);

        let frivillig = (await exports.getBrugere({_id:vagt.bruger}))[0];

        let o = {vagt: vagt, begivenhed: begivenhed.navn, bruger: frivillig.fornavn + ' ' + frivillig.efternavn, dato: dato, tidSlut : vagt.slutTid};

        if(vagt.startTid >= new Date(Date.now()))
        vagtermedinfo.push(o);
    }
    return vagtermedinfo;
}

exports.overtagVagt = async function overtagVagt(bruger, vagtid) {
    let b = (await exports.getBrugere({brugernavn:bruger}))[0];
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
    const filter = {_id: begivenhedsid};
    let realDate = new Date(dato);

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
        // let vagter = await exports.getVagterFraBegivenhed(begivenhed); // fix snart
        // for(let v of vagter)
        // {
        //     v.update({startTid:tid,slutTid:tidSlut});
        //
        // }
        // Vagt.save();
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
                let vagt = (await exports.getVagter({_id:v}))[0];
                console.log(vagt)
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

//main()