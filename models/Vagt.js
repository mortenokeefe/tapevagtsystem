

class Vagt {
    constructor(startTid, fravær, fraværsBeskrivelse, status, vagtType) {
        this.startTid = startTid;
        this.fravær = fravær;
        this.fraværsBeskrivelse = fraværsBeskrivelse;
        this.status = status;
        this.vagtType = vagtType;
        if (Kat._antal) Kat._antal++; else Kat._antal = 1;
    }
    toString() { return this.constructor.name + ': ' + this.navn; };
    static antal() { return Kat._antal; }
}