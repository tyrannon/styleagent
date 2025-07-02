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
      // Handle single string message for backward compatibility
      if (typeof messages === 'string') {
        messages = [{ role: 'user', content: messages }];
      }

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
        response: data.message?.content || data.message,
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

  /**
   * Analyze an image with a vision-capable model
   * @param {string} base64Image - Base64 encoded image
   * @param {string} prompt - Analysis prompt
   * @param {Object} options - Options including model and mimeType
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeImage(base64Image, prompt, options = {}) {
    try {
      // Check if vision model is available first
      const models = await this.listModels();
      console.log('🔍 Available models:', models.map(m => m.name));
      
      const availableVisionModels = models.filter(m => 
        m.name.includes('llava') || 
        m.name.includes('vision') || 
        m.name.includes('moondream')
      );
      
      if (availableVisionModels.length === 0) {
        console.error('❌ No vision-capable models available');
        console.error('💡 Install with: ollama pull moondream');
        throw new Error('No vision-capable model available');
      }

      // Use the first available vision model
      const selectedModel = options.model || availableVisionModels[0].name;
      console.log('🎯 Using vision model:', selectedModel);
      
      const mimeType = options.mimeType || 'image/jpeg';

      const messages = [{
        role: 'user',
        content: prompt,
        images: [base64Image]
      }];

      console.log('📡 Making API request to:', `${this.baseUrl}/api/chat`);
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.3,
            top_p: options.top_p || 0.9,
            num_predict: 512,
            ...options
          }
        })
      });

      console.log('📡 API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API response received');
      
      return {
        success: true,
        response: data.message?.content || data.message,
        model: data.model,
        created_at: data.created_at,
        done: data.done,
        visionUsed: true
      };
    } catch (error) {
      console.error('❌ Error analyzing image:', error);
      return {
        success: false,
        error: error.message,
        visionUsed: false
      };
    }
  }

  /**
   * Check if vision models are available
   * @returns {Promise<boolean>} Whether vision capabilities are available
   */
  async hasVisionCapability() {
    try {
      const models = await this.listModels();
      return models.some(m => 
        m.name.includes('llava') || 
        m.name.includes('vision') || 
        m.name.includes('moondream')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available vision models
   * @returns {Promise<Array>} List of vision-capable models
   */
  async getVisionModels() {
    try {
      const models = await this.listModels();
      return models.filter(m => 
        m.name.includes('llava') || 
        m.name.includes('vision') || 
        m.name.includes('moondream')
      );
    } catch (error) {
      return [];
    }
  }
}

module.exports = OllamaClient;