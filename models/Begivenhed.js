// class Begivenhed{
//     constructor(navn, dato, beskrivelse, antalFrivillige) {
//         if(navn && typeof navn=="string"){
//             this.navn = navn;
//         }
//         else{
//             if(!navn){
//                 throw "navn ikke angivet"
//             }
//             if(typeof navn != "string"){
//                 throw "navn ikke en string"
//             }
//         }
//         if(dato instanceof Date && dato){
//             this.dato = dato;
//         }
//         else{
//             throw "dato forkert udfyldt"
//         }
//         if(typeof  beskrivelse == "string"){
//             this.beskrivelse = beskrivelse;
//         }
//         else{
//             throw "beskrivelse ikke en string"
//         }
//         if(typeof antalFrivillige == "number" && antalFrivillige){
//             this.antalFrivillige = antalFrivillige
//         }
//         else{
//             throw "antalFrivillige ikke et tal eller ikke eksisterende"
//         }
//         this.vagtArr = []
//     }
// }

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const begivenhed = new Schema({
    navn: {
        type: String,
        required: true,
        unique: true,
    },
    dato: Date,
    beskrivelse: String,
    antalFrivillige: Number,
    vagter: [{type: ObjectId, ref: 'Vagt'}]
});

begivenhed.methods.toString = function() {
    return '';
};

module.exports = mongoose.model('Begivenheds', begivenhed);