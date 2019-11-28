const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const bruger = new Schema({
    fornavn: String,
    efternavn: String,
    telefonnummer: String,
    brugernavn: {
        type: String,
        required: true,
        unique: true,
    },
    password: String,
    brugertype: Number,
    tilstand: Number,
    email: String,
    vagter: [{type: ObjectId, ref: 'Vagt'}]
});

bruger.methods.toString = function() {
    return this.password;
};

module.exports = mongoose.model('Bruger', bruger);