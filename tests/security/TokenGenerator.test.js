import TokenGenerator from "../../security/TokenGenerator.js";
import {describe, it, expect, jest} from '@jest/globals';

// Mock the logger to avoid actual logging during tests
jest.mock('../../logger/logger.js', () => ({
   info: jest.fn(),
   error: jest.fn()
}));

describe('generateToken', () => {
   it('should generate a random token', () => {
      const token = TokenGenerator.generateToken();
      expect(token).not.toBeNull();
   });
});

describe('generateToken', () => {
   it('should generate unique token', () => {
      const token1 = TokenGenerator.generateToken();
      const token2 = TokenGenerator.generateToken();
      expect(token1).not.toEqual(token2);
   });
});