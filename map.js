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
    [41.3337, -5.5591], // Sud-Ouest
    [51.124, 9.6625]    // Nord-Est
];

// Créez la carte et ajoutez la couche de tuiles personnalisée
const mymap = L.map('mapid', {
    zoomControl: false,
    attributionControl: false,
    maxBounds: franceBounds, // Définir les limites de la carte
    maxBoundsViscosity: 1.0,  // Rendre les limites strictes
    minZoom: 5,               // Fixer le maximum du dézoom à 5
    gestureHandling: true     // Activer la gestion des gestes
}).setView([46.5, 2.5], 6);
tileLayer.addTo(mymap);

// Créez une icône personnalisée en forme de rond avec la couleur HEX 333 et le nombre d'écrans
const customIcon = (ecrans) => L.divIcon({
    className: 'my-cluster-icon', // Utiliser la même classe que les clusters
    html: `<b>${ecrans}</b>`, // Afficher le nombre d'écrans
    iconSize: L.point(24, 24), // 1.5rem = 24px
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

// Récupérez le div pour la liste des POI
const poiListDiv = document.getElementById('poi-names'); // Modifier pour utiliser le nouveau div scrollable

fetch('https://raw.githubusercontent.com/knoohledge/DOOH-screens/main/TIPI%20Locations%20-%20Feuille%201.csv')
    .then(response => response.text())
    .then(data => {
        const results = Papa.parse(data, {header: true, dynamicTyping: true}).data;
        results.forEach(location => {
            if (location.latitude && location.longitude) {
                // Créez un marqueur et ajoutez-le directement à la carte
                const marker = L.marker([location.latitude, location.longitude], {
                    icon: customIcon(location.ecrans)
                });
                marker.bindTooltip(location.name, {
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

                marker.addTo(mymap);

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
