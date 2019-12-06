const navn = document.querySelector('#navn');
const password = document.querySelector('#password');
const login = document.querySelector('#login');
const fejl = document.querySelector('#fejl');
let bruger = "";
let tempbruger = "";

function makeFrivilligHTML() {
    let frivillig = document.getElementById('frivilligcontent');
    frivillig.innerHTML += "<div id = divinputfelte> <h1> Frivillige </h1> <input id=\"fornavn\" placeholder='fornavn'><br>\n" +
        "<input id=\"efternavn\" placeholder='efternavn'> <br>\n" +
        "<input id=\"telefonnummer\" placeholder='telefonnummer'> <br>\n" +
        "<input id=\"brugernavn\" placeholder='brugernavn'> <br>\n" +
        "<input id=\"password\" type='password' placeholder='password'> <br>\n" +
        "<input id=\"email\" placeholder='email'> <br>\n" +
        "<label>brugertype</label> <br> <select id = 'brugertype'>" +
        "<option value='0'>Admin</option>" +
        "<option value='1'>Afvikler</option>" +
        "<option value='2'>Frivillig</option>" +
        "</select><br>" +
        // "<input id=\"tilstand\"> <label> tilstand</label> <br>\n" +
        "<label>tilstand</label> <br> <select id='tilstand'>" +
        "<option value='0'>Aktiv</option>" +
        "<option value='1'>Inaktiv</option>" +
        "</select> <br>" +
        "<button id = \"opretbruger\"> Opret </button>\n" +
        "<button id = \"deletebruger\"> Delete </button>\n" +
        "<button id = \"updatebruger\"> Update </button>\n" +
        "<br> </div>";
}

async function getBrugere() {
    try {
        document.getElementById('frivilligcontent').innerHTML = null;
        if (await getBrugertype() === 0) {
            makeFrivilligHTML()
        }
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
                fravær: await getFraværsProcent(bruger.brugernavn)+'%'

            });
        }
        brugereHTML += '</ul>';
            let frivillig = document.getElementById('frivilligcontent')
            frivillig.innerHTML += brugereHTML;
        if (await getBrugertype() === 0) {
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
                    lis[i].style.color = 'gray';
                    if (tempbruger !== "" && tempbruger !== lis[i])
                        tempbruger.style.color = 'black';
                    tempbruger = lis.item(i);
                    frivillig.querySelector('#fornavn').value = bruger.fornavn
                    frivillig.querySelector('#efternavn').value = bruger.efternavn
                    frivillig.querySelector('#telefonnummer').value = bruger.telefonnummer
                    frivillig.querySelector('#brugernavn').value = "";
                    frivillig.querySelector('#password').value = bruger.password
                    frivillig.querySelector('#brugertype').value = bruger.brugertype
                    frivillig.querySelector('#tilstand').value = bruger.tilstand
                    frivillig.querySelector('#email').value = bruger.email
                }
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
        if (await getBrugertype() === 0) {
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
                cleartab()
                await getBrugere()
                // console.log("POST: %o", response);
            } else if (!data.telefonnummer.match("^\\d{8}$")) {
                alert("et telefonnummer skal være 8 tal langt")
            } else {
                alert("Udfyld alt informationen")
            }
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
};

async function updateBruger() {
    try {
        if (await getBrugertype() === 0) {
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
            // console.log(data);
            let url = "/updateBruger/" + bruger.brugernavn;
            if (data.fornavn.length > 0 && data.efternavn.length > 0 && data.telefonnummer.match("^\\d{8}$")
                && data.password.length > 0 && data.email.length > 0) {

                    let response = await PUT(data, url);
                    // console.log("POST: %o", response);

            } else if (!data.telefonnummer.match("^\\d{8}$")) {
                alert("et telefonnummer skal være 8 tal langt")
            } else {
                alert("Udfyld alt informationen")
            }
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
};

async function sletBruger() {
    try {
        if (await getBrugertype() === 0) {
            let brugernavn = bruger.brugernavn;
            let url = "/deleteBruger/" + brugernavn;
            let response = await DELETE(url);
            // console.log("DELETE: %o", response);
            await getBrugere();
        }
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function clearDatabase() {
    try {
       let brugertype = await getBrugertype();
        let svar = confirm("Er du sikker på, at du vil slette alle begivenheder og vagter, før dagens dato?");
        if (brugertype == 0 && svar) {
            let url = "/clearDatabase/";
            let response = await DELETE(url);
            // console.log("DELETE: %o", response);
            await loadhtml();
            document.getElementById("defaultOpen").click();

        }
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
            displayEventTime: false,
            eventColor: "green",
            eventRender: function(info){
                info.el.append( "Ledige vagter: " + info.event.extendedProps.antalLedigeVagter);
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
    getBegivenheder();
    getBrugere();
    loadCalendar();
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
        forside = await fetch('/forsideafvikler.hbs');

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
            // console.log(svar.type);
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
        const brugertype = await getBrugertype();
        const compiledTemplate = Handlebars.compile(vagtTxt);
        let mineVagterHTML = '<table><tr><th> Mine Vagter</th></tr> <tr><th>Begivenhed</th><th>Dato</th> <th>Sluttidspunkt</th></tr><tr><td>';



        brugerResponse.forEach(vagt => {
            let realDateStart = new Date(vagt.dato);
            let realDateSlut = new Date(vagt.tidSlut);
            console.log(vagt.startTid, vagt.tidSlut);
            console.log(realDateStart, realDateSlut);

            mineVagterHTML += compiledTemplate({
                dato: realDateStart.toLocaleDateString() +' ' +realDateStart.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
                sluttid : realDateSlut.toLocaleDateString() +' ' +realDateSlut.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
                begivenhed: vagt.begivenhed,
                id: vagt.id
            });
            if(brugertype !=1) {
                if (vagt.status != 2) {
                    mineVagterHTML += '<td><button class="sætVagtTilSalgButton" id="' + vagt.id + '"> Sæt til salg</button></td>';
                } else {
                    mineVagterHTML += ' TIL SALG!';
                }
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
        let brugertype = await getBrugertype();

        const compiledTemplate = Handlebars.compile(vagterText);
        let brugereHTML = '<table><tr><th>Begivenhed</th><th>Dato</th><th>Sluttidspunkt</th><th>Frivillig</th><th></th></tr>';

        vagterResponse.forEach(vagt => {
            let realDateStart = new Date(vagt.dato);
            let realDateSlut = new Date(vagt.tidSlut);
            console.log(vagt.dato, vagt.tidSlut);
            brugereHTML += compiledTemplate({

                begivenhed: vagt.begivenhed,
                dato: realDateStart.toLocaleDateString() +' ' +realDateStart.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
                sluttid : realDateSlut.toLocaleDateString() +' ' +realDateSlut.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
                bruger: vagt.bruger,
                id: vagt.vagt._id
            });
        });
        brugereHTML += '</table>';
        document.getElementById('vagtertilsalgcontent').innerHTML = brugereHTML;

        vagterResponse.forEach(vagt => {
            let knap = document.getElementById(vagt.vagt._id);
            //knap.onclick = overtagvagt;
            if (brugertype == 0) {
                // knap.innerHTML = '';
                knap.hidden = true;
            } else {

            knap.onclick = function () {
                overtagvagt(vagt.vagt._id, vagt.vagt.begivenhed);
            };
        }
        });

    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function overtagvagt(vagtid, begivenhedsid) {
    try {
        let svar = confirm("er du sikker?");

        // console.log('Du har trykket på knappen med ID: ' + event.target.id + " og overtager vagten");
        // let id = {id: event.target.id};
        if (svar) {
            let begivenhed = await GET('/sebegivenhed/' + begivenhedsid);
            let brugerid = await GET('/getbrugeridforbrugerloggetind');
            //hvis man ikke er en del af dem, må man ikke tage vagten
            let frivillige = begivenhed[1];
            let påbegivenhed = false;
            for (let frivillig of frivillige) {
                if (frivillig.bruger == brugerid) {
                    console.log('du er allerde på beginvehd');
                    påbegivenhed = true;
                break;
                }
            }

            let vagtermin = false;
            let minevagter = await GET('/mineVagter');
            for (let vagt of minevagter) {
                if (vagt.id == vagtid) {
                    console.log('vagten er din');
                    vagtermin = true;
                }
            }
            if (!påbegivenhed) {
                await POST('/overtagvagt', {id: vagtid});

                await getVagterTilSalg();
                update();
            }
            else if (påbegivenhed && vagtermin) {
                await POST('/overtagvagt', {id: vagtid});

                await getVagterTilSalg();
                update();
            }
            else {
                alert('Du kan kun tage et vagt per begivenhed.');
            }
        }
    } catch (e) {
        console.log(e.name + " " + e.message + " overtag vagt");
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
async function setFravær(vagtId){
    try {
        let svar = confirm('er du sikker?');
        if(svar) {
            const url = '/setFravaer';
            const data = {vagtId: vagtId};
            await PUT(data, url);

        }

    }
    catch (e) {
        console.log(e.name +" "+ e.message);
    }

}

function removeElement(elementId) {
    // Removes an element from the document
    let element = document.getElementById(elementId);
    // console.log(element);
    // console.log(element.parentNode);
    element.parentNode.removeChild(element);
}


async function getBegivenheder() {
    try {
        // console.log('henter begivenheder');
        // const begivenhederResponse = await GET('/begivenheder');
        // const hbs = await fetch('/begivenheder.hbs');
        // const begivenhederText = await hbs.text();
        //
        // const compiledTemplate = Handlebars.compile(begivenhederText);
        // let brugereHTML = '<table><tr><th>Navn</th></tr>';
        //
        // begivenhederResponse.forEach(begivenhed => {
        //     brugereHTML += compiledTemplate({
        //         navn:  begivenhed.navn,
        //         id: begivenhed._id
        //     });
        // });
        // brugereHTML += '</table>';
        let brugereHTML ='';
        const brugertype = await getBrugertype();
        if(brugertype ==0)                                       //   smider knappen på
        {
            brugereHTML += '<br> <button id="åbenOpretBegivenhedButton"> ny begivenhed</button> <button id="ClearDatabase"> Slet gamle begivenheder</button>';
        }



        document.getElementById('begivenhedercontent').innerHTML = brugereHTML;
         if(brugertype ==0) {
             document.getElementById("åbenOpretBegivenhedButton").onclick = åbenOpretEventVindue;
             document.getElementById("ClearDatabase").onclick = clearDatabase;
         }

    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
}

async function clickBegivenhed(eventId) {
    getBegivenhed(eventId);
}
async function opretBegivenhed(navn, dato, beskrivelse, antalFrivillige, afvikler, starttid, sluttid)
{

    const url = '/opretBegivenhed';
    let realDate = new Date(dato);
    if(navn.length ==0 || dato ==null  ){

        alert('du har enten ikke valgt 1 navn, eller 1 dato ');
    }
    else {
    try {
        await POST(url, {
            navn: navn,
            dato: realDate,
            beskrivelse: beskrivelse,
            antalFrivillige: antalFrivillige,
            logbog: [],
            afvikler: afvikler,
            starttid : starttid,
            sluttid : sluttid
        });
    }

    catch
        (e)
        {
            console.log(e.name + ": " + e.message);
        }
        cleartab();
        update();
    }
}

async function åbenOpretEventVindue()
{
    cleartab();

    let html =  'navn:<br> <input type="text" name="navn" id="bNameTxt"><br>' +
        'dato:<br> <input type="date" name="bday" id="bDate"><br>'+
        'starttidspunkt:<br> <input type="time" name ="starttidspunkt" id="bStartTid" ><br>'+
        'sluttidspunkt: <br> <input type="time" name ="slutttidspunkt" id="bSlutTid" ><br>'+
        'beskrivelse:<br><textarea rows="10" cols="50" id="bBeskrivelseTxt"></textarea><br>' +
        'antal frivillige:<br> <input type="number" name="antalfrivillige" id="bAntalFrivillige"><br>';

    const afviklere = await getAfviklere();
    // console.log(afviklere, " afviklere");
    let afviklerehtml = "<label>Afvikler</label><br><select id='afviklereSelect'> ";

    for (let a of afviklere)
    {
        // console.log(a, "afviklere loop");
           let navn = a.fornavn +", "+ a.efternavn;
          afviklerehtml += "<option value='"+a._id+"'>"+navn+"</option>";
    }
    afviklerehtml += "<option value='undefined'> Ingen</option>";
    afviklerehtml += "</select>";
    html += afviklerehtml + '<br><br><button id ="opretBegivenhedButton"> opret begivenhed</button>';;


    let div = document.getElementById('begivenhedcontent');
    div.innerHTML = html;

    document.getElementById('opretBegivenhedButton').onclick = async function () {
        let navn = document.getElementById('bNameTxt').value;
        let dato = document.getElementById('bDate').valueAsDate;
        let starttid = document.getElementById('bStartTid').valueAsDate;
        let sluttid = document.getElementById('bSlutTid').valueAsDate;
        let beskrivelse = document.getElementById('bBeskrivelseTxt').value;
        let antalFrivillige = document.getElementById('bAntalFrivillige').value;
        let afviklerId = document.getElementById('afviklereSelect').value;
        if(afviklerId != 'undefined') {
            console.log(starttid, "starttid", sluttid,"sluttid");
            let afvikler = await getBruger(afviklerId);
            opretBegivenhed(navn, dato, beskrivelse, antalFrivillige, afvikler,starttid,sluttid);
               //console.log(afvikler, "script opret event afvikler");  
        }
            else {
                console.log(starttid, "starttid", sluttid,"sluttid");
                     opretBegivenhed(navn, dato, beskrivelse, antalFrivillige, undefined,starttid,sluttid);
        }


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
    let brugertype = await getBrugertype();
    let endpoint = '/sebegivenhed/' + id;
    const begivenhedResponse = await GET(endpoint);
    //console.log(begivenhedResponse);
    let begivenhed = begivenhedResponse[0];
    let frivillige = begivenhedResponse[1];
    let afvikler = begivenhedResponse[2][0];
   // console.log(afvikler, "getbegivnehed");
   //  console.log(afvikler, "getbegivnehed");

    //lav fjern og rediger knap såfremt brugertype=admin

    let begivenhedHTML ='<br>';

    if (brugertype == 0) {
        // console.log('bruger er admin');
        begivenhedHTML += '<button class="redigerknap" id="' + id + '">Rediger begivenhed</button>    ';
        begivenhedHTML += '<button class="sletknap" id="' + id + '">Slet begivenhed</button><br>';
    }


    const side = await fetch('/begivenhed.hbs');
    const begivenhedText = await side.text();
    const compiledTemplate = Handlebars.compile(begivenhedText);
    let realDateStart = new Date(begivenhed.dato);
    let realDateSlut = new Date(begivenhed.tidSlut);
    if(afvikler) {
         begivenhedHTML += compiledTemplate({
            navn: begivenhed.navn,
            dato: realDateStart.toLocaleDateString() +' ' +realDateStart.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
             sluttid : realDateSlut.toLocaleDateString() +' ' + realDateSlut.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
            beskrivelse: begivenhed.beskrivelse,
            afvikler: afvikler.fornavn + " " + afvikler.efternavn

        });
    }
    else {
                        begivenhedHTML += compiledTemplate({
                             navn: begivenhed.navn,
                            dato: realDateStart.toLocaleDateString() +' ' +realDateStart.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
                            sluttid : realDateSlut.toLocaleDateString() +' ' + realDateSlut.toLocaleTimeString([],{hour :'2-digit',minute: '2-digit'}),
                            beskrivelse: begivenhed.beskrivelse,
                             afvikler: 'ingen afvikler'
                             });

    }
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
              if (brugertype === 0 || brugertype === 1)
             vagterhtml += index + '. ' + bruger.fornavn + ' ' + bruger.efternavn + " " + bruger.telefonnummer;
              else {
                  vagterhtml += index + '. ' + bruger.fornavn + ' ' + bruger.efternavn;
              }
             //hvis brugerttype=admin
             if (brugertype == 0) {
                 vagterhtml += '<button class="fjernknap" id="' + vagt._id + '">Fjern frivillig</button>';
             }

             if(brugertype ==1)
             {
                 let fraværsstatus;
                 if(vagt.fravær)
                 fraværsstatus ='fraværende';
                 else
                     fraværsstatus ='deltagende';


                 vagterhtml += ' : ' +fraværsstatus+'<button class="fraværKnap" id="' + vagt._id + '">Skift fraværsstatus</button>';
             }


             vagterhtml += '<br>';
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
                let frivillige = await GET('/FrivilligeDerIkkeHarEnVagtPaaBegivenhed/' + id);
                const tildelhbs = await fetch('/tildel.hbs');
                const tildelText = await tildelhbs.text();
                vagterhtml += tildelText;

                let knaphbs = await fetch('/tildelknap.hbs');
                let knapText = await knaphbs.text();

                const knapTemplate = Handlebars.compile(knapText);
                let knapHTML;
                knapHTML = knapTemplate({
                    vagtid: vagt._id
                });
                let frivilligehbs = await fetch('/frivillig.hbs');
                let frivilligeText = await frivilligehbs.text();
                let d = new Date(begivenhed.dato);
                const måneder = ["januar", "februar", "marts", "april", "maj", "juni",
                    "juli", "august", "september", "oktober", "november", "december"
                ];
                let begivenhedsmåned = måneder[d.getMonth()];

                const frivilligeTemplate = Handlebars.compile(frivilligeText);
                knapHTML += '<select class="select" id="' + vagt._id +'" size="10" style="width: 80%">';
                for (let frivillig of frivillige) {
                     // console.log(frivillig);
                    let g = await GET('/getDenneMaanedsVagter/' + begivenhed._id + '/' + frivillig._id);
                    let antalv = g.antalvagter;
                    // console.log(frivillig);
                    knapHTML += frivilligeTemplate({
                        frivilligid: frivillig._id,
                       navn: frivillig.fornavn + ' ' + frivillig.efternavn,
                        antalvagter: antalv,
                        måned: begivenhedsmåned
                });
                }
                knapHTML += '</select><br>';
                knapHTML += '<button class="popupknap" id="'+ vagt._id +'">Tildel valgt</button>';
                knapHTML += '</div></div>';
                vagterhtml += knapHTML;
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

    const logbogside = await fetch('/logbog.hbs');
    const logbogText = await logbogside.text();
    const logbogTemplate = Handlebars.compile(logbogText);

    begivenhedHTML += logbogTemplate({
        logbog: begivenhed.logbog
    });

    let div = document.getElementById('begivenhedcontent');
    div.innerHTML = begivenhedHTML;

    //lav funktion til fjernknapper hvis logget ind = admin
    if (brugertype == 0) {
        let fjernknapper = document.getElementsByClassName('fjernknap');
        for (let knap of fjernknapper) {
            knap.onclick = async function () {
                let vagtid = knap.id;
                let s = await POST('/fjernfrivilligfravagt', {vagtid: vagtid})
                if (s.ok) {
                    cleartab();
                    getBegivenhed(id);
                }
            }
        }
        //lav funktion til rediger knap
        let redigerknap = document.getElementsByClassName('redigerknap');
        redigerknap[0].onclick = async function () {
            åbenRedigerEvent(id);
        }
        let sletknap = document.getElementsByClassName('sletknap');
        sletknap[0].onclick = async function () {
            let svar = confirm('Er du sikker på, at du vil slette begivenheden?');
            if(svar) {
                await DELETE('/sletbegivenhed/' + id)
                    .then(cleartab())
                        .then(loadCalendar());
            }
        }
    }

    if (brugertype == 2) {
        let knap = document.getElementsByClassName('tilmeld');
        if (knap.length > 0) {
            knap[0].onclick = tilmeldBegivenhed;
        }
    }
    if(brugertype ==1){
        let knap = document.getElementsByClassName('fraværKnap');
        for(let k of knap)
        {
            k.onclick = function(){
                setFravær(k.id);
                cleartab();
                getBegivenhed(id);
            }
        }
    }
    let logbogGemKnap = document.getElementById("gemLogbog");
    logbogGemKnap.onclick = async function(){
        let brugernavn = await GET("/bruger/api/getcurrentbrugernavn")
        console.log(brugernavn)
        begivenhed.logbog.push(
            {entry: document.getElementById("logBogsEntry").value,
                by: brugernavn.brugernavn
            })
        console.log(begivenhed.logbog, "logbog");
        let begivenhedsid = begivenhed._id;
        let navn = begivenhed.navn;
        let dato = begivenhed.dato;
        let beskrivelse = begivenhed.beskrivelse;
        let logbog = begivenhed.logbog;
        let antalfrivillige = begivenhed.antalfrivillige;
        let sluttid =  begivenhed.tidSlut;
        let starttid = dato;


        let o = {begivenhedsid, navn, dato, beskrivelse, logbog, antalfrivillige,starttid, sluttid};
        await PUT(o, '/redigerBegivenhed');
        getBegivenhed(begivenhedsid);
    }
    //logbog slet knap, fjernes hvis bruger ikke er admin eller afvikler
    for(i = 0; i<begivenhed.logbog.length;i++){
        let postButton = document.getElementById(""+i)
        console.log(postButton, "postbutton")
        postButton.onclick = async function(){
            begivenhed.logbog.splice(postButton.id, 1)
            let begivenhedsid = begivenhed._id
            let navn = begivenhed.navn
            let dato = begivenhed.dato
            let beskrivelse = begivenhed.beskrivelse
            let logbog = begivenhed.logbog
            let antalfrivillige = begivenhed.antalfrivillige
            let sluttid =  begivenhed.tidSlut;
            let starttid = dato;


            let o = {begivenhedsid, navn, dato, beskrivelse, logbog, antalfrivillige, starttid, sluttid};
            await PUT(o, '/redigerBegivenhed');
            getBegivenhed(begivenhedsid);
        }
    }
    if(brugertype == 2){
        let logBogTable = document.getElementById("logBogTable")
        logBogTable.style.display = "none"

        for(i=0; i<begivenhed.logbog.length;i++){
            let hiddenbutton = document.getElementById("" + i)
            hiddenbutton.style.display = "none"
        }
        let logbogTitle = document.getElementById("gemLogbog")
        logbogTitle.style.display = "none"

        let logbogTA = document.getElementById("logBogsEntry")
        logbogTA.style.display = "none"
        let logbogGem = document.getElementById("logBogTitle")
        logbogGem.style.display = "none"
        let addLogBog = document.getElementById("addLogbog")
        addLogBog.style.display = "none"
    }

    if (brugertype == 0) {
        // Get the modal
        var modals = document.getElementsByClassName("modal");

        // Get the button that opens the modal
        var btns = document.getElementsByClassName("tildelknap");

        // Get the <span> element that closes the modal
        var spans = document.getElementsByClassName("close");

        var tildelbtns = document.getElementsByClassName('popupknap');

        var selects = document.getElementsByClassName('select');

        for (let index = 0; index < btns.length; index++) {
            // When the user clicks the button, open the modal
            btns[index].onclick = function () {
                modals[index].style.display = "block";
            }

            tildelbtns[index].onclick = async function () {

                let vagtid = btns[index].id;
                let frivilligid = selects[index].value;
                let o = {vagtid: vagtid, frivilligid: frivilligid};
                await POST('/adminTilfoejVagtTilBruger', o);

                //lukker vindue
                modals[index].style.display = "none";
                cleartab();
                getBegivenhed(id);
//get begivenhed
            }

            // When the user clicks on <span> (x), close the modal
            spans[index].onclick = function () {
                modals[index].style.display = "none";
            }

        }
    }
}

async function åbenRedigerEvent(begivenhedsid) {
    cleartab();

    let endpoint = '/sebegivenhed/' + begivenhedsid;
    const begivenhedResponse = await GET(endpoint);

    let begivenhed = begivenhedResponse[0];
    let afvikler = begivenhedResponse[2][0];

    //hvad er afviklervagtens id
    let ep2 = '/getAfvikerVagtFraBegivenhed/' + begivenhedsid;
    let afviklervagt = await GET(ep2);
    console.log('dette er afviklervagten');
    // console.log(afviklervagt);
    let begivenhedHTML = '';

    const side = await fetch('/redigerevent.hbs');
    const begivenhedText = await side.text();
    const compiledTemplate = Handlebars.compile(begivenhedText);
    if (afvikler) {
        let dat = new Date(begivenhed.dato);
        let dat2 = dat.toISOString().substring(0, 10);
        let dat3 = new Date(begivenhed.tidSlut);
        let dat4 = dat3.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
        let dat5 = dat.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
        let starttidHours =dat5.substring(0,2);
        let starttidMinutes=dat5.substring(3);
        let sluttidHours =dat4.substring(0,2);
        let sluttidMinutes=dat4.substring(3);

        console.log(dat4, dat5);
        console.log(starttidHours +':'+starttidMinutes, sluttidHours+':'+sluttidMinutes);


        begivenhedHTML += compiledTemplate({
            navn: begivenhed.navn,
            dato: dat2,
            starttid : starttidHours +':'+starttidMinutes,
            sluttid: sluttidHours+':'+sluttidMinutes,
            beskrivelse: begivenhed.beskrivelse,
            afvikler: afvikler.fornavn + " " + afvikler.efternavn,
            antalfrivillige: begivenhed.antalFrivillige,
            logbog: begivenhed.logbog
        });
        begivenhedHTML += '<br>';
        begivenhedHTML += '<p>Afvikler</p>' + afvikler.fornavn + ' ' + afvikler.efternavn;
        begivenhedHTML += '<button class="fjernafvikler" id="'+ afviklervagt._id +'">Fjern afvikler</button><br><br>';
        begivenhedHTML += '<button class="gemændringer">Gem ændringer</button>';

        let div = document.getElementById('begivenhedcontent');
        div.innerHTML = begivenhedHTML;

        let fknap = document.getElementsByClassName('fjernafvikler');
        fknap[0].onclick = async function () {
            // console.log('prøver at fjerne vagt...............');
            let vagtid = fknap[0].id;
            let s = await POST('/fjernfrivilligfravagt', {vagtid: vagtid})
            if (s.ok) {
                cleartab();
                åbenRedigerEvent(begivenhed._id);
            }
        }

    } else {
        let dat = new Date(begivenhed.dato);
        let dat2 = dat.toISOString().substring(0, 10);
        let dat3 = new Date(begivenhed.tidSlut);

        let dat4 = dat3.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
        let dat5 = dat.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
        let starttidHours =dat5.substring(0,2);
        let starttidMinutes=dat5.substring(3);
        let sluttidHours =dat4.substring(0,2);
        let sluttidMinutes=dat4.substring(3);
        begivenhedHTML += compiledTemplate({
            navn: begivenhed.navn,
            dato: dat2,
            starttid: starttidHours +':'+starttidMinutes,
            sluttid: sluttidHours+':'+sluttidMinutes,
            beskrivelse: begivenhed.beskrivelse,
            antalfrivillige: begivenhed.antalFrivillige,
            logbog: begivenhed.logbog
        });

        //endpoint skal være /afviklere
        let afviklere = await GET('/afviklere');
        const tildelhbs = await fetch('/tildel.hbs');
        const tildelText = await tildelhbs.text();
        begivenhedHTML += tildelText;
        //id skal være vagtid?
        let knapHTML = 'Ingen afvikler   <button class="tildelknap" id="' + afviklervagt._id +'">Tilknyt afvikler</button><div id="1" class="modal"><div class="modal-content"> <span class="close">&times;</span>';

        let afviklerehbs = await fetch('/afvikler.hbs');
        let afviklereText = await afviklerehbs.text();
        const frivilligeTemplate = Handlebars.compile(afviklereText);
        //1 skal være vagtid
        knapHTML += '<select class="select" id="' + afviklervagt._id + '" size="10" style="width: 80%">';
        for (let afvikler of afviklere) {
            knapHTML += frivilligeTemplate({
                afviklerid: afvikler._id,
                navn: afvikler.fornavn + ' ' + afvikler.efternavn

            });
        }
        knapHTML += '</select><br>';
        //1 skal være vagtid
        knapHTML += '<button class="popupknap" id="' + afviklervagt._id + '">Tilknyt afvikler</button>';
        knapHTML += '</div></div><br><br>';
        begivenhedHTML += knapHTML;
        begivenhedHTML += '<button class="gemændringer">Gem ændringer</button>';

        let div = document.getElementById('begivenhedcontent');
        div.innerHTML = begivenhedHTML;

        var modals = document.getElementsByClassName("modal");

        // Get the button that opens the modal
        var btns = document.getElementsByClassName("tildelknap");

        // Get the <span> element that closes the modal
        var spans = document.getElementsByClassName("close");

        var tildelbtns = document.getElementsByClassName('popupknap');

        var selects = document.getElementsByClassName('select');

        for (let index = 0; index < btns.length; index++) {
            // When the user clicks the button, open the modal
            btns[index].onclick = function () {
                modals[index].style.display = "block";
            }

            tildelbtns[index].onclick = async function () {

                let vagtid = btns[index].id;
                let afviklerid = selects[index].value;
                let o = {vagtid: vagtid, frivilligid: afviklerid};
                // console.log(o);
                await POST('/adminTilfoejVagtTilBruger', o);

                //lukker vindue
                modals[index].style.display = "none";
                cleartab();
                åbenRedigerEvent(begivenhedsid);
            }
            spans[index].onclick = function () {
                modals[index].style.display = "none";
            }
        }
    }
    //mangler antal frivillige
    let knap = document.getElementsByClassName('gemændringer');
    knap[0].onclick = async function () {
        let navn = document.getElementById('begivenhednavn').value;
        let dato = document.getElementById('begivenheddato').valueAsDate;
        let starttid = document.getElementById('bRStartTid').valueAsDate;
        let sluttid = document.getElementById('bRSlutTid').valueAsDate;
        let beskrivelse = document.getElementById('begivenhedbeskrivelse').value;
        let antalfrivillige = document.getElementById('begivenhedantalfrivillige').value;
        if (navn.length == 0 || dato == null) {
            alert('du har enten ikke valgt 1 navn eller 1 dato');
        } else {
            let logbog = begivenhed.logbog;
            let o = {begivenhedsid, navn, dato, beskrivelse,logbog , antalfrivillige, starttid, sluttid };
            let checksvar = await GET('/checkForLedigeVagter/' + begivenhedsid + '/' + antalfrivillige);
            if (checksvar) {
                await PUT(o, '/redigerBegivenhed');
                cleartab();
                getBegivenhed(begivenhedsid);
            } else {
                alert('Det må du ikke');
            }
        }
    }

}

async function tilmeldBegivenhed(event) {
    let svar = confirm('Er du sikker på at du vil tilmelde dig begivenheden?');
    if (svar) {
        let begivenhedsid = event.target.id;
        let s = await POST('/tilmeldmigbegivenhed', {"id": begivenhedsid})
        if (s.ok) {
            // console.log('prøver at slette content');
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

async function logud () {
    window.location.replace('index.html');
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
        loadCalendar();

    }
        document.getElementById('begivenhedercontent')

    if (tabName == 'Mine vagter'){
        cleartab();
        getBrugersVagter();
    }
    if (tabName == 'Vagter til salg') {
        cleartab();
        getVagterTilSalg();
    }

    if (tabName == 'Log ud') {
        logud();
    }

}
