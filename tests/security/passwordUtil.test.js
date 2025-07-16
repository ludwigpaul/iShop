import passwordUtil from "../../security/passwordUtil.js";
import {describe, it, expect, jest} from '@jest/globals';

// Mock the logger to avoid actual logging during tests
jest.mock('../../logger/logger.js', () => ({
    info: jest.fn(),
    error: jest.fn()
}));

describe('hashPassword()', () => {
    it('should hash the given password (password1234)', async() => {
        const password = 'password1234';
        expect(passwordUtil.hashPassword(password)).not.toBe(password);
    });
});

describe('hashPassword()', () => {
   it('should throw an error for empty password', async() => {
       const password = undefined;
       await expect(passwordUtil.hashPassword(password))
           .rejects.toThrow('Password is required for hashing');
   });
});

describe('comparePasswords()', () => {
    it('should compare both passwords and return true', async () => {
        const password = 'password1234';
        const hashedPassword = await passwordUtil.hashPassword(password);
        const result = await passwordUtil.comparePasswords(password, hashedPassword);
        expect(result).toBeTruthy();
    });
});

describe('comparePasswords()', () => {
    it('should compare both passwords and return false', async () => {
        const registeredPassword = 'password1234';

        const loginPassword = 'Password12345'

        const hashedPassword = await passwordUtil.hashPassword(registeredPassword)
        const result = await passwordUtil.comparePasswords(loginPassword, hashedPassword);
        expect(result).toBeFalsy();
    });
});

describe('comparePasswords()', () => {
   it('should throw an error when password is empty', async () => {
       const registeredPassword = 'password1234';
       const hashedPassword = await passwordUtil.hashPassword(registeredPassword);
       await expect(passwordUtil.comparePasswords(undefined, hashedPassword))
           .rejects.toThrow('Both password and hashed password are required for comparison');
   })
});

describe('comparePasswords()', () => {
    it('should throw an error when hashedPassword is empty', async () => {
        const loginPassword = 'Password12345'
        await expect(passwordUtil.comparePasswords(loginPassword, undefined))
            .rejects.toThrow('Both password and hashed password are required for comparison');
    })
});

