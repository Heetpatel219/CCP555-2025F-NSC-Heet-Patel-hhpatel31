const Fragment = require('../../src/model/fragment');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory');

// Define (i.e., name) the set of tests we're about to do
describe('Fragment class', () => {
  // Write a test for Fragment constructor
  test('Fragment constructor should set all properties correctly', () => {
    const fragment = new Fragment({
      id: 'test-id',
      ownerId: 'test-owner',
      type: 'text/plain',
      size: 100,
    });

    expect(fragment.id).toBe('test-id');
    expect(fragment.ownerId).toBe('test-owner');
    expect(fragment.type).toBe('text/plain');
    expect(fragment.size).toBe(100);
    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
  });

  // Write a test for Fragment constructor without ID
  test('Fragment constructor should generate ID if not provided', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    expect(fragment.id).toBeDefined();
    expect(typeof fragment.id).toBe('string');
    expect(fragment.id.length).toBeGreaterThan(0);
  });

  // Write a test for Fragment constructor with timestamps
  test('Fragment constructor should set created and updated timestamps', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
    expect(fragment.created).toBe(fragment.updated);
  });

  // Write a test for isSupportedType()
  test('isSupportedType() should return true for supported types', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
  });

  // Write a test for isSupportedType() with unsupported type
  test('isSupportedType() should return false for unsupported types', () => {
    expect(Fragment.isSupportedType('application/json')).toBe(false);
    expect(Fragment.isSupportedType('image/png')).toBe(false);
  });

  // Write a test for byUser()
  test('byUser() should return fragments for a user', async () => {
    const ownerId = 'test-user-' + Date.now();
    const fragment = {
      id: 'test-fragment-user',
      ownerId,
      type: 'text/plain',
      size: 0,
    };

    // First create a fragment for the user
    await writeFragment(ownerId, fragment.id, fragment);

    // Now test byUser
    const fragments = await Fragment.byUser(ownerId);
    expect(Array.isArray(fragments)).toBe(true);
    expect(fragments.length).toBeGreaterThan(0);
    expect(fragments[0].id).toBe(fragment.id);
  });

  // Write a test for byId()
  test('byId() should return fragment by ID', async () => {
    const fragment = {
      id: 'test-fragment-id',
      ownerId: 'test-owner',
      type: 'text/plain',
      size: 0,
    };

    // First create a fragment
    await writeFragment('test-owner', fragment.id, fragment);

    // Now test byId
    const result = await Fragment.byId(fragment.id);
    expect(result).toBeInstanceOf(Fragment);
    expect(result.id).toBe(fragment.id);
  });

  // Write a test for byId() with non-existent fragment
  test('byId() should return null for non-existent fragment', async () => {
    const result = await Fragment.byId('non-existent-id');
    expect(result).toBeNull();
  });

  // Write a test for save()
  test('save() should update fragment and call writeFragment', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    const testData = Buffer.from('test data');
    await fragment.save(testData);

    // Check that it was saved to the database
    const savedFragment = await readFragment('test-owner', fragment.id);
    expect(savedFragment).toBeDefined();
    expect(savedFragment.id).toBe(fragment.id);
  });

  // Write a test for getData()
  test('getData() should return fragment data', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    const testData = Buffer.from('Hello, world!');
    await writeFragmentData('test-owner', fragment.id, testData);

    const result = await fragment.getData();
    expect(result).toEqual(testData);
  });

  // Write a test for setData()
  test('setData() should set fragment data and update size', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    const testData = Buffer.from('Test data for fragment');
    await fragment.setData(testData);

    expect(fragment.size).toBe(testData.length);

    // Check that data was saved
    const savedData = await readFragmentData('test-owner', fragment.id);
    expect(savedData).toEqual(testData);
  });

  // Write a test for delete()
  test('delete() should delete fragment', async () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });

    // Save the fragment first
    const testData = Buffer.from('test data');
    await fragment.save(testData);

    // Now delete it
    const result = await fragment.delete();
    expect(result).toBe(true);

    // Verify it's deleted
    const deletedFragment = await readFragment('test-owner', fragment.id);
    expect(deletedFragment).toBeNull();
  });
});