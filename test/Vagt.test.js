const should = require('should');
const {Vagt} = require('../models/Vagt');

describe('unitTest', () => {
    it('genererUserTabelundenusers', () => {
        let vagt = new Vagt('18:00',undefined, undefined, 'Optaget', 'Normal', 'jensb89');
        (typeof vagt).should.be.equal('object');
        vagt.bruger.should.be.equal('jensb89');
    });
});

//Hvilke andre tests skal der laves??