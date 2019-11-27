const navn = document.querySelector('#navn');
const password = document.querySelector('#password');
const login = document.querySelector('#login');
const fejl = document.querySelector('#fejl');

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

login.onclick = async () => {
    try {
        const svar = await POST("/login", {brugernavn: navn.value, password: password.value});
        if (svar.ok) {
            console.log(svar.type);
            //hvis login er ok, vises brugere - testtest
            const forside = await fetch('/forside.hbs');
            const brugereText = await forside.text();
            document.getElementById('content').innerHTML = brugereText;
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
        k.onclick = sætVagtTilSalg;
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
            knap.onclick = overtagvagt;
        });

    }
    catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function overtagvagt(event) {
    console.log('Du har trykket på knappen med ID: ' + event.target.id + " og overtager vagten");
    let id = {id: event.target.id};
    await POST('/overtagvagt', id);

    getVagterTilSalg();
    event.stopPropagation();
}

async function sætVagtTilSalg(event) {
try {
    const id = event.target.id;
    console.log("vagt til salg knap " + id);
    const url = '/saetVagtTilSalg';

    await POST('/saetVagtTilSalg', {vagtID:id});
}

    catch (e) {
        console.log(e.name +" "+ e.message +" sæt vagt til salg");
    }



}

function openPane(evt, tabName) {
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
        getBrugere();
    }
    if (tabName == 'Kalender') {

    }
    if (tabName == 'Mine vagter'){
        getBrugersVagter();
    }
    if (tabName == 'Vagter til salg') {
        getVagterTilSalg();
    }

}
