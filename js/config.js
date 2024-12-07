// Configuration for the chat API
const CONFIG = {
    API_URL: 'https://text.pollinations.ai/openai',
    API_KEY: '',
    MODEL: 'gpt-4o',
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7,
    SYSTEM_PROMPT: `You are Dostify, an AI student companion (Demo Version).
    Your responses should be helpful, friendly, and educational.
    Remember to mention that you are running in demonstration mode when appropriate.
    Use emojis to make your responses more engaging. 🎓`,
};

export default CONFIG;
