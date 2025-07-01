const fs = require('fs').promises;
const path = require('path');

class FileManagerError extends Error {
  constructor(message, code = null, originalError = null) {
    super(message);
    this.name = 'FileManagerError';
    this.code = code;
    this.originalError = originalError;
  }
}

class FileManager {
  constructor(dataDirectory = null) {
    this.dataDirectory = dataDirectory || path.join(__dirname);
  }

  /**
   * Ensures the data directory exists
   * @private
   */
  async ensureDirectory() {
    try {
      await fs.access(this.dataDirectory);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(this.dataDirectory, { recursive: true });
      } else {
        throw new FileManagerError(
          `Failed to access data directory: ${error.message}`,
          'DIRECTORY_ACCESS_ERROR',
          error
        );
      }
    }
  }

  /**
   * Gets the full path for a data file
   * @param {string} filename - The filename
   * @returns {string} Full file path
   * @private
   */
  getFilePath(filename) {
    return path.join(this.dataDirectory, filename);
  }

  /**
   * Reads JSON data from a file
   * @param {string} filename - The filename to read
   * @returns {Promise<Object>} Parsed JSON data
   * @throws {FileManagerError} If file reading or parsing fails
   */
  async readJSON(filename) {
    try {
      const filePath = this.getFilePath(filename);
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileManagerError(
          `File not found: ${filename}`,
          'FILE_NOT_FOUND',
          error
        );
      } else if (error instanceof SyntaxError) {
        throw new FileManagerError(
          `Invalid JSON in file: ${filename}`,
          'INVALID_JSON',
          error
        );
      } else {
        throw new FileManagerError(
          `Failed to read file: ${filename} - ${error.message}`,
          'FILE_READ_ERROR',
          error
        );
      }
    }
  }

  /**
   * Writes JSON data to a file
   * @param {string} filename - The filename to write to
   * @param {Object} data - The data to write
   * @param {boolean} createBackup - Whether to create a backup of existing file
   * @returns {Promise<void>}
   * @throws {FileManagerError} If file writing fails
   */
  async writeJSON(filename, data, createBackup = true) {
    try {
      await this.ensureDirectory();
      
      const filePath = this.getFilePath(filename);
      
      // Create backup if file exists and backup is requested
      if (createBackup) {
        try {
          await fs.access(filePath);
          await this.createBackup(filename);
        } catch (error) {
          // File doesn't exist, no backup needed
          if (error.code !== 'ENOENT') {
            console.warn(`Warning: Could not create backup for ${filename}:`, error.message);
          }
        }
      }

      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonString, 'utf8');
    } catch (error) {
      if (error instanceof FileManagerError) {
        throw error;
      }
      throw new FileManagerError(
        `Failed to write file: ${filename} - ${error.message}`,
        'FILE_WRITE_ERROR',
        error
      );
    }
  }

  /**
   * Creates a backup of an existing file
   * @param {string} filename - The filename to backup
   * @returns {Promise<string>} Path to the backup file
   * @throws {FileManagerError} If backup creation fails
   */
  async createBackup(filename) {
    try {
      const filePath = this.getFilePath(filename);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `${filename}.backup.${timestamp}`;
      const backupPath = this.getFilePath(backupFilename);
      
      await fs.copyFile(filePath, backupPath);
      
      // Clean up old backups (keep only the 5 most recent)
      await this.cleanupBackups(filename);
      
      return backupPath;
    } catch (error) {
      throw new FileManagerError(
        `Failed to create backup for: ${filename} - ${error.message}`,
        'BACKUP_ERROR',
        error
      );
    }
  }

  /**
   * Cleans up old backup files, keeping only the most recent ones
   * @param {string} filename - The original filename
   * @param {number} keepCount - Number of backups to keep
   * @private
   */
  async cleanupBackups(filename, keepCount = 5) {
    try {
      const files = await fs.readdir(this.dataDirectory);
      const backupFiles = files
        .filter(file => file.startsWith(`${filename}.backup.`))
        .map(file => ({
          name: file,
          path: this.getFilePath(file),
          time: fs.stat(this.getFilePath(file)).then(stats => stats.mtime)
        }));

      if (backupFiles.length > keepCount) {
        const filesWithStats = await Promise.all(
          backupFiles.map(async file => ({
            ...file,
            time: await file.time
          }))
        );

        const sortedFiles = filesWithStats.sort((a, b) => b.time - a.time);
        const filesToDelete = sortedFiles.slice(keepCount);

        await Promise.all(
          filesToDelete.map(file => fs.unlink(file.path))
        );
      }
    } catch (error) {
      console.warn(`Warning: Could not cleanup backups for ${filename}:`, error.message);
    }
  }

  /**
   * Checks if a file exists
   * @param {string} filename - The filename to check
   * @returns {Promise<boolean>} Whether the file exists
   */
  async fileExists(filename) {
    try {
      const filePath = this.getFilePath(filename);
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets file stats
   * @param {string} filename - The filename
   * @returns {Promise<Object>} File stats
   * @throws {FileManagerError} If getting stats fails
   */
  async getFileStats(filename) {
    try {
      const filePath = this.getFilePath(filename);
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime
      };
    } catch (error) {
      throw new FileManagerError(
        `Failed to get stats for: ${filename} - ${error.message}`,
        'STATS_ERROR',
        error
      );
    }
  }

  /**
   * Lists all JSON files in the data directory
   * @returns {Promise<Array<string>>} List of JSON filenames
   */
  async listJSONFiles() {
    try {
      await this.ensureDirectory();
      const files = await fs.readdir(this.dataDirectory);
      return files.filter(file => path.extname(file) === '.json');
    } catch (error) {
      throw new FileManagerError(
        `Failed to list files in data directory: ${error.message}`,
        'LIST_ERROR',
        error
      );
    }
  }

  /**
   * Deletes a file
   * @param {string} filename - The filename to delete
   * @param {boolean} createBackup - Whether to create a backup before deletion
   * @returns {Promise<void>}
   * @throws {FileManagerError} If deletion fails
   */
  async deleteFile(filename, createBackup = true) {
    try {
      const filePath = this.getFilePath(filename);
      
      if (createBackup && await this.fileExists(filename)) {
        await this.createBackup(filename);
      }
      
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new FileManagerError(
          `File not found: ${filename}`,
          'FILE_NOT_FOUND',
          error
        );
      }
      throw new FileManagerError(
        `Failed to delete file: ${filename} - ${error.message}`,
        'DELETE_ERROR',
        error
      );
    }
  }

  /**
   * Validates JSON file integrity
   * @param {string} filename - The filename to validate
   * @returns {Promise<{valid: boolean, error?: string}>} Validation result
   */
  async validateJSONFile(filename) {
    try {
      await this.readJSON(filename);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Safely updates a JSON file with atomic write operation
   * @param {string} filename - The filename to update
   * @param {Function} updateFunction - Function that receives current data and returns updated data
   * @returns {Promise<Object>} Updated data
   * @throws {FileManagerError} If update fails
   */
  async updateJSON(filename, updateFunction) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Read current data
        let currentData = {};
        if (await this.fileExists(filename)) {
          currentData = await this.readJSON(filename);
        }

        // Apply update function
        const updatedData = await updateFunction(currentData);

        // Validate that updateFunction returned data
        if (updatedData === undefined || updatedData === null) {
          throw new FileManagerError(
            'Update function must return valid data',
            'INVALID_UPDATE_RESULT'
          );
        }

        // Write updated data
        await this.writeJSON(filename, updatedData);

        return updatedData;
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries && (error.code === 'EBUSY' || error.code === 'EMFILE')) {
          // Wait before retry for file system issues
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
          continue;
        }
        
        if (error instanceof FileManagerError) {
          throw error;
        }
        
        throw new FileManagerError(
          `Failed to update file: ${filename} - ${error.message}`,
          'UPDATE_ERROR',
          error
        );
      }
    }

    throw lastError;
  }
}

module.exports = { FileManager, FileManagerError };