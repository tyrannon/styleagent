const OllamaClient = require('./OllamaClient');

class StyleAI {
  constructor(wardrobeManager) {
    this.wardrobeManager = wardrobeManager;
    this.ollama = new OllamaClient();
    this.conversationHistory = [];
    this.systemPrompt = this.createSystemPrompt();
  }

  createSystemPrompt() {
    return `You are StyleAgent, a personal fashion and wardrobe AI assistant. You help users make outfit decisions based on their wardrobe, personal style, weather, and occasions.

PERSONALITY:
- Friendly, enthusiastic, and supportive
- Fashion-forward but practical 
- Encouraging and confidence-boosting
- Considerate of personal style preferences

CAPABILITIES:
- Analyze user's wardrobe and suggest outfits
- Consider weather, occasion, and personal preferences
- Provide styling tips and fashion advice
- Help organize and categorize clothing
- Track outfit history and preferences

RESPONSE STYLE:
- Keep responses concise (2-3 sentences max unless asked for detail)
- Be encouraging and positive
- Use emojis sparingly but effectively
- Focus on actionable advice
- Ask clarifying questions when needed

CURRENT CONTEXT:
- You have access to the user's complete wardrobe data
- You can see what they've worn recently
- You know their favorite items and preferences
- You can suggest outfits based on specific criteria`;
  }

  async initialize() {
    const available = await this.ollama.isAvailable();
    if (!available) {
      throw new Error('Ollama is not available. Please make sure Ollama is running.');
    }

    const models = await this.ollama.listModels();
    console.log('Available models:', models.map(m => m.name));
    
    return true;
  }

  async analyzeWardrobe() {
    try {
      const items = await this.wardrobeManager.getAllItems();
      const stats = await this.wardrobeManager.getStats();

      const analysis = {
        totalItems: items.length,
        categories: stats.categories,
        favorites: stats.favorites,
        mostWorn: stats.mostWorn,
        leastWorn: stats.leastWorn,
        averageWears: stats.averageWears,
        recentItems: items.slice(-5),
        colorDistribution: this.analyzeColors(items),
        seasonalGaps: this.findSeasonalGaps(items),
        styleInsights: this.generateStyleInsights(items)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing wardrobe:', error);
      return null;
    }
  }

  analyzeColors(items) {
    const colorCount = {};
    items.forEach(item => {
      item.color.forEach(color => {
        colorCount[color] = (colorCount[color] || 0) + 1;
      });
    });
    
    return Object.entries(colorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
  }

  findSeasonalGaps(items) {
    const seasonalItems = {
      spring: items.filter(item => item.season.includes('spring')),
      summer: items.filter(item => item.season.includes('summer')),
      fall: items.filter(item => item.season.includes('fall')),
      winter: items.filter(item => item.season.includes('winter'))
    };

    const gaps = [];
    Object.entries(seasonalItems).forEach(([season, seasonItems]) => {
      if (seasonItems.length < 3) {
        gaps.push(season);
      }
    });

    return gaps;
  }

  generateStyleInsights(items) {
    const insights = [];
    
    // Check for versatile pieces
    const versatileItems = items.filter(item => 
      item.occasion.length >= 2 && item.season.length >= 2
    );
    
    if (versatileItems.length > 0) {
      insights.push(`You have ${versatileItems.length} versatile pieces that work across seasons and occasions`);
    }

    // Check for underutilized items
    const underused = items.filter(item => item.timesWorn === 0).length;
    if (underused > 0) {
      insights.push(`${underused} items haven't been worn yet - great opportunities to refresh your look!`);
    }

    return insights;
  }

  async suggestOutfit(context = {}) {
    try {
      const { occasion = 'casual', weather = 'mild', mood = 'comfortable' } = context;
      
      const wardrobeAnalysis = await this.analyzeWardrobe();
      const items = await this.wardrobeManager.getAllItems();
      
      // Filter items based on context
      let relevantItems = items.filter(item => {
        const matchesOccasion = item.occasion.includes(occasion) || occasion === 'any';
        const matchesSeason = this.matchesWeather(item, weather);
        return matchesOccasion && matchesSeason;
      });

      if (relevantItems.length === 0) {
        relevantItems = items; // Fallback to all items
      }

      const prompt = this.createOutfitPrompt(relevantItems, context, wardrobeAnalysis);
      
      const messages = [
        { role: 'system', content: 'You are a helpful assistant. Complete the format exactly as shown. Do not repeat the prompt.' },
        { role: 'user', content: prompt }
      ];

      const response = await this.ollama.chat(messages, 'tinyllama', {
        temperature: 0.2,
        max_tokens: 60
      });

      if (response.success) {
        return {
          success: true,
          suggestion: response.message.content,
          relevantItems: relevantItems.slice(0, 10), // Limit for performance
          context
        };
      } else {
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error) {
      console.error('Error suggesting outfit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  matchesWeather(item, weather) {
    const weatherToSeason = {
      'hot': ['summer'],
      'warm': ['spring', 'summer'],
      'mild': ['spring', 'summer', 'fall'],
      'cool': ['spring', 'fall'],
      'cold': ['fall', 'winter'],
      'freezing': ['winter']
    };

    const appropriateSeasons = weatherToSeason[weather] || ['spring', 'summer', 'fall', 'winter'];
    return item.season.some(season => appropriateSeasons.includes(season));
  }

  createOutfitPrompt(items, context, analysis) {
    // Get unique items to avoid duplicates
    const uniqueItems = items.filter((item, index, self) => 
      index === self.findIndex(t => t.name === item.name && t.category === item.category)
    ).slice(0, 8);
    
    // Group by category for clearer prompting
    const tops = uniqueItems.filter(item => item.category === 'tops');
    const bottoms = uniqueItems.filter(item => item.category === 'bottoms');
    const shoes = uniqueItems.filter(item => item.category === 'shoes');
    
    return `Pick one item from each category for a ${context.occasion} ${context.weather} weather outfit:

Tops: ${tops.map(item => item.name).join(', ')}
Bottoms: ${bottoms.map(item => item.name).join(', ')}
Shoes: ${shoes.map(item => item.name).join(', ')}

Answer only with:
TOP: 
BOTTOM: 
SHOES: 
TIP:`;
  }

  async chat(userMessage, context = {}) {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Prepare context for the AI
      const wardrobeAnalysis = await this.analyzeWardrobe();
      const contextualPrompt = this.createContextualPrompt(userMessage, wardrobeAnalysis, context);

      const messages = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: contextualPrompt }
      ];

      const response = await this.ollama.chat(messages, 'tinyllama', {
        temperature: 0.6,
        max_tokens: 100
      });

      if (response.success) {
        const aiResponse = response.message.content;
        
        // Add AI response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: aiResponse
        });

        return {
          success: true,
          response: aiResponse,
          context: wardrobeAnalysis
        };
      } else {
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error) {
      console.error('Error in chat:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  createContextualPrompt(userMessage, analysis, context) {
    return `User question: "${userMessage}"

WARDROBE CONTEXT:
${analysis ? `
- Total items: ${analysis.totalItems}
- Categories: ${Object.entries(analysis.categories).map(([cat, count]) => `${cat}(${count})`).join(', ')}
- Favorites: ${analysis.favorites}
` : 'Wardrobe data not available'}

Please respond helpfully in 2-3 sentences max. Be encouraging and personal.`;
  }

  clearHistory() {
    this.conversationHistory = [];
  }
}

module.exports = StyleAI;