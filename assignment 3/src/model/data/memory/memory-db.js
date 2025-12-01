class MemoryDB {
  constructor() {
    this.db = new Map();
  }

  // Generic write
  async write(key, value) {
    this.db.set(key, value);
    return true;
  }

  // Generic read
  async read(key) {
    return this.db.get(key) || null;
  }

  // Generic delete
  async delete(key) {
    return this.db.delete(key);
  }

  // --- High-level fragment functions ---

  async writeFragment(fragment) {
    const key = `${fragment.ownerId}:${fragment.id}`;
    return this.write(key, { ...fragment });
  }

  async readFragment(ownerId, id) {
    const key = `${ownerId}:${id}`;
    return this.read(key);
  }

  async writeFragmentData(ownerId, id, data) {
    const key = `${ownerId}:${id}:data`;
    return this.write(key, Buffer.from(data));
  }

  async readFragmentData(ownerId, id) {
    const key = `${ownerId}:${id}:data`;
    return this.read(key);
  }

  async listFragments(ownerId, expand = false) {
    const fragments = [];
    for (const key of this.db.keys()) {
      if (key.startsWith(`${ownerId}:`) && !key.endsWith(':data')) {
        const id = key.split(':')[1];
        const meta = await this.readFragment(ownerId, id);
        if (meta) {
          if (expand) {
            fragments.push(meta);
          } else {
            fragments.push(meta.id);
          }
        }
      }
    }
    return fragments;
  }

  async deleteFragment(ownerId, id) {
    // Find and delete all keys related to this fragment
    const keysToDelete = [];
    for (const key of this.db.keys()) {
      if (key === `${ownerId}:${id}` || key === `${ownerId}:${id}:data`) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.db.delete(key);
    }

    return keysToDelete.length > 0;
  }
}

module.exports = MemoryDB;
