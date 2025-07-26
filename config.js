// Configuration pour Ben-Bot
// Remplacez 'YOUR_OPENROUTER_API_KEY' par votre vraie clé API OpenRouter

const CONFIG = {
    // Clé API OpenRouter - OBLIGATOIRE
    OPENROUTER_API_KEY: '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',
    
    // URL de l'API OpenRouter
    OPENROUTER_API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    
    // Modèle IA à utiliser
    MODEL: 'moonshotai/kimi-k2:free',
    
    // Paramètres du modèle
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.7,
    
    // Nom de l'application pour OpenRouter
    APP_NAME: 'Ben-Bot',
    
    // Configuration Supabase pour l'historique des messages
    SUPABASE_URL: 'https://ocdloxagawjkokiheuiu.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZGxveGFnYXdqa29raWhldWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTM1NTQsImV4cCI6MjA2ODA4OTU1NH0.OFC4QyrCKtyY_2JA2I5MnI8JjmuFBYHuJH7nO1Vyu5o'
};

// Export pour utilisation dans le script principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
