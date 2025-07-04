/**
 * Enhanced Prompt Generator for StyleAgent
 * Professional fashion photography prompts optimized for FLUX.1, SDXL, and SD models
 * Delivers DALL-E 3+ quality through advanced prompt engineering
 */

export class EnhancedPromptGenerator {
  constructor() {
    this.fashionVocabulary = this.initializeFashionVocabulary();
    this.qualityTemplates = this.initializeQualityTemplates();
    this.modelOptimizations = this.initializeModelOptimizations();
  }

  /**
   * Generate enhanced prompt for outfit generation
   */
  generateOutfitPrompt(clothingItems, options = {}) {
    const {
      modelType = 'flux', // 'flux', 'sdxl', 'sd15'
      qualityPreset = 'high_quality', // 'preview', 'standard', 'high_quality', 'commercial'
      styleDNA = null,
      gender = null,
      style = 'fashion_photography',
      composition = 'full_body',
      background = 'studio'
    } = options;

    // Build detailed clothing descriptions
    const enhancedClothingDescs = this.enhanceClothingDescriptions(clothingItems);
    
    // Generate core prompt components
    const qualitySpecs = this.getQualitySpecifications(qualityPreset);
    const modelSpecs = this.getModelSpecifications(modelType);
    const humanSpecs = this.getHumanSpecifications(gender, styleDNA);
    const compositionSpecs = this.getCompositionSpecifications(composition, background);
    const styleSpecs = this.getStyleSpecifications(style);
    
    // Construct main prompt
    const mainPrompt = this.buildMainPrompt({
      qualitySpecs,
      humanSpecs,
      enhancedClothingDescs,
      compositionSpecs,
      styleSpecs,
      modelSpecs
    });

    // Generate negative prompt
    const negativePrompt = this.generateNegativePrompt(modelType, qualityPreset);

    return {
      prompt: mainPrompt,
      negative_prompt: negativePrompt,
      model_type: modelType,
      quality_preset: qualityPreset,
      estimated_quality_score: this.estimateQualityScore(qualityPreset, modelType)
    };
  }

  /**
   * Enhanced clothing descriptions with professional terminology
   */
  enhanceClothingDescriptions(clothingItems) {
    return clothingItems.map(item => {
      const enhanced = {
        base: item.description || item.title || 'clothing item',
        color: this.enhanceColorDescription(item.color),
        material: this.enhanceMaterialDescription(item.material),
        style: this.enhanceStyleDescription(item.style, item.category),
        fit: this.enhanceFitDescription(item.fit),
        details: this.extractStyleDetails(item)
      };

      // Build comprehensive description
      const parts = [
        enhanced.color,
        enhanced.material,
        enhanced.style,
        enhanced.fit,
        enhanced.details
      ].filter(Boolean);

      return parts.join(' ');
    });
  }

  /**
   * Enhanced color descriptions with fashion terminology
   */
  enhanceColorDescription(color) {
    if (!color) return '';
    
    const colorEnhancements = {
      'navy': 'deep navy blue',
      'navy blue': 'sophisticated navy blue',
      'white': 'crisp pristine white',
      'black': 'rich jet black',
      'gray': 'elegant charcoal gray',
      'grey': 'sophisticated dove grey',
      'brown': 'warm cognac brown',
      'tan': 'luxurious camel tan',
      'blue': 'vibrant cobalt blue',
      'red': 'bold crimson red',
      'green': 'forest emerald green',
      'pink': 'soft blush pink',
      'purple': 'regal amethyst purple',
      'yellow': 'sunny golden yellow',
      'orange': 'warm burnt orange',
      'beige': 'sophisticated nude beige',
      'cream': 'luxurious ivory cream'
    };

    const normalizedColor = color.toLowerCase().trim();
    return colorEnhancements[normalizedColor] || `beautiful ${color}`;
  }

  /**
   * Enhanced material descriptions
   */
  enhanceMaterialDescription(material) {
    if (!material) return '';

    const materialEnhancements = {
      'cotton': 'premium cotton weave',
      'denim': 'structured denim fabric',
      'wool': 'fine merino wool',
      'silk': 'lustrous silk charmeuse',
      'leather': 'supple genuine leather',
      'linen': 'breathable linen weave',
      'cashmere': 'luxurious cashmere',
      'polyester': 'high-quality synthetic blend',
      'nylon': 'sleek technical fabric',
      'spandex': 'stretch performance fabric',
      'modal': 'smooth modal blend',
      'rayon': 'flowing rayon fabric'
    };

    const normalizedMaterial = material.toLowerCase().trim();
    return materialEnhancements[normalizedMaterial] || `quality ${material}`;
  }

  /**
   * Enhanced style descriptions
   */
  enhanceStyleDescription(style, category) {
    if (!style) return '';

    const styleEnhancements = {
      // Tops
      'blazer': 'tailored professional blazer',
      'shirt': 'crisp button-down shirt',
      'blouse': 'elegant flowing blouse',
      't-shirt': 'fitted crew neck tee',
      'sweater': 'cozy knit sweater',
      'cardigan': 'open-front cardigan',
      'tank': 'sleek tank top',
      'polo': 'classic polo shirt',
      
      // Bottoms
      'jeans': 'perfectly fitted jeans',
      'trousers': 'tailored dress trousers',
      'pants': 'well-cut straight pants',
      'skirt': 'flattering A-line skirt',
      'shorts': 'stylish bermuda shorts',
      'leggings': 'sleek athletic leggings',
      
      // Shoes
      'sneakers': 'premium white sneakers',
      'heels': 'elegant pointed-toe heels',
      'boots': 'sophisticated ankle boots',
      'loafers': 'classic penny loafers',
      'sandals': 'minimalist strap sandals',
      'flats': 'comfortable ballet flats'
    };

    const normalizedStyle = style.toLowerCase().trim();
    return styleEnhancements[normalizedStyle] || `stylish ${style}`;
  }

  /**
   * Enhanced fit descriptions
   */
  enhanceFitDescription(fit) {
    if (!fit) return '';

    const fitEnhancements = {
      'slim': 'perfectly tailored slim fit',
      'regular': 'comfortable regular fit',
      'loose': 'relaxed oversized fit',
      'tight': 'form-fitting silhouette',
      'oversized': 'intentionally oversized cut',
      'tailored': 'expertly tailored fit',
      'straight': 'classic straight cut',
      'skinny': 'sleek skinny fit',
      'wide': 'flowing wide-leg cut',
      'cropped': 'modern cropped length'
    };

    const normalizedFit = fit.toLowerCase().trim();
    return fitEnhancements[normalizedFit] || `well-fitted ${fit}`;
  }

  /**
   * Extract and enhance style details
   */
  extractStyleDetails(item) {
    const details = [];
    
    if (item.tags) {
      const styleDetails = item.tags.filter(tag => 
        !tag.includes('brand:') && 
        !tag.includes('text-entry') &&
        !['casual', 'formal', 'business'].includes(tag.toLowerCase())
      );
      details.push(...styleDetails);
    }

    return details.length > 0 ? `with ${details.join(', ')} details` : '';
  }

  /**
   * Quality specifications for different presets
   */
  getQualitySpecifications(preset) {
    const specs = {
      preview: {
        resolution: 'good quality',
        detail: 'clear details',
        lighting: 'natural lighting'
      },
      standard: {
        resolution: 'high quality',
        detail: 'sharp details',
        lighting: 'professional lighting'
      },
      high_quality: {
        resolution: 'ultra high quality',
        detail: 'crystal clear details',
        lighting: 'studio-quality lighting'
      },
      commercial: {
        resolution: 'commercial photography quality',
        detail: 'museum-quality detail',
        lighting: 'professional studio lighting setup'
      }
    };

    return specs[preset] || specs.standard;
  }

  /**
   * Model-specific optimizations
   */
  getModelSpecifications(modelType) {
    const specs = {
      flux: {
        prefix: 'masterpiece, best quality,',
        emphasis: 'ultra detailed, photorealistic,',
        technical: '8k uhd, high resolution,'
      },
      sdxl: {
        prefix: 'masterpiece, best quality,',
        emphasis: 'highly detailed, photorealistic,',
        technical: '4k, high resolution,'
      },
      sd15: {
        prefix: 'masterpiece, best quality,',
        emphasis: 'detailed, realistic,',
        technical: 'high quality,'
      }
    };

    return specs[modelType] || specs.flux;
  }

  /**
   * Human model specifications
   */
  getHumanSpecifications(gender, styleDNA) {
    let baseSpec = 'beautiful professional fashion model';
    
    if (gender === 'male') {
      baseSpec = 'handsome male fashion model';
    } else if (gender === 'female') {
      baseSpec = 'beautiful female fashion model';
    }

    const specs = [baseSpec];

    if (styleDNA?.appearance) {
      const { appearance } = styleDNA;
      
      // Add hair details
      if (appearance.hair_color && appearance.hair_length) {
        specs.push(`${appearance.hair_color} ${appearance.hair_length} hair`);
      }

      // Add build/physique
      if (appearance.build) {
        specs.push(`${appearance.build} build`);
      }

      // Add complexion
      if (appearance.complexion) {
        specs.push(`${appearance.complexion} skin tone`);
      }

      // Add age range
      if (appearance.age_range) {
        specs.push(`${appearance.age_range} appearance`);
      }
    }

    return specs.join(', ');
  }

  /**
   * Composition and background specifications
   */
  getCompositionSpecifications(composition, background) {
    const compositions = {
      full_body: 'full body shot from head to toe',
      portrait: 'portrait composition focusing on upper body',
      three_quarter: 'three-quarter length composition'
    };

    const backgrounds = {
      studio: 'clean white studio background',
      minimal: 'minimal light gray background',
      gradient: 'subtle gradient background',
      natural: 'soft natural background'
    };

    return {
      composition: compositions[composition] || compositions.full_body,
      background: backgrounds[background] || backgrounds.studio
    };
  }

  /**
   * Photography style specifications
   */
  getStyleSpecifications(style) {
    const styles = {
      fashion_photography: {
        description: 'professional fashion photography',
        lighting: 'studio lighting with soft shadows',
        mood: 'confident and elegant mood',
        reference: 'Vogue magazine editorial style'
      },
      editorial: {
        description: 'high-end editorial photography',
        lighting: 'dramatic editorial lighting',
        mood: 'sophisticated artistic mood',
        reference: 'Harper\'s Bazaar editorial style'
      },
      commercial: {
        description: 'commercial product photography',
        lighting: 'bright commercial lighting',
        mood: 'approachable and stylish mood',
        reference: 'premium brand catalog style'
      },
      lifestyle: {
        description: 'lifestyle fashion photography',
        lighting: 'natural lifestyle lighting',
        mood: 'relaxed and authentic mood',
        reference: 'modern lifestyle brand style'
      }
    };

    return styles[style] || styles.fashion_photography;
  }

  /**
   * Build the main prompt from components
   */
  buildMainPrompt({ qualitySpecs, humanSpecs, enhancedClothingDescs, compositionSpecs, styleSpecs, modelSpecs }) {
    const prompt = [
      // Model-specific prefix
      modelSpecs.prefix,
      modelSpecs.emphasis,
      modelSpecs.technical,
      
      // Core description
      `${styleSpecs.description} featuring ${humanSpecs}`,
      
      // Outfit details
      'wearing a complete outfit consisting of:',
      enhancedClothingDescs.map((desc, i) => `${i + 1}. ${desc}`).join(', '),
      
      // Composition
      compositionSpecs.composition,
      'positioned in a confident fashion pose',
      compositionSpecs.background,
      
      // Quality specifications
      qualitySpecs.lighting,
      qualitySpecs.detail,
      qualitySpecs.resolution,
      
      // Style details
      styleSpecs.lighting,
      styleSpecs.mood,
      `shot in ${styleSpecs.reference}`,
      
      // Final quality emphasis
      'sharp focus, perfect composition, professional quality'
    ];

    return prompt.filter(Boolean).join(', ');
  }

  /**
   * Generate comprehensive negative prompt
   */
  generateNegativePrompt(modelType, qualityPreset) {
    const baseNegatives = [
      // Quality issues
      'blurry, out of focus, low quality, low resolution',
      'grainy, pixelated, compression artifacts',
      'oversaturated, undersaturated, bad colors',
      
      // Human anatomy issues
      'distorted face, ugly face, deformed face',
      'bad eyes, crossed eyes, asymmetrical eyes',
      'bad hands, deformed hands, extra fingers, missing fingers',
      'bad anatomy, deformed body, disproportionate',
      'extra limbs, missing limbs, floating limbs',
      
      // Clothing issues
      'poorly fitted clothes, wrinkled clothes',
      'floating clothes, disconnected clothing',
      'unrealistic clothing physics',
      
      // Composition issues
      'cropped body parts, cut off head, cut off feet',
      'multiple people, crowd, group',
      'cluttered background, distracting background',
      
      // Technical issues
      'watermark, signature, text, logo',
      'frame, border, split screen',
      'amateur photography, snapshot quality'
    ];

    // Model-specific negatives
    const modelNegatives = {
      flux: [
        'painting, drawing, illustration, cartoon',
        'artificial, synthetic, fake'
      ],
      sdxl: [
        'painting, drawing, cartoon, anime',
        'unrealistic, fantasy, fictional'
      ],
      sd15: [
        'painting, sketch, cartoon',
        'low detail, simple'
      ]
    };

    // Quality-specific negatives
    const qualityNegatives = {
      commercial: [
        'amateur, casual, informal',
        'poor lighting, harsh shadows',
        'unprofessional composition'
      ],
      high_quality: [
        'amateur photography',
        'poor composition'
      ]
    };

    const negatives = [
      ...baseNegatives,
      ...(modelNegatives[modelType] || []),
      ...(qualityNegatives[qualityPreset] || [])
    ];

    return negatives.join(', ');
  }

  /**
   * Estimate quality score based on settings
   */
  estimateQualityScore(preset, modelType) {
    const presetScores = {
      preview: 60,
      standard: 75,
      high_quality: 90,
      commercial: 95
    };

    const modelMultipliers = {
      flux: 1.0,
      sdxl: 0.9,
      sd15: 0.7
    };

    const baseScore = presetScores[preset] || 75;
    const multiplier = modelMultipliers[modelType] || 1.0;
    
    return Math.round(baseScore * multiplier);
  }

  /**
   * Initialize fashion vocabulary database
   */
  initializeFashionVocabulary() {
    // Comprehensive fashion terminology database
    return {
      materials: [
        'cotton', 'denim', 'wool', 'silk', 'leather', 'linen', 'cashmere',
        'polyester', 'nylon', 'spandex', 'modal', 'rayon', 'velvet', 'tweed'
      ],
      colors: [
        'navy', 'burgundy', 'emerald', 'sapphire', 'crimson', 'ivory',
        'charcoal', 'champagne', 'rose gold', 'forest green', 'midnight blue'
      ],
      styles: [
        'minimalist', 'contemporary', 'classic', 'modern', 'sophisticated',
        'elegant', 'chic', 'trendy', 'timeless', 'refined', 'polished'
      ],
      fits: [
        'tailored', 'relaxed', 'fitted', 'loose', 'structured', 'flowing',
        'slim', 'straight', 'wide', 'cropped', 'oversized', 'body-hugging'
      ]
    };
  }

  /**
   * Initialize quality templates
   */
  initializeQualityTemplates() {
    return {
      face_quality: 'beautiful natural face, clear eyes, natural expression',
      body_quality: 'perfect human anatomy, natural proportions',
      clothing_quality: 'well-fitted clothes, natural fabric drape',
      lighting_quality: 'professional studio lighting, soft shadows',
      composition_quality: 'perfect composition, rule of thirds'
    };
  }

  /**
   * Initialize model optimizations
   */
  initializeModelOptimizations() {
    return {
      flux: {
        strengths: ['photorealism', 'detail', 'prompt_adherence'],
        optimal_settings: {
          guidance_scale: 7.5,
          num_inference_steps: 20,
          scheduler: 'DDPM'
        }
      },
      sdxl: {
        strengths: ['composition', 'color', 'style'],
        optimal_settings: {
          guidance_scale: 8.0,
          num_inference_steps: 25,
          scheduler: 'DPMSolverMultistep'
        }
      },
      sd15: {
        strengths: ['speed', 'consistency'],
        optimal_settings: {
          guidance_scale: 7.5,
          num_inference_steps: 20,
          scheduler: 'DDIM'
        }
      }
    };
  }
}