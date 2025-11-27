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

  static isSupportedType(type) {
    // Remove charset and other parameters for comparison
    const baseType = type ? type.split(';')[0].trim() : '';
    return baseType === 'text/plain' || baseType === 'application/json';
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

  static async find(ownerId, id) {
    const meta = await db.readFragment(ownerId, id);
    if (!meta) return null;

    const data = await db.readFragmentData(ownerId, id);
    if (meta.type === 'text/plain') return data.toString('utf-8'); // return text

    return { ...meta, data };
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
    // With DynamoDB, we use a Scan operation to find by ID
    const fragmentData = await db.findFragmentById(id);
    if (fragmentData) {
      return new Fragment(fragmentData);
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
}

module.exports = Fragment;
