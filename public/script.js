let brugerliste = document.getElementById("brugere");
let opretbutton = document.getElementById("opretbruger");
const navn = document.querySelector('#navn');
const password = document.querySelector('#password');
const login = document.querySelector('#login');
const fejl = document.querySelector('#fejl');
let lastID;


// opretbutton.onclick = opretBruger;
//setAllBrugere("/brugere");

async function setAllBrugere(url) {
    brugerliste.innerHTML = "";
    const response = await GET(url);
    await JSON.stringify(response);
    for (let i = 0; i < response.length; i++) {
        brugerliste.innerHTML += "<li>" + " <p>" + response[i].fornavn + " " + response[i].efternavn
            + " " + response[i].brugernavn + " " + " " + response[i].telefonnummer + " " + " " + response[i].email + " " + "</p>" + "</li>"
    }
}

async function GET(url) {
    const OK = 200;
    let response = await fetch(url);
    if (response.status !== OK)
        throw new Error("GET status code " + response.status);
    return await response.json();
};

async function opretBruger() {
    try {
        let url = "/opretBruger";
        let data = {
            "fornavn": document.querySelector('#fornavn').value,
            "efternavn": document.querySelector('#efternavn').value,
            "telefonnummer": document.querySelector('#telefonnummer').value,
            "brugernavn": document.querySelector('#brugernavn').value,
            "password": document.querySelector('#password').value,
            "brugertype": document.querySelector('#brugertype').value,
            "tilstand": document.querySelector('#tilstand').value,
            "email": document.querySelector('#email').value,
        };
        if (data.fornavn.length > 0 || data.efternavn.length > 0 || data.brugernavn.length > 0 || data.password.length > 0) {
            let response = await POST(data, url);
            document.querySelector('#fornavn').value = "";
            document.querySelector('#efternavn').value = "";
            document.querySelector('#telefonnummer').value = "";
            document.querySelector('#brugernavn').value = "";
            document.querySelector('#password').value = "";
            document.querySelector('#brugertype').value = "";
            document.querySelector('#tilstand').value = "";
            document.querySelector('#email').value = "";
            console.log("POST: %o", response);
            await setAllBrugere("/brugere");
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
};

async function sletBruger() {
        try {
            let brugernavn = "jaja";
            let url = "/deleteBruger/" + brugernavn;
            let response = await DELETE(url);
            console.log("DELETE: %o", response);
        }
        catch (e) {
                console.log(e.name + ": " + e.message);
            }
}

async function POST(data, url) {
    const CREATED = 201;
    let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.status !== CREATED)
        throw new Error("POST status code " + response.status);
    return await response.text();
};

async function DELETE(url) {
    const OK = 200;
    let response = await fetch(url, {
        method: "DELETE",
    });
    if (response.status !== OK)
        throw new Error("DELETE status code " + response.status);
    return await response.text();
}



async function POST(url, data) {
    const CREATED = 200;
    let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.ok) {
        update();
    }
    if (response.status !== CREATED)
        throw new Error("POST status code " + response.status);
    return await response.json();
}

function update() {
    getVagterTilSalg();
    getBrugersVagter();
}

async function loadhtml() {
    const forside = await fetch('/forside.hbs');
    const brugereText = await forside.text();
    document.getElementById('content').innerHTML = brugereText;
}

login.onclick = async () => {
    try {
        const svar = await POST("/login", {brugernavn: navn.value, password: password.value});
        if (svar.ok) {
            console.log(svar.type);
            // //hvis login er ok, vises brugere - testtest
            // const forside = await fetch('/forside.hbs');
            // const brugereText = await forside.text();
            // document.getElementById('content').innerHTML = brugereText;
            await loadhtml();
            document.getElementById("defaultOpen").click();

        }
        else {
            password.value = "";
            fejl.innerHTML = "Forkert password!";
        }
    } catch (e) {
        fejl.innerHTML = e.name + ": " + e.message;
    }
};

async function GET(url) {
    const OK = 200;
    let response = await fetch(url);
    if (response.status !== OK)
        throw new Error("GET status code " + response.status);
    return await response.json();
}

async function getBrugere() {
    try {
        const brugereResponse = await GET('/brugere');
        const hbs = await fetch('/brugere.hbs');
        const brugereText = await hbs.text();

        const compiledTemplate = Handlebars.compile(brugereText);
        let brugereHTML = '<table><tr><th>Navn</th></tr>';

        brugereResponse.forEach(bruger => {
            brugereHTML += compiledTemplate({
                fornavn:  bruger.fornavn,
                efternavn: bruger.efternavn,
            });
        });
        brugereHTML += '</table>';

        document.getElementById('frivilligcontent').innerHTML = brugereHTML;


    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}
async function getBrugersVagter(){
    try {
        const brugerResponse = await GET('/mineVagter');
        const hbs = await fetch('/vagt.hbs');
        const vagtTxt = await hbs.text();

        const compiledTemplate = Handlebars.compile(vagtTxt);
        let mineVagterHTML = '<table><tr><th> Mine Vagter</th></tr>';

        brugerResponse.forEach(vagt => {
            mineVagterHTML += compiledTemplate({
                dato: vagt.dato,
                begivenhed: vagt.begivenhed,
                id: vagt.id
            });
            if (vagt.status != 2) {
                mineVagterHTML += '<button class="sætVagtTilSalgButton" id="' + vagt.id + '"> Sæt til salg</button>';
            } else {
                mineVagterHTML += ' TIL SALG!';
            }
            mineVagterHTML += '</td></tr>';
        });
        mineVagterHTML += '</table>';
        document.getElementById('mineVagterContent').innerHTML = mineVagterHTML;
        let knap = document.querySelectorAll('.sætVagtTilSalgButton');
        for (let k of knap) {
            //k.onclick = sætVagtTilSalg;
            k.onclick = function () {

               // confirmBox(k.id, sætVagtTilSalg)

                    sætVagtTilSalg(k.id);

            };

        }
    }
    catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function getVagterTilSalg() {
    try{
        const vagterResponse = await GET('/vagtertilsalg');
        const hbs = await fetch('/salg.hbs');
        const vagterText = await hbs.text();

        const compiledTemplate = Handlebars.compile(vagterText);
        let brugereHTML = '<table><tr><th>Begivenhed</th><th>Dato</th><th>Frivillig</th><th></th></tr>';

        vagterResponse.forEach(vagt => {
            brugereHTML += compiledTemplate({
                begivenhed:  vagt.begivenhed,
                dato: vagt.dato,
                bruger: vagt.bruger,
                id: vagt.vagt._id
            });
        });
        brugereHTML += '</table>';
        document.getElementById('vagtertilsalgcontent').innerHTML = brugereHTML;

        vagterResponse.forEach(vagt => {
            let knap = document.getElementById(vagt.vagt._id);
            //knap.onclick = overtagvagt;
            knap.onclick = function () {


                overtagvagt(vagt.vagt._id);
            };
        });

    }
    catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function overtagvagt(id) {
    try {
        let svar = confirm("er du sikker?");

        // console.log('Du har trykket på knappen med ID: ' + event.target.id + " og overtager vagten");
        // let id = {id: event.target.id};
        if(svar) {
            await POST('/overtagvagt', {id: id});

            await getVagterTilSalg();
       }
    }
    catch (e) {
        console.log(e.name +" "+ e.message +" overtag vagt");
    }

}



async function sætVagtTilSalg(id) {
try {
    let svar = confirm("er du sikker?");


    const url = '/saetVagtTilSalg';
    if (svar) {


        await POST('/saetVagtTilSalg', {vagtID: id});
    }

}
    catch (e) {
        console.log(e.name +" "+ e.message +" sæt vagt til salg");
    }
}

async function getFraværsProcent(brugernavn){
    try {
        const url = '/fravær/'+brugernavn;
       const fraværsprocent = await GET(url);
       return fraværsprocent;

    }
    catch (e) {
        console.log(e.name +" "+ e.message);
    }
}

function removeElement(elementId) {
    // Removes an element from the document
    let element = document.getElementById(elementId);
    console.log(element);
    console.log(element.parentNode);
    element.parentNode.removeChild(element);
}




async function getBegivenheder() {
    try {
        console.log('henter begivenheder');
        const begivenhederResponse = await GET('/begivenheder');
        const hbs = await fetch('/begivenheder.hbs');
        const begivenhederText = await hbs.text();

        const compiledTemplate = Handlebars.compile(begivenhederText);
        let brugereHTML = '<table><tr><th>Navn</th></tr>';

        begivenhederResponse.forEach(begivenhed => {
            brugereHTML += compiledTemplate({
                navn:  begivenhed.navn,
                id: begivenhed._id
            });
        });
        brugereHTML += '</table>';
        document.getElementById('begivenhedercontent').innerHTML = brugereHTML;
        console.log(brugereHTML.length);
        console.log(begivenhederResponse);
        let link = document.getElementsByClassName('link');
         link[0].onclick = clickBegivenhed;

    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function clickBegivenhed(event) {
    let id = event.target.id;
    getBegivenhed(id);
}
async function opretBegivenhed(navn, dato, beskrivelse, antalFrivillige)
{
    console.log(navn + dato + beskrivelse + antalFrivillige);
    const url = '/opretBegivenhed';
    let realDate = new Date(dato);
    try {
        await POST(url, {navn: navn, dato: realDate, beskrivelse: beskrivelse, antalFrivillige : antalFrivillige });
    }
    catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function åbenOpretEventVindue()
{
    cleartab();

    let html =  'navn:<br> <input type="text" name="navn" id="bNameTxt"><br>' +
        'dato:<br> <input type="date" name="bday" id="bDate"><br>'+
        ' beskrivelse:<br><textarea rows="10" cols="50" id="bBeskrivelseTxt"></textarea><br>' +
        'antal frivillige:<br> <input type="number" name="antalfrivillige" id="bAntalFrivillige"><br>'+
    '<button id ="opretBegivenhedButton"> opret begivenhed</button>';
    let div = document.getElementById('begivenhedcontent');
    div.innerHTML = html;

    document.getElementById('opretBegivenhedButton').onclick = function () {
        let navn = document.getElementById('bNameTxt').value;
        let dato = document.getElementById('bDate').valueAsDate;
        let beskrivelse = document.getElementById('bBeskrivelseTxt').value;
        let antalFrivillige = document.getElementById('bAntalFrivillige').value;
        opretBegivenhed(navn, dato, beskrivelse, antalFrivillige);
    }
}

async function getBegivenhed(id) {
    cleartab();
    let endpoint = '/sebegivenhed/' + id;
    const begivenhedResponse = await GET(endpoint);
    console.log(begivenhedResponse);
    let begivenhed = begivenhedResponse[0];
    let frivillige = begivenhedResponse[1];
    let afvikler = begivenhedResponse[2];
    const side = await fetch('/begivenhed.hbs');
    const begivenhedText = await side.text();
    const compiledTemplate = Handlebars.compile(begivenhedText);
    let begivenhedHTML = compiledTemplate({
        navn:  begivenhed.navn,
        dato: begivenhed.dato,
        beskrivelse: begivenhed.beskrivelse,
        afvikler: afvikler.navn,
    });

    //generer vagt text / knap
    // let v = await fetch('/eventvagt.hbs');
    // let vagterText = await v.text();
    // ledig 0 optaget 1 til salg 2

    let vagterhtml = '';
    let index = 1;
    frivillige.forEach(vagt => {
        console.log('Printer vagt: ');
        console.log(vagt);
        if (vagt.status == 0) {
            vagterhtml += index + '. ' + 'Ledig       <button class="tilmeld" id="' + vagt._id + '"> Tilmeld vagt</button><br>';
            index++;
        }
        if(vagt.status < 0) {
            vagterhtml += index + '. ' + vagt.fornavn + ' ' + vagt.efternavn;
            index++;
        }
    });
    begivenhedHTML += vagterhtml;
    let div = document.getElementById('begivenhedcontent');
    div.innerHTML = begivenhedHTML;
    let knapper = document.getElementsByClassName('tilmeld');
    for (let knap of knapper) {
        knap.onclick = tilmeldVagt;
    }
}

async function tilmeldVagt(event) {
    let svar = confirm('Er du sikker på at du vil tilmelde dig vagten?');
    if (svar) {
        let id = event.target.id;
        await POST('/tagvagt', {"id": id});
    }
}

async function cleartab() {
    let bg = document.getElementById('begivenhedcontent');
    let bg1 = document.getElementById('begivenhedercontent');

    bg.innerHTML = '';
    bg1.innerHTML = '';
}

async function openPane(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    if (tabName == 'Frivillige') {
        cleartab();
        getBrugere();
    }
    if (tabName == 'Kalender') {
        cleartab();
        getBegivenheder();


        document.getElementById("åbenOpretBegivenhedButton").onclick = åbenOpretEventVindue;

    }
    if (tabName == 'Mine vagter'){
        cleartab();
        getBrugersVagter();
    }
    if (tabName == 'Vagter til salg') {
        cleartab();
        getVagterTilSalg();
    }


}
