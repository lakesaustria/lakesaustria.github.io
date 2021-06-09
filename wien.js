let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let overlays = {
    bathingSpot: L.featureGroup()
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
    "Badestelle": overlays.bathingSpot
}).addTo(map);

overlays.bathingSpot.addTo(map);

let drawBathingSpot = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(feature.properties.BEZEICHNUNG)
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

for (let config of OGDWIEN) {
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            if (config.title == "Badestellen Standorte Wien") {
                drawBathingSpot(geojsonData);
            }
        })
}