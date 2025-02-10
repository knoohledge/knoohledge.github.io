// Utilisez une couche de tuiles personnalisée de Mapbox avec un style grayscale
const tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}@2x?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox/light-v10', // Utilisez le style light-v10 pour un effet grayscale
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoid2lsbGlhbWJlcm5hcmQiLCJhIjoiY2x1b3J1M3lzMWZhcjJ2bG5qY3BzdnA0NSJ9.8BpsWtRMCdZKtFwNGI-XpQ'
});

// Définir les limites de la France
const franceBounds = [
    [35.0, -10.0], // Sud-Ouest élargi
    [55.0, 15.0]   // Nord-Est élargi
];

// Créez la carte et ajoutez la couche de tuiles personnalisée
const mymap = L.map('mapid', {
    zoomControl: false,
    attributionControl: false,
    maxBounds: franceBounds, // Définir les limites de la carte
    maxBoundsViscosity: 1.0,  // Rendre les limites strictes
    minZoom: 5,               // Fixer le maximum du dézoom à 5
    gestureHandling: true     // Activer la gestion des gestes
}).setView([46.8, 2.5], 6);
tileLayer.addTo(mymap);

// Créez une icône personnalisée avec l'image spécifiée et une bordure
const customIcon = () => L.divIcon({
    className: 'custom-marker-icon',
    html: `<img src="https://raw.githubusercontent.com/knoohledge/DOOH-screens/refs/heads/main/pngtree-sport-ball-golf-ball-png-png-image_9962814%201.png" style="border: 3px solid #333; border-radius: 50%; width: 1.5rem; height: 1.5rem;" />`,
    iconSize: [30, 30], // Taille de l'icône incluant la bordure
    iconAnchor: [15, 15], // Point d'ancrage de l'icône
    popupAnchor: [0, -15] // Point d'ancrage du popup
});

// Créez le groupe de clusters de marqueurs avec un style personnalisé
const markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
        return L.divIcon({
            html: `<div style="background-color: #333; color: white; border-radius: 50%; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;">${cluster.getChildCount()}</div>`,
            className: 'my-cluster-icon',
            iconSize: L.point(32, 32) // Taille de l'icône de cluster
        });
    },
    spiderfyOnMaxZoom: false, // Désactiver le polygonage lors du survol
    showCoverageOnHover: false // Désactiver l'affichage de la couverture lors du survol
});

fetch('https://raw.githubusercontent.com/knoohledge/DOOH-screens/main/TIPI%20Locations%20-%20Feuille%201.csv')
    .then(response => response.text())
    .then(data => {
        const results = Papa.parse(data, {header: true, dynamicTyping: true}).data;
        results.forEach(location => {
            if (location.latitude && location.longitude) {
                // Créez un marqueur
                const marker = L.marker([location.latitude, location.longitude], {
                    icon: customIcon()
                });
                const ecransText = location.ecrans === 1 ? 'écran' : 'écrans';
                marker.bindTooltip(`
                    <div>
                        <strong style="font-weight: bold;">${location.name}</strong><br>
                        <span style="font-size: 0.8rem; font-weight: 300;">${location.ecrans} ${ecransText}</span>
                    </div>`, {
                    className: 'custom-tooltip',
                    direction: 'top',
                    permanent: false,
                    offset: [0, -16], // 1rem = 16px
                    noWrap: true // Empêcher l'affichage de la flèche
                });

                // Ajoutez des gestionnaires d'événements pour l'animation du tooltip
                marker.on('mouseover', function() {
                    var tooltip = this.getTooltip();
                    tooltip.setOpacity(1);
                });

                marker.on('mouseout', function() {
                    var tooltip = this.getTooltip();
                    tooltip.setOpacity(0);
                });

                // Ajoutez le marqueur au groupe de clusters
                markers.addLayer(marker);
            } else {
                console.warn('Invalid coordinates:', location);
            }
        });

        // Ajoutez le groupe de clusters à la carte
        mymap.addLayer(markers);
    });
