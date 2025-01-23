const axios = require('axios');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API Key is not configured' })
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt is required' })
            };
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );

        const generatedText = response.data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: generatedText })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to generate response',
                details: error.response?.data || error.message
            })
        };
    }
};