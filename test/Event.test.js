"use strict";


//import Begivenhed from "../models/Begivenhed";
const {Begivenhed} = require('../models/Begivenhed');
const should = require('should');

let date1 = new Date('December 17, 2019 20:00:00');
let test = {navn : "FestAften", dato : date1 , beskrivelse : "abefest", antalFrivillige : 4, vagtArr: []};
console.log( new Begivenhed('FestAften',date1, 'abefest',4));
console.log(test);



describe('unittest', () =>{
    it('opret correct begivnhed', () =>{

        let b1 =  new Begivenhed('FestAften',date1, 'abefest',4);
        b1.navn.should.be.equal('FestAften');
        b1.dato.should.be.equal(date1);
        b1.beskrivelse.should.be.equal('abefest');
        b1.antalFrivillige.should.be.equal(4);
    })
});

