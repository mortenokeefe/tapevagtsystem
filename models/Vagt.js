
class Vagt {
    constructor (startTid, fravær, fraværsBeskrivelse, stat, vagtType, bruger) {
        this.startTid = startTid;
        this.fravær = fravær;
        this.fraværsBeskrivelse = fraværsBeskrivelse;
        this.status = stat;
        this.vagtType = vagtType;
        this.bruger = bruger;
    }
    toString() {
        return 'Vagt';
    }
}

exports.Vagt = Vagt;