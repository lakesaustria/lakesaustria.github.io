let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let overlays = {
    bathingSpot: L.featureGroup(),
    bbqArea: L.markerClusterGroup()
};

let map = L.map("map", {
    fullscreenControl: true,
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        basemapGray
    ]

});

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray
}, {
    "Badestelle": overlays.bathingSpot,
    "Grillplatz": overlays.bbqArea
}).addTo(map);

overlays.bathingSpot.addTo(map);
overlays.bbqArea.addTo(map);

let drawBathingSpot = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`${feature.properties.BEZEICHNUNG} <br>
            Bezirk: ${feature.properties.BEZIRK}`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/badestelle.png',
                    iconSize: [39, 39]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>, <a href="https://mapicons.mapsmarker.com">Maps Icons Collection</a>'
    }).addTo(overlays.bathingSpot);
}

let drawbbqArea = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`<strong>Lage: ${feature.properties.LAGE}</strong>
            <hr>
            Grillplatz ID: ${feature.properties.GRILLPLATZ_ID} <br>
            Reservierung notwendig: ${feature.properties.RESERVIERUNG} <br>
            <a href="${feature.properties.WEBLINK1}">Weitere Info</a>`)
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/grillplatz.png',
                    iconSize: [39, 39]
                })
            })
        }
    }).addTo(overlays.bbqArea);
}

for (let config of OGDWIEN) {
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            if (config.title == "Badestellen Standorte Wien") {
                drawBathingSpot(geojsonData);
            } else if (config.title == "Grillplätze Standorte Wien") {
                drawbbqArea(geojsonData);
            }
        })
}

// Leaflet hash
L.hash(map);

// Minimap
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.grau"), {
        toggleDisplay: true,
        minimized: false
    }
).addTo(map);