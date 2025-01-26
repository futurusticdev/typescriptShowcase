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
    <div className="min-h-screen w-full bg-[#f9fafc] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
              Create your account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 input-field"
                  placeholder="Enter your email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 input-field"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 input-field"
                  placeholder="Confirm your password"
                  value={credentials.confirmPassword}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Sign up
              </button>
            </form>
            <div className="mt-4 text-center">
              <a
                href="#login"
                className="text-primary hover:text-primary-dark transition-colors"
              >
                Already have an account? Sign In
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
