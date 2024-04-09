// Utilisez une couche de tuiles personnalisée de Mapbox
const tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}', {
    maxZoom: 18,
    id: 'williambernard/clupou3n600ve01r2c7uv74in',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoid2lsbGlhbWJlcm5hcmQiLCJhIjoiY2x1b3J1M3lzMWZhcjJ2bG5qY3BzdnA0NSJ9.8BpsWtRMCdZKtFwNGI-XpQ'
});

// Créez la carte et ajoutez la couche de tuiles personnalisée
const mymap = L.map('mapid', {
    zoomControl: false,
    attributionControl: false
}).setView([46.5, 2.5], 6);
tileLayer.addTo(mymap);

// Créez une icône personnalisée
const customIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/knoohledge/DOOH-screens/main/TIPI%20Map%20Icon.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
});

// Créez un groupe de clusters de marqueurs avec une fonction de création d'icônes personnalisée
const markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
        return L.divIcon({
            html: '<b>' + cluster.getChildCount() + '</b>',
            className: 'my-cluster-icon',
            iconSize: L.point(40, 40)
        });
    },
    showCoverageOnHover: false, // Désactivez l'affichage du polygone au survol
});

// Récupérez le div pour la liste des POI
const poiListDiv = document.getElementById('poi-list');

fetch('https://raw.githubusercontent.com/knoohledge/DOOH-screens/main/TIPI%20Locations%20-%20Feuille%201.csv')
    .then(response => response.text())
    .then(data => {
        const results = Papa.parse(data, {header: true, dynamicTyping: true}).data;
        results.forEach(location => {
            if (location.latitude && location.longitude) {
                // Créez un marqueur et ajoutez-le au groupe de clusters
                const marker = L.marker([location.latitude, location.longitude], {icon: customIcon});
                marker.bindTooltip(location.name, {className: 'custom-tooltip', direction: 'top', permanent: false, offset: [0, -38]});

                // Ajoutez des gestionnaires d'événements pour l'animation du tooltip
                marker.on('mouseover', function() {
                    var tooltip = this.getTooltip();
                    tooltip.setOpacity(1);
                });

                marker.on('mouseout', function() {
                    var tooltip = this.getTooltip();
                    tooltip.setOpacity(0);
                });

                markers.addLayer(marker);

                // Créez un lien pour ce POI dans la liste
                const poiLink = document.createElement('a');
                poiLink.href = '#';
                poiLink.textContent = location.name;
                poiLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Faites zoomer la carte sur le POI lorsque le lien est cliqué
                    mymap.setView([location.latitude, location.longitude], 13);
                });
                poiListDiv.appendChild(poiLink);
                poiListDiv.appendChild(document.createElement('br')); // Ajoutez une nouvelle ligne après chaque lien
            } else {
                console.warn('Invalid coordinates:', location);
            }
        });

        // Ajoutez le groupe de clusters à la carte
        mymap.addLayer(markers);
    });

    document.getElementById('search-bar').addEventListener('input', function(e) {
        var searchValue = e.target.value.toLowerCase();
        var poiListItems = document.querySelectorAll('#poi-list a'); // Sélectionnez les éléments a à l'intérieur de #poi-list
        
        poiListItems.forEach(function(listItem) {
            var poiText = listItem.textContent.toLowerCase();
            
            if (searchValue === '') {
                listItem.classList.remove('matching-search'); // Supprime la classe
            } else if (poiText.includes(searchValue)) {
                listItem.classList.add('matching-search'); // Ajoute la classe
            } else {
                listItem.classList.remove('matching-search'); // Supprime la classe
            }
        });
    });