const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

/**
 * ImageGenerator - Handles photo-realistic outfit image generation
 * Uses direct Python diffusers pipeline for reliable local generation
 */
class ImageGenerator {
  constructor() {
    // Path to our working Python environment and script
    this.pythonPath = '/Users/kaiyakramer/styleagent/stable-diffusion-webui/venv/bin/python';
    this.generatorScript = path.join(__dirname, '../scripts/generate_outfit_image.py');
    
    // Default generation parameters optimized for fashion
    this.defaultParams = {
      width: 512,
      height: 512,
      steps: 20,
      guidance_scale: 7.5,
      model_id: "runwayml/stable-diffusion-v1-5"
    };
    
    // Output directory for generated images
    this.outputDir = path.join(__dirname, '../generated_outfits');
    
    this.isAvailable = null; // Cache availability status
  }

  /**
   * Check if Stable Diffusion pipeline is available
   * @returns {Promise<Object>} Availability status and info
   */
  async checkAvailability() {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      // Test our Python environment
      const result = await this.runPythonScript('test_availability');
      
      this.isAvailable = {
        success: true,
        available: true,
        type: 'direct_diffusers',
        info: 'Direct diffusers pipeline available',
        device: result.device || 'unknown'
      };
      
      return this.isAvailable;
      
    } catch (error) {
      console.error('Stable Diffusion pipeline not available:', error.message);
      
      this.isAvailable = {
        success: false,
        available: false,
        error: error.message,
        suggestion: 'Ensure diffusers and torch are installed in the Python environment'
      };
      
      return this.isAvailable;
    }
  }

  /**
   * Generate photo-realistic outfit image
   * @param {string} prompt - Detailed prompt from PromptGenerator
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateOutfitImage(prompt, options = {}) {
    try {
      // Check availability first
      const availability = await this.checkAvailability();
      if (!availability.available) {
        return {
          success: false,
          error: `Stable Diffusion not available: ${availability.error}`,
          suggestion: availability.suggestion
        };
      }

      // Prepare generation parameters
      const params = {
        prompt: prompt,
        negative_prompt: options.negativePrompt || this.getDefaultNegativePrompt(),
        width: options.width || this.defaultParams.width,
        height: options.height || this.defaultParams.height,
        steps: options.steps || this.defaultParams.steps,
        guidance_scale: options.guidanceScale || this.defaultParams.guidance_scale,
        model_id: options.modelId || this.defaultParams.model_id,
        output_dir: this.outputDir,
        filename: options.filename || `outfit_${Date.now()}`
      };

      console.log('🎨 Generating photo-realistic outfit image...');
      console.log('📝 Prompt:', prompt.substring(0, 100) + '...');
      
      // Run the generation script
      const result = await this.runPythonScript('generate', params);
      
      if (result.success && result.image_path) {
        // Read the generated image and convert to base64
        const imageBuffer = await fs.readFile(result.image_path);
        const base64Image = imageBuffer.toString('base64');
        const dataURL = `data:image/png;base64,${base64Image}`;
        
        return {
          success: true,
          image: dataURL,
          base64: base64Image,
          savedPath: result.image_path,
          parameters: params,
          info: {
            generation_time: result.generation_time,
            device: result.device
          }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown generation error'
        };
      }

    } catch (error) {
      console.error('Error generating outfit image:', error);
      
      return {
        success: false,
        error: error.message,
        suggestion: 'Check Python environment and diffusers installation'
      };
    }
  }

  /**
   * Generate multiple style variations of an outfit
   * @param {Object} prompts - Prompts from PromptGenerator.generatePromptVariations()
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Multiple generated images
   */
  async generateOutfitVariations(prompts, options = {}) {
    const variations = {};
    const errors = [];

    // Generate each style variation
    for (const [style, prompt] of Object.entries(prompts)) {
      if (style === 'negative') continue; // Skip negative prompt

      try {
        console.log(`🎨 Generating ${style} variation...`);
        
        const result = await this.generateOutfitImage(prompt, {
          ...options,
          negativePrompt: prompts.negative,
          filename: `outfit_${style}_${Date.now()}`
        });

        if (result.success) {
          variations[style] = result;
        } else {
          errors.push(`${style}: ${result.error}`);
        }
        
      } catch (error) {
        errors.push(`${style}: ${error.message}`);
      }
    }

    return {
      success: Object.keys(variations).length > 0,
      variations: variations,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Run Python script for image generation
   * @param {string} command - Command to run (test_availability, generate)
   * @param {Object} params - Parameters for the command
   * @returns {Promise<Object>} Script result
   */
  async runPythonScript(command, params = {}) {
    return new Promise((resolve, reject) => {
      const args = [this.generatorScript, command];
      
      // Add parameters as JSON string
      if (Object.keys(params).length > 0) {
        args.push(JSON.stringify(params));
      }
      
      const pythonProcess = spawn(this.pythonPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Parse JSON response from Python script
            const result = JSON.parse(stdout.trim());
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse Python script output: ${stdout}`));
          }
        } else {
          reject(new Error(`Python script failed with code ${code}: ${stderr}`));
        }
      });
      
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python script: ${error.message}`));
      });
    });
  }

  /**
   * Ensure output directory exists
   * @returns {Promise<void>}
   */
  async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  /**
   * Get default negative prompt for fashion photography
   * @returns {string} Negative prompt
   */
  getDefaultNegativePrompt() {
    return [
      'blurry', 'low quality', 'distorted', 'deformed',
      'bad anatomy', 'extra limbs', 'watermark', 'text',
      'signature', 'username', 'low resolution', 'pixelated',
      'mismatched colors', 'wrinkled clothing', 'stains',
      'torn fabric', 'ill-fitting clothes', 'unprofessional',
      'bad proportions', 'mutation', 'ugly', 'duplicate'
    ].join(', ');
  }

  /**
   * Configure generation parameters
   * @param {Object} config - Configuration
   */
  configure(config) {
    if (config.defaultParams) {
      this.defaultParams = { ...this.defaultParams, ...config.defaultParams };
    }
    if (config.outputDir) {
      this.outputDir = config.outputDir;
    }
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return {
      pythonPath: this.pythonPath,
      generatorScript: this.generatorScript,
      outputDir: this.outputDir,
      defaultParams: this.defaultParams,
      type: 'direct_diffusers'
    };
  }
}

module.exports = ImageGenerator;