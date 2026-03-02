const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    // 1. Only allow POST requests from your builder UI
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ error: "Method Not Allowed" }) 
        };
    }

    try {
        // 2. Parse the addresses sent from builder.js
        const { addresses } = JSON.parse(event.body);
        
        if (!addresses || addresses.length < 2) {
            throw new Error("At least two addresses are required.");
        }

        // 3. Initialize Gemini with your Netlify Environment Variable
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a geocoding expert. Convert these wedding addresses into a JSON object for Leaflet.js:
            Addresses: ${addresses.join(", ")}

            Return ONLY a valid JSON object with this exact structure:
            {
              "locations": {
                "loc1": { "lat": 0, "lng": 0, "label": "Name", "address": "Full Address" }
              },
              "routes": [
                { "start": "loc1", "end": "loc2", "time": 0, "distance": 0, "link": "Google Maps URL" }
              ]
            }
            Do not include any conversational text or markdown blocks.
        `;

        // 4. Call the Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // 5. Clean the response (removes ```json ... ``` if Gemini includes it)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        }

        // 6. Return the data to your builder website
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: text
        };

    } catch (error) {
        // 7. Log the error to Netlify Function Logs and send to browser console
        console.error("Function Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
