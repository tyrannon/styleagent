/**
 * Enhanced Image Generator for StyleAgent
 * Integrates with enhanced Python backend for professional quality generation
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { EnhancedPromptGenerator } from './EnhancedPromptGenerator.js';

export class EnhancedImageGenerator {
  constructor() {
    this.promptGenerator = new EnhancedPromptGenerator();
    this.pythonVenvPath = '/Users/kaiyakramer/styleagent/stable-diffusion-webui/venv/bin/python';
    this.generatorScriptPath = '/Users/kaiyakramer/styleagent/scripts/enhanced_outfit_generator.py';
    this.modelsDir = '/Users/kaiyakramer/styleagent/models/diffusion';
  }

  /**
   * Generate enhanced outfit image with professional quality
   */
  async generateOutfitImage(clothingItems, options = {}) {
    const {
      qualityPreset = 'high_quality',
      modelType = 'sdxl',
      styleDNA = null,
      gender = null,
      style = 'fashion_photography',
      outputPath = null
    } = options;

    try {
      console.log('🎨 Starting enhanced outfit generation...');
      console.log(`📊 Quality: ${qualityPreset}, Model: ${modelType}`);

      // Generate enhanced prompts
      const promptData = this.promptGenerator.generateOutfitPrompt(clothingItems, {
        modelType,
        qualityPreset,
        styleDNA,
        gender,
        style
      });

      console.log('✅ Enhanced prompts generated');
      console.log(`📝 Main prompt length: ${promptData.prompt.length} chars`);
      console.log(`🚫 Negative prompt length: ${promptData.negative_prompt.length} chars`);

      // Call Python generation script
      const result = await this.callPythonGenerator({
        prompt: promptData.prompt,
        negativePrompt: promptData.negative_prompt,
        qualityPreset,
        outputPath
      });

      if (result.success) {
        console.log('🎉 Enhanced generation completed successfully!');
        console.log(`📸 Generated in: ${result.metadata.generation_time}s`);
        console.log(`📁 Saved to: ${result.output_path}`);
        
        return {
          success: true,
          imagePath: result.output_path,
          metadata: {
            ...result.metadata,
            prompt_data: promptData,
            quality_score: promptData.estimated_quality_score
          }
        };
      } else {
        throw new Error(`Generation failed: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ Enhanced generation failed:', error);
      return {
        success: false,
        error: error.message,
        imagePath: null
      };
    }
  }

  /**
   * Generate multiple outfit variations
   */
  async generateOutfitVariations(clothingItems, options = {}) {
    const {
      count = 3,
      qualityPreset = 'standard',
      variations = ['fashion_photography', 'editorial', 'commercial']
    } = options;

    const results = [];

    for (let i = 0; i < count; i++) {
      const style = variations[i % variations.length];
      console.log(`🎨 Generating variation ${i + 1}/${count} (${style})`);

      const result = await this.generateOutfitImage(clothingItems, {
        ...options,
        qualityPreset,
        style,
        outputPath: null // Auto-generate unique paths
      });

      results.push({
        ...result,
        variation_index: i,
        style
      });

      // Brief pause between generations
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Quick preview generation for rapid iteration
   */
  async generatePreview(clothingItems, options = {}) {
    return this.generateOutfitImage(clothingItems, {
      ...options,
      qualityPreset: 'preview',
      modelType: 'sdxl'
    });
  }

  /**
   * Commercial quality generation for final output
   */
  async generateCommercial(clothingItems, options = {}) {
    return this.generateOutfitImage(clothingItems, {
      ...options,
      qualityPreset: 'commercial',
      modelType: 'sdxl'
    });
  }

  /**
   * Call the enhanced Python generator
   */
  async callPythonGenerator({ prompt, negativePrompt, qualityPreset, outputPath }) {
    return new Promise((resolve, reject) => {
      const args = [
        this.generatorScriptPath,
        '--prompt', prompt,
        '--negative-prompt', negativePrompt,
        '--quality', qualityPreset,
        '--models-dir', this.modelsDir
      ];

      if (outputPath) {
        args.push('--output', outputPath);
      }

      console.log('🐍 Calling Python generator...');
      
      const pythonProcess = spawn(this.pythonVenvPath, args);
      
      let output = '';
      let error = '';
      let generationResult = null;

      pythonProcess.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        
        // Look for generation result JSON
        if (dataStr.includes('GENERATION_RESULT_JSON:')) {
          try {
            const jsonStart = dataStr.indexOf('GENERATION_RESULT_JSON:') + 'GENERATION_RESULT_JSON:'.length;
            const jsonStr = dataStr.substring(jsonStart).trim();
            generationResult = JSON.parse(jsonStr);
          } catch (e) {
            console.warn('⚠️ Could not parse generation result JSON');
          }
        }
        
        // Log progress
        console.log(dataStr.trim());
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
        console.error('Python stderr:', data.toString());
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && generationResult) {
          resolve(generationResult);
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`));
        }
      });

      pythonProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
  }

  /**
   * Check if enhanced models are available
   */
  async checkModelAvailability() {
    const modelsToCheck = [
      'juggernaut-xl',
      'realvis-xl', 
      'sdxl-lightning'
    ];

    const availability = {};

    for (const modelName of modelsToCheck) {
      const modelPath = path.join(this.modelsDir, modelName);
      availability[modelName] = fs.existsSync(modelPath);
    }

    return availability;
  }

  /**
   * Get system capabilities for model selection
   */
  async getSystemCapabilities() {
    try {
      const result = await this.callPythonGenerator({
        prompt: 'test',
        negativePrompt: 'test',
        qualityPreset: 'preview',
        outputPath: '/tmp/test_capabilities.png'
      });

      return {
        device: result.metadata?.device || 'unknown',
        available: true,
        models_available: await this.checkModelAvailability()
      };
    } catch (error) {
      return {
        device: 'unknown',
        available: false,
        error: error.message,
        models_available: await this.checkModelAvailability()
      };
    }
  }

  /**
   * Generate outfit image with fallback to current system
   */
  async generateWithFallback(clothingItems, options = {}) {
    try {
      // Try enhanced generation first
      const enhancedResult = await this.generateOutfitImage(clothingItems, options);
      
      if (enhancedResult.success) {
        return enhancedResult;
      }
    } catch (error) {
      console.warn('⚠️ Enhanced generation failed, falling back to original system');
    }

    // Fallback to original system
    try {
      const { PhotoRealisticVisualizer } = await import('../visualizers/PhotoRealisticVisualizer.js');
      const fallbackVisualizer = new PhotoRealisticVisualizer();
      
      const fallbackResult = await fallbackVisualizer.generateOutfitImage(clothingItems, options);
      
      return {
        success: true,
        imagePath: fallbackResult,
        metadata: {
          fallback_used: true,
          generation_method: 'original_system'
        }
      };
    } catch (fallbackError) {
      console.error('❌ Both enhanced and fallback generation failed');
      throw new Error(`All generation methods failed: ${fallbackError.message}`);
    }
  }
}

/**
 * Quality preset definitions for easy reference
 */
export const QUALITY_PRESETS = {
  PREVIEW: 'preview',        // Fast preview (15 steps, 768x1024)
  STANDARD: 'standard',      // Balanced quality (25 steps, 1024x1024)
  HIGH_QUALITY: 'high_quality', // High quality (30 steps, 1024x1344)
  COMMERCIAL: 'commercial'   // Commercial grade (40 steps, 1024x1536)
};

/**
 * Model types for different use cases
 */
export const MODEL_TYPES = {
  SDXL: 'sdxl',    // SDXL models (Juggernaut, RealVis, Lightning)
  SD15: 'sd15'     // Stable Diffusion 1.5 (fallback)
};

/**
 * Photography styles available
 */
export const PHOTOGRAPHY_STYLES = {
  FASHION: 'fashion_photography',
  EDITORIAL: 'editorial',
  COMMERCIAL: 'commercial',
  LIFESTYLE: 'lifestyle'
};