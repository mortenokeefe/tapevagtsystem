
function openPane(evt, cityName) {
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
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";

    if (cityName == 'Frivillige') {
        getBrugere();
    }
}

document.getElementById("defaultOpen").click();




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