/* class Bruger {
    constructor(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand) {
        this.fornavn = fornavn;
        this.efternavn = efternavn;
        this.telefonnummer = telefonnummer;
        this.brugernavn = brugernavn;
        this.password = password;
        this.brugertype = brugertype;
        this.tilstand = tilstand;

        if (typeof this.fornavn !== 'string' ||  this.fornavn.length == 0) {

        }
        if (typeof this.efternavn !== 'string' ||   this.efternavn.length == 0) {

        }
        if (typeof this.telefonnummer !== 'string' || this.telefonnummer.length != 8) {

        }
        if (typeof this.brugernavn !== 'string' || this.brugernavn.length == 0) {

        }
        if (typeof this.password !== 'string' || this.password.length == 0) {

        }
        if () {

        }
    }

    toString() {
        return this.fornavn + " " + this.efternavn;
    }
}
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const bruger = new Schema({
    fornavn: String,
    efternavn: String,
    telefonnummer: String,
    brugernavn: {
        String,
        unique: true
    },
    password: String,
    brugertype: Number,
    tilstand: Number,
    email: String,
    vagter: [{type: ObjectId, ref: 'Vagt'}]
});

bruger.methods.toString = function() {
    return '';
};

module.exports = mongoose.model('Bruger', bruger);

