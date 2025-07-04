/**
 * Comparison Generator for StyleAgent
 * Provides side-by-side comparison between local enhanced generation and OpenAI
 */

import { EnhancedImageGenerator } from './EnhancedImageGenerator.js';
import fs from 'fs';

export class ComparisonGenerator {
  constructor() {
    this.enhancedGenerator = new EnhancedImageGenerator();
  }

  /**
   * Generate side-by-side comparison: Local vs OpenAI
   */
  async generateComparison(clothingItems, options = {}) {
    const {
      qualityPreset = 'high_quality',
      gender = null,
      styleDNA = null,
      includeOpenAI = true
    } = options;

    console.log('🔬 Starting comparison generation...');
    console.log(`📊 Quality preset: ${qualityPreset}`);

    const results = {
      local: null,
      openai: null,
      comparison: null
    };

    try {
      // Generate with enhanced local system
      console.log('\n🎨 Generating with Enhanced Local System...');
      const localStart = Date.now();
      
      const localResult = await this.enhancedGenerator.generateOutfitImage(clothingItems, {
        qualityPreset,
        gender,
        styleDNA,
        style: 'fashion_photography'
      });

      if (localResult.success) {
        results.local = {
          ...localResult,
          generation_time: (Date.now() - localStart) / 1000,
          method: 'enhanced_local',
          privacy: 'full',
          cost: 0
        };
        console.log('✅ Local generation completed');
        console.log(`⏱️  Time: ${results.local.generation_time}s`);
        console.log(`📁 Saved: ${localResult.imagePath}`);
      } else {
        console.log('❌ Local generation failed:', localResult.error);
      }

      // Generate with OpenAI (if enabled and API key available)
      if (includeOpenAI && this.isOpenAIAvailable()) {
        console.log('\n🤖 Generating with OpenAI for comparison...');
        
        try {
          // Import OpenAI client dynamically
          const { generatePersonalizedOutfitImage } = await import('../services/openaiClient.js');
          
          const openaiStart = Date.now();
          const openaiUrl = await generatePersonalizedOutfitImage(clothingItems, styleDNA, gender);
          
          if (openaiUrl) {
            results.openai = {
              success: true,
              imagePath: openaiUrl,
              generation_time: (Date.now() - openaiStart) / 1000,
              method: 'openai_dalle3',
              privacy: 'external',
              cost: 0.04 // Approximate cost per image
            };
            console.log('✅ OpenAI generation completed');
            console.log(`⏱️  Time: ${results.openai.generation_time}s`);
            console.log(`🔗 URL: ${openaiUrl}`);
          } else {
            console.log('❌ OpenAI generation failed');
          }
        } catch (error) {
          console.log('❌ OpenAI generation error:', error.message);
        }
      } else {
        console.log('\n⚠️ OpenAI comparison skipped (API key not available or disabled)');
      }

      // Generate comparison summary
      results.comparison = this.generateComparisonSummary(results.local, results.openai);

      console.log('\n📊 Comparison Summary:');
      console.log('='.repeat(50));
      
      if (results.local?.success) {
        console.log('🏠 LOCAL (Enhanced StyleAgent):');
        console.log(`   ✅ Success: ${results.local.success}`);
        console.log(`   ⏱️  Time: ${results.local.generation_time}s`);
        console.log(`   🔒 Privacy: Full (local processing)`);
        console.log(`   💰 Cost: $0 (one-time model download)`);
        console.log(`   📐 Resolution: ${results.local.metadata.resolution}`);
        console.log(`   🖥️  Device: ${results.local.metadata.device}`);
      }

      if (results.openai?.success) {
        console.log('\n🤖 OPENAI (DALL-E 3):');
        console.log(`   ✅ Success: ${results.openai.success}`);
        console.log(`   ⏱️  Time: ${results.openai.generation_time}s`);
        console.log(`   🔒 Privacy: External (sent to OpenAI)`);
        console.log(`   💰 Cost: ~$0.04 per image`);
        console.log(`   📐 Resolution: 1024x1792`);
        console.log(`   🌐 Device: OpenAI cloud`);
      }

      console.log('\n🏆 Winner Analysis:');
      if (results.comparison) {
        console.log(`   📊 Quality: ${results.comparison.quality_winner}`);
        console.log(`   ⚡ Speed: ${results.comparison.speed_winner}`);
        console.log(`   🔒 Privacy: ${results.comparison.privacy_winner}`);
        console.log(`   💰 Cost: ${results.comparison.cost_winner}`);
        console.log(`   🎯 Overall: ${results.comparison.overall_recommendation}`);
      }

      return results;

    } catch (error) {
      console.error('❌ Comparison generation failed:', error);
      return {
        ...results,
        error: error.message
      };
    }
  }

  /**
   * Generate multiple comparisons for thorough testing
   */
  async generateMultipleComparisons(testCases) {
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🧪 Test Case ${i + 1}/${testCases.length}: ${testCase.name}`);
      console.log('-'.repeat(30));

      const result = await this.generateComparison(testCase.clothingItems, testCase.options);
      results.push({
        ...result,
        testCase: testCase.name
      });

      // Brief pause between tests
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Generate overall comparison report
    this.generateComparisonReport(results);
    return results;
  }

  /**
   * Check if OpenAI is available
   */
  isOpenAIAvailable() {
    return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0;
  }

  /**
   * Generate comparison summary
   */
  generateComparisonSummary(localResult, openaiResult) {
    if (!localResult?.success && !openaiResult?.success) {
      return null;
    }

    const summary = {
      both_successful: localResult?.success && openaiResult?.success,
      quality_winner: 'unknown',
      speed_winner: 'unknown',
      privacy_winner: 'local',
      cost_winner: 'local',
      overall_recommendation: 'local'
    };

    if (localResult?.success && openaiResult?.success) {
      // Speed comparison
      if (localResult.generation_time < openaiResult.generation_time) {
        summary.speed_winner = 'local';
      } else if (openaiResult.generation_time < localResult.generation_time) {
        summary.speed_winner = 'openai';
      } else {
        summary.speed_winner = 'tie';
      }

      // Quality comparison (based on resolution and model capabilities)
      const localRes = localResult.metadata.resolution;
      const openaiRes = '1024x1792';
      
      // For now, consider them comparable - would need human evaluation for quality
      summary.quality_winner = 'comparable';

      // Overall recommendation
      if (localResult.generation_time < 60) {
        summary.overall_recommendation = 'local (fast + private)';
      } else {
        summary.overall_recommendation = 'depends on use case';
      }
    } else if (localResult?.success) {
      summary.overall_recommendation = 'local (only working option)';
    } else if (openaiResult?.success) {
      summary.overall_recommendation = 'openai (only working option)';
    }

    return summary;
  }

  /**
   * Generate comprehensive comparison report
   */
  generateComparisonReport(results) {
    console.log('\n📋 COMPREHENSIVE COMPARISON REPORT');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.local?.success || r.openai?.success);
    const localSuccesses = results.filter(r => r.local?.success).length;
    const openaiSuccesses = results.filter(r => r.openai?.success).length;

    console.log(`📊 Test Results Summary:`);
    console.log(`   Total tests: ${results.length}`);
    console.log(`   Local successes: ${localSuccesses}/${results.length}`);
    console.log(`   OpenAI successes: ${openaiSuccesses}/${results.length}`);

    if (localSuccesses > 0) {
      const avgLocalTime = results
        .filter(r => r.local?.success)
        .reduce((sum, r) => sum + r.local.generation_time, 0) / localSuccesses;
      
      console.log(`\n🏠 Local Performance:`);
      console.log(`   Average generation time: ${avgLocalTime.toFixed(1)}s`);
      console.log(`   Success rate: ${(localSuccesses / results.length * 100).toFixed(1)}%`);
      console.log(`   Privacy: 100% local`);
      console.log(`   Cost: $0 ongoing`);
    }

    if (openaiSuccesses > 0) {
      const avgOpenAITime = results
        .filter(r => r.openai?.success)
        .reduce((sum, r) => sum + r.openai.generation_time, 0) / openaiSuccesses;
      
      console.log(`\n🤖 OpenAI Performance:`);
      console.log(`   Average generation time: ${avgOpenAITime.toFixed(1)}s`);
      console.log(`   Success rate: ${(openaiSuccesses / results.length * 100).toFixed(1)}%`);
      console.log(`   Privacy: External processing`);
      console.log(`   Cost: ~$${(openaiSuccesses * 0.04).toFixed(2)} for this test`);
    }

    console.log(`\n🏆 Recommendation:`);
    if (localSuccesses === results.length) {
      console.log(`   ✅ Use Enhanced Local System`);
      console.log(`   Reasons: 100% success rate, full privacy, zero ongoing costs`);
    } else if (localSuccesses > openaiSuccesses) {
      console.log(`   ✅ Prefer Enhanced Local System with OpenAI backup`);
      console.log(`   Reasons: Better success rate, privacy-first, cost-effective`);
    } else {
      console.log(`   🤔 Mixed results - use case dependent`);
      console.log(`   Consider hybrid approach based on requirements`);
    }
  }
}

/**
 * Predefined test cases for comparison
 */
export const COMPARISON_TEST_CASES = [
  {
    name: 'Casual Male Outfit',
    clothingItems: [
      {
        title: "Navy Blue Blazer",
        color: "navy blue", 
        material: "wool blend",
        style: "tailored blazer",
        fit: "slim fit",
        category: "jacket"
      },
      {
        title: "White Cotton Shirt",
        color: "white",
        material: "cotton", 
        style: "button-down shirt",
        fit: "tailored fit",
        category: "top"
      },
      {
        title: "Dark Jeans",
        color: "dark indigo",
        material: "denim",
        style: "straight-leg jeans", 
        fit: "regular fit",
        category: "bottom"
      }
    ],
    options: {
      gender: 'male',
      qualityPreset: 'high_quality'
    }
  },
  {
    name: 'Professional Female Outfit',
    clothingItems: [
      {
        title: "Black Blazer",
        color: "black",
        material: "wool",
        style: "professional blazer",
        fit: "tailored fit",
        category: "jacket"
      },
      {
        title: "White Blouse", 
        color: "white",
        material: "silk",
        style: "button-up blouse",
        fit: "fitted",
        category: "top"
      },
      {
        title: "Black Trousers",
        color: "black",
        material: "wool blend",
        style: "straight trousers",
        fit: "tailored fit", 
        category: "bottom"
      }
    ],
    options: {
      gender: 'female',
      qualityPreset: 'commercial'
    }
  }
];