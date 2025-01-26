import React, { useState } from "react";
import { LoginCredentials, AuthResponse, ApiError } from "../types/interfaces";
import axios from "axios";

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<AuthResponse>(
        `${import.meta.env.VITE_API_URL}/api/login`,
        credentials
      );
      onLogin(response.data.token);
    } catch (err: any) {
      const apiError = err.response?.data as ApiError;
      setError(apiError?.error || "An error occurred");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
        Sign in to your account
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
        <button type="submit" className="btn-primary w-full">
          Sign in
        </button>
      </form>
      <div className="mt-4 text-center">
        <a
          href="#register"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          Don't have an account? Sign Up
        </a>
      </div>
    </div>
  );
};

export default Login;
