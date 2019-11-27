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
    if (response.status !== CREATED)
        throw new Error("POST status code " + response.status);
    return await response.json();
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
        const brugereResponse = await GET('/mineVagter');
    }
    catch (e) {
        console.log(e.name + ": " + e.message);
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
}
