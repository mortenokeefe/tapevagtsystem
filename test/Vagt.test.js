const should = require('should');
const {Vagt} = require('../models/Vagt');

describe('unitTest', () => {
    it('genererUserTabelundenusers', () => {
        let vagt = new Vagt('18:00',undefined, undefined, 'Optaget', 'Normal', 'jensb89');
        (typeof vagt).should.be.equal('object');
        vagt.bruger.should.be.equal('jensb89');
        //sidste del kan jeg ikke få til at fungere og er blevet unladt
        //let v  = {startTid: '18:00', fravær: undefined, fraværsBeskrivelse: undefined, status: 'Optaget', vagtType: 'Normal', bruger: 'jensb89'};
        //vagt.should.be.equal(v);
    });
});

//Hvilke andre tests skal der laves??