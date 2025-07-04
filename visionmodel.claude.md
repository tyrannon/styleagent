# VISIONMODEL.CLAUDE.MD

## Purpose
Manage local vision model usage and image analysis for clothing detection, style analysis, and wardrobe categorization. Handles model selection, prompt optimization, and fallback strategies for robust computer vision in StyleAgent.

## Trigger Examples
- `//visionmodel` - Debug vision model issues
- `//visionmodel analyze clothing` - Test clothing analysis
- `//visionmodel --model moondream` - Use specific model
- `//visionmodel fallback` - Check fallback options
- `use visionmodel.claude.md to improve clothing detection accuracy`

## Claude Strategy

### Step 1: Model Assessment
- Check which vision models are available locally (moondream, llava, etc.)
- Test model responsiveness and performance
- Verify Ollama service status and model downloads
- Assess model capabilities for clothing analysis

### Step 2: Prompt Engineering
- Design specific prompts for clothing category detection
- Optimize prompts for color, material, and style extraction
- Create fallback prompts for different accuracy levels
- Test prompt variations for consistent results

### Step 3: Analysis Pipeline
- Implement image preprocessing (cropping, resizing)
- Set up batch processing for multiple images
- Add confidence scoring and quality assessment
- Create structured output parsing

### Step 4: Error Handling
- Implement graceful fallbacks when models fail
- Add retry logic for temporary failures
- Create user-friendly error messages
- Maintain service availability during issues

### Step 5: Performance Optimization
- Cache model responses for similar images
- Implement request queuing for batch processing
- Optimize image sizes for faster processing
- Monitor processing times and resource usage

## Dev Tips (Electron/JS/Ollama Specific)

### Model Detection & Selection
```javascript
// Check available vision models
async function getAvailableVisionModels() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    
    const visionModels = data.models.filter(model => 
      model.name.includes('moondream') || 
      model.name.includes('llava') ||
      model.name.includes('bakllava')
    );
    
    return visionModels;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
  }
}
```

### Optimized Clothing Analysis Prompts
```javascript
const clothingPrompts = {
  category: `Analyze this clothing image and identify the category. 
    Respond with ONE word only from: tops, bottoms, shoes, accessories, outerwear, underwear, sleepwear, activewear`,
  
  detailed: `Analyze this clothing item and provide:
    Category: [one word]
    Colors: [list main colors]
    Material: [fabric type]
    Style: [casual/formal/athletic]
    Description: [brief description]`,
  
  quick: `What type of clothing is this? One word answer from: 
    shirt, pants, dress, shoes, jacket, accessory`
};
```

### Image Preprocessing
```javascript
// Optimize image for vision model
function preprocessImageForAnalysis(imageData) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Target size for optimal processing
      const targetSize = 512;
      const scale = Math.min(targetSize / img.width, targetSize / img.height);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    
    img.src = imageData;
  });
}
```

### ClothingAnalyzer Integration
```javascript
class ClothingAnalyzer {
  constructor() {
    this.preferredModels = ['moondream:latest', 'llava:latest'];
    this.currentModel = null;
  }
  
  async analyzeClothing(imageData, options = {}) {
    const model = await this.selectBestModel();
    if (!model) throw new Error('No vision models available');
    
    const prompt = options.detailed ? 
      clothingPrompts.detailed : 
      clothingPrompts.category;
    
    try {
      return await this.callVisionModel(model, imageData, prompt);
    } catch (error) {
      return await this.fallbackAnalysis(imageData);
    }
  }
  
  async fallbackAnalysis(imageData) {
    // Simple fallback based on image analysis
    return {
      category: 'tops',
      colors: ['unknown'],
      confidence: 0.1,
      source: 'fallback'
    };
  }
}
```

### Batch Processing
```javascript
// Process multiple images efficiently
async function batchAnalyzeImages(imagePaths, options = {}) {
  const results = [];
  const batchSize = 3; // Process 3 at a time
  
  for (let i = 0; i < imagePaths.length; i += batchSize) {
    const batch = imagePaths.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (imagePath) => {
      try {
        const result = await analyzeClothingImage(imagePath, options);
        return { success: true, data: result, path: imagePath };
      } catch (error) {
        return { success: false, error: error.message, path: imagePath };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}
```

## Output Formatting

### Model Status Check
```
🤖 **Vision Model Status**

**Available Models:**
• moondream:latest ✅ (Preferred)
• llava:7b ✅ (Backup)
• bakllava:latest ❌ (Not installed)

**Current Model:** moondream:latest
**Service Status:** ✅ Ollama running on localhost:11434
**Average Response Time:** 2.3s
**Memory Usage:** 1.2GB
```

### Analysis Results
```
👕 **Clothing Analysis Results**

**Image:** user_upload_001.jpg
**Model:** moondream:latest
**Confidence:** 89%

**Results:**
• Category: tops
• Colors: ["blue", "white"]
• Material: cotton
• Style: casual
• Description: Blue striped cotton t-shirt

**Processing Time:** 1.8s
**Status:** ✅ Success
```

### Error Diagnostics
```
❌ **Vision Model Error**

**Issue:** Model request timeout
**Model:** moondream:latest
**Image:** large_file.png (8.2MB)

**Diagnosis:**
• Image too large for processing
• Model may be overloaded
• Network connectivity issues

**Suggested Fixes:**
1. Resize image to < 2MB
2. Try fallback model: llava:7b
3. Check Ollama service status
4. Restart vision service if needed

**Fallback Applied:** ✅ Using basic image analysis
```

### Batch Processing Report
```
📊 **Batch Analysis Complete**

**Processed:** 15 images
**Successful:** 12 ✅
**Failed:** 3 ❌
**Average Time:** 2.1s per image
**Total Time:** 31.5s

**Success Rate by Category:**
• Tops: 100% (5/5)
• Bottoms: 83% (5/6) 
• Shoes: 75% (3/4)

**Failed Items:**
• blurry_image.jpg - Low quality
• dark_photo.png - Poor lighting
• multiple_items.jpg - Multiple subjects

**Recommendations:**
• Improve image quality for better results
• Use single item per image
• Ensure good lighting conditions
```

### Performance Optimization Report
```
🚀 **Vision Model Performance**

**Optimizations Applied:**
• Image preprocessing: 512px max size
• Request queuing: 3 concurrent max
• Response caching: 1hr duration
• Fallback prompts: 3 levels

**Performance Metrics:**
• Cache hit rate: 34%
• Average response time: 1.9s (was 3.2s)
• Memory usage: -45%
• Error rate: 2% (was 12%)

**Model Recommendations:**
• Primary: moondream:latest (fastest)
• Backup: llava:7b (more accurate)
• Emergency: rule-based fallback
```