let map;
let routingControl;

window.onload = () => {
    map = L.map('preview-frame').setView([38.449, -78.868], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
};

document.getElementById('generateBtn').addEventListener('click', () => {
    const ceremony = document.getElementById('ceremonyAddr').value;
    const reception = document.getElementById('receptionAddr').value;
    const status = document.getElementById('status');

    if (!ceremony || !reception) return alert("Please fill in both addresses.");
    status.innerText = "Searching for locations...";

    const geocoder = L.Control.Geocoder.nominatim();

    geocoder.geocode(ceremony, (res1) => {
        if (!res1.length) return status.innerText = "Ceremony address not found.";
        
        geocoder.geocode(reception, (res2) => {
            if (!res2.length) return status.innerText = "Reception address not found.";

            const start = res1[0].center;
            const end = res2[0].center;

            if (routingControl) map.removeControl(routingControl);

            routingControl = L.Routing.control({
                waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
                routeWhileDragging: false,
                addWaypoints: false,
                show: false
            }).on('routesfound', (e) => {
                const r = e.routes[0];
                const miles = (r.summary.totalDistance / 1609).toFixed(1);
                const minutes = Math.round(r.summary.totalTime / 60);

                // Update Dashboard Values
                document.getElementById('stat-distance').innerText = `${miles} miles`;
                document.getElementById('stat-time').innerText = `${minutes} mins`;
                document.getElementById('stat-points').innerText = `2 Points`;
                
                status.innerText = `✓ Route Found`;
                document.getElementById('deployBtn').disabled = false;
                
                setTimeout(() => { map.invalidateSize(); }, 200);
            }).addTo(map);
        });
    });
});
