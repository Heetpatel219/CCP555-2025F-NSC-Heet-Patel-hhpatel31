const Fragment = require('../../src/model/fragment');

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

  // Test constructor throws for missing ownerId
  test('Fragment constructor should throw for missing ownerId', () => {
    expect(() => new Fragment({ type: 'text/plain' })).toThrow('ownerId is required');
  });

  // Test constructor throws for missing type
  test('Fragment constructor should throw for missing type', () => {
    expect(() => new Fragment({ ownerId: 'test-owner' })).toThrow('type is required');
  });

  // Test constructor throws for invalid type
  test('Fragment constructor should throw for invalid type', () => {
    expect(
      () =>
        new Fragment({
          ownerId: 'test-owner',
          type: 'invalid/type',
        })
    ).toThrow('Invalid type');
  });

  // Test constructor throws for invalid size
  test('Fragment constructor should throw for invalid size', () => {
    expect(
      () =>
        new Fragment({
          ownerId: 'test-owner',
          type: 'text/plain',
          size: -1,
        })
    ).toThrow('size must be a non-negative number');
  });

  // Write a test for isSupportedType()
  test('isSupportedType() should return true for supported types', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('text/markdown')).toBe(true);
    expect(Fragment.isSupportedType('text/html')).toBe(true);
    expect(Fragment.isSupportedType('text/csv')).toBe(true);
    expect(Fragment.isSupportedType('application/json')).toBe(true);
    expect(Fragment.isSupportedType('image/png')).toBe(true);
    expect(Fragment.isSupportedType('image/jpeg')).toBe(true);
  });

  // Write a test for isSupportedType() with unsupported type
  test('isSupportedType() should return false for unsupported types', () => {
    expect(Fragment.isSupportedType('application/pdf')).toBe(false);
    expect(Fragment.isSupportedType('video/mp4')).toBe(false);
    expect(Fragment.isSupportedType(null)).toBe(false);
    expect(Fragment.isSupportedType(undefined)).toBe(false);
  });

  // Test isSupportedType with charset
  test('isSupportedType() should handle types with charset', () => {
    expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
    expect(Fragment.isSupportedType('application/json; charset=utf-8')).toBe(true);
  });

  // Test supportedTypes getter
  test('supportedTypes should return array of supported types', () => {
    const types = Fragment.supportedTypes;
    expect(Array.isArray(types)).toBe(true);
    expect(types).toContain('text/plain');
    expect(types).toContain('image/png');
    expect(types).toContain('application/json');
  });

  // Test mimeType getter
  test('mimeType should return type without charset', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain; charset=utf-8',
    });
    expect(fragment.mimeType).toBe('text/plain');
  });

  // Test isText getter
  test('isText should return true for text types', () => {
    const textFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
    expect(textFragment.isText).toBe(true);

    const jsonFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'application/json',
    });
    expect(jsonFragment.isText).toBe(true);
  });

  // Test isImage method
  test('isImage() should return true for image types', () => {
    const imageFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'image/png',
    });
    expect(imageFragment.isImage()).toBe(true);

    const textFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
    expect(textFragment.isImage()).toBe(false);
  });

  // Test formats getter
  test('formats should return valid conversion formats', () => {
    const mdFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/markdown',
    });
    expect(mdFragment.formats).toContain('.html');
    expect(mdFragment.formats).toContain('.txt');

    const pngFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'image/png',
    });
    expect(pngFragment.formats).toContain('.jpg');
    expect(pngFragment.formats).toContain('.webp');
  });

  // Test canConvertTo method
  test('canConvertTo() should return true for valid conversions', () => {
    const mdFragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/markdown',
    });
    expect(mdFragment.canConvertTo('.html')).toBe(true);
    expect(mdFragment.canConvertTo('.txt')).toBe(true);
    expect(mdFragment.canConvertTo('.png')).toBe(false);
  });

  // Test getMimeType()
  test('getMimeType() should return correct MIME types', () => {
    expect(Fragment.getMimeType('.txt')).toBe('text/plain');
    expect(Fragment.getMimeType('.md')).toBe('text/markdown');
    expect(Fragment.getMimeType('.html')).toBe('text/html');
    expect(Fragment.getMimeType('.json')).toBe('application/json');
    expect(Fragment.getMimeType('.png')).toBe('image/png');
    expect(Fragment.getMimeType('.jpg')).toBe('image/jpeg');
  });

  test('getMimeType() should return null for unknown extensions', () => {
    expect(Fragment.getMimeType('.unknown')).toBeNull();
    expect(Fragment.getMimeType('.xyz')).toBeNull();
  });

  // Test tags
  test('Fragment should initialize with empty tags', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
    expect(fragment.tags).toEqual([]);
  });

  test('Fragment should accept tags in constructor', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
      tags: ['test', 'important'],
    });
    expect(fragment.tags).toContain('test');
    expect(fragment.tags).toContain('important');
  });

  // Test version
  test('Fragment should have version property', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
    expect(fragment.version).toBe(1);
  });

  // Test sharedWith
  test('Fragment should initialize with empty sharedWith', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
    expect(fragment.sharedWith).toEqual([]);
  });

  // Test accessCount
  test('Fragment should initialize with accessCount of 0', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
    });
    expect(fragment.accessCount).toBe(0);
  });

  // Test getAnalytics
  test('getAnalytics() should return fragment statistics', () => {
    const fragment = new Fragment({
      ownerId: 'test-owner',
      type: 'text/plain',
      size: 100,
      tags: ['test'],
    });
    const analytics = fragment.getAnalytics();
    expect(analytics.id).toBe(fragment.id);
    expect(analytics.type).toBe('text/plain');
    expect(analytics.size).toBe(100);
    expect(analytics.tagCount).toBe(1);
  });
});
