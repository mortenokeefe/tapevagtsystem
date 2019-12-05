"use strict";


//import Begivenhed from "../models/Begivenhed";
//const {Begivenhed} = require('../models/Begivenhed');
const Begivenhed = require('../models/Begivenhed');
const should = require('should');
const controller = require('../Controllers/controller');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;
var conn;
conn= mongoose.connect("mongodb+srv://victor:namchu2897@cluster0-3shzr.gcp.mongodb.net/test?authSource=test&retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let date1 = new Date('December 17, 2019 20:00:00');
let test = {navn : "FestAften", dato : date1 , beskrivelse : "abefest", antalFrivillige : 4, vagtArr: []};
//console.log( new Begivenhed('FestAften',date1, 'abefest',4));
console.log(test);

beforeEach(async function() {

    const connection = mongoose.connection;
    connection.once("open", function() {
        console.log("*** MongoDB got connected ***");
        console.log(`Our Current Database Name : ${connection.db.databaseName}`);
        mongoose.connection.db.dropDatabase(
            console.log(`${connection.db.databaseName} database dropped.`)
        );
    });
});

describe('unittest', () =>{

    it('controller opret begivenhed uden afvikler',async function ()

    { //test af controllermetode til at oprette begivenhed uden afvikler


        let b1 = await controller.newBegivenhed('FestAften',date1, 'abefest', 4,undefined, undefined);

         b1.navn.should.be.equal('FestAften')
        b1.dato.should.be.equal(date1);
         b1.beskrivelse.should.be.equal('abefest');
         b1.antalFrivillige.should.be.equal(4);
        // b1.afvikler.should.be.equal(afvikler);
        let checkForUndefined = (b1.afvikler === undefined);
        checkForUndefined.should.be.equal(true);
         b1.vagter.length.should.be.equal(5);
       // return  controller.newBegivenhed('FestAften',date1, 'abefest', 4,undefined, undefined);

    });
    it('controller opret begivenhed med afvikler', async function () {
        let afvikler = await controller.newBruger('jens','brouw','12345678','jaja','jaja',1,0,'jaja@jaja.dk',undefined);
        let b1 = await controller.newBegivenhed('FestAften2',date1, 'abefest', 4,undefined, afvikler);
        b1.navn.should.be.equal('FestAften2')
        b1.dato.should.be.equal(date1);
        b1.beskrivelse.should.be.equal('abefest');
        b1.antalFrivillige.should.be.equal(4);
        b1.vagter.length.should.be.equal(5);
         let afviklerFromDb = await controller.getBrugerFraId(afvikler);
         let id1 = afviklerFromDb._id;
         let id2 = afvikler._id;
         id1.toString().should.be.equal(id2.toString());
        let afviklerVagt = await controller.getVagtFraId(afviklerFromDb.vagter[0]);
        let begivenhedFraDb = await controller.getBegivenhed(b1);
        begivenhedFraDb.vagter[4].toString().should.be.equal(afviklerVagt._id.toString());
        b1.vagter.length.should.be.equal(5);

        //test af afvikler
        afviklerFromDb.fornavn.should.be.equal(afvikler.fornavn);
        afviklerFromDb.efternavn.should.be.equal(afvikler.efternavn);
        afviklerFromDb.telefonnummer.should.be.equal(afvikler.telefonnummer);
        afviklerFromDb.brugernavn.should.be.equal(afvikler.brugernavn);
        afviklerFromDb.password.should.be.equal(afvikler.password);
        afviklerFromDb.brugertype.should.be.equal(afvikler.brugertype);
        afviklerFromDb.tilstand.should.be.equal(afvikler.tilstand);
        afviklerFromDb.email.should.be.equal(afvikler.email);

    });

});

describe('integrationstest', () =>{
    it('controller tilmeld begivenhed ', async function (){
        let frivillig = await controller.newBruger('frivillig','test','11223344','fri','fri',2,0,'fri@fri.dk',undefined);
        let b1 = await controller.newBegivenhed('FestAften3',date1, 'abefest', 4,undefined, undefined);
        let frivilligFraDb = await controller.getBrugerFraId()
    });
});


