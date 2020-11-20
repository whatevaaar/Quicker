window.onload = obtenerDatos();

let industriasConNumeroDeAceptacion = [];
let clientesConRetornoAcumulado = [];
let clientesConRetornoDesglozado = [];
let clientesConNumeroDeAceptacion = [];
let detonantesConNumeroDeAceptacion = [];

let MAX_DATOS_MONTO = 5;

function actualizarListaIndustria(industriaPropuesta, estado) {
    let resultado = industriasConNumeroDeAceptacion.find(({industria}) => industria === industriaPropuesta);
    if (resultado) {
        if (estado === "Aceptado")
            resultado.aceptado += 1;
        else if (estado === "Rechazado")
            resultado.rechazado += 1;
        else if (estado === "Pendiente")
            resultado.pendiente += 1;
    } else {
        industriasConNumeroDeAceptacion.push({
            industria: industriaPropuesta,
            aceptado: estado === "Aceptado" ? 1 : 0,
            rechazado: estado === "Rechazado" ? 1 : 0,
            pendiente: estado === "Pendiente" ? 1 : 0
        })
    }

}

function actualizarListaCliente(clientePropuesta, estado) {
    let resultado = clientesConNumeroDeAceptacion.find(({cliente}) => cliente === clientePropuesta);
    if (resultado) {
        if (estado === "Aceptado")
            resultado.aceptado += 1;
        else if (estado === "Rechazado")
            resultado.rechazado += 1;
        else if (estado === "Pendiente")
            resultado.pendiente += 1;
    } else {
        clientesConNumeroDeAceptacion.push({
            cliente: clientePropuesta,
            aceptado: estado === "Aceptado" ? 1 : 0,
            rechazado: estado === "Rechazado" ? 1 : 0,
            pendiente: estado === "Pendiente" ? 1 : 0
        })
    }

}

function actualizarListaDetonantes(detonantePropuesta, estado) {
    let resultado = detonantesConNumeroDeAceptacion.find(({detonante}) => detonante === detonantePropuesta);
    if (resultado) {
        if (estado === "Aceptado")
            resultado.aceptado += 1;
        else if (estado === "Rechazado")
            resultado.rechazado += 1;
    } else {
        detonantesConNumeroDeAceptacion.push({
            detonante: detonantePropuesta,
            aceptado: estado === "Aceptado" ? 1 : 0,
            rechazado: estado === "Rechazado" ? 1 : 0,
        })
    }

}

function actualizarListaMonto(clienteP, monto, estado) {
    let resultado = clientesConRetornoAcumulado.find(({cliente}) => cliente === clienteP);
    if (estado != "Aceptado" || monto < 0)
        return;
    clientesConRetornoDesglozado.push({
        cliente: clienteP,
        monto: monto
    })
    if (resultado)
        resultado.monto += monto;
    else{
        clientesConRetornoAcumulado.push({
            cliente: clienteP,
            monto: monto
        })
    }

}

function obtenerDatos() {
    let query = firebase.database().ref("propuestas/");
    query.on("value", function (snapshot) {
        if (snapshot.empty)
            return;
        snapshot.forEach(function (childSnapshot) {
            let childData = childSnapshot.val();
            if (!childSnapshot.child('estado').exists() || !childSnapshot.child('detonante').exists())
                return;
            let cliente = regresarNombreDeCliente(childData.nombre);
            let industria = regresarIndustria(childData.nombre);
            let fecha = regresarFecha(childData.nombre);
            actualizarListaIndustria(industria, childData.estado);
            actualizarListaCliente(cliente, childData.estado);
            actualizarListaDetonantes(childData.detonante, childData.estado);
            actualizarListaMonto(cliente, childData.monto, childData.estado);
            clientesConRetornoAcumulado.sort((a, b) => b.monto - a.monto);
            clientesConRetornoDesglozado.sort((a, b) => b.monto - a.monto);
        });
        generarGraficas();
    }, function (error) {
    });
}

function generarGraficas() {

    $(function () {
        /* ChartJS
         * -------
         * Here we will create a few charts using ChartJS
         */

        //--------------
        //- AREA CHART -
        //--------------

        // Get context with jQuery - using jQuery's .get() method.
        var areaChartCanvas = $('#areaChart').get(0).getContext('2d')

        var areaChartData = {
            labels: clientesConRetornoDesglozado.slice(0, MAX_DATOS_MONTO).map(i => i.cliente),
            datasets: [
                {
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data:clientesConRetornoDesglozado.slice(0, MAX_DATOS_MONTO).map(i => i.monto)
                }
            ]
        }

        var areaChartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false,
                    }
                }],
                yAxes: [{
                    gridLines: {
                        display: false,
                    }
                }]
            }
        }

        // This will get the first returned node in the jQuery collection.
        var areaChart = new Chart(areaChartCanvas, {
            type: 'bar',
            data: areaChartData,
            options: areaChartOptions
        })

        //-------------
        //- LINE CHART -
        //--------------
        var lineChartCanvas = $('#lineChart').get(0).getContext('2d')
        var lineChartOptions = $.extend(true, {}, areaChartOptions)
        var lineChartData = {
            labels: clientesConRetornoAcumulado.slice(0, MAX_DATOS_MONTO).map(i => i.cliente),
            datasets: [
                {
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data:clientesConRetornoAcumulado.slice(0, MAX_DATOS_MONTO).map(i => i.monto)
                }
            ]
        }
        lineChartData.datasets[0].fill = false;
        lineChartOptions.datasetFill = false

        var lineChart = new Chart(lineChartCanvas, {
            type: 'polarArea',
            data: lineChartData,
            options: lineChartOptions
        })

        //-------------
        //- DONUT CHART -
        //-------------
        // Get context with jQuery - using jQuery's .get() method.
        var donutChartCanvas = $('#donutChart').get(0).getContext('2d')
        var donutData = {
            labels: detonantesConNumeroDeAceptacion.filter(i => i.aceptado > 0).map(i => i.detonante),
            datasets: [
                {
                    data: detonantesConNumeroDeAceptacion.filter(i => i.aceptado > 0).map(i => i.aceptado),
                    backgroundColor: ['#f56954', '#00a65a', '#f39c12', '#00c0ef', '#3c8dbc', '#d2d6de'],
                }
            ]
        }
        var donutOptions = {
            maintainAspectRatio: false,
            responsive: true,
        }
        //Create pie or douhnut chart
        // You can switch between pie and douhnut using the method below.
        var donutChart = new Chart(donutChartCanvas, {
            type: 'doughnut',
            data: donutData,
            options: donutOptions
        })

        //-------------
        //- PIE CHART -
        //-------------
        // Get context with jQuery - using jQuery's .get() method.
        var pieChartCanvas = $('#pieChart').get(0).getContext('2d')
        var pieData = {
            labels: industriasConNumeroDeAceptacion.map(i => i.industria),
            datasets: [
                {
                    data: industriasConNumeroDeAceptacion.map(i => i.rechazado),
                    backgroundColor: ['#f56954', '#00a65a', '#f39c12', '#00c0ef', '#3c8dbc', '#d2d6de'],
                }
            ]
        };
        var pieOptions = {
            maintainAspectRatio: false,
            responsive: true,
        }
        //Create pie or douhnut chart
        // You can switch between pie and douhnut using the method below.
        var pieChart = new Chart(pieChartCanvas, {
            type: 'pie',
            data: pieData,
            options: pieOptions
        })

        //-------------
        //- BAR CHART -
        //-------------
        var barChartCanvas = $('#barChart').get(0).getContext('2d')
        var barChartData = {
            labels: industriasConNumeroDeAceptacion.map(i => i.industria),
            datasets: [
                {
                    label: 'Aceptado',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: industriasConNumeroDeAceptacion.map(i => i.aceptado)
                },
                {
                    label: 'Rechazado',
                    backgroundColor: 'rgba(210, 214, 222, 1)',
                    borderColor: 'rgba(210, 214, 222, 1)',
                    pointRadius: false,
                    pointColor: 'rgba(210, 214, 222, 1)',
                    pointStrokeColor: '#c1c7d1',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(220,220,220,1)',
                    data: industriasConNumeroDeAceptacion.map(i => i.rechazado)
                },
            ]
        }

        var barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            datasetFill: false
        }

        var barChart = new Chart(barChartCanvas, {
            type: 'bar',
            data: barChartData,
            options: barChartOptions
        })

        //---------------------
        //- STACKED BAR CHART -
        //---------------------
        var stackedBarChartCanvas = $('#stackedBarChart').get(0).getContext('2d')
        var stackedBarChartData = {
            labels: clientesConNumeroDeAceptacion.map(i => i.cliente),
            datasets: [
                {
                    label: 'Aceptado',
                    backgroundColor: 'rgba(60,141,188,0.9)',
                    borderColor: 'rgba(60,141,188,0.8)',
                    pointRadius: false,
                    pointColor: '#3b8bba',
                    pointStrokeColor: 'rgba(60,141,188,1)',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(60,141,188,1)',
                    data: clientesConNumeroDeAceptacion.map(i => i.aceptado)
                },
                {
                    label: 'Rechazado',
                    backgroundColor: 'rgba(210, 214, 222, 1)',
                    borderColor: 'rgba(210, 214, 222, 1)',
                    pointRadius: false,
                    pointColor: 'rgba(210, 214, 222, 1)',
                    pointStrokeColor: '#c1c7d1',
                    pointHighlightFill: '#fff',
                    pointHighlightStroke: 'rgba(220,220,220,1)',
                    data: clientesConNumeroDeAceptacion.map(i => i.rechazado)
                },
            ]
        }

        var stackedBarChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }

        var stackedBarChart = new Chart(stackedBarChartCanvas, {
            type: 'bar',
            data: stackedBarChartData,
            options: stackedBarChartOptions
        })
    })
}