const tablaModal = document.getElementById("tabla-modal");
const parrafoTotal = document.getElementById("p-total");

const bodyTablaPDF = [
    ['Estrategia', 'Táctica', 'Costo', 'Cantidad', 'Total']
];

function generarPropuesta() {
    tablaModal.textContent = '';
    $('[name="input-cantidad-tacticas"]').each(function () {
        let input = $(this);
        if (input && input.val() > 0) {
            tablaModal.appendChild(crearHilera(input));
            bodyTablaPDF.push([input.attr('data-estrategia'), input.attr('data-nombre'), input.attr('data-costo'), input.val(), input.val() * input.attr('data-costo')]);
        }
    });
    $('#myModal').modal(show = true);
    actualizarTextoTotal();
}

function actualizarTextoTotal() {
    let suma = 0;
    $('.columna-total').each(function () {
        suma += Number($(this).html());
    });
    parrafoTotal.innerText = 'Total $' + suma;
}

function crearCeldaEliminar(propuesta) {
    let celda = document.createElement('td');
    let enlace = document.createElement('a');
    let icono = document.createElement('i');
    enlace.href = "#";
    enlace.onclick = function () {
        tablaModal.removeChild(document.getElementById(propuesta));
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
    let columnaEliminar = crearCeldaEliminar(propuesta.attr('data-nombre'));

    columnaEstrategia.innerText = propuesta.attr('data-estrategia');
    columnaTactica.innerText = propuesta.attr('data-nombre');
    columnaCosto.innerText = propuesta.attr('data-costo');
    columnaCantidad.innerText = propuesta.val();
    columnaTotal.innerText = propuesta.val() * propuesta.attr('data-costo');
    columnaTotal.classList.add('columna-total');

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
    crearPdf();
}

function crearPdf() {
    var docDefinition = {
        content: [
            {
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto'],

                    body: bodyTablaPDF.slice()
                }
            }
        ]
    };

    pdfMake.createPdf(docDefinition).download();
}