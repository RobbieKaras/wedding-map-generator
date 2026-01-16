document.getElementById('generateBtn').addEventListener('click', async () => {
    const names = document.getElementById('eventName').value;
    const addresses = document.getElementById('addressInput').value.split('\n');
    const status = document.getElementById('status');
    const deployBtn = document.getElementById('deployBtn');

    if (!names || addresses.length < 2) {
        alert("Please enter names and at least two locations.");
        return;
    }

    status.innerText = "Consulting Gemini AI...";

    try {
        const response = await fetch('/.netlify/functions/process-map', {
            method: 'POST',
            body: JSON.stringify({ addresses })
        });
        
        const data = await response.json();
        
        // Update Preview
        document.getElementById('prev-title').innerText = `${names}'s Wedding Map`;
        document.getElementById('prev-desc').innerText = "AI Success! Map data generated.";
        
        status.innerText = "Map data ready!";
        deployBtn.style.display = "block";
        
        // Store data for deployment
        window.siteData = { names, data };
    } catch (err) {
        status.innerText = "Error processing addresses. Check console.";
        console.error(err);
    }
});
