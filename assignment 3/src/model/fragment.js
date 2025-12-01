const crypto = require('crypto');
const db = require('./data');

// Supported content types and their extensions
const validTypes = {
  'text/plain': ['.txt'],
  'text/plain; charset=utf-8': ['.txt'],
  'text/markdown': ['.md', '.html', '.txt'],
  'text/html': ['.html', '.txt'],
  'text/csv': ['.csv', '.txt', '.json'],
  'application/json': ['.json', '.yaml', '.yml', '.txt'],
  'application/yaml': ['.yaml', '.yml', '.txt'],
  'image/png': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/jpeg': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/webp': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/avif': ['.png', '.jpg', '.webp', '.gif', '.avif'],
  'image/gif': ['.png', '.jpg', '.webp', '.gif'],
};

class Fragment {
  constructor({
    id,
    ownerId,
    created,
    updated,
    type,
    size = 0,
    tags = [],
    version = 1,
    sharedWith = [],
    accessCount = 0,
  }) {
    if (!ownerId) throw new Error('ownerId is required');
    if (!type) throw new Error('type is required');
    if (!Fragment.isSupportedType(type)) throw new Error(`Invalid type: ${type}`);
    if (typeof size !== 'number' || size < 0) throw new Error('size must be a non-negative number');

    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.tags = tags;
    this.version = version;
    this.sharedWith = sharedWith;
    this.accessCount = accessCount;
  }

  /**
   * Get all supported MIME types
   */
  static get supportedTypes() {
    return Object.keys(validTypes);
  }

  /**
   * Check if a content type is supported
   */
  static isSupportedType(type) {
    if (!type) return false;
    // Check exact match or base type match (without charset)
    const baseType = type.split(';')[0].trim();
    return validTypes[type] !== undefined || validTypes[baseType] !== undefined;
  }

  /**
   * Get the extensions this fragment type can be converted to
   */
  get formats() {
    const baseType = this.type.split(';')[0].trim();
    return validTypes[this.type] || validTypes[baseType] || [];
  }

  /**
   * Check if this is a text type
   */
  get isText() {
    return this.mimeType.startsWith('text/') || this.mimeType === 'application/json';
  }

  /**
   * Get the MIME type (without charset)
   */
  get mimeType() {
    return this.type.split(';')[0].trim();
  }

  /**
   * Check if this is an image type
   */
  isImage() {
    return this.mimeType.startsWith('image/');
  }

  /**
   * Save fragment metadata to database
   */
  async save() {
    this.updated = new Date().toISOString();
    return db.writeFragment({
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size,
      tags: this.tags,
      version: this.version,
      sharedWith: this.sharedWith,
      accessCount: this.accessCount,
    });
  }

  /**
   * Get fragment data from storage
   */
  async getData() {
    return db.readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set fragment data to storage
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }
    this.size = data.length;
    this.updated = new Date().toISOString();
    await db.writeFragmentData(this.ownerId, this.id, data);
    return this.save();
  }

  /**
   * Delete this fragment
   */
  async delete() {
    return db.deleteFragment(this.ownerId, this.id);
  }

  /**
   * Get all fragment IDs for a user
   */
  static async byUser(ownerId, expand = false) {
    return db.listFragments(ownerId, expand);
  }

  /**
   * Get a fragment by owner and ID
   */
  static async byId(ownerId, id) {
    const data = await db.readFragment(ownerId, id);
    if (!data) {
      throw new Error(`Fragment not found: ${id}`);
    }
    return new Fragment(data);
  }

  /**
   * Add tags to the fragment
   */
  async addTags(newTags) {
    if (!Array.isArray(newTags)) {
      newTags = [newTags];
    }
    const existingTags = new Set(this.tags);
    newTags.forEach((tag) => existingTags.add(tag.toLowerCase()));
    this.tags = Array.from(existingTags);
    return this.save();
  }

  /**
   * Remove tags from the fragment
   */
  async removeTags(tagsToRemove) {
    if (!Array.isArray(tagsToRemove)) {
      tagsToRemove = [tagsToRemove];
    }
    const removeSet = new Set(tagsToRemove.map((t) => t.toLowerCase()));
    this.tags = this.tags.filter((tag) => !removeSet.has(tag.toLowerCase()));
    return this.save();
  }

  /**
   * Share this fragment with another user
   */
  async shareWith(userId) {
    if (!this.sharedWith.includes(userId)) {
      this.sharedWith.push(userId);
      return this.save();
    }
  }

  /**
   * Unshare this fragment from a user
   */
  async unshareFrom(userId) {
    this.sharedWith = this.sharedWith.filter((id) => id !== userId);
    return this.save();
  }

  /**
   * Increment access count
   */
  async incrementAccessCount() {
    this.accessCount++;
    return this.save();
  }

  /**
   * Get analytics for this fragment
   */
  getAnalytics() {
    return {
      id: this.id,
      type: this.type,
      size: this.size,
      created: this.created,
      updated: this.updated,
      accessCount: this.accessCount,
      version: this.version,
      tagCount: this.tags.length,
      sharedCount: this.sharedWith.length,
    };
  }

  /**
   * Get the MIME type for a file extension
   */
  static getMimeType(ext) {
    const mimeTypes = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.yaml': 'application/yaml',
      '.yml': 'application/yaml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.avif': 'image/avif',
    };
    return mimeTypes[ext.toLowerCase()] || null;
  }

  /**
   * Check if a conversion from this type to another is supported
   */
  canConvertTo(ext) {
    return this.formats.includes(ext.toLowerCase());
  }

  /**
   * Convert fragment data to a different format
   */
  async convertTo(ext) {
    const data = await this.getData();

    if (!this.canConvertTo(ext)) {
      throw new Error(`Cannot convert ${this.type} to ${ext}`);
    }

    const targetMime = Fragment.getMimeType(ext);

    // If same type, just return data
    if (targetMime === this.mimeType) {
      return { data, mimeType: targetMime };
    }

    // Text conversions
    if (this.mimeType === 'text/markdown' && ext === '.html') {
      const MarkdownIt = require('markdown-it');
      const md = new MarkdownIt();
      const html = md.render(data.toString('utf8'));
      return { data: Buffer.from(html, 'utf8'), mimeType: 'text/html' };
    }

    if (this.mimeType === 'text/markdown' && ext === '.txt') {
      return { data: data, mimeType: 'text/plain' };
    }

    if (this.mimeType === 'text/html' && ext === '.txt') {
      return { data: data, mimeType: 'text/plain' };
    }

    if (this.mimeType === 'application/json' && ext === '.txt') {
      return { data: data, mimeType: 'text/plain' };
    }

    if (this.mimeType === 'text/csv' && ext === '.txt') {
      return { data: data, mimeType: 'text/plain' };
    }

    if (this.mimeType === 'text/csv' && ext === '.json') {
      // Simple CSV to JSON conversion
      const lines = data.toString('utf8').trim().split('\n');
      if (lines.length === 0) {
        return { data: Buffer.from('[]'), mimeType: 'application/json' };
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const result = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim());
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i];
        });
        return obj;
      });
      return { data: Buffer.from(JSON.stringify(result)), mimeType: 'application/json' };
    }

    // Image conversions using sharp
    if (this.isImage()) {
      const sharp = require('sharp');
      let image = sharp(data);

      const formatMap = {
        '.png': 'png',
        '.jpg': 'jpeg',
        '.jpeg': 'jpeg',
        '.webp': 'webp',
        '.gif': 'gif',
        '.avif': 'avif',
      };

      const format = formatMap[ext.toLowerCase()];
      if (format) {
        const converted = await image.toFormat(format).toBuffer();
        return { data: converted, mimeType: targetMime };
      }
    }

    throw new Error(`Conversion from ${this.type} to ${ext} not implemented`);
  }
}

module.exports = Fragment;
