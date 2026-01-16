const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async (event) => {
    try {
        const { addresses } = JSON.parse(event.body);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Convert these addresses into JSON for Leaflet.js: ${addresses.join(", ")}. 
        Return ONLY a JSON object with "locations" (lat, lng, label) and "routes" (start, end, time, distance, link).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, ""); // Remove AI markdown

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: text
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
