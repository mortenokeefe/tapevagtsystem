class Bruger {
    constructor(fornavn, efternavn, telefonnummer, brugernavn, password, brugertype, tilstand) {
        this.fornavn = fornavn;
        this.efternavn = efternavn;
        this.telefonnummer = telefonnummer;
        this.brugernavn = brugernavn;
        this.password = password;
        this.brugertype = brugertype;
        this.tilstand = tilstand;
    }

    toString() {
        return this.fornavn + " " + this.efternavn;
    }
}
