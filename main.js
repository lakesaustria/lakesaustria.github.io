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
    zoom: 7,
    layers: [
        baselayers.grau
    ]
});


let overlays = {
    stations: L.featureGroup(),
    waterTemperature: L.featureGroup(),
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
    "Wassertemperatur": overlays.waterTemperature,
}, {
    collapsed: false
}).addTo(map);


//Daten aus JSON File auslesen und auf map darstellen




//Marker auf Karte einzeichnen, Struktur Daten Bundeslaender-Array aus Bundesland-Objekt welches Name Key-Value Pair und Gewaesser-Array aus Badegewasser-Objekten trägt; letzteres enthaelt Infos zum Badegewaesser
//zwei Loops, um durch die Objekte zu loopen, quasi für jedes Bundesland soll für jedes Badegewässer die Seestation bzw. Koordinate angegebn werden
//vielleicht geht es eleganter, die zwei for-loops funktionieren aber
let dummyUrl = 'data/badegewaesser_db.json';
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

                let waterbodyQuality = lakestation.MESSWERTE[0]['A'];

                marker.bindPopup(`
                <h3>${lakestation.BADEGEWAESSERNAME}</h3>
                <ul>
                    <li>Aktuellstes Messdatum: ${lakestation.MESSWERTE[0]['D']}</li>
                    <li>Wassertemperatur: ${lakestation.MESSWERTE[0]['W']} °C</li>
                    <li>Sichttiefe: ${lakestation.MESSWERTE[0]['S']} m</li>
                    <li>Badegewässerqualität: ${waterQualityMonitoring(waterbodyQuality)}</li>
                </ul>`)

                //console.log(waterMonitoring(lakestation.MESSWERTE));


                marker.addTo(overlays.stations);
                //console.log("Data: ", lakestation.MESSWERTE[0]['W']);
                //console.log("Name: ", lakestation.BADEGEWAESSERNAME);
                if (lakestation.MESSWERTE[0]['W']) {
                    let marker = newLabel(lakestation, {
                        value: lakestation.MESSWERTE[0]['W'].toFixed(0),
                        colors: COLORS.temperature,
                        station: lakestation.BADEGEWAESSERNAME
                    });
                    marker.addTo(overlays.waterTemperature); 
                } 
            }

        }

    })

let getColor = (value, colorRamp) => {
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";
};

let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors)
    let label = L.divIcon({
        html: `<div style="background-color:${color}">${options.value}</div>`,
        className: "text-label"
    })
    let marker = L.marker([coords['LATITUDE'], coords['LONGITUDE']], {
        icon: label,
        title: `${options.station}`
    });
    return marker;
};


//Function fuer Loop durch Messwerte, gibt aktuellsten Wert für Datum zurueck weil anfangs Schwierigkeiten mit Auslese von Messwerten, nicht notwendig. Funktionert aber
let waterMonitoring = (waterData) => {
    for (waterDataSingle of waterData) {
        return waterDataSingle.D;
    }
}
//Function fuer sprechende Ausgabe der Badegewässerqualität
let waterQualityMonitoring = (waterQuality) => {
    if (waterQuality == 1) {
        return "Ausgezeichnet";
    } else if (waterQuality == 2) {
        return "Gut";
    } else if (waterQuality == 3) {
        return "Mangelhaft";
    } else if (waterQuality == 4) {
        return "Vom Baden wird abgeraten"
    } else {
        return "?"
    }
}



//Minimap Plugin
var miniMap = new L.Control.MiniMap(L.tileLayer.provider("BasemapAT.basemap"), {
    toggleDisplay: true,
    minimized: false,
}).addTo(map);

//Massstab fuer Karte
let layerScale = L.control.scale({
    maxwidth: 800,
    metric: true,
    imperial: false,
}).addTo(map);