let sumaTotal = 0;
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
            let costoConFormato = parseFloat(input.attr('data-costo')).toLocaleString();
            let totalConFormato = (input.val() * input.attr('data-costo')).toLocaleString();
            bodyTablaPDF.push([input.attr('data-estrategia'), input.attr('data-nombre'), costoConFormato, input.val(), totalConFormato]);
        }
    });
    $('#myModal').modal(show = true);
    actualizarTextoTotal();
}

function actualizarTextoTotal() {
    let suma = 0;
    $('.columna-total').each(function () {
        let valorEnColumna = parseFloat($(this).html().replace(/,/g, ''));
        suma += valorEnColumna;
    });
    sumaTotal = suma;
    parrafoTotal.innerText = 'Total $' + suma.toLocaleString();
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
    columnaCosto.innerText = parseInt(propuesta.attr('data-costo')).toLocaleString();
    columnaCantidad.innerText = propuesta.val();
    columnaTotal.innerText = (propuesta.val() * propuesta.attr('data-costo')).toLocaleString();
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
    let urlHeader = imgAUrl('img-header');
    let urlFooter = imgAUrl('img-footer');
    var docDefinition = {
        header: {
                    // usually you would use a dataUri instead of the name for client-side printing
                    // sampleImage.jpg however works inside playground so you can play with it
            image: urlHeader,
            fit: [200, 300],
            margin: [15, 15]
        },
        footer: {
            image: urlFooter,
            margin: [15, 0, 15],
            fit: [200, 300]
        },
        content: [
            {
                margin: [0, 35],
                text: 'Propuesta de Comunicación',
                style: 'header',
                alignment: 'center'
            },
            {
                margin: [15, 35, 15, 15],
                layout: 'lightHorizontalLines', // optional
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: ['auto', 'auto', 'auto', 'auto', 'auto'],

                    body: bodyTablaPDF.slice()
                }
            },
            {

                margin: [0, 35],
                text: 'Total: $' + sumaTotal.toLocaleString(),
                style: 'header',
                alignment: 'center'
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'justify'
            }
        }
    };

    pdfMake.createPdf(docDefinition).download();
}

function imgAUrl(clave){
    let imgToExport = document.getElementById(clave);
    let canvas = document.createElement('canvas');
    canvas.width = imgToExport.width;
    canvas.height = imgToExport.height;
    canvas.getContext('2d').drawImage(imgToExport, 0, 0);
    return canvas.toDataURL('image/png');
}