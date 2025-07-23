import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Automatically mock dotenv at the top level
jest.mock('dotenv');

describe('db.config.js', () => {
    const ORIGINAL_ENV = process.env;
    let dotenv;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
        dotenv = require('dotenv');
        dotenv.config.mockClear();
    });

    afterEach(() => {
        process.env = ORIGINAL_ENV;
        jest.clearAllMocks();
    });

    it('should call dotenv.config()', () => {
        require('../../config/db.config.js');
        expect(dotenv.config).toHaveBeenCalled();
    });

    it('should use default port 3306 when DB_PORT is not set', () => {
        delete process.env.DB_PORT;
        const { dbConfig } = require('../../config/db.config.js');
        expect(dbConfig.PORT).toBe(3306);
    });

    it('should use DB_PORT from environment when set', () => {
        process.env.DB_PORT = '1234';
        const { dbConfig } = require('../../config/db.config.js');
        expect(dbConfig.PORT).toBe(1234);
    });

    it('should export correct database configuration', () => {
        delete process.env.DB_PORT;
        process.env.DB_HOST = 'localhost';
        process.env.DB_USER = 'root';
        process.env.DB_PASSWORD = 'password';
        process.env.DB_NAME = 'ishop';
        jest.resetModules();
        const { dbConfig } = require('../../config/db.config.js');
        expect(dbConfig).toHaveProperty('HOST', 'localhost');
        expect(dbConfig).toHaveProperty('USER', 'root');
        expect(dbConfig).toHaveProperty('PASSWORD', 'password');
        expect(dbConfig).toHaveProperty('PORT', 3306);
        expect(dbConfig).toHaveProperty('DATABASE', 'ishop');
        expect(dbConfig).toHaveProperty('dialect', 'mysql');
        expect(dbConfig).toHaveProperty('pool');
        expect(dbConfig.pool).toHaveProperty('max', 5);
        expect(dbConfig.pool).toHaveProperty('min', 0);
        expect(dbConfig.pool).toHaveProperty('acquire', 30000);
        expect(dbConfig.pool).toHaveProperty('idle', 10000);
    });

    it('should parse pool config from environment variables', () => {
        process.env.DB_POOL_MAX = '20';
        process.env.DB_POOL_MIN = '2';
        process.env.DB_POOL_ACQUIRE = '50000';
        process.env.DB_POOL_IDLE = '15000';
        jest.resetModules();
        const { dbConfig } = require('../../config/db.config.js');
        expect(dbConfig.pool.max).toBe(20);
        expect(dbConfig.pool.min).toBe(2);
        expect(dbConfig.pool.acquire).toBe(50000);
        expect(dbConfig.pool.idle).toBe(15000);
    });
});