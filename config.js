// Load environment variables
const config = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
};

export default config; 