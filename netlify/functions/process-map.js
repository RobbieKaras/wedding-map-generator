const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    
    try {
        const { addresses } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Convert these addresses into JSON for a Leaflet map. 
        Addresses: ${addresses.join(", ")}. 
        Return ONLY valid JSON with keys: "locations" (id, lat, lng, label, address) and "routes" (startId, endId, time, distance, link).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json|```/g, "").trim();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: jsonText
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
