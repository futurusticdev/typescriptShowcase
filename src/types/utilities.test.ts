import { describe, it, expect } from 'vitest';

// Test data
interface TestUser {
  id: number;
  name: string;
  email: string | null;
  age?: number;
  roles: string[];
}

describe('TypeScript Utility Types Runtime Tests', () => {
  describe('Pick', () => {
    it('should pick only specified properties', () => {
      const user: TestUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: ['user']
      };

      const identity: Pick<TestUser, 'id' | 'name'> = {
        id: user.id,
        name: user.name
      };

      expect(identity).toEqual({ id: 1, name: 'Test User' });
      expect(Object.keys(identity)).toHaveLength(2);
      expect('email' in identity).toBe(false);
    });
  });

  describe('Omit', () => {
    it('should omit specified properties', () => {
      const user: TestUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        roles: ['user']
      };

      const public_user: Omit<TestUser, 'email'> = {
        id: user.id,
        name: user.name,
        roles: user.roles
      };

      expect('email' in public_user).toBe(false);
      expect(Object.keys(public_user)).toHaveLength(3);
    });
  });

  describe('Partial', () => {
    it('should make all properties optional', () => {
      const partial_user: Partial<TestUser> = {
        name: 'Test User'
      };

      expect(partial_user.id).toBeUndefined();
      expect(partial_user.email).toBeUndefined();
      expect(partial_user.name).toBe('Test User');
    });
  });

  describe('Required', () => {
    it('should make all properties required', () => {
      const required_user: Required<TestUser> = {
        id: 1,
        name: 'Test User',
        email: null,
        age: 25,
        roles: ['user']
      };

      expect(Object.keys(required_user)).toHaveLength(5);
      expect(required_user.age).toBeDefined();
    });
  });

  describe('Record', () => {
    it('should create an object with specified keys and value types', () => {
      const roles: Record<'admin' | 'user', string[]> = {
        admin: ['read', 'write', 'delete'],
        user: ['read']
      };

      expect(Object.keys(roles)).toHaveLength(2);
      expect(Array.isArray(roles.admin)).toBe(true);
      expect(Array.isArray(roles.user)).toBe(true);
    });
  });

  describe('NonNullable', () => {
    it('should handle null and undefined', () => {
      type EmailType = string | null | undefined;
      const email: NonNullable<EmailType> = 'test@example.com';

      expect(email).toBeDefined();
      expect(email).not.toBeNull();
      expect(typeof email).toBe('string');
    });
  });

  describe('ReturnType', () => {
    it('should correctly type function return values', () => {
      function createUser(name: string): TestUser {
        return {
          id: 1,
          name,
          email: null,
          roles: []
        };
      }

      const user: ReturnType<typeof createUser> = createUser('Test User');

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('roles');
    });
  });

  describe('Parameters', () => {
    it('should correctly type function parameters', () => {
      function greet(name: string, age: number): string {
        return `${name} is ${age} years old`;
      }

      const params: Parameters<typeof greet> = ['Test User', 25];

      expect(params).toHaveLength(2);
      expect(typeof params[0]).toBe('string');
      expect(typeof params[1]).toBe('number');
    });
  });

  describe('Complex Type Combinations', () => {
    it('should handle nested type transformations', () => {
      interface NestedData {
        user?: {
          settings?: {
            theme: string | null;
          } | null;
        } | null;
      }

      const data: Required<NonNullable<NestedData['user']>> = {
        settings: {
          theme: 'dark'
        }
      };

      expect(data.settings).toBeDefined();
      expect(data.settings.theme).toBe('dark');
    });

    it('should handle numeric edge cases', () => {
      interface NumericData {
        int: number;
        float: number;
        negative: number;
      }

      const numbers: NumericData = {
        int: 42,
        float: 3.14,
        negative: -1
      };

      expect(Number.isInteger(numbers.int)).toBe(true);
      expect(Number.isInteger(numbers.float)).toBe(false);
      expect(numbers.negative).toBeLessThan(0);
    });
  });
});