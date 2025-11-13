const crypto = require('crypto');
const db = require('./data');

class Fragment {
  constructor({ ownerId, type, size = 0, id = null, created, updated }) {
    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  /**
   * Check if a content type is supported
   * Supports text/* and application/json types
   */
  static isSupportedType(type) {
    if (!type) return false;
    
    // Support application/json
    if (type === 'application/json') return true;
    
    // Support all text/* types
    if (type.startsWith('text/')) return true;
    
    return false;
  }

  async save(buffer) {
    const dataSize = buffer ? buffer.length : this.size;

    // Save metadata
    await db.writeFragment(this.ownerId, this.id, {
      id: this.id,
      type: this.type,
      size: dataSize,
      created: this.created,
      ownerId: this.ownerId,
    });

    // Save raw data if buffer provided
    if (buffer) {
      await db.writeFragmentData(this.ownerId, this.id, buffer);
    }
  }

  /**
   * Find a fragment by owner ID and fragment ID
   * Returns the fragment metadata, not the data
   */
  static async find(ownerId, id) {
    const meta = await db.readFragment(ownerId, id);
    if (!meta) return null;
    return new Fragment(meta);
  }

  static async list(ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }
    return db.listFragments(ownerId);
  }

  // New methods for the updated API
  static async byUser(ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const fragmentIds = await db.listFragments(ownerId);
    const fragments = [];

    for (const id of fragmentIds) {
      const fragmentData = await db.readFragment(ownerId, id);
      if (fragmentData) {
        fragments.push(new Fragment(fragmentData));
      }
    }

    return fragments;
  }

  static async byId(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    // For byId, we need to search through all fragments
    // This is not efficient but matches the expected API
    const allKeys = Array.from(db.db.db.keys());
    for (const key of allKeys) {
      if (!key.endsWith(':data')) {
        const parts = key.split(':');
        if (parts.length >= 2) {
          const ownerId = parts[0];
          const fragmentId = parts[1];
          const fragmentData = await db.readFragment(ownerId, fragmentId);
          if (fragmentData && fragmentData.id === id) {
            return new Fragment(fragmentData);
          }
        }
      }
    }
    return null;
  }

  async getData() {
    return await db.readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();

    await db.writeFragmentData(this.ownerId, this.id, data);
    await this.save(); // Update metadata with new size and timestamp
  }

  async delete() {
    return await db.deleteFragment(this.ownerId, this.id);
  }

  /**
   * Get the MIME type for a file extension
   */
  static getMimeType(ext) {
    const mimeTypes = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.json': 'application/json',
      '.xml': 'text/xml',
      '.csv': 'text/csv',
    };
    return mimeTypes[ext.toLowerCase()] || null;
  }

  /**
   * Check if a conversion from one type to another is supported
   */
  static canConvert(fromType, toExt) {
    // Markdown to HTML conversion
    if (fromType === 'text/markdown' && toExt === '.html') {
      return true;
    }
    // For now, only support Markdown to HTML
    // Other conversions will be added in Assignment 3
    return false;
  }

  /**
   * Convert fragment data to a different format
   */
  async convertTo(ext) {
    const data = await this.getData();
    
    if (!Fragment.canConvert(this.type, ext)) {
      throw new Error(`Conversion from ${this.type} to ${ext} is not supported`);
    }

    // Markdown to HTML conversion
    if (this.type === 'text/markdown' && ext === '.html') {
      const MarkdownIt = require('markdown-it');
      const md = new MarkdownIt();
      const html = md.render(data.toString('utf8'));
      return Buffer.from(html, 'utf8');
    }

    throw new Error(`Conversion not implemented for ${this.type} to ${ext}`);
  }
}

module.exports = Fragment;
