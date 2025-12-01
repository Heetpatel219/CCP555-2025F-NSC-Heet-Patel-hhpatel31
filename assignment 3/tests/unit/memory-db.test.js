// tests/unit/memory-db.test.js
const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('MemoryDB', () => {
  let db;

  beforeEach(() => {
    db = new MemoryDB();
  });

  test('writeFragment stores a fragment', async () => {
    await db.writeFragment({ ownerId: 'user1', id: 'id1', type: 'text/plain', size: 4 });
    const frag = await db.readFragment('user1', 'id1');
    expect(frag.type).toBe('text/plain');
    expect(frag.size).toBe(4);
  });

  test('readFragmentData returns stored data', async () => {
    await db.writeFragmentData('user1', 'id1', Buffer.from('test'));
    const data = await db.readFragmentData('user1', 'id1');
    expect(data.toString()).toBe('test');
  });

  test('readFragment returns null for unknown id', async () => {
    const frag = await db.readFragment('user1', 'unknown');
    expect(frag).toBeNull();
  });

  test('listFragments returns fragment IDs for owner', async () => {
    await db.writeFragment({ ownerId: 'user1', id: 'id1', type: 'text/plain' });
    await db.writeFragment({ ownerId: 'user1', id: 'id2', type: 'text/plain' });
    await db.writeFragment({ ownerId: 'user2', id: 'id3', type: 'text/plain' });

    const fragments = await db.listFragments('user1');
    expect(fragments).toContain('id1');
    expect(fragments).toContain('id2');
    expect(fragments).not.toContain('id3');
  });

  test('listFragments with expand returns full metadata', async () => {
    await db.writeFragment({ ownerId: 'user1', id: 'id1', type: 'text/plain', size: 10 });
    await db.writeFragment({ ownerId: 'user1', id: 'id2', type: 'text/html', size: 20 });

    const fragments = await db.listFragments('user1', true);
    expect(fragments.length).toBe(2);
    expect(fragments[0]).toHaveProperty('type');
    expect(fragments[0]).toHaveProperty('size');
  });

  test('listFragments returns empty array for user with no fragments', async () => {
    const fragments = await db.listFragments('user1');
    expect(fragments).toEqual([]);
  });

  test('deleteFragment removes both metadata and data', async () => {
    await db.writeFragment({ ownerId: 'user1', id: 'id1', type: 'text/plain' });
    await db.writeFragmentData('user1', 'id1', Buffer.from('test'));

    const deleted = await db.deleteFragment('user1', 'id1');
    expect(deleted).toBe(true);

    const frag = await db.readFragment('user1', 'id1');
    expect(frag).toBeNull();

    const data = await db.readFragmentData('user1', 'id1');
    expect(data).toBeNull();
  });

  test('deleteFragment returns false for non-existent fragment', async () => {
    const deleted = await db.deleteFragment('user1', 'non-existent');
    expect(deleted).toBe(false);
  });

  test('generic read returns null for unknown key', async () => {
    const result = await db.read('unknown-key');
    expect(result).toBeNull();
  });

  test('generic write and read work correctly', async () => {
    await db.write('test-key', { data: 'test-value' });
    const result = await db.read('test-key');
    expect(result).toEqual({ data: 'test-value' });
  });

  test('generic delete works correctly', async () => {
    await db.write('test-key', { data: 'test-value' });
    const deleted = await db.delete('test-key');
    expect(deleted).toBe(true);

    const result = await db.read('test-key');
    expect(result).toBeNull();
  });
});
