const navn = document.querySelector('#navn');
const password = document.querySelector('#password');
const login = document.querySelector('#login');
const fejl = document.querySelector('#fejl');
let bruger = "";
let tempbruger = "";

function makeFrivilligHTML() {
    let frivillig =  document.getElementById('frivilligcontent');
    frivillig.innerHTML += "<div id = divinputfelte> <input id=\"fornavn\"> <label> fornavn</label><br>\n" +
        "<input id=\"efternavn\"> <label> efternavn</label><br>\n" +
        "<input id=\"telefonnummer\"> <label> telefonnummer</label> <br>\n" +
        "<input id=\"brugernavn\"> <label> brugernavn</label> <br>\n" +
        "<input id=\"password\"> <label> password</label> <br>\n" +
        "<input id=\"brugertype\"> <label> brugertype</label> <br>\n" +
        "<input id=\"tilstand\"> <label> tilstand</label> <br>\n" +
        "<input id=\"email\"> <label> email</label> <br>\n" +
        "<button id = \"opretbruger\"> Opret </button>\n" +
        "<button id = \"deletebruger\"> Delete </button>\n" +
        "<br> </div>";
}
let lastID;


// opretbutton.onclick = opretBruger;
//setAllBrugere("/brugere");

async function getBrugere() {
    try {
        document.getElementById('frivilligcontent').innerHTML = null;
        makeFrivilligHTML()
        const brugereResponse = await GET('/brugere');
        const hbs = await fetch('/brugere.hbs');
        const brugereText = await hbs.text();

        const compiledTemplate = Handlebars.compile(brugereText);
        let brugereHTML = '<ul>';
        brugereResponse.forEach(bruger => {
            brugereHTML += compiledTemplate({
                fornavn:  bruger.fornavn,
                efternavn: bruger.efternavn,
                telefonnummer: bruger.telefonnummer,
                email: bruger.email,
                brugernavn: bruger.brugernavn

            });
        });
        brugereHTML += '</ul>';

        let frivillig = document.getElementById('frivilligcontent')
        frivillig.innerHTML += brugereHTML;
        let opretbutton = frivillig.querySelector('#opretbruger');
        opretbutton.onclick = opretBruger;
        let deletebutton = frivillig.querySelector('#deletebruger');
        deletebutton.onclick = sletBruger;
        let lis = frivillig.getElementsByTagName("li");
        for (let i = 0; i < lis.length; i++) {
            lis[i].onclick = function () {
                bruger = brugereResponse[i];
                lis[i].style.color = 'grey';
                if (tempbruger !== "" && tempbruger !== lis[i])
                    tempbruger.style.color = 'black';
                tempbruger = lis.item(i);
                console.log(bruger)
            }
        }

    } catch (e) {
        console.log(e.name + ": " + e.message);
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
        let frivillig =  document.getElementById('frivilligcontent');
        let url = "/opretBruger";
        let data = {
            "fornavn": frivillig.querySelector('#fornavn').value,
            "efternavn": frivillig.querySelector('#efternavn').value,
            "telefonnummer": frivillig.querySelector('#telefonnummer').value,
            "brugernavn": frivillig.querySelector('#brugernavn').value,
            "password": frivillig.querySelector('#password').value,
            "brugertype": frivillig.querySelector('#brugertype').value,
            "tilstand": frivillig.querySelector('#tilstand').value,
            "email": frivillig.querySelector('#email').value,
        };
        if (data.fornavn.length > 0 || data.efternavn.length > 0 || data.brugernavn.length > 0 || data.password.length > 0) {
            let response = await POSTBruger(data, url);
            console.log("POST: %o", response);
            await getBrugere();
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
};

async function sletBruger() {
        try {
            let brugernavn = bruger.brugernavn;
            let url = "/deleteBruger/" + brugernavn;
            let response = await DELETE(url);
            console.log("DELETE: %o", response);
            await getBrugere();
        }
        catch (e) {
                console.log(e.name + ": " + e.message);
            }
}

async function POSTBruger(data, url) {
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
async function loaddivs() {
    const forside = await fetch('/tabdivs.hbs');
    const brugereText = await forside.text();
    document.getElementById('tabcontent').innerHTML = brugereText;
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

async function getBrugersVagter(){
    try{
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
            }
            else
            {
                mineVagterHTML += ' TIL SALG!';
            }
            mineVagterHTML += '</td></tr>';
        });
    mineVagterHTML += '</table>';
    document.getElementById('mineVagterContent').innerHTML = mineVagterHTML;
    let knap = document.querySelectorAll('.sætVagtTilSalgButton');
    for (let k of knap) {
        //k.onclick = sætVagtTilSalg;
        k.onclick = function() {confirmBox(k.id,sætVagtTilSalg)};
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

async function åbenOpretEventVindue()
{

    parent.append(confirmBox);
    confirmBox.innerHTML = newHTML;


    let yKnap = document.getElementById("y");
    let nKnap = document.getElementById("n");
    yKnap.onclick = function() {targetFunction(id)};
    nKnap.onclick = function() {
    let alert = document.getElementsByClassName("alert info");
    alert.remove();
};
}
async function fortryd(event)
{

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
