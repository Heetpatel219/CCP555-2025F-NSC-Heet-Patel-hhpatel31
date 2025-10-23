// tests/unit/memory-db.test.js
const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('MemoryDB', () => {
  let db;

  beforeEach(() => {
    db = new MemoryDB();
  });

  test('writeFragment stores a fragment', async () => {
    await db.writeFragment('user1', 'id1', { type: 'text/plain', size: 4 });
    const frag = await db.readFragment('user1', 'id1');
    expect(frag).toEqual({ type: 'text/plain', size: 4 });
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

  test('listFragments returns fragments for owner', async () => {
    await db.writeFragment('user1', 'id1', { id: 'id1', type: 'text/plain' });
    await db.writeFragment('user1', 'id2', { id: 'id2', type: 'text/plain' });
    await db.writeFragment('user2', 'id3', { id: 'id3', type: 'text/plain' });
    
    const fragments = await db.listFragments('user1');
    expect(fragments).toEqual(['id1', 'id2']);
  });

  test('listFragments returns empty array for user with no fragments', async () => {
    const fragments = await db.listFragments('user1');
    expect(fragments).toEqual([]);
  });

  test('delete removes fragment', async () => {
    await db.writeFragment('user1', 'id1', { id: 'id1', type: 'text/plain' });
    const deleted = await db.delete('user1:id1');
    expect(deleted).toBe(true);
    
    const frag = await db.readFragment('user1', 'id1');
    expect(frag).toBeNull();
  });

  test('generic read returns null for unknown key', async () => {
    const result = await db.read('unknown-key');
    expect(result).toBeNull();
  });
});
