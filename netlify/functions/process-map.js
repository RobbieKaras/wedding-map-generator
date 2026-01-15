exports.handler = async (event) => {
    // This function will eventually call Gemini
    // For now, it returns a success message to test your setup
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "AI Function is ready!" })
    };
};
