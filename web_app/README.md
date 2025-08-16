# AgriConnect Web Application

A modern, responsive web application for AgriConnect government admin dashboard built with Next.js, TypeScript, and Material-UI.

##  Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on port 3000

### Installation
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env.local

# Start development server
npm run dev
```

The application will be available at: **http://localhost:3005**

##  Configuration

### Port Configuration
- **Frontend**: Port 3005
- **Backend**: Port 3000 (configured in `config/config.ts`)
### Environment Variables
Create a `.env.local` file based on `env.example`:
```bash
# Frontend Configuration
PORT=3005
NEXT_PUBLIC_APP_URL=http://localhost:3005

# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SERVICE_BASE_URL=http://localhost:3000
```

##  Project Structure

```
web_app/
├── app/                    # Next.js 13+ app directory
│   ├── login/            # Login page
│   ├── auth/             # Authentication pages
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
├── slices/               # Redux Toolkit slices
├── constants/            # App constants
├── config/               # Configuration files
└── types/                # TypeScript type definitions
```

##  Features

- **Modern UI**: Built with Material-UI and Tailwind CSS
- **Authentication**: Complete login/logout system
- **State Management**: Redux Toolkit for global state
- **Type Safety**: Full TypeScript support
- **Responsive Design**: Mobile-first approach
- **Agriculture Theme**: Custom color palette (#52B788 primary)

##  Available Scripts

```bash
npm run dev      # Start development server on port 3005
npm run build    # Build for production
npm run start    # Start production server on port 3005
npm run lint     # Run ESLint
```

## 🔌 API Integration

The application integrates with the AgriConnect backend API:

- **Base URL**: `http://localhost:3000`
- **Authentication**: JWT-based auth system
- **Endpoints**: Configured in `config/config.ts`

##  Key Components

- **Login System**: Smart identifier detection (username/email/phone/NIC)
- **Password Reset**: Multi-step OTP-based password reset
- **Dashboard**: Admin dashboard with agriculture-themed design
- **Navigation**: Responsive sidebar and top navigation

##  Design System

### Colors
- **Primary**: #52B788 (Agriculture Green)
- **Secondary**: #eab308 (Golden Wheat)
- **Success**: #22c55e (Healthy Green)
- **Warning**: #f59e0b (Harvest Orange)
- **Error**: #ef4444 (Alert Red)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

##  Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup
Ensure all environment variables are properly configured for production.

##  Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

##  Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Update types when adding new features
4. Test thoroughly before submitting

##  License

This project is part of the AgriConnect government initiative.
