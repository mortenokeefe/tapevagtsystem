
// class Vagt {
//     constructor (startTid, fravær, fraværsBeskrivelse, stat, vagtType, bruger) {
//         this.startTid = startTid;
//         this.fravær = fravær;
//         this.fraværsBeskrivelse = fraværsBeskrivelse;
//         this.status = stat;
//         this.vagtType = vagtType;
//         this.bruger = bruger;
//     }
//     toString() {
//         return 'Vagt';
//     }
// }
//
// exports.Vagt = Vagt;


const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const vagt = new Schema({
    startTid: Date,
    fravær: Boolean,
    fraværsBeskrivelse: String,
    status: Number, // ledig 0 optaget 1 til salg 2
    vagtType: Number, // 0 frivilligvagt , 1 afviklervagt
    bruger: {type: ObjectId, ref: 'Bruger'},
    begivenhed: {type: ObjectId, ref: 'Begivenhed'},
    slutTid : Date
});

vagt.methods.toString = function() {
    return '';
};

module.exports = mongoose.model('Vagt', vagt);