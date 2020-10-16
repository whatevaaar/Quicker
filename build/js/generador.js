const tablaModal = document.getElementById("tabla-modal");
const tablaModalPadre = document.getElementById("tabla-modal-padre");
const parrafoTotal = document.getElementById("p-total");


function generarPropuesta() {
    tablaModal.textContent = '';
    $('[name="input-cantidad-tacticas"]').each(function () {
        let input = $(this);
        if (input && input.val() > 0)
            tablaModal.appendChild(crearHilera(input));
    });
    actualizarTextoTotal();
    $('#myModal').modal(show = true);
}

function actualizarTextoTotal() {
    let suma = 0;
    $('[name="columna-total"]').each(function () {
        suma += $(this).innerText();
    });
    parrafoTotal.innerText = 'Total $' + suma;
}

function crearCeldaEliminar(propuesta) {
    let celda = document.createElement('td');
    let enlace = document.createElement('a');
    let icono = document.createElement('i');
    enlace.href = "#";
    enlace.onclick = function () {
        eliminarDeCarrito(idProducto);
    }
    icono.classList.add("far");
    icono.classList.add("fa-window-close");
    enlace.appendChild(icono);
    celda.appendChild(enlace);
    return celda;
}

function crearHilera(propuesta) {
    let hilera = document.createElement('tr');
    let columnaEstrategia = document.createElement('td');
    let columnaTactica = document.createElement('td');
    let columnaCantidad = document.createElement('td');
    let columnaCosto = document.createElement('td');
    let columnaTotal = document.createElement('td');
    let columnaEliminar = crearCeldaEliminar(propuesta);

    columnaEstrategia.innerText = propuesta.attr('data-estrategia');
    columnaTactica.innerText = propuesta.attr('data-nombre');
    columnaCosto.innerText = propuesta.attr('data-costo');
    columnaCantidad.innerText = propuesta.val();
    columnaTotal.innerText = propuesta.val() * propuesta.attr('data-costo');
    columnaTotal.name = 'columna-total';

    hilera.appendChild(columnaEstrategia);
    hilera.appendChild(columnaTactica);
    hilera.appendChild(columnaCosto);
    hilera.appendChild(columnaCantidad);
    hilera.appendChild(columnaTotal);
    hilera.appendChild(columnaEliminar);
    hilera.id = columnaTactica.innerText;
    hilera.setAttribute("scope", "row");
    return hilera;

}

function generar() {

    pdfMake.createPdf(createTableDoc()).open();
}

function createTableDoc() {
    var wdths= [];
    for (var i = 0; i < tablaModalPadre.rows[0].cells.length; i++) {
        var cell = tablaModalPadre.rows[0].cells[i];
        wdths[i] = (cell.style.width != "" ? cell.style.width : cell.style.offsetWidth); //if the cell's style width is not set, get its' actual width
    }

    var bdy;
    for (var y = 0; y < tablaModalPadre.rows.length; y++)
        for (var x = 0; x < tablaModalPadre.rows[y].cells.length; x++)
            bdy[y][x] = tablaModalPadre.rows[y].cells[x].innerHTML;
    var docDef = {content: [{table: {headerRows: 1, widths: wdths, body: bdy}}]};
    return docDef;
}