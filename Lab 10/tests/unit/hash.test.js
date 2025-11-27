const { hash } = require('../../src/hash');

describe('Hash', () => {
  test('hash() should return a consistent hash for the same input', () => {
    const input = 'test@example.com';
    const hash1 = hash(input);
    const hash2 = hash(input);
    expect(hash1).toBe(hash2);
  });

  test('hash() should return different hashes for different inputs', () => {
    const input1 = 'test1@example.com';
    const input2 = 'test2@example.com';
    const hash1 = hash(input1);
    const hash2 = hash(input2);
    expect(hash1).not.toBe(hash2);
  });

  test('hash() should return a 64-character hex string', () => {
    const input = 'test@example.com';
    const result = hash(input);
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  test('hash() should handle empty string', () => {
    const result = hash('');
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });

  test('hash() should handle special characters', () => {
    const input = 'test+tag@example.com';
    const result = hash(input);
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });
});

