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

    conn.connection.db.dropDatabase(); // virker ikke .
});

describe('unittest', () =>{

    it('controller opret begivenhed',async function ()

    { //test af controllermetode til at oprette begivenhed uden afvikler

        let afvikler = await controller.newBruger('jens','brouw','12345678','jaja','jaja',1,0,'jaja@jaja.dk',undefined);
        let b1 = await controller.newBegivenhed('FestAften',date1, 'abefest', 4,undefined, afvikler);

         b1.navn.should.be.equal('FestAften')
        b1.dato.should.be.equal(date1);
         b1.beskrivelse.should.be.equal('abefest');
         b1.antalFrivillige.should.be.equal(4);
        // b1.afvikler.should.be.equal(afvikler);
         b1.vagter.length.should.be.equal(5);
       // return  controller.newBegivenhed('FestAften',date1, 'abefest', 4,undefined, undefined);

    });
});



