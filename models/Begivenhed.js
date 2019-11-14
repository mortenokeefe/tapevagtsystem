class Begivenhed{
    constructor(navn, dato, beskrivelse, antalFrivillige) {
        if(navn && typeof navn=="string"){
            this.navn = navn;
        }
        else{
            if(!navn){
                throw "navn ikke angivet"
            }
            if(typeof navn != "string"){
                throw "navn ikke en string"
            }
        }
        if(dato instanceof Date && dato){
            this.dato = dato;
        }
        else{
            throw "dato forkert udfyldt"
        }
        if(typeof  beskrivelse == "string"){
            this.beskrivelse = beskrivelse;
        }
        else{
            throw "beskrivelse ikke en string"
        }
        if(typeof antalFrivillige == "number" && antalFrivillige){
            this.antalFrivillige = antalFrivillige
        }
        else{
            throw "antalFrivillige ikke et tal eller ikke eksisterende"
        }
        this.vagtArr = []
    }
}