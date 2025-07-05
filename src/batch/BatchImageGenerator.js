/**
 * BatchImageGenerator - Main orchestrator for batch image generation
 * Integrates queue management, progress tracking, error handling, and memory management
 */

const { EventEmitter } = require('events');
const { BatchImageQueue } = require('./BatchImageQueue.js');
const { BatchProgressTracker } = require('./BatchProgressTracker.js');
const { BatchErrorHandler } = require('./BatchErrorHandler.js');
const { MPSMemoryManager } = require('./MPSMemoryManager.js');
const { EnhancedImageGenerator } = require('../enhanced/EnhancedImageGenerator.js');
const path = require('path');
const fs = require('fs');

class BatchImageGenerator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration
    this.config = {
      maxConcurrentJobs: options.maxConcurrentJobs || 2,
      defaultQuality: options.defaultQuality || 'standard',
      outputDirectory: options.outputDirectory || '/Users/kaiyakramer/styleagent/generated_outfits',
      autoOptimizeMemory: options.autoOptimizeMemory !== false,
      enableProgressTracking: options.enableProgressTracking !== false,
      enableErrorHandling: options.enableErrorHandling !== false,
      enableMemoryManagement: options.enableMemoryManagement !== false,
      logLevel: options.logLevel || 'info',
      ...options
    };
    
    // Component instances
    this.queue = null;
    this.progressTracker = null;
    this.errorHandler = null;
    this.memoryManager = null;
    this.imageGenerator = null;
    
    // State
    this.isInitialized = false;
    this.isProcessing = false;
    this.currentBatchId = null;
    this.activeBatches = new Map();
    
    // Statistics
    this.stats = {
      totalBatches: 0,
      completedBatches: 0,
      failedBatches: 0,
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      totalProcessingTime: 0,
      averageJobTime: 0,
      createdAt: new Date()
    };
    
    console.log('🎨 BatchImageGenerator initialized');
  }

  /**
   * Initialize the batch generator
   */
  async initialize() {
    try {
      console.log('🚀 Initializing BatchImageGenerator...');
      
      // Initialize Enhanced Image Generator
      this.imageGenerator = new EnhancedImageGenerator();
      
      // Initialize Queue
      this.queue = new BatchImageQueue({
        maxConcurrentJobs: this.config.maxConcurrentJobs,
        maxRetries: 3,
        retryDelay: 5000,
        jobTimeout: 300000 // 5 minutes
      });
      
      // Initialize Progress Tracker
      if (this.config.enableProgressTracking) {
        this.progressTracker = new BatchProgressTracker({
          updateInterval: 1000,
          etaUpdateInterval: 2000
        });
      }
      
      // Initialize Error Handler
      if (this.config.enableErrorHandling) {
        this.errorHandler = new BatchErrorHandler({
          maxGlobalRetries: 5,
          circuitBreakerThreshold: 0.7,
          errorReportingInterval: 10000
        });
      }
      
      // Initialize Memory Manager
      if (this.config.enableMemoryManagement) {
        // Pass all memory-related configuration to the memory manager
        const memoryConfig = {
          maxMemoryUsage: this.config.maxMemoryUsage || 0.95,
          memoryCheckInterval: this.config.memoryCheckInterval || 5000,
          gcTriggerThreshold: this.config.gcTriggerThreshold || 0.90,
          lowMemoryThreshold: this.config.lowMemoryThreshold || 0.92,
          criticalMemoryThreshold: this.config.criticalMemoryThreshold || 0.98,
          memoryPressureCheckInterval: this.config.memoryPressureCheckInterval || 1000,
          memoryCleanupDelay: this.config.memoryCleanupDelay || 2000
        };
        
        // Debug logging (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('🧠 Memory manager config:', {
            maxMemoryUsage: memoryConfig.maxMemoryUsage,
            gcTriggerThreshold: memoryConfig.gcTriggerThreshold,
            lowMemoryThreshold: memoryConfig.lowMemoryThreshold,
            criticalMemoryThreshold: memoryConfig.criticalMemoryThreshold
          });
        }
        
        this.memoryManager = new MPSMemoryManager(memoryConfig);
        
        const memoryInit = await this.memoryManager.initialize();
        if (memoryInit.success) {
          // Adjust concurrency based on memory
          const memoryStats = this.memoryManager.getMemoryStatistics();
          const recommendedConcurrency = memoryStats.config.recommendedConcurrency;
          
          if (recommendedConcurrency !== this.config.maxConcurrentJobs) {
            console.log(`🧠 Adjusting concurrency from ${this.config.maxConcurrentJobs} to ${recommendedConcurrency} based on memory`);
            this.config.maxConcurrentJobs = recommendedConcurrency;
            this.queue.config.maxConcurrentJobs = recommendedConcurrency;
          }
        }
      }
      
      // Override queue's executeJob method
      this.queue.executeJob = this.executeJob.bind(this);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Ensure output directory exists
      this.ensureOutputDirectory();
      
      this.isInitialized = true;
      console.log('✅ BatchImageGenerator initialized successfully');
      
      this.emit('initialized', {
        config: this.config,
        capabilities: {
          progressTracking: !!this.progressTracker,
          errorHandling: !!this.errorHandler,
          memoryManagement: !!this.memoryManager
        }
      });
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ BatchImageGenerator initialization failed:', error);
      this.emit('initializationFailed', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set up event listeners for all components
   */
  setupEventListeners() {
    // Queue events
    this.queue.on('jobAdded', (job) => {
      this.emit('jobAdded', job);
    });
    
    this.queue.on('jobStarted', (job) => {
      if (this.progressTracker) {
        this.progressTracker.trackJobStart(job.id);
      }
      if (this.memoryManager) {
        this.memoryManager.trackJobStart(job.id, this.estimateJobMemoryUsage(job));
      }
      this.emit('jobStarted', job);
    });
    
    this.queue.on('jobCompleted', (job) => {
      if (this.progressTracker) {
        this.progressTracker.trackJobCompletion(job.id, job.result);
      }
      if (this.memoryManager) {
        this.memoryManager.trackJobCompletion(job.id);
      }
      this.updateStats('completed');
      this.emit('jobCompleted', job);
    });
    
    this.queue.on('jobFailed', (job) => {
      if (this.progressTracker) {
        this.progressTracker.trackJobFailure(job.id, job.errors[job.errors.length - 1]);
      }
      if (this.memoryManager) {
        this.memoryManager.trackJobCompletion(job.id);
      }
      this.updateStats('failed');
      this.emit('jobFailed', job);
    });
    
    this.queue.on('jobCancelled', (job) => {
      if (this.progressTracker) {
        this.progressTracker.trackJobCancellation(job.id);
      }
      if (this.memoryManager) {
        this.memoryManager.trackJobCompletion(job.id);
      }
      this.emit('jobCancelled', job);
    });
    
    this.queue.on('queueEmpty', () => {
      this.handleBatchCompletion();
    });
    
    // Progress tracker events
    if (this.progressTracker) {
      this.progressTracker.on('progressUpdated', (progress) => {
        this.emit('progressUpdated', progress);
      });
      
      this.progressTracker.on('batchCompleted', (batchStats) => {
        this.emit('batchCompleted', batchStats);
      });
      
      this.progressTracker.on('etaUpdated', (etaData) => {
        this.emit('etaUpdated', etaData);
      });
    }
    
    // Error handler events
    if (this.errorHandler) {
      this.errorHandler.on('jobRetryReady', async (retryData) => {
        // Add job back to queue with modifications
        const job = retryData.errorRecord.jobData;
        
        // Apply any modifications from fallback strategy
        if (retryData.modifiedJobData) {
          Object.assign(job, retryData.modifiedJobData);
        }
        
        // Add job back to queue
        this.queue.addJob(job);
      });
      
      this.errorHandler.on('circuitBreakerOpened', () => {
        console.warn('⚡ Circuit breaker opened - pausing queue');
        this.queue.pause();
      });
      
      this.errorHandler.on('circuitBreakerClosed', () => {
        console.log('✅ Circuit breaker closed - resuming queue');
        this.queue.resume();
      });
    }
    
    // Memory manager events
    if (this.memoryManager) {
      this.memoryManager.on('criticalMemoryPressure', (memoryData) => {
        console.warn('🚨 Critical memory pressure - reducing concurrency');
        this.queue.config.maxConcurrentJobs = memoryData.recommendedConcurrency;
        this.emit('memoryPressure', memoryData);
      });
      
      this.memoryManager.on('warningMemoryPressure', (memoryData) => {
        console.warn('⚠️ Memory pressure warning - adjusting concurrency');
        this.queue.config.maxConcurrentJobs = memoryData.recommendedConcurrency;
        this.emit('memoryPressure', memoryData);
      });
      
      this.memoryManager.on('memoryEmergency', (memoryData) => {
        console.error('🚨 Memory emergency - pausing processing');
        this.queue.pause();
        this.emit('memoryEmergency', memoryData);
        
        // Resume after brief pause
        setTimeout(() => {
          this.queue.resume();
        }, 5000);
      });
    }
  }

  /**
   * Generate multiple outfit images in batch
   */
  async generateBatch(jobs, options = {}) {
    if (!this.isInitialized) {
      throw new Error('BatchImageGenerator not initialized');
    }
    
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.currentBatchId = batchId;
    
    console.log(`🎯 Starting batch generation: ${batchId} (${jobs.length} jobs)`);
    
    try {
      // Validate jobs
      const validatedJobs = this.validateJobs(jobs);
      
      // Optimize batch for memory if enabled
      if (this.memoryManager) {
        const optimization = this.memoryManager.optimizeForBatch(
          validatedJobs.length,
          this.estimateJobMemoryUsage()
        );
        
        if (optimization.recommendedConcurrency !== this.config.maxConcurrentJobs) {
          console.log(`🧠 Batch optimization: adjusting concurrency to ${optimization.recommendedConcurrency}`);
          this.queue.config.maxConcurrentJobs = optimization.recommendedConcurrency;
        }
      }
      
      // Start batch tracking
      if (this.progressTracker) {
        this.progressTracker.startBatch(validatedJobs.length);
      }
      
      if (this.errorHandler) {
        this.errorHandler.setTotalJobs(validatedJobs.length);
      }
      
      // Add jobs to queue
      const jobIds = [];
      for (const job of validatedJobs) {
        const jobId = this.queue.addJob({
          ...job,
          batchId,
          type: 'image_generation'
        });
        jobIds.push(jobId);
      }
      
      // Track batch
      this.activeBatches.set(batchId, {
        id: batchId,
        jobIds,
        totalJobs: validatedJobs.length,
        startTime: Date.now(),
        options
      });
      
      this.stats.totalBatches++;
      this.stats.totalJobs += validatedJobs.length;
      
      this.emit('batchStarted', {
        batchId,
        totalJobs: validatedJobs.length,
        jobIds
      });
      
      return {
        success: true,
        batchId,
        totalJobs: validatedJobs.length,
        jobIds
      };
      
    } catch (error) {
      console.error(`❌ Batch generation failed: ${error.message}`);
      this.emit('batchFailed', { batchId, error: error.message });
      throw error;
    }
  }

  /**
   * Generate single outfit image
   */
  async generateSingle(clothingItems, options = {}) {
    const job = {
      clothingItems,
      qualityPreset: options.qualityPreset || this.config.defaultQuality,
      modelType: options.modelType || 'sdxl',
      styleDNA: options.styleDNA || null,
      gender: options.gender || null,
      style: options.style || 'fashion_photography',
      outputPath: options.outputPath || null,
      metadata: options.metadata || {}
    };
    
    const result = await this.generateBatch([job], options);
    
    return {
      ...result,
      singleJob: true
    };
  }

  /**
   * Generate outfit variations
   */
  async generateVariations(clothingItems, options = {}) {
    const {
      count = 3,
      variations = ['fashion_photography', 'editorial', 'commercial'],
      ...baseOptions
    } = options;
    
    const jobs = [];
    
    for (let i = 0; i < count; i++) {
      const style = variations[i % variations.length];
      jobs.push({
        clothingItems,
        style,
        variationIndex: i,
        qualityPreset: baseOptions.qualityPreset || this.config.defaultQuality,
        modelType: baseOptions.modelType || 'sdxl',
        styleDNA: baseOptions.styleDNA || null,
        gender: baseOptions.gender || null,
        outputPath: baseOptions.outputPath || null,
        metadata: {
          ...baseOptions.metadata,
          variation: style,
          variationIndex: i
        }
      });
    }
    
    const result = await this.generateBatch(jobs, {
      ...options,
      isVariationBatch: true
    });
    
    return {
      ...result,
      variationBatch: true,
      variationCount: count
    };
  }

  /**
   * Execute a single job (called by queue)
   */
  async executeJob(job) {
    const startTime = Date.now();
    
    try {
      console.log(`⚡ Executing job: ${job.id} (${job.type})`);
      
      // Check memory availability
      if (this.memoryManager) {
        const memoryCheck = this.memoryManager.canStartNewJob(
          this.estimateJobMemoryUsage(job)
        );
        
        if (!memoryCheck.canStart) {
          throw new Error(`Memory check failed: ${memoryCheck.reason}`);
        }
      }
      
      // Execute image generation
      const result = await this.imageGenerator.generateOutfitImage(job.clothingItems, {
        qualityPreset: job.qualityPreset,
        modelType: job.modelType,
        styleDNA: job.styleDNA,
        gender: job.gender,
        style: job.style,
        outputPath: job.outputPath
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Image generation failed');
      }
      
      // Process and save result
      const processedResult = await this.processJobResult(job, result);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Job completed: ${job.id} (${processingTime}ms)`);
      
      return {
        success: true,
        imagePath: processedResult.imagePath,
        metadata: processedResult.metadata,
        processingTime
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Job failed: ${job.id} (${processingTime}ms):`, error.message);
      
      // Handle error with error handler
      if (this.errorHandler) {
        await this.errorHandler.handleJobError(job.id, error, job);
      }
      
      throw error;
    }
  }

  /**
   * Process job result
   */
  async processJobResult(job, result) {
    // Generate output filename if not provided
    let outputPath = result.imagePath;
    
    if (!outputPath || !fs.existsSync(outputPath)) {
      // Generate new filename
      const timestamp = Date.now();
      const filename = `outfit_${timestamp}.png`;
      outputPath = path.join(this.config.outputDirectory, filename);
      
      // If the result has image data, save it
      if (result.imageData) {
        await fs.promises.writeFile(outputPath, result.imageData);
      }
    }
    
    // Prepare metadata
    const metadata = {
      ...result.metadata,
      jobId: job.id,
      batchId: job.batchId,
      generatedAt: new Date().toISOString(),
      clothingItems: job.clothingItems,
      generationSettings: {
        qualityPreset: job.qualityPreset,
        modelType: job.modelType,
        style: job.style,
        styleDNA: job.styleDNA,
        gender: job.gender
      }
    };
    
    return {
      imagePath: outputPath,
      metadata
    };
  }

  /**
   * Validate job array
   */
  validateJobs(jobs) {
    if (!Array.isArray(jobs)) {
      throw new Error('Jobs must be an array');
    }
    
    if (jobs.length === 0) {
      throw new Error('Jobs array cannot be empty');
    }
    
    return jobs.map((job, index) => {
      if (!job.clothingItems || !Array.isArray(job.clothingItems)) {
        throw new Error(`Job ${index}: clothingItems must be an array`);
      }
      
      if (job.clothingItems.length === 0) {
        throw new Error(`Job ${index}: clothingItems cannot be empty`);
      }
      
      return {
        clothingItems: job.clothingItems,
        qualityPreset: job.qualityPreset || this.config.defaultQuality,
        modelType: job.modelType || 'sdxl',
        styleDNA: job.styleDNA || null,
        gender: job.gender || null,
        style: job.style || 'fashion_photography',
        outputPath: job.outputPath || null,
        metadata: job.metadata || {}
      };
    });
  }

  /**
   * Estimate memory usage for a job
   */
  estimateJobMemoryUsage(job = {}) {
    const qualityPreset = job?.qualityPreset || this.config.defaultQuality;
    const modelType = job?.modelType || 'sdxl';
    
    // Memory estimates in bytes (realistic approximations for StyleAgent)
    const memoryEstimates = {
      'sdxl': {
        'preview': 512 * 1024 * 1024,      // 512MB
        'standard': 1024 * 1024 * 1024,    // 1GB
        'high_quality': 1536 * 1024 * 1024, // 1.5GB
        'commercial': 2048 * 1024 * 1024   // 2GB
      },
      'sd15': {
        'preview': 256 * 1024 * 1024,      // 256MB
        'standard': 512 * 1024 * 1024,     // 512MB
        'high_quality': 768 * 1024 * 1024, // 768MB
        'commercial': 1024 * 1024 * 1024   // 1GB
      }
    };
    
    return memoryEstimates[modelType]?.[qualityPreset] || 
           memoryEstimates['sdxl']['standard'];
  }

  /**
   * Handle batch completion
   */
  handleBatchCompletion() {
    if (!this.currentBatchId) {
      return;
    }
    
    const batchData = this.activeBatches.get(this.currentBatchId);
    if (!batchData) {
      return;
    }
    
    const completionTime = Date.now();
    const totalTime = completionTime - batchData.startTime;
    
    console.log(`🏁 Batch completed: ${this.currentBatchId} (${totalTime}ms)`);
    
    // Update batch statistics
    this.stats.completedBatches++;
    this.stats.totalProcessingTime += totalTime;
    
    // Clean up batch tracking
    this.activeBatches.delete(this.currentBatchId);
    this.currentBatchId = null;
    
    this.emit('batchCompleted', {
      batchId: batchData.id,
      totalJobs: batchData.totalJobs,
      totalTime,
      completionTime
    });
  }

  /**
   * Update statistics
   */
  updateStats(type) {
    switch (type) {
      case 'completed':
        this.stats.completedJobs++;
        break;
      case 'failed':
        this.stats.failedJobs++;
        break;
    }
    
    // Update average job time
    if (this.stats.completedJobs > 0) {
      this.stats.averageJobTime = this.stats.totalProcessingTime / this.stats.completedJobs;
    }
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDirectory() {
    if (!fs.existsSync(this.config.outputDirectory)) {
      fs.mkdirSync(this.config.outputDirectory, { recursive: true });
      console.log(`📁 Created output directory: ${this.config.outputDirectory}`);
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    const queueStatus = this.queue ? this.queue.getStatus() : null;
    const progressStatus = this.progressTracker ? this.progressTracker.getProgress() : null;
    const errorStats = this.errorHandler ? this.errorHandler.getErrorStatistics() : null;
    const memoryStats = this.memoryManager ? this.memoryManager.getMemoryStatistics() : null;
    
    return {
      isInitialized: this.isInitialized,
      isProcessing: this.isProcessing,
      currentBatchId: this.currentBatchId,
      activeBatches: this.activeBatches.size,
      queue: queueStatus,
      progress: progressStatus,
      errors: errorStats,
      memory: memoryStats,
      stats: { ...this.stats },
      config: { ...this.config }
    };
  }

  /**
   * Pause processing
   */
  pause() {
    if (this.queue) {
      this.queue.pause();
    }
    this.emit('paused');
    console.log('⏸️ Batch processing paused');
  }

  /**
   * Resume processing
   */
  resume() {
    if (this.queue) {
      this.queue.resume();
    }
    this.emit('resumed');
    console.log('▶️ Batch processing resumed');
  }

  /**
   * Stop processing
   */
  stop() {
    if (this.queue) {
      this.queue.stopProcessing();
    }
    this.emit('stopped');
    console.log('⏹️ Batch processing stopped');
  }

  /**
   * Cancel batch
   */
  cancelBatch(batchId) {
    const batchData = this.activeBatches.get(batchId);
    if (!batchData) {
      return { success: false, error: 'Batch not found' };
    }
    
    // Cancel all jobs in the batch
    let cancelledCount = 0;
    for (const jobId of batchData.jobIds) {
      if (this.queue.removeJob(jobId)) {
        cancelledCount++;
      }
    }
    
    // Remove batch tracking
    this.activeBatches.delete(batchId);
    
    console.log(`🚫 Batch cancelled: ${batchId} (${cancelledCount} jobs)`);
    this.emit('batchCancelled', { batchId, cancelledJobs: cancelledCount });
    
    return { success: true, cancelledJobs: cancelledCount };
  }

  /**
   * Get batch progress
   */
  getBatchProgress(batchId) {
    const batchData = this.activeBatches.get(batchId);
    if (!batchData) {
      return { success: false, error: 'Batch not found' };
    }
    
    const progress = this.progressTracker ? this.progressTracker.getProgress() : null;
    
    return {
      success: true,
      batchId,
      progress
    };
  }

  /**
   * Shutdown the generator
   */
  async shutdown() {
    console.log('🛑 Shutting down BatchImageGenerator...');
    
    // Stop processing
    this.stop();
    
    // Cancel all active batches
    for (const batchId of this.activeBatches.keys()) {
      this.cancelBatch(batchId);
    }
    
    // Shutdown components
    if (this.queue) {
      await this.queue.shutdown();
    }
    
    if (this.progressTracker) {
      this.progressTracker.reset();
    }
    
    if (this.errorHandler) {
      this.errorHandler.shutdown();
    }
    
    if (this.memoryManager) {
      this.memoryManager.shutdown();
    }
    
    // Clear state
    this.activeBatches.clear();
    this.isInitialized = false;
    this.isProcessing = false;
    this.currentBatchId = null;
    
    // Remove all listeners
    this.removeAllListeners();
    
    console.log('✅ BatchImageGenerator shutdown complete');
  }
}

module.exports = { BatchImageGenerator };