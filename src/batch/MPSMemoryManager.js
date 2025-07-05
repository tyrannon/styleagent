/**
 * MPSMemoryManager - Memory management for Apple Silicon MPS
 * Optimizes memory usage for Metal Performance Shaders on Apple Silicon
 */

const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const os = require('os');

class MPSMemoryManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configuration with proper option override
    const defaults = {
      maxMemoryUsage: 0.95, // 95% of available memory (more realistic for macOS)
      memoryCheckInterval: 5000, // 5 seconds
      gcTriggerThreshold: 0.90, // 90% memory usage
      memoryCleanupDelay: 2000, // 2 seconds after job
      lowMemoryThreshold: 0.92, // 92% memory usage
      criticalMemoryThreshold: 0.98, // 98% memory usage
      memoryPressureCheckInterval: 1000 // 1 second
    };
    
    this.config = { ...defaults, ...options };
    
    // Configuration logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔧 MPSMemoryManager config:`, {
        maxMemoryUsage: this.config.maxMemoryUsage,
        gcTriggerThreshold: this.config.gcTriggerThreshold,
        lowMemoryThreshold: this.config.lowMemoryThreshold,
        criticalMemoryThreshold: this.config.criticalMemoryThreshold
      });
    }
    
    // Memory state
    this.totalMemory = 0;
    this.availableMemory = 0;
    this.usedMemory = 0;
    this.memoryUsagePercentage = 0;
    this.isMPS = false;
    this.isAppleSilicon = false;
    this.memoryPressureLevel = 'normal'; // normal, warning, critical
    
    // Memory tracking
    this.memoryHistory = [];
    this.jobMemoryUsage = new Map();
    this.activeJobs = new Set();
    
    // Timers
    this.memoryMonitorTimer = null;
    this.cleanupTimer = null;
    
    // Memory optimization state
    this.optimizationLevel = 'balanced'; // conservative, balanced, aggressive
    this.concurrencyLimits = {
      conservative: 1,
      balanced: 2,
      aggressive: 3
    };
    
    // Bind methods
    this.checkMemory = this.checkMemory.bind(this);
    
    console.log('🧠 MPSMemoryManager initialized');
  }

  /**
   * Initialize memory manager
   */
  async initialize() {
    try {
      // Detect system capabilities
      await this.detectSystemCapabilities();
      
      // Get initial memory state
      await this.updateMemoryState();
      
      // Start monitoring
      this.startMemoryMonitoring();
      
      console.log('✅ MPSMemoryManager initialized successfully');
      console.log(`📊 System: ${this.isAppleSilicon ? 'Apple Silicon' : 'Intel'}, MPS: ${this.isMPS ? 'Available' : 'Not Available'}`);
      console.log(`💾 Total Memory: ${this.formatBytes(this.totalMemory)}`);
      
      this.emit('initialized', {
        isAppleSilicon: this.isAppleSilicon,
        isMPS: this.isMPS,
        totalMemory: this.totalMemory
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ MPSMemoryManager initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Detect system capabilities
   */
  async detectSystemCapabilities() {
    const platform = os.platform();
    const arch = os.arch();
    
    // Check if running on macOS
    if (platform !== 'darwin') {
      this.isAppleSilicon = false;
      this.isMPS = false;
      return;
    }
    
    // Check for Apple Silicon
    this.isAppleSilicon = arch === 'arm64';
    
    // Check for MPS availability
    try {
      const mpsCheck = await this.checkMPSAvailability();
      this.isMPS = mpsCheck.available;
    } catch (error) {
      console.warn('⚠️ Could not check MPS availability:', error.message);
      this.isMPS = false;
    }
    
    // Get total memory
    this.totalMemory = os.totalmem();
    
    // Set optimization level based on memory
    if (this.totalMemory < 8 * 1024 * 1024 * 1024) { // Less than 8GB
      this.optimizationLevel = 'conservative';
    } else if (this.totalMemory < 16 * 1024 * 1024 * 1024) { // Less than 16GB
      this.optimizationLevel = 'balanced';
    } else {
      this.optimizationLevel = 'aggressive';
    }
    
    console.log(`🔍 System detected: ${platform}/${arch}, Optimization: ${this.optimizationLevel}`);
  }

  /**
   * Check MPS availability using Python
   */
  async checkMPSAvailability() {
    return new Promise((resolve) => {
      const pythonCode = `
import torch
try:
    mps_available = torch.backends.mps.is_available()
    mps_built = torch.backends.mps.is_built()
    print(f"MPS_AVAILABLE:{mps_available}")
    print(f"MPS_BUILT:{mps_built}")
except Exception as e:
    print(f"MPS_ERROR:{str(e)}")
`;
      
      const pythonProcess = spawn('python3', ['-c', pythonCode]);
      let output = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        const available = output.includes('MPS_AVAILABLE:True') && output.includes('MPS_BUILT:True');
        resolve({ available, output });
      });
      
      pythonProcess.on('error', () => {
        resolve({ available: false, output: 'Python check failed' });
      });
    });
  }

  /**
   * Update memory state
   */
  async updateMemoryState() {
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      
      this.totalMemory = totalMem;
      this.availableMemory = freeMem;
      this.usedMemory = usedMem;
      
      // TEMPORARY FIX: Use a more realistic memory calculation for macOS
      // macOS reports very high "used" memory due to caching and compression
      // We'll use available memory as a better indicator
      const availableMemoryRatio = freeMem / totalMem;
      const adjustedUsagePercentage = (1 - availableMemoryRatio) * 100;
      
      // For debugging, calculate both methods
      const rawUsagePercentage = (usedMem / totalMem) * 100;
      
      // Use the adjusted calculation that's more realistic for macOS
      this.memoryUsagePercentage = adjustedUsagePercentage;
      
      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Memory calculation:', {
          rawUsagePercentage: rawUsagePercentage.toFixed(2) + '%',
          adjustedUsagePercentage: adjustedUsagePercentage.toFixed(2) + '%',
          availableMemory: this.formatBytes(freeMem)
        });
      }
      
      // Periodic memory usage logging (much less frequent)
      if (Math.random() < 0.01) { // Log 1% of the time to avoid spam
        console.log(`🧠 Memory: ${this.memoryUsagePercentage.toFixed(1)}% used (${this.formatBytes(usedMem)}/${this.formatBytes(totalMem)})`);
      }
      
      // Update memory pressure level
      this.updateMemoryPressureLevel();
      
      // Add to history
      this.memoryHistory.push({
        timestamp: Date.now(),
        total: totalMem,
        available: freeMem,
        used: usedMem,
        percentage: this.memoryUsagePercentage,
        pressure: this.memoryPressureLevel
      });
      
      // Keep history size manageable
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }
      
      // Get detailed GPU memory if available
      if (this.isMPS) {
        await this.updateGPUMemoryState();
      }
      
    } catch (error) {
      console.error('❌ Error updating memory state:', error);
    }
  }

  /**
   * Update GPU memory state
   */
  async updateGPUMemoryState() {
    try {
      const gpuMemory = await this.getGPUMemoryUsage();
      if (gpuMemory.success) {
        this.gpuMemory = gpuMemory.data;
        this.emit('gpuMemoryUpdated', gpuMemory.data);
      }
    } catch (error) {
      console.warn('⚠️ Could not get GPU memory usage:', error.message);
    }
  }

  /**
   * Get GPU memory usage
   */
  async getGPUMemoryUsage() {
    return new Promise((resolve) => {
      const pythonCode = `
import torch
try:
    if torch.backends.mps.is_available():
        # Get MPS memory stats
        allocated = torch.mps.current_allocated_memory()
        cached = torch.mps.driver_allocated_memory()
        print(f"MPS_ALLOCATED:{allocated}")
        print(f"MPS_CACHED:{cached}")
    else:
        print("MPS_NOT_AVAILABLE")
except Exception as e:
    print(f"MPS_ERROR:{str(e)}")
`;
      
      const pythonProcess = spawn('python3', ['-c', pythonCode]);
      let output = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        try {
          const allocatedMatch = output.match(/MPS_ALLOCATED:(\d+)/);
          const cachedMatch = output.match(/MPS_CACHED:(\d+)/);
          
          if (allocatedMatch && cachedMatch) {
            resolve({
              success: true,
              data: {
                allocated: parseInt(allocatedMatch[1]),
                cached: parseInt(cachedMatch[1]),
                total: parseInt(allocatedMatch[1]) + parseInt(cachedMatch[1])
              }
            });
          } else {
            resolve({ success: false, error: 'Could not parse GPU memory' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
      
      pythonProcess.on('error', () => {
        resolve({ success: false, error: 'Python process failed' });
      });
    });
  }

  /**
   * Update memory pressure level
   */
  updateMemoryPressureLevel() {
    const usage = this.memoryUsagePercentage / 100;
    
    if (usage >= this.config.criticalMemoryThreshold) {
      this.memoryPressureLevel = 'critical';
    } else if (usage >= this.config.lowMemoryThreshold) {
      this.memoryPressureLevel = 'warning';
    } else {
      this.memoryPressureLevel = 'normal';
    }
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    this.memoryMonitorTimer = setInterval(this.checkMemory, this.config.memoryCheckInterval);
    console.log('🔍 Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryMonitorTimer) {
      clearInterval(this.memoryMonitorTimer);
      this.memoryMonitorTimer = null;
    }
    console.log('🔍 Memory monitoring stopped');
  }

  /**
   * Check memory and trigger actions if needed
   */
  async checkMemory() {
    await this.updateMemoryState();
    
    const usage = this.memoryUsagePercentage / 100;
    
    // Emit memory status
    this.emit('memoryStatus', {
      usage: this.memoryUsagePercentage,
      available: this.availableMemory,
      pressure: this.memoryPressureLevel,
      timestamp: Date.now()
    });
    
    // Trigger garbage collection if needed
    if (usage >= this.config.gcTriggerThreshold) {
      await this.triggerGarbageCollection();
    }
    
    // Handle memory pressure
    if (this.memoryPressureLevel === 'critical') {
      await this.handleCriticalMemoryPressure();
    } else if (this.memoryPressureLevel === 'warning') {
      await this.handleWarningMemoryPressure();
    }
  }

  /**
   * Trigger garbage collection
   */
  async triggerGarbageCollection() {
    try {
      console.log('🗑️ Triggering garbage collection');
      
      // Trigger Python garbage collection
      await this.triggerPythonGC();
      
      // Trigger Node.js garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      this.emit('garbageCollectionTriggered');
      
    } catch (error) {
      console.error('❌ Error triggering garbage collection:', error);
    }
  }

  /**
   * Trigger Python garbage collection
   */
  async triggerPythonGC() {
    return new Promise((resolve) => {
      const pythonCode = `
import gc
import torch
try:
    # Clear Python garbage
    gc.collect()
    
    # Clear PyTorch cache if available
    if hasattr(torch, 'cuda') and torch.cuda.is_available():
        torch.cuda.empty_cache()
    
    # Clear MPS cache if available
    if hasattr(torch, 'mps') and torch.backends.mps.is_available():
        torch.mps.empty_cache()
    
    print("GC_SUCCESS")
except Exception as e:
    print(f"GC_ERROR:{str(e)}")
`;
      
      const pythonProcess = spawn('python3', ['-c', pythonCode]);
      
      pythonProcess.on('close', (code) => {
        resolve(code === 0);
      });
      
      pythonProcess.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Handle critical memory pressure
   */
  async handleCriticalMemoryPressure() {
    console.warn('🚨 Critical memory pressure detected');
    
    // Immediately trigger garbage collection
    await this.triggerGarbageCollection();
    
    // Reduce concurrency to minimum
    const newConcurrency = 1;
    
    this.emit('criticalMemoryPressure', {
      memoryUsage: this.memoryUsagePercentage,
      recommendedConcurrency: newConcurrency,
      action: 'reduce_concurrency'
    });
    
    // Pause processing if memory is extremely high
    if (this.memoryUsagePercentage > 98) {
      this.emit('memoryEmergency', {
        memoryUsage: this.memoryUsagePercentage,
        action: 'pause_processing'
      });
    }
  }

  /**
   * Handle warning memory pressure
   */
  async handleWarningMemoryPressure() {
    console.warn('⚠️ Warning memory pressure detected');
    
    // Get recommended concurrency
    const recommendedConcurrency = this.getRecommendedConcurrency();
    
    this.emit('warningMemoryPressure', {
      memoryUsage: this.memoryUsagePercentage,
      recommendedConcurrency,
      action: 'reduce_concurrency'
    });
  }

  /**
   * Get recommended concurrency based on memory usage
   */
  getRecommendedConcurrency() {
    const usage = this.memoryUsagePercentage / 100;
    const baseConcurrency = this.concurrencyLimits[this.optimizationLevel];
    
    if (usage >= this.config.criticalMemoryThreshold) {
      return 1;
    } else if (usage >= this.config.lowMemoryThreshold) {
      return Math.max(1, Math.floor(baseConcurrency * 0.5));
    } else if (usage >= this.config.gcTriggerThreshold) {
      return Math.max(1, Math.floor(baseConcurrency * 0.75));
    } else {
      return baseConcurrency;
    }
  }

  /**
   * Check if memory is available for new job
   */
  canStartNewJob(estimatedMemoryUsage = 0) {
    // IMPROVED MEMORY CHECK FOR MACOS
    // Instead of relying on percentage (which is unreliable on macOS), 
    // use absolute memory thresholds that are more realistic
    
    const platform = require('os').platform();
    const isMacOS = platform === 'darwin';
    
    // Define minimum free memory thresholds (adjusted for macOS reality)
    const minFreeMemory = {
      // More realistic thresholds for macOS where high memory usage is normal
      conservative: Math.max(256 * 1024 * 1024, this.totalMemory * 0.02), // 256MB or 2% of total
      balanced: Math.max(128 * 1024 * 1024, this.totalMemory * 0.01),     // 128MB or 1% of total  
      aggressive: Math.max(64 * 1024 * 1024, this.totalMemory * 0.005)    // 64MB or 0.5% of total
    };
    
    const requiredFreeMemory = minFreeMemory[this.optimizationLevel] || minFreeMemory.balanced;
    const hasEnoughMemory = this.availableMemory >= requiredFreeMemory;
    
    // For macOS, use the improved memory check
    if (isMacOS) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 macOS Memory Check:', {
          optimizationLevel: this.optimizationLevel,
          requiredFreeMemory: this.formatBytes(requiredFreeMemory),
          availableMemory: this.formatBytes(this.availableMemory),
          hasEnoughMemory: hasEnoughMemory
        });
      }
      
      if (!hasEnoughMemory) {
        console.log('⚠️ Insufficient free memory for new job:', {
          required: this.formatBytes(requiredFreeMemory),
          available: this.formatBytes(this.availableMemory),
          shortfall: this.formatBytes(requiredFreeMemory - this.availableMemory)
        });
        
        return {
          canStart: false,
          reason: 'insufficient_free_memory',
          currentUsage: this.memoryUsagePercentage,
          requiredFreeMemory: this.formatBytes(requiredFreeMemory),
          availableMemory: this.formatBytes(this.availableMemory)
        };
      }
      
      // Check if estimated usage would exceed our safety margin
      if (estimatedMemoryUsage > 0) {
        const memoryAfterJob = this.availableMemory - estimatedMemoryUsage;
        const wouldHaveEnoughAfterJob = memoryAfterJob >= requiredFreeMemory * 0.5; // Keep 50% safety margin
        
        if (!wouldHaveEnoughAfterJob) {
          console.log('⚠️ Estimated memory usage would exceed safety margin:', {
            estimatedUsage: this.formatBytes(estimatedMemoryUsage),
            memoryAfterJob: memoryAfterJob > 0 ? this.formatBytes(memoryAfterJob) : 'Negative',
            requiredSafetyMargin: this.formatBytes(requiredFreeMemory * 0.5)
          });
          
          return {
            canStart: false,
            reason: 'estimated_memory_would_exceed_safety_margin',
            currentUsage: this.memoryUsagePercentage,
            estimatedMemoryUsage: this.formatBytes(estimatedMemoryUsage),
            memoryAfterJob: this.formatBytes(memoryAfterJob)
          };
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Memory check passed:', {
          availableMemory: this.formatBytes(this.availableMemory),
          requiredFreeMemory: this.formatBytes(requiredFreeMemory),
          safetyMargin: this.formatBytes(this.availableMemory - requiredFreeMemory)
        });
      }
      
      return {
        canStart: true,
        currentUsage: this.memoryUsagePercentage,
        availableMemory: this.availableMemory,
        requiredFreeMemory: requiredFreeMemory,
        safetyMargin: this.availableMemory - requiredFreeMemory
      };
    }
    
    // FALLBACK: Use percentage-based check for non-macOS systems
    const currentUsage = this.memoryUsagePercentage / 100;
    const maxUsage = this.config.maxMemoryUsage;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Percentage-based memory check:', {
        memoryUsagePercentage: this.memoryUsagePercentage,
        maxUsagePercentage: maxUsage * 100
      });
    }
    
    // Check if we're already at capacity
    if (currentUsage >= maxUsage) {
      console.log('⚠️ Memory usage at capacity:', {
        current: this.memoryUsagePercentage.toFixed(1) + '%',
        max: (maxUsage * 100).toFixed(1) + '%'
      });
      
      return {
        canStart: false,
        reason: 'memory_at_capacity',
        currentUsage: this.memoryUsagePercentage,
        maxUsage: maxUsage * 100
      };
    }
    
    // Check if estimated usage would exceed limits
    if (estimatedMemoryUsage > 0) {
      const estimatedUsagePercentage = (estimatedMemoryUsage / this.totalMemory) * 100;
      if (currentUsage + estimatedUsagePercentage / 100 >= maxUsage) {
        console.log('⚠️ Estimated memory would exceed limit');
        
        return {
          canStart: false,
          reason: 'estimated_memory_would_exceed_limit',
          currentUsage: this.memoryUsagePercentage,
          estimatedUsage: estimatedUsagePercentage,
          maxUsage: maxUsage * 100
        };
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Memory check passed (percentage-based):', {
        currentUsagePercentage: this.memoryUsagePercentage.toFixed(1) + '%',
        availableMemory: this.formatBytes(this.availableMemory)
      });
    }
    
    return {
      canStart: true,
      currentUsage: this.memoryUsagePercentage,
      availableMemory: this.availableMemory
    };
  }

  /**
   * Track job memory usage
   */
  trackJobStart(jobId, estimatedMemoryUsage = 0) {
    this.activeJobs.add(jobId);
    this.jobMemoryUsage.set(jobId, {
      startTime: Date.now(),
      estimatedMemory: estimatedMemoryUsage,
      startMemoryUsage: this.memoryUsagePercentage
    });
    
    console.log(`📊 Tracking job memory: ${jobId} (estimated: ${this.formatBytes(estimatedMemoryUsage)})`);
  }

  /**
   * Track job completion
   */
  trackJobCompletion(jobId) {
    this.activeJobs.delete(jobId);
    
    const jobMemory = this.jobMemoryUsage.get(jobId);
    if (jobMemory) {
      jobMemory.endTime = Date.now();
      jobMemory.endMemoryUsage = this.memoryUsagePercentage;
      jobMemory.duration = jobMemory.endTime - jobMemory.startTime;
      
      // Schedule cleanup
      setTimeout(() => {
        this.scheduleMemoryCleanup(jobId);
      }, this.config.memoryCleanupDelay);
    }
    
    console.log(`✅ Job memory tracking completed: ${jobId}`);
  }

  /**
   * Schedule memory cleanup after job
   */
  scheduleMemoryCleanup(jobId) {
    // Remove job from tracking
    this.jobMemoryUsage.delete(jobId);
    
    // Trigger garbage collection if no active jobs
    if (this.activeJobs.size === 0) {
      this.triggerGarbageCollection();
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStatistics() {
    return {
      system: {
        total: this.totalMemory,
        available: this.availableMemory,
        used: this.usedMemory,
        usagePercentage: this.memoryUsagePercentage,
        pressureLevel: this.memoryPressureLevel
      },
      gpu: this.gpuMemory || null,
      config: {
        optimizationLevel: this.optimizationLevel,
        maxMemoryUsage: this.config.maxMemoryUsage * 100,
        recommendedConcurrency: this.getRecommendedConcurrency()
      },
      activeJobs: this.activeJobs.size,
      capabilities: {
        isAppleSilicon: this.isAppleSilicon,
        isMPS: this.isMPS
      }
    };
  }

  /**
   * Get memory history
   */
  getMemoryHistory(limit = 20) {
    return this.memoryHistory.slice(-limit);
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Optimize for batch processing
   */
  optimizeForBatch(batchSize, estimatedMemoryPerJob = 0) {
    const totalEstimatedMemory = batchSize * estimatedMemoryPerJob;
    const maxConcurrency = this.getRecommendedConcurrency();
    
    // Adjust concurrency based on batch size and memory
    let recommendedConcurrency = maxConcurrency;
    
    if (totalEstimatedMemory > 0) {
      const memoryPerJob = totalEstimatedMemory / batchSize;
      const availableMemoryForJobs = this.availableMemory * this.config.maxMemoryUsage;
      const concurrencyByMemory = Math.floor(availableMemoryForJobs / memoryPerJob);
      
      recommendedConcurrency = Math.min(maxConcurrency, concurrencyByMemory);
    }
    
    return {
      recommendedConcurrency: Math.max(1, recommendedConcurrency),
      batchSize,
      estimatedMemoryPerJob,
      totalEstimatedMemory,
      optimizationLevel: this.optimizationLevel
    };
  }

  /**
   * Shutdown memory manager
   */
  shutdown() {
    this.stopMemoryMonitoring();
    
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
    }
    
    this.activeJobs.clear();
    this.jobMemoryUsage.clear();
    this.removeAllListeners();
    
    console.log('🛑 MPSMemoryManager shutdown complete');
  }
}

module.exports = { MPSMemoryManager };