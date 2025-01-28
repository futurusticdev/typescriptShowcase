# 🚀 Modern TypeScript Task Management Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-06B6D4.svg)](https://tailwindcss.com/)

A sophisticated task management application showcasing modern TypeScript development practices and enterprise-level architecture. This project demonstrates expertise in full-stack TypeScript development, modern state management, and responsive design patterns.

## 🎯 Technical Highlights

### Frontend Architecture
- **TypeScript Excellence**
  - Strict type checking with custom utility types
  - Type-safe API integration with Axios
  - Comprehensive type definitions for state management

- **Modern React Patterns**
  - Functional components with custom hooks
  - Context API for theme management
  - Optimized rendering with proper React.memo usage

- **Advanced UI Features**
  - Drag-and-drop functionality using @dnd-kit
  - Responsive design with Tailwind CSS
  - Material UI integration for enhanced components

### Backend Implementation
- **Secure Authentication**
  - JWT-based authentication flow
  - Bcrypt password hashing
  - Protected API routes

- **API Design**
  - RESTful endpoints with Express
  - CORS configuration for security
  - JSON Server for rapid prototyping

## 🛠️ Technology Stack

### Core Technologies
- TypeScript 5.2.2
- React 18.2.0
- Vite 4.5.2
- Node.js 18.x

### Frontend
- Tailwind CSS 3.4.1
- @dnd-kit for drag-and-drop
- Material UI components
- Axios for API calls

### Backend
- Express.js
- JSON Server
- JWT for authentication
- CORS for security

### Development & Testing
- Vitest for unit testing
- ESLint for code quality
- Concurrent development servers
- Type checking with `tsc`

## 🚀 Getting Started

1. **Clone and Install**
```bash
git clone <repository-url>
cd typescript-task-manager
npm install
```

2. **Development**
```bash
# Run both frontend and backend
npm run dev

# Run frontend only
npm run dev:frontend

# Run backend only
npm run dev:backend
```

3. **Testing**
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run test:types
```

4. **Production**
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── services/           # API and external services
├── types/              # TypeScript interfaces and types
├── hooks/              # Custom React hooks
└── assets/             # Static assets

server/                 # Backend implementation
├── server.js          # Express server setup
└── db.json            # JSON Server database
```

## 💡 Key Features

- **Task Management**
  - Create, edit, and delete tasks
  - Drag-and-drop task organization
  - Real-time updates

- **User Experience**
  - Responsive design for all devices
  - Dark/light theme support
  - Smooth animations and transitions

- **Authentication**
  - Secure user registration
  - JWT-based authentication
  - Protected routes

## 🔒 Security Features

- CORS configuration
- Password hashing with bcrypt
- JWT token validation
- Protected API endpoints
- Type-safe data handling

## 🧪 Testing Strategy

- Unit tests with Vitest
- Type testing with TypeScript
- Component testing best practices
- API endpoint testing

## 📦 Deployment

The application is configured for deployment on Heroku with:
- Automatic builds via `heroku-postbuild`
- Environment variable management
- Production optimization
- Node.js and NPM version specifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
