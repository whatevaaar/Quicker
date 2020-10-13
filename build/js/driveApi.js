const CLIENT_ID = '44639973669-tmdvdp0ugud488t3iarcbqn7ieuu9hlf.apps.googleusercontent.com';
const API_KEY = 'AIzaSyD8dArG_JyWaYnQgZ5HTVs_Wo75TfFCBzA';
const CORREO_ADMIN = "arturo.pega@extrategia.com";
const CORREO_ADMIN_FINANCIERO = "emiliano.hidalgo@extrategia.com";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive';

const signoutButton = document.getElementById('boton-signout');
const nombrePerfil = document.getElementById('nombre-perfil');
const imgPerfil = document.getElementById('img-perfil');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        signoutButton.onclick = handleSignoutClick;
    }, function (error) {
        alert("error");
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        actualizarUILogged();
    } else {
        redirigirALogin();
    }
}

function actualizarUILogged(resp) {
    var auth2 = gapi.auth2.getAuthInstance();
    var profile = auth2.currentUser.get().getBasicProfile();
    imgPerfil.src = profile.getImageUrl();
    nombrePerfil.innerText = profile.getName();
}

function actualizarUIAdmin() {

}
function actualizarUIAdminFinanciero() {

}

function esAdmin() {
    let auth2 = gapi.auth2.getAuthInstance();
    let profile = auth2.currentUser.get().getBasicProfile();
    return profile.getEmail() === CORREO_ADMIN;
}

function esAdminFinanciero() {
    let auth2 = gapi.auth2.getAuthInstance();
    let profile = auth2.currentUser.get().getBasicProfile();
    return profile.getEmail() === CORREO_ADMIN_FINANCIERO;
}

function redirigirALogin() {
    window.location.replace("login.html");
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    return false;
}
function redirigirALogin() {
    window.location.replace("login.html");
}
