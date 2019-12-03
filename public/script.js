const navn = document.querySelector('#navn');
const password = document.querySelector('#password');
const login = document.querySelector('#login');
const fejl = document.querySelector('#fejl');
let bruger = "";
let tempbruger = "";

function makeFrivilligHTML() {
    let frivillig =  document.getElementById('frivilligcontent');
    frivillig.innerHTML += "<div id = divinputfelte> <h1> Frivillige </h1> <input id=\"fornavn\"> <label> fornavn</label><br>\n" +
        "<input id=\"efternavn\"> <label> efternavn</label><br>\n" +
        "<input id=\"telefonnummer\"> <label> telefonnummer</label> <br>\n" +
        "<input id=\"brugernavn\"> <label> brugernavn</label> <br>\n" +
        "<input id=\"password\"> <label> password</label> <br>\n" +
        "<input id=\"email\"> <label> email</label> <br>\n" +
        // "<input id=\"brugertype\"> <label> brugertype</label> <br>\n" +
        "<label>brugertype</label> <br> <select id = 'brugertype'>" +
            "<option value='0'>Admin</option>"+
            "<option value='1'>Afvikler</option>"+
            "<option value='2'>Frivillig</option>"+
        "</select><br>"+
        // "<input id=\"tilstand\"> <label> tilstand</label> <br>\n" +
        "<label>tilstand</label> <br> <select id='tilstand'>"+
            "<option value='0'>Aktiv</option>"+
            "<option value='1'>Inaktiv</option>"+
        "</select> <br>"+
        "<button id = \"opretbruger\"> Opret </button>\n" +
        "<button id = \"deletebruger\"> Delete </button>\n" +
        "<button id = \"updatebruger\"> Update </button>\n" +
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
        for (const bruger of brugereResponse) {
            brugereHTML += compiledTemplate({
                fornavn: bruger.fornavn,
                efternavn: bruger.efternavn,
                telefonnummer: bruger.telefonnummer,
                email: bruger.email,
                brugernavn: bruger.brugernavn,
                fravær: await getFraværsProcent(bruger.brugernavn)

            });
        }
        brugereHTML += '</ul>';

        let frivillig = document.getElementById('frivilligcontent')
        frivillig.innerHTML += brugereHTML;
        let opretbutton = frivillig.querySelector('#opretbruger');
        opretbutton.onclick = opretBruger;
        let deletebutton = frivillig.querySelector('#deletebruger');
        deletebutton.onclick = sletBruger;
        let updatebruger = frivillig.querySelector('#updatebruger');
        updatebruger.onclick = updateBruger;
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
        let frivillig = document.getElementById('frivilligcontent');
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
        if (data.fornavn.length > 0 && data.efternavn.length > 0 && data.brugernavn.length > 0 && data.telefonnummer.match("^\\d{8}$")
            && data.password.length > 0 && data.email.length > 0) {
            let response = await POSTBruger(data, url);
            console.log("POST: %o", response);
            await getBrugere();
        } else if (!data.telefonnummer.match("^\\d{8}$")) {
            alert("et telefonnummer skal være 8 tal langt")
        } else {
            alert("Udfyld alt informationen")
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
};

async function updateBruger() {
    try {
        let frivillig = document.getElementById('frivilligcontent');
        let data = {
            "fornavn": frivillig.querySelector('#fornavn').value,
            "efternavn": frivillig.querySelector('#efternavn').value,
            "telefonnummer": frivillig.querySelector('#telefonnummer').value,
            "password": frivillig.querySelector('#password').value,
            "brugertype": frivillig.querySelector('#brugertype').value,
            "tilstand": frivillig.querySelector('#tilstand').value,
            "email": frivillig.querySelector('#email').value,
        };
        console.log(data);
        let url = "/updateBruger/" + bruger.brugernavn;
        if (data.fornavn.length > 0 && data.efternavn.length > 0 && data.telefonnummer.match("^\\d{8}$")
            && data.password.length > 0 && data.email.length > 0) {
            if (frivillig.querySelector('#brugernavn').value.length > 0) {
                alert("Et brugernavn kan ikke opdateres")
                let response = await PUT(data, url);
                console.log("POST: %o", response);
                await getBrugere();
            }
        } else if (!data.telefonnummer.match("^\\d{8}$")) {
            alert("et telefonnummer skal være 8 tal langt")
        } else {
            alert("Udfyld alt informationen")
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
    } catch (e) {
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

async function PUT(data, url) {
    const OK = 200;
    let response = await fetch(url, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {'Content-Type': 'application/json'}
    });
    if (response.status !== OK)
        throw new Error("PUT status code " + response.status);
    return await response.text();
}

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
    // if (response.ok) {
    //     update();
    // }
    if (response.status !== CREATED)
        throw new Error("POST status code " + response.status);
    return await response.json();
}

function loadCalendar() {
    var calendarEl = document.getElementById('calendar');
    if (calendarEl && calendarEl.className != "fc fc-ltr fc-unthemed") {
        var calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: [ 'dayGrid', 'interaction' ],
            events: {url: "http://localhost:8080/calendar/api/event"},
            eventClick: function(info){
                const id = info.event.extendedProps.complete._id
                clickBegivenhed(id)
            },
            eventColor: "green",
            eventRender: function(info){
                info.el.append( info.event.extendedProps.description + "      Ledige vagter: " + info.event.extendedProps.antalLedigeVagter);
                if(info.event.extendedProps.antalLedigeVagter == 0){
                    info.el.style.backgroundColor = 'red'
                    info.el.style.borderColor = 'red'
                }
            }


        });
        calendar.render();
    }
}

function update() {
    getVagterTilSalg();
    getBrugersVagter();
    //getBegivenheder();
    getBrugere();
}

async function getBrugertype() {
    const brugertype = await GET('/brugertype');
    return brugertype.brugertype;
}

async function loadhtml() {

    const brugertype = await getBrugertype();
    let forside;

    if(brugertype == 0) //admin
    {
        forside = await fetch('/forside.hbs');


    }
    if(brugertype ==1) //afvikler
    {
        forside = await fetch('/forside.hbs');

    }
    if (brugertype ==2) //frivillig
    {
        forside = await fetch('/forsideFrivillig.hbs');

    }

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

        } else {
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

async function getBrugersVagter() {
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
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function getVagterTilSalg() {
    try {
        const vagterResponse = await GET('/vagtertilsalg');
        const hbs = await fetch('/salg.hbs');
        const vagterText = await hbs.text();

        const compiledTemplate = Handlebars.compile(vagterText);
        let brugereHTML = '<table><tr><th>Begivenhed</th><th>Dato</th><th>Frivillig</th><th></th></tr>';

        vagterResponse.forEach(vagt => {
            brugereHTML += compiledTemplate({
                begivenhed: vagt.begivenhed,
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

    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function overtagvagt(id) {
    try {
        let svar = confirm("er du sikker?");

        // console.log('Du har trykket på knappen med ID: ' + event.target.id + " og overtager vagten");
        // let id = {id: event.target.id};
        if (svar) {
            await POST('/overtagvagt', {id: id});

            await getVagterTilSalg();
            update();
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
        update();
    }

}
    catch (e) {
        console.log(e.name +" "+ e.message +" sæt vagt til salg");
    }
}

async function getFraværsProcent(brugernavn){
    try {
        const url = '/fravaer/'+ brugernavn;
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




/*async function getBegivenheder() {
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
        const brugertype = await getBrugertype();
        if(brugertype ==0)                                       //   smider knappen på
        {
            brugereHTML += '<br> <button id="åbenOpretBegivenhedButton"> ny begivenhed</button>';
        }



        document.getElementById('begivenhedercontent').innerHTML = brugereHTML;
         if(brugertype ==0) {
             document.getElementById("åbenOpretBegivenhedButton").onclick = åbenOpretEventVindue;
         }
        console.log(brugereHTML.length);
        console.log(begivenhederResponse);

    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}*/

async function clickBegivenhed(eventId) {
    getBegivenhed(eventId);
}
async function opretBegivenhed(navn, dato, beskrivelse, antalFrivillige, afvikler)
{
    console.log(navn + dato + beskrivelse + antalFrivillige);
    const url = '/opretBegivenhed';
    let realDate = new Date(dato);
    try {
        await POST(url, {navn: navn, dato: realDate, beskrivelse: beskrivelse, antalFrivillige : antalFrivillige, afvikler : afvikler });
    }
    catch (e) {
        console.log(e.name + ": " + e.message);
    }
    cleartab();
    update();
}

async function åbenOpretEventVindue()
{
    cleartab();

    let html =  'navn:<br> <input type="text" name="navn" id="bNameTxt"><br>' +
        'dato:<br> <input type="date" name="bday" id="bDate"><br>'+
        ' beskrivelse:<br><textarea rows="10" cols="50" id="bBeskrivelseTxt"></textarea><br>' +
        'antal frivillige:<br> <input type="number" name="antalfrivillige" id="bAntalFrivillige"><br>'+
    '<button id ="opretBegivenhedButton"> opret begivenhed</button>';

    const afviklere = await getAfviklere();
    console.log(afviklere, " afviklere");
    let afviklerehtml = "<br><label>Afvikler</label><br><select id='afviklereSelect'> ";

    for (let a of afviklere)
    {
        console.log(a, "afviklere loop");
           let navn = a.fornavn +", "+ a.efternavn;
          afviklerehtml += "<option value='"+a._id+"'>"+navn+"</option>";
    }
    afviklerehtml += "</select>";
    html += afviklerehtml;


    let div = document.getElementById('begivenhedcontent');
    div.innerHTML = html;

    document.getElementById('opretBegivenhedButton').onclick = async function () {
        let navn = document.getElementById('bNameTxt').value;
        let dato = document.getElementById('bDate').valueAsDate;
        let beskrivelse = document.getElementById('bBeskrivelseTxt').value;
        let antalFrivillige = document.getElementById('bAntalFrivillige').value;
        let afviklerId = document.getElementById('afviklereSelect').value;
        let afvikler = await getBruger(afviklerId);
        console.log(afvikler, "script opret event afvikler");
        opretBegivenhed(navn, dato, beskrivelse, antalFrivillige, afvikler);
    }
}
async function getAfviklere()
{
    return await GET('/afviklere');
}
async function getBruger(brugerId)
{
          let svar = await GET('/getbruger/'+brugerId);
          return svar.bruger;
}

async function getBegivenhed(id) {
    cleartab();
    brugertype = await getBrugertype();
    let endpoint = '/sebegivenhed/' + id;
    const begivenhedResponse = await GET(endpoint);
    console.log(begivenhedResponse);
    let begivenhed = begivenhedResponse[0];
    let frivillige = begivenhedResponse[1];
    let afvikler = begivenhedResponse[2][0];
    console.log(afvikler, "getbegivnehed");
    const side = await fetch('/begivenhed.hbs');
    const begivenhedText = await side.text();
    const compiledTemplate = Handlebars.compile(begivenhedText);
    let begivenhedHTML = compiledTemplate({
        navn:  begivenhed.navn,
        dato: begivenhed.dato,
        beskrivelse: begivenhed.beskrivelse,
        afvikler: afvikler.fornavn +" " +afvikler.efternavn
    });

    //generer vagt text / knap
    // let v = await fetch('/eventvagt.hbs');
    // let vagterText = await v.text();
    // ledig 0 optaget 1 til salg 2

    let vagterhtml = '';
    let index = 1;
    var mig;
    let harVagt = false;
    for (let vagt of frivillige) {

         if (vagt.bruger) {
             let ep = '/getbruger/' + vagt.bruger;
              let brugere = await GET(ep);
              // console.log('XXbrugere');
              // console.log(brugere);
              mig = brugere.minbruger;
              let bruger = brugere.bruger;
             vagterhtml += index + '. ' + bruger.fornavn + ' ' + bruger.efternavn + '<br>';
             index++;
             if(mig._id == vagt.bruger)
             {
                 harVagt = true;
             }
         }
        if (vagt.status == 0) {
            vagterhtml += index + '. ' + 'Ledig   ';
            //hvis man er admin skal man kunne tildele vagter:
            if (brugertype == 0) {
                const tildelhbs = await fetch('/tildel.hbs');
                const tildelText = await tildelhbs.text();
                const tildelTemplate = Handlebars.compile(tildelText);
                let tildelHTML = tildelTemplate({
                    navn:  vagt.fornavn,
                });
                vagterhtml += tildelHTML;
                // vagterhtml += '<button class="tildel" id="' + vagt._id + '">Tildel vagt</button> '
            }
            vagterhtml += '<br>';
            index++;
        }
    }
    //mellemrum
    vagterhtml += '<br><br>';

    //hvis man er frivillig, skal man have:
    if (brugertype == 2) {
        if (harVagt) {
            vagterhtml += 'Du har taget en vagt til dette event.';
        } else {
            vagterhtml += '<button class="tilmeld" id="' + begivenhed._id + '"> Tilmeld begivenhed</button>';
        }
    }

        begivenhedHTML += vagterhtml;
    let div = document.getElementById('begivenhedcontent');
    div.innerHTML = begivenhedHTML;
    if (brugertype == 2) {
        let knap = document.getElementsByClassName('tilmeld');
        if (knap.length > 0) {
            knap[0].onclick = tilmeldBegivenhed;
        }
    }
    if (brugertype == 0) {
        // Get the modal
        var modal = document.getElementById("myModal");

        // Get the button that opens the modal
        var btn = document.getElementById("myBtn");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks the button, open the modal
        btn.onclick = function() {
            modal.style.display = "block";
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
}

async function tilmeldBegivenhed(event) {
    let svar = confirm('Er du sikker på at du vil tilmelde dig begivenheden?');
    if (svar) {
        begivenhedsid = event.target.id;
        let s = await POST('/tilmeldmigbegivenhed', {"id": begivenhedsid})
        if (s.ok) {
            console.log('prøver at slette content');
            await cleartab()
                .then(getBegivenhed(begivenhedsid));

        }
    }
}

async function cleartab() {
    let bg = document.getElementById('begivenhedcontent');
    let bg1 = document.getElementById('begivenhedercontent');
    let calendar = document.getElementById("calendar");
    calendar.className = ""
    calendar.innerHTML = ""

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
        //getBegivenheder();
        loadCalendar();

        document.getElementById('begivenhedercontent')



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
