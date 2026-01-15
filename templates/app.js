// --- 1. DATA PLACEHOLDERS (Filled by the Builder) ---
// These {{ }} tags are replaced by the generator script.
const locations = {{LOCATIONS_JSON}};
const routes = {{ROUTES_JSON}};

let map;
let allMarkers = {};
let allRoutePairs = [];

// --- 2. INITIALIZE MAP ---
document.addEventListener("DOMContentLoaded", initMap);

function initMap() {
  const popup = document.getElementById("travel-info-popup");
  const popupRoute = document.getElementById("popup-route");
  const popupTime = document.getElementById("popup-time");
  const popupDistance = document.getElementById("popup-distance");
  const popupLink = document.getElementById("popup-link");

  function showPopup(routeData) {
    popupRoute.textContent = `${locations[routeData.start].label} ↔ ${locations[routeData.end].label}`;
    popupTime.textContent = `Estimate: ${routeData.time} min`;
    popupDistance.textContent = `Distance: ${routeData.distance} mi`;
    popupLink.href = routeData.link;
    popup.classList.add("visible");
  }

  function hidePopup() {
    popup.classList.remove("visible");
  }

  // Set initial view based on the first location provided by the user
  const firstLoc = Object.values(locations)[0];
  map = L.map("map").setView([firstLoc.lat, firstLoc.lng], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap"
  }).addTo(map);

  map.on("click", hidePopup);
  drawRoutesAndMarkers(showPopup);
}

// --- 3. DYNAMIC MARKERS & ROUTES ---
function drawRoutesAndMarkers(showPopup) {
  for (const key in locations) {
    const loc = locations[key];
    const marker = L.marker([loc.lat, loc.lng]).addTo(map);
    marker.bindTooltip(loc.label);
    marker.on("click", () => routeFromCurrentLocation(loc));
    allMarkers[key] = marker;
  }

  routes.forEach((route) => {
    const latlngs = [
      [locations[route.start].lat, locations[route.start].lng],
      [locations[route.end].lat, locations[route.end].lng]
    ];

    const visible = L.polyline(latlngs, {
      color: "#A0522D",
      weight: 6,
      interactive: true
    }).addTo(map);

    visible.on("click", () => showPopup(route));
  });
}

// --- 4. GOOGLE MAPS ROUTING ---
function routeFromCurrentLocation(locationObject) {
  const destination = encodeURIComponent(locationObject.address);
  
  if (!navigator.geolocation) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, "_blank");
  });
}
