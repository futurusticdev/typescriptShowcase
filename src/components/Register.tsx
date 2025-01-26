import React, { useState } from "react";
import axios from "axios";
import {
  RegisterCredentials,
  AuthResponse,
  ApiError,
} from "../types/interfaces";

interface RegisterProps {
  onRegister: (token: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credentials.password !== credentials.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/api/register`,
        {
          email: credentials.email,
          password: credentials.password,
        }
      );
      onRegister(response.data.token);
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;
      setError(apiError?.error || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field rounded-t-md"
                placeholder="Email address"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
            <div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field rounded-b-md"
                placeholder="Confirm Password"
                value={credentials.confirmPassword}
                onChange={(e) =>
                  setCredentials({
                    ...credentials,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <button type="submit" className="btn-primary w-full">
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center">
          <a
            href="#login"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Already have an account? Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
