function loadLinkStatistics() {
    createChart('week', '#2CAF78');
    createChart('month', '#9F6CE9');
    createChart('all-time', '#4575C8');
    createMap('all-time');
}

let createChart = function createChartForID(id, borderColor) {
    let container = $('#' + id + '-chart-container');

    // Spaces are encoded as underscores when they are sent from the server,
    // so they needed to be converted back when they are used.
    let replacedLabelsString = container.attr('data-labels').replace(/\_/g, ' ');
    let labels = JSON.parse(replacedLabelsString);
    let data = JSON.parse(container.attr('data-data'));

    let context = $('#' + id + '-chart')[0];
    let chart = new Chart(context, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Number of Views',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: borderColor,
                data,
                lineTension: 0,
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 12,
                    },
                }],
            },
            legend: {
                display: false,
            },
        },
    });
}

let createMap = function createWorldIPMap(id) {
    let container = $('#' + id + '-map-container');

    let datamap = new Datamap({
        element: container[0],
        projection: 'mercator',
        height: 350,
        fills: {
            defaultFill: '#2CAF78',
            bubble: '#4575C8',
        },
        geographyConfig: {
            highlightOnHover: false,
            popupOnHover: false,
        },
        bubblesConfig: {
            borderWidth: 0,
            highlightFillColor: '#9F6CE9',
            fillOpacity: 1,
        },
    });

    // Spaces are encoded as underscores when they are sent from the server,
    // so they needed to be converted back when they are used.
    let replacedPointsString = container.attr('data-points').replace(/\_/g, ' ');
    let points = JSON.parse(replacedPointsString);
    console.log(points);
    let bubbles = points.map((point) => {
        return {
            name: point.title,
            latitude: point.latitude,
            longitude: point.longitude,
            radius: 5,
            fillKey: 'bubble',
        };
    });

    datamap.bubbles(bubbles);
}
