const listaDeIdDeCarpetasPadre = [];
var queryPadres = "";
var propuestaSeleccionada = "";

const tablaResultados = document.getElementById('cuerpo-tabla');
const divEstrategias = document.getElementById('div-estrategias');
const divCrearEstrategias = document.getElementById('div-crear-estrategia');
const divCrearTacticas = document.getElementById('div-crear-tactica');
const divTacticas = document.getElementById('div-tacticas');
const botonEditar = document.getElementById('boton-editar');
const botonDescargar = document.getElementById('boton-descargar');
const inputNuevaEstrategia = document.getElementById('inputNuevaEstrategia');
const inputNuevaTactica = document.getElementById('inputNuevaTactica');
const inputMonto = document.getElementById('input-monto');
/**
 *  On load, called to load the auth2 library and API client library.
 */

window.onload = actualizarFormulario();
function actualizarFormulario() {
    conseguirEstrategias();
    conseguirTacticas();
}

function handleClientLoadLogin() {
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
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function (error) {
        alert("error");
    });
}
/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
    if (isSignedIn)
        actualizarUIBuscador();
    else
        redirigirALogin();
}

function transferir() {
    crearListaDePadres();
}

function actualizarUIBuscador() {
    actualizarUILogged();
    crearListaDePadres();
    if(esAdmin())
        actualizarUIAdmin();
}

function crearListaDePadres() {
    gapi.client.drive.files.list({
        'q': "'0AA9UZB_ARqnhUk9PVA' in parents and mimeType = 'application/vnd.google-apps.folder'",
        'corpora': "allDrives",
        'includeItemsFromAllDrives': true,
        'supportsAllDrives': true,
        'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            files.forEach(file => {
                listaDeIdDeCarpetasPadre.push(file.id);
            });
            listaDeIdDeCarpetasPadre.forEach(id => {
                queryPadres = queryPadres + "'" + id + "' in parents or ";
            });
            queryPadres = queryPadres.slice(0, -4);
            listFiles("");
        }
    });
}

function actualizarUIAdmin(){
    botonEditar.hidden = false;
    inputMonto.disabled = false;
    divCrearEstrategias.hidden = false;
    divCrearTacticas.hidden = false;
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function listFiles(terminos) {
    limpiarTabla();
    let query = ["mimeType != 'application/vnd.google-apps.folder'",
        "and",
        "trashed = false",
        "and",
        "(" + queryPadres + ")",
    ].join(' ');
    gapi.client.drive.files.list({
        'q': query,
        'corpora': 'allDrives',
        'includeItemsFromAllDrives': true,
        'supportsAllDrives': true,
        'fields': "nextPageToken, files(id, name, webContentLink, parents)"
    }).then(function (response) {
        var files = response.result.files;
        if (files && files.length > 0) {
            files.forEach(function (file, i) {
                tablaResultados.appendChild(crearHilera(file));
            });
            configurarTabla();
        }
        else $('.toast').toast('show');
    });
}

function configurarTabla() {
    $("#example1").DataTable({
        "responsive": true, "lengthChange": false, "autoWidth": false,
        "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');
}

function limpiarTabla() {
    while (tablaResultados.lastElementChild)
        tablaResultados.removeChild(tablaResultados.lastElementChild);
}

function crearHilera(archivo) {
    let hilera = document.createElement('tr');
    let columnaCliente = document.createElement('td');
    let columnaPropuesta = document.createElement('td');
    let columnaIndustria = document.createElement('td');
    let columnaFecha = document.createElement('td');

    columnaCliente.innerText = regresarNombreDeCliente(archivo.name);
    columnaPropuesta.innerText = regresarPropuesta(archivo.name);
    columnaIndustria.innerText = regresarIndustria(archivo.name);
    columnaFecha.innerText = regresarFecha(archivo.name);
    columnaCliente.classList.add("sorting_1");
    columnaCliente.classList.add("dtr-control");

    hilera.appendChild(columnaCliente);
    hilera.appendChild(columnaPropuesta);
    hilera.appendChild(columnaIndustria);
    hilera.appendChild(columnaFecha);
    hilera.setAttribute("role", "row");
    hilera.onclick = function () {
        let nombreSinExtension = regresarNombreSinExtension(archivo.name);
        $(".selected").removeClass("selected");
        hilera.classList.add("selected");
        propuestaSeleccionada = nombreSinExtension;
        botonDescargar.href = archivo.webContentLink;
        conseguirDetallesDePropuesta(nombreSinExtension);
    }
    return hilera;
}

function conseguirDetallesDePropuesta() {
    checarBoxes("estrategias");
    checarBoxes("tacticas");
    let query = firebase.database().ref("propuestas/" + propuestaSeleccionada);
    query.on("value", function (snapshot) {
        if (!snapshot.exists()) {
            inputMonto.value = 0;
            limpiarFormulario();
            return;
        }
        let propuesta = snapshot.val();
        inputMonto.value = propuesta.monto;
    }, function (error) {
    });
}

function limpiarFormulario() {
    limpiarCheckBox("estrategias");
    limpiarCheckBox("tacticas");
}

function limpiarFormulario(clave) {
    $("#div-" + clave + " input[type=checkbox]").each(function () {
        $(this).prop("checked", false);
    });
}
function checarBoxes(clave) {
    let temp = [];
    let query = firebase.database().ref("propuestas/" + propuestaSeleccionada + "/" + clave);
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            temp.push(childData);
            console.log(childData);
        });
        $("#div-" + clave + " input[type=checkbox]").each(function () {
            if (temp.indexOf($(this).val()) != -1)
                $(this).prop("checked", true);
            else
                $(this).prop("checked", false);
        });

    }, function (error) {
    });
}

function conseguirEstrategias() {
    let query = firebase.database().ref("estrategias");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            let div = document.createElement("div");
            div.classList.add("form-check");
            let input = document.createElement("input");
            input.classList.add("form-check-input");
            input.type = "checkbox";
            input.id = "checkboxEstrategia" + childData.nombre.replace(' ', '');
            input.value = childData.nombre;
            input.disabled = !esAdmin();
            let label = document.createElement("label");
            label.setAttribute("for", childData.nombre.replace(' ', ''));
            label.innerText = childData.nombre;
            div.appendChild(input);
            div.appendChild(label);
            divEstrategias.appendChild(div);
        });
    }, function (error) {
    });
}

function conseguirTacticas() {
    let query = firebase.database().ref("tacticas");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            let div = document.createElement("div");
            div.classList.add("form-check");
            let input = document.createElement("input");
            input.classList.add("form-check-input");
            input.type = "checkbox";
            input.id = "checkboxTactica" + childData.nombre.replace(' ', '');
            input.value = childData.nombre;
            input.disabled = !esAdmin();
            let label = document.createElement("label");
            label.setAttribute("for", childData.nombre.replace(' ', ''));
            label.innerText = childData.nombre;
            div.appendChild(input);
            div.appendChild(label);
            divTacticas.appendChild(div);
        });
    }, function (error) {
    });
}

function crearEstrategia() {
    let nombre = inputNuevaEstrategia.value;
    firebase.database().ref('estrategias/' + nombre).set({
        nombre: nombre,
    }, function (error) {
        if (error)
            console.log(error);
    });
}

function editarPropuesta() {
    let estrategias = checkboxAListaEstrategias();
    let tacticas = checkboxAListaTacticas();
    let monto = inputMonto.value;
    firebase.database().ref('propuestas/' + propuestaSeleccionada).set({
        nombre: propuestaSeleccionada,
        estrategias: estrategias,
        tacticas: tacticas,
        monto: monto
    }, function (error) {
        if (error)
            console.log(error);
    });
}

function checkboxAListaTacticas() {
    let temp = []
    $("#div-tacticas input[type=checkbox]").each(function () {
        if ($(this).is(':checked'))
            temp.push($(this).val());
    });
    return temp;
}
function checkboxAListaEstrategias() {
    let temp = []
    $("#div-estrategias input[type=checkbox]").each(function () {
        if ($(this).is(':checked'))
            temp.push($(this).val());
    });
    return temp;
}

function crearTactica() {
    let nombre = inputNuevaTactica.value;
    firebase.database().ref('tacticas/' + nombre).set({
        nombre: nombre,
    }, function (error) {
        if (error)
            console.log(error);
    });
}
function editarSeleccionado() {
    let row = $(".selected").removeClass("selected");
}

function regresarNombreDeCliente(nombre) {
    let arr = nombre.split('-')
    return arr[0].replaceAll('_', ' ');
}

function regresarPropuesta(nombre) {
    let arr = nombre.split('-')
    if (!arr[1])
        return "";
    return arr[1].replaceAll('_', ' ');
}

function regresarIndustria(nombre) {
    let arr = nombre.split('-')
    if (!arr[2])
        return "";
    return arr[2].replaceAll('_', ' ');
}

function regresarFecha(nombre) {
    let arr = nombre.split('-')
    if (!arr[3])
        return "";
    return arr[3].slice(0, arr[3].indexOf('.')).replaceAll('_', ' ');
}

function regresarNombreSinExtension(nombre) {
    return nombre.slice(0, nombre.indexOf('.'));
}