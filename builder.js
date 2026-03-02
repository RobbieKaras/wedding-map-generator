let map;
let routingControl;

// Initialize map on load
window.onload = () => {
    map = L.map('preview-frame').setView([38.449, -78.868], 13); // Default to Harrisonburg
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);
};

document.getElementById('generateBtn').addEventListener('click', () => {
    const ceremony = document.getElementById('ceremonyAddr').value;
    const reception = document.getElementById('receptionAddr').value;
    const status = document.getElementById('status');

    if (!ceremony || !reception) return alert("Please enter both addresses.");
    status.innerText = "Searching for addresses...";

    const geocoder = L.Control.Geocoder.nominatim();

    // Find Ceremony Coordinates
    geocoder.geocode(ceremony, (res1) => {
        if (!res1.length) return status.innerText = "Error: Ceremony address not found.";
        
        // Find Reception Coordinates
        geocoder.geocode(reception, (res2) => {
            if (!res2.length) return status.innerText = "Error: Reception address not found.";

            const start = res1[0].center;
            const end = res2[0].center;

            // Clear previous routes
            if (routingControl) map.removeControl(routingControl);

            // Draw Route & Get Summary
            routingControl = L.Routing.control({
                waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
                routeWhileDragging: false,
                addWaypoints: false,
                createMarker: () => null // Hide default markers
            }).on('routesfound', (e) => {
                const r = e.routes[0];
                const miles = (r.summary.totalDistance / 1609).toFixed(1);
                status.innerText = `✓ Found! Distance: ${miles} miles.`;
                document.getElementById('deployBtn').disabled = false;
                
                // Store data for your final guest site
                window.finalMapData = {
                    eventName: document.getElementById('eventName').value,
                    locations: [
                        { lat: start.lat, lng: start.lng, name: "Ceremony" },
                        { lat: end.lat, lng: end.lng, name: "Reception" }
                    ],
                    distance: miles
                };
            }).addTo(map);
        });
    });
});
