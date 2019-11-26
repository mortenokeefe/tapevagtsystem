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
            window.location.href = "/session";
        }
        else {
            password.value = "";
            fejl.innerHTML = "Forkert password!";
        }
    } catch (e) {
        fejl.innerHTML = e.name + ": " + e.message;
    }
};

