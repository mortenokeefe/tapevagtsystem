const should = require('should');
const {Vagt} = require('../models/Vagt');
const controller = require('../Controllers/controller');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
mongoose.connect("mongodb+srv://TapeProjekt:tape123@tape-yxunw.gcp.mongodb.net/Tape?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

describe('asyncTest', () => {
    it('test', async () => {
        // let usersUrl = 'https://jsonplaceholder.typicode.com/users';
        // let users = await GET(usersUrl);
        // users.length.should.be.equal(10);
        // users[0].name.should.be.equal('Leanne Graham');
        let frivillige = await controller.getBrugere();
        frivillige.length.should.be.above(0);
    }).timeout(10000);
});

//Hvilke andre tests skal der laves??