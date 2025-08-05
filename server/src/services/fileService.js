const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class FileService {
  constructor() {
    // Ensure upload directory exists
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(config.uploadPath);
    } catch {
      await fs.mkdir(config.uploadPath, { recursive: true });
    }
  }

  getMulterConfig() {
    const storage = multer.memoryStorage();
    
    return multer({
      storage,
      limits: {
        fileSize: config.maxFileSize
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      }
    });
  }

  async processAndSaveImage(buffer, originalName) {
    try {
      const fileExtension = path.extname(originalName).toLowerCase();
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(config.uploadPath, fileName);

      // Process image with sharp
      await sharp(buffer)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      return fileName;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('Failed to process image');
    }
  }

  async deleteFile(fileName) {
    try {
      const filePath = path.join(config.uploadPath, fileName);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  getFileUrl(fileName) {
    return `/uploads/${fileName}`;
  }
}

module.exports = new FileService();