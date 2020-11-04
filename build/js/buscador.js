var propuestaSeleccionada = "";
const listaArchivos = [];

const tablaResultados = document.getElementById('cuerpo-tabla');
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
        alert("error", error);
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
    crearListaDePadres("");
    if (esAdmin())
        actualizarUIAdmin();
}

function crearListaDePadres(token) {
    let listaDeIdDeCarpetasPadre = [];
    let queryPadres = "";
    gapi.client.drive.files.list({
        'q': "'0AA9UZB_ARqnhUk9PVA' in parents and mimeType = 'application/vnd.google-apps.folder'",
        'corpora': "allDrives",
        'includeItemsFromAllDrives': true,
        'supportsAllDrives': true,
        'pageToken': token,
        'fields': "nextPageToken, files(id, name)"
    }).then(function (response) {
        let files = response.result.files;
        let nToken = response.result.nextPageToken;
        if (files && files.length > 0) {
            files.forEach(file => {
                if (listaDeIdDeCarpetasPadre.length > 100) {

                    queryPadres = queryPadres.slice(0, -4);
                    listaDeIdDeCarpetasPadre.forEach(id => {
                        queryPadres = queryPadres + "'" + id + "' in parents or ";
                    });
                    listFiles(queryPadres);
                    queryPadres = "";
                    listaDeIdDeCarpetasPadre = [];
                }
                listaDeIdDeCarpetasPadre.push(file.id);
            });
            console.log(files.length);
            listaDeIdDeCarpetasPadre.forEach(id => {
                queryPadres = queryPadres + "'" + id + "' in parents or ";
            });
            queryPadres = queryPadres.slice(0, -4);
            listFiles(queryPadres);
            queryPadres = "";
        }
        if (nToken) {
            listFiles(queryPadres);
            crearListaDePadres(nToken);
            queryPadres = "";
            listaDeIdDeCarpetasPadre = [];
        } else {
            configurarTabla();
            $('#loading').hide();
        }
    });
}

function actualizarUIAdmin() {
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

function listFiles(queryPadres) {
    if (queryPadres === "")
        return;
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
                listaArchivos.push(file);
            });
        } else $('.toast').toast('show');
    });
}

function configurarTabla() {
    listaArchivos.forEach(archivo => tablaResultados.appendChild(crearHilera(archivo)));
    $("#example1").DataTable({
        "responsive": true, "lengthChange": false, "autoWidth": false,
        "buttons": ["excel", "pdf", "print", "colvis"]
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
    checarBoxesDeEstrategias();
    establecerSelectedDeTacticas();
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

function establecerSelectedDeTacticas() {
    $('#select-tacticas').tokenize2().trigger('tokenize:clear');
    let temp = [];
    let query = firebase.database().ref("propuestas/" + propuestaSeleccionada + "/tacticas");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            temp.push(childData);
        });
        $("#select-tacticas > option").each(function () {
            if (temp.indexOf($(this).val()) !== -1)
                $(this).prop("selected", "selected");
        });

        $('.demo').tokenize2().trigger('tokenize:remap');
    }, function (error) {
    });
}

function limpiarFormulario(clave) {
    $("#div-" + clave + " input[type=checkbox]").each(function () {
        $(this).prop("checked", false);
    });
}

function checarBoxesDeEstrategias() {
    let temp = [];
    let query = firebase.database().ref("propuestas/" + propuestaSeleccionada + "/estrategias");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            temp.push(childData);
        });
        $("#div-estrategias input[type=checkbox]").each(function () {
            if (temp.indexOf($(this).val()) !== -1)
                $(this).prop("checked", true);
            else
                $(this).prop("checked", false);
        });

    }, function (error) {
    });
}

function crearElementoInput(nombre) {
    let input = document.createElement("input");
    input.classList.add("form-check-input");
    input.type = "checkbox";
    input.value = nombre;
    input.disabled = !esAdmin();
    return input;
}

function crearElementoLabel(nombre) {
    let label = document.createElement("label");
    label.setAttribute("for", nombre.replace(' ', ''));
    label.innerText = nombre;
    return label;
}

function crearBotonEliminar(sector, nombre) {
    let boton = document.createElement("button");
    let icono = document.createElement("i");
    icono.classList.add("fas");
    icono.classList.add("fa-minus");
    boton.classList.add("btn");
    boton.classList.add("btn-danger");
    boton.classList.add("btn-sm");
    boton.onclick = function () {
        firebase.database().ref(sector + '/' + nombre).remove();
    }
    boton.appendChild(icono);
    boton.hidden = !esAdmin();
    return boton;
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

function tacitcasSeleccionadasALista() {
    let temp = []
    $("#select-tacticas > option").each(function () {
        if ($(this).is(':selected'))
            temp.push($(this).val());
    });
    return temp;
}

function editarPropuesta() {
    let estrategias = estrategiasSeleccionadasALista();
    let tacticas = tacitcasSeleccionadasALista();
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

function estrategiasSeleccionadasALista() {
    let temp = []
    $("#div-estrategias input[type=checkbox]").each(function () {
        if ($(this).is(':checked'))
            temp.push($(this).val());
    });
    return temp;
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