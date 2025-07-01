class OllamaClient {
  constructor(baseUrl = 'http://127.0.0.1:11434') {
    this.baseUrl = baseUrl;
    this.defaultModel = 'tinyllama';
  }

  async isAvailable() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch (error) {
      console.error('Ollama not available:', error);
      return false;
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  async generateResponse(prompt, model = this.defaultModel, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response,
        model: data.model,
        created_at: data.created_at,
        done: data.done
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async chat(messages, model = this.defaultModel, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            ...options
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        model: data.model,
        created_at: data.created_at,
        done: data.done
      };
    } catch (error) {
      console.error('Error in chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = OllamaClient;