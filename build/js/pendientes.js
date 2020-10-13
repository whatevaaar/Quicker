const listaDeDetonantes = []
window.onload = conseguirDetonantes();

const tablaResultados = document.getElementById('cuerpo-tabla');
const inputNuevoDetonante = document.getElementById('inputNuevoDetonante');

function conseguirDetonantes() {
    let query = firebase.database().ref("detonantes");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            listaDeDetonantes.push(childData.nombre);
        });
        conseguirPropuestas();
    }, function (error) {
    });
}

function conseguirPropuestas() {
    let query = firebase.database().ref("propuestas");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            tablaResultados.appendChild(crearHilera(childData));
            actualizarDatosHilera(childData.nombre);
        });
        configurarTabla();
    }, function (error) {
    });
}
function crearDetonante() {
    let detonante = inputNuevoDetonante.value;
    firebase.database().ref('detonantes/' + detonante).set({
        nombre: detonante,
    }, function (error) {
        if (error)
            console.log(error);
    });
}

function crearHilera(archivo) {
    let hilera = document.createElement('tr');
    let columnaCliente = document.createElement('td');
    let columnaPropuesta = document.createElement('td');
    let columnaFecha = document.createElement('td');
    let columnaDetonante = document.createElement('td');
    let columnaEstado = document.createElement('td');
    columnaEstado.append(crearRadiosEstado("Aceptado", archivo.nombre));
    columnaEstado.append(crearRadiosEstado("Rechazado", archivo.nombre));
    columnaEstado.append(crearRadiosEstado("Proceso", archivo.nombre));

    let selectDetonante = document.createElement('select');
    selectDetonante.name = 'select-' + archivo.nombre;
    selectDetonante.id = 'select-' + archivo.nombre;
    selectDetonante.classList.add("form-control");
    listaDeDetonantes.forEach(function (detonante) {
        let opcion = document.createElement('option');
        opcion.innerText = detonante;
        opcion.value = detonante;
        selectDetonante.appendChild(opcion);
    });
    selectDetonante.onchange = function () {
        actualizarPropuesta(archivo.nombre);
    };
    columnaDetonante.appendChild(selectDetonante);
    columnaCliente.innerText = regresarNombreDeCliente(archivo.nombre);
    columnaPropuesta.innerText = regresarPropuesta(archivo.nombre);
    columnaFecha.innerText = regresarFecha(archivo.nombre);
    columnaCliente.classList.add("sorting_1");
    columnaCliente.classList.add("dtr-control");

    hilera.appendChild(columnaCliente);
    hilera.appendChild(columnaPropuesta);
    hilera.appendChild(columnaFecha);
    hilera.appendChild(columnaDetonante);
    hilera.appendChild(columnaEstado);
    hilera.setAttribute("role", "row");
    hilera.onclick = function () {
    }
    return hilera;
}

function actualizarDatosHilera(nombre) {
    let query = firebase.database().ref("propuestas/" + nombre);
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        let propuesta = snapshot.val();
        $('#radio-estado-' + propuesta.estado + '-' + nombre).prop("checked", true);
        $('#select-' + nombre).val(propuesta.detonante);

    }, function (error) {
    });

}

function actualizarPropuesta(nombre) {
    let radioEstado = $('input[name="radio-estado-' + nombre + '"]:checked').val();
    let checkboxDetonante = $('select[name="select-' + nombre + '"] option').filter(':selected').val();
    let updates = {};
    updates['/propuestas/' + nombre + '/detonante'] = checkboxDetonante;
    updates['/propuestas/' + nombre + '/estado'] = radioEstado;
    return firebase.database().ref().update(updates);
}

function crearRadiosEstado(clave, nombre) {
    let div = document.createElement('div');
    div.classList.add("form-check")
    let input = document.createElement('input');
    input.type = "radio";
    input.name = "radio-estado-" + nombre;
    input.id = "radio-estado-" + clave + '-' + nombre;
    input.value = clave;
    let label = document.createElement('label');
    label.setAttribute("for", input.id);
    label.innerText = clave;
    input.addEventListener('change', function () {
        actualizarPropuesta(nombre);
    });
    div.appendChild(input);
    div.appendChild(label);
    return div;
}

function configurarTabla() {
    $("#example1").DataTable({
        "responsive": true, "lengthChange": false, "autoWidth": false,
        "buttons": ["copy", "csv", "excel", "pdf", "print", "colvis"]
    }).buttons().container().appendTo('#example1_wrapper .col-md-6:eq(0)');
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

function regresarFecha(nombre) {
    let arr = nombre.split('-')
    if (!arr[3])
        return "";
    return arr[3].slice(0, arr[3].indexOf('.')).replaceAll('_', ' ');
}