let map;
let routingControl;

window.onload = () => {
    // Start map at Harrisonburg coordinates
    map = L.map('preview-frame').setView([38.449, -78.868], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
};

document.getElementById('generateBtn').addEventListener('click', () => {
    const ceremony = document.getElementById('ceremonyAddr').value;
    const reception = document.getElementById('receptionAddr').value;
    const status = document.getElementById('status');

    if (!ceremony || !reception) return alert("Enter both addresses!");
    status.innerText = "Searching for locations...";

    const geocoder = L.Control.Geocoder.nominatim();

    geocoder.geocode(ceremony, (res1) => {
        if (!res1.length) return status.innerText = "Ceremony address not found.";
        
        geocoder.geocode(reception, (res2) => {
            if (!res2.length) return status.innerText = "Reception address not found.";

            const start = res1[0].center;
            const end = res2[0].center;

            if (routingControl) map.removeControl(routingControl);

            // Create the route
            routingControl = L.Routing.control({
                waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
                routeWhileDragging: false,
                addWaypoints: false,
                show: false // Keeps the sidebar clean
            }).on('routesfound', (e) => {
                const r = e.routes[0];
                const miles = (r.summary.totalDistance / 1609).toFixed(1);
                status.innerText = `✓ Success: ${miles} miles found.`;
                document.getElementById('deployBtn').disabled = false;
                
                // Refresh map size to fix any box fitting issues
                setTimeout(() => { map.invalidateSize(); }, 200);
            }).addTo(map);
        });
    });
});
