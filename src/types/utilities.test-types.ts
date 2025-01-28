/**
 * Type Validation Tests
 * This file contains type-level tests for our utility types
 * Tests are performed at compile time through type assertions and conditional types
 */

// Type assertion helper
type AssertTrue<T extends true> = T;
type AssertFalse<T extends false> = T;
type IsExactType<T, U> = [T] extends [U] ? [U] extends [T] ? true : false : false;

// Test base types
interface TestUser {
  id: number;
  name: string;
  email: string | null;
  age?: number;
  roles: string[];
}

// === Pick Tests ===
type TestUserIdentity = Pick<TestUser, "id" | "name">;

// Validate Pick type structure
type ValidatePickProps = AssertTrue<
  IsExactType<keyof TestUserIdentity, "id" | "name">
>;

// Validate property types are preserved
type ValidatePickTypes = AssertTrue<
  IsExactType<TestUserIdentity["id"], number> & 
  IsExactType<TestUserIdentity["name"], string>
>;

// === Omit Tests ===
type TestPublicUser = Omit<TestUser, "email">;

// Validate Omit removes correct property
type ValidateOmitProps = AssertTrue<
  IsExactType<keyof TestPublicUser, "id" | "name" | "age" | "roles">
>;

// === Partial Tests ===
type TestOptionalUser = Partial<TestUser>;

// Validate all properties are optional
type ValidatePartial = AssertTrue<
  IsExactType<TestOptionalUser["id"] | undefined, TestOptionalUser["id"]>
>;

// === Required Tests ===
type TestRequiredUser = Required<TestUser>;

// Validate all properties are required
type ValidateRequired = AssertTrue<
  IsExactType<Exclude<TestRequiredUser["age"], undefined>, number>
>;

// === Record Tests ===
type TestUserRoles = Record<"admin" | "user", { permissions: string[] }>;

// Validate Record structure
type ValidateRecord = AssertTrue<
  IsExactType<
    TestUserRoles,
    {
      admin: { permissions: string[] };
      user: { permissions: string[] };
    }
  >
>;

// === Exclude Tests ===
type TestUserType = "admin" | "user" | "guest" | null;
type TestActiveUserType = Exclude<TestUserType, null | "guest">;

// Validate excluded types
type ValidateExclude = AssertTrue<
  IsExactType<TestActiveUserType, "admin" | "user">
>;

// === Extract Tests ===
type TestPrivilegedRole = Extract<TestUserType, "admin" | "user">;

// Validate extracted types
type ValidateExtract = AssertTrue<
  IsExactType<TestPrivilegedRole, "admin" | "user">
>;

// === NonNullable Tests ===
type TestNonNullableEmail = NonNullable<TestUser["email"]>;

// Validate null and undefined are removed
type ValidateNonNullable = AssertTrue<
  IsExactType<TestNonNullableEmail, string>
>;

// === ReturnType and Parameters Tests ===
type TestFunction = (data: Partial<TestUser>) => TestUser;
type TestReturnType = ReturnType<TestFunction>;
type TestParameters = Parameters<TestFunction>;

// Validate function types
type ValidateReturnType = AssertTrue<
  IsExactType<TestReturnType, TestUser>
>;

type ValidateParameters = AssertTrue<
  IsExactType<TestParameters, [data: Partial<TestUser>]>
>;

// === Edge Cases and Complex Types ===

// Numeric type tests
interface TestNumericTypes {
  int: number;
  float: number;
  negative: number;
}

type TestValidateNumeric = Pick<TestNumericTypes, "int" | "float">;

// Validate numeric type handling
type ValidateNumberTypes = AssertTrue<
  IsExactType<TestValidateNumeric["int"], number> &
  IsExactType<TestValidateNumeric["float"], number>
>;

// Nested nullability tests
interface TestNestedObject {
  data?: {
    value: string | null;
  } | null;
}

type TestNonNullableNested = NonNullable<TestNestedObject["data"]>;
type TestRequiredNested = Required<TestNestedObject>;

// Validate nested type handling
type ValidateNested = AssertTrue<
  IsExactType<
    TestNonNullableNested,
    {
      value: string | null;
    }
  >
>;

// Complex type combinations
type TestComplexType = NonNullable<Required<Pick<Partial<TestUser>, "email" | "age">>>;

// Validate complex type transformations
type ValidateComplex = AssertTrue<
  IsExactType<
    TestComplexType,
    {
      email: string | null;
      age: number;
    }
  >
>;

// === Type Constraint Tests ===

// Branded types for additional type safety
type TestBranded<T, Brand> = T & { __brand: Brand };
type TestUserId = TestBranded<number, "UserId">;
type TestEmailAddress = TestBranded<string, "EmailAddress">;

// Validate branded types
type ValidateBranded = AssertTrue<
  IsExactType<TestUserId, number & { __brand: "UserId" }> &
  IsExactType<TestEmailAddress, string & { __brand: "EmailAddress" }>
>;

// Add a validation check that all type assertions are valid
type ValidateAllAssertions = AssertTrue<
  ValidatePickProps &
  ValidatePickTypes &
  ValidateOmitProps &
  ValidatePartial &
  ValidateRequired &
  ValidateRecord &
  ValidateExclude &
  ValidateExtract &
  ValidateNonNullable &
  ValidateReturnType &
  ValidateParameters &
  ValidateNumberTypes &
  ValidateNested &
  ValidateComplex &
  ValidateBranded
>;