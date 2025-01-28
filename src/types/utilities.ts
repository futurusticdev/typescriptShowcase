/**
 * TypeScript Utility Types Demonstration
 * This file showcases common utility types with practical examples
 */

// Base interface for examples
interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  metadata?: {
    lastLogin: Date;
    preferences: string[];
  };
}

/**
 * Pick<Type, Keys>
 * Constructs a type by picking the specified properties from Type
 */
type UserBasicInfo = Pick<User, "id" | "name">;
// Result: { id: number; name: string; }

/**
 * Omit<Type, Keys>
 * Constructs a type by removing the specified properties from Type
 */
type UserPublicInfo = Omit<User, "email" | "isAdmin">;
// Result: { id: number; name: string; metadata?: { lastLogin: Date; preferences: string[]; }; }

/**
 * Partial<Type>
 * Makes all properties in Type optional
 */
type PartialUser = Partial<User>;
// Result: { id?: number; name?: string; email?: string; isAdmin?: boolean; metadata?: {...}; }

/**
 * Required<Type>
 * Makes all properties in Type required
 */
type RequiredUser = Required<User>;
// Result: { id: number; name: string; email: string; isAdmin: boolean; metadata: {...}; }

/**
 * Record<Keys, Type>
 * Constructs an object type with properties of Keys type and values of Type
 */
type UserRoles = Record<"user" | "admin" | "guest", { permissions: string[] }>;
// Result: { user: { permissions: string[] }; admin: { permissions: string[] }; guest: { permissions: string[] }; }

/**
 * Exclude<UnionType, ExcludedMembers>
 * Constructs a type by excluding from UnionType all union members assignable to ExcludedMembers
 */
type UserRole = "admin" | "user" | "guest";
type NonAdminRole = Exclude<UserRole, "admin">;
// Result: "user" | "guest"

/**
 * Extract<Type, Union>
 * Constructs a type by extracting from Type all union members that are assignable to Union
 */
type AdminOrUser = Extract<UserRole, "admin" | "user">;
// Result: "admin" | "user"

/**
 * Function type for ReturnType example
 */
function createUser(name: string, email: string): User {
  return {
    id: Math.random(),
    name,
    email,
    isAdmin: false
  };
}

/**
 * ReturnType<Type>
 * Constructs a type consisting of the return type of function Type
 */
type CreateUserReturn = ReturnType<typeof createUser>;
// Result: User

/**
 * NonNullable<Type>
 * Constructs a type by excluding null and undefined from Type
 */
type UserMetadata = NonNullable<User["metadata"]>;
// Result: { lastLogin: Date; preferences: string[]; }

/**
 * Parameters<Type>
 * Constructs a tuple type from the types used in the parameters of a function type Type
 */
type CreateUserParams = Parameters<typeof createUser>;
// Result: [name: string, email: string]

// Example usage
const example = {
  // Pick example
  basicInfo: { id: 1, name: "John" } as UserBasicInfo,

  // Omit example
  publicInfo: { 
    id: 1, 
    name: "John",
    metadata: { lastLogin: new Date(), preferences: ["dark"] }
  } as UserPublicInfo,

  // Partial example
  partialUser: { name: "John" } as PartialUser,

  // Required example
  requiredUser: {
    id: 1,
    name: "John",
    email: "john@example.com",
    isAdmin: false,
    metadata: { lastLogin: new Date(), preferences: [] }
  } as RequiredUser,

  // Record example
  roles: {
    admin: { permissions: ["all"] },
    user: { permissions: ["read"] },
    guest: { permissions: [] }
  } as UserRoles,

  // Parameters example
  createUserArgs: ["John", "john@example.com"] as CreateUserParams,

  // ReturnType example
  newUser: createUser("John", "john@example.com") as CreateUserReturn
};

// Type assertions to prove type safety
const assertions = {
  // Exclude example
  nonAdminRole: "user" as NonAdminRole, // OK
  // nonAdminRole: "admin" as NonAdminRole, // Error!

  // Extract example
  adminOrUser: "admin" as AdminOrUser, // OK
  // adminOrUser: "guest" as AdminOrUser, // Error!

  // NonNullable example
  metadata: { lastLogin: new Date(), preferences: [] } as UserMetadata
};

/**
 * These utility types can be combined for more complex type manipulations
 */
type ComplexExample = Required<Pick<Partial<User>, "name" | "email">>;
// Result: { name: string; email: string; }