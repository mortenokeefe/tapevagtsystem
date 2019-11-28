let brugerliste = document.getElementById("brugere");
let opretbutton = document.getElementById("opretbruger");
opretbutton.onclick = opretBruger;
setAllBrugere("/brugere");

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

