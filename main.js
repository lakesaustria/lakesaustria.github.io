//basemap Hintergruende definieren; eigentlich sollte nur ein Layer bei map instantiation geladen werden, die anderen sollten in der layercontrol stehen

let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Karte initialisieren und auf Oesterreichs Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true,
    center: [47.59397, 14.12456],
    zoom: 8,
    layers: [
        baselayers.grau
    ]
});

let layerScale = L.control.scale({
    maxwidth: 800,
    metric: true,
    imperial: false,
}).addTo(map);

let overlays = {
    stations: L.featureGroup(),
};

let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Messstation Seen Österreich": overlays.stations,
}, {
    collapsed: false
}).addTo(map);

//Versuch über Function, die WasserStationen einzeichnet, funktioniert nicht    
let drawWaterStation = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>${feature.BADEGEWAESSER.BADEGEWAESSERNAME}</strong>
                <hr>
                Station: ${feature.BADEGEWAESSER.BADEGEWAESSERNAME}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng)
        }
    }).addTo(overlays.stations);
}
//Daten aus JSON File auslesen und auf map darstellen

//for (let config of BADEGEWAESSER) {
//console.log("Config: ", config.data);

let dummyUrl = 'data/badegewaesser_db.json';

//Marker auf Karte einzeichnen, Struktur Daten Bundeslaender-Array aus Bundesland-Objekt welches Name Key-Value Pair und Gewaesser-Array aus Badegewasser-Objekten trägt; letzteres enthaelt Infos zum Badegewaesser
//zwei Loops, um durch die Objekte zu loopen, quasi für jedes Bundesland soll für jedes Badegewässer die Seestation bzw. Koordinate angegebn werden
//vielleicht geht es eleganter, die zwei for-loops funktionieren aber
fetch(dummyUrl)
    .then(response => response.json())
    .then(json => {
       // console.log("Data: ", json.BUNDESLAENDER);
        for (station of json.BUNDESLAENDER) {
            //console.log("Badegewässer: ", station.BADEGEWAESSER);
            for (lakestation of station.BADEGEWAESSER) {
                //console.log("Gewässername: ", lakestation.BADEGEWAESSERNAME);
                let marker = L.marker([
                    lakestation.LATITUDE,
                    lakestation.LONGITUDE,
                ]);
                marker.bindPopup(`
                <h3>${lakestation.BADEGEWAESSERNAME}</h3>
                <ul>
                    <li>Akuellstes Messdatum: ${waterMonitoring(lakestation.MESSWERTE)}</li>
                    <li>Versuch Messdatum: ${lakestation.MESSWERTE[0]['D']}</li>
                </ul>`)
                //console.log(waterMonitoring(lakestation.MESSWERTE));


                marker.addTo(overlays.stations);
            }

        }

    })

let waterMonitoring = (waterData) => {
    for (waterDataSingle of waterData) {
        return waterDataSingle.D; 
    }
}

/*
fetch(awsUrl)
    .then(response => response.json())
    .then(json => {
        //  console.log('Daten konvertiert: ', json);
        for (station of json.features) {
            //console.log('Station: ', station);
            //https://leafletjs.com/reference-1.7.1.html#marker
            let marker = L.marker([
                station.BUNDESLAENDER.BADEGEWAESSER[0].LATITUDE,
                station.BUNDESLAENDER.BADEGEWAESSER[0].LONGITUDE
            ]);

            marker.bindPopup(`
            <h3>${station.BUNDESLAENDER.BADEGEWAESSER[0].BADEGEWAESSERNAME}</h3>`);
            marker.addTo(overlays.stations);

        }});
        */