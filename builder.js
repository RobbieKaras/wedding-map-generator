// --- CONFIGURATION ---
let previewMap;
let markers = [];

// --- 1. AI PROCESSING ---
document.getElementById('generateBtn').addEventListener('click', async () => {
    const names = document.getElementById('eventName').value;
    const addresses = [
        document.getElementById('ceremonyAddr').value,
        document.getElementById('receptionAddr').value
    ];
    const status = document.getElementById('status');

    if (!names || !addresses[0] || !addresses[1]) {
        alert("Please fill in the names and both addresses.");
        return;
    }

    status.innerText = "Consulting Gemini AI...";

    try {
        const response = await fetch('/.netlify/functions/process-map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addresses })
        });

        if (!response.ok) throw new Error('AI Function failed');

        const aiData = await response.json();
        
        // Update the UI
        document.getElementById('preview-title').innerText = `${names}'s Wedding Map`;
        status.innerText = "✓ Map data ready!";
        document.getElementById('deployBtn').disabled = false;

        // Draw the preview map
        initPreviewMap(aiData);

    } catch (err) {
        console.error(err);
        status.innerText = "Error: Could not process addresses.";
    }
});

// --- 2. PREVIEW MAP LOGIC ---
function initPreviewMap(data) {
    // Clear existing map if it exists
    if (previewMap) {
        previewMap.remove();
    }

    // Change placeholder text to a map container
    const frame = document.getElementById('preview-frame');
    frame.innerHTML = '<div id="map-inner" style="height: 400px; width: 100%; border-radius: 8px;"></div>';

    // Set view to the first location found
    const firstKey = Object.keys(data.locations)[0];
    const firstLoc = data.locations[firstKey];
    
    previewMap = L.map('map-inner').setView([firstLoc.lat, firstLoc.lng], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(previewMap);

    // Add markers for each location
    Object.values(data.locations).forEach(loc => {
        L.marker([loc.lat, loc.lng])
            .addTo(previewMap)
            .bindTooltip(loc.label, { permanent: true })
            .openTooltip();
    });
}
