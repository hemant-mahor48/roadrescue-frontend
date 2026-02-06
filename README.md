<<<<<<< HEAD
# roadrescue-frontend
=======
# 🚗 RoadRescue Frontend

A modern, feature-rich React + TypeScript frontend for the RoadRescue roadside assistance platform.

## ✨ Features

### 🎨 Modern UI/UX
- **Distinctive Design**: Custom gradient themes, glassmorphism effects, and smooth animations
- **Dark Theme**: Eye-friendly dark interface with vibrant accent colors
- **Responsive**: Mobile-first design that works on all screen sizes
- **Animated**: Smooth page transitions and micro-interactions using Framer Motion
- **Accessible**: Semantic HTML and keyboard navigation support

### 🔐 Authentication & User Management
- **Dual Role System**: Customer and Mechanic accounts
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Different dashboards for customers and mechanics
- **Profile Management**: Update user information and preferences

### 👥 Customer Features
- **Quick Request**: Submit breakdown requests with location and issue details
- **Real-time Tracking**: Track assigned mechanic location (when integrated with backend)
- **Request History**: View all past and active requests
- **Status Updates**: Live updates on request status
- **Become Mechanic**: Easy onboarding to switch to mechanic role

### 🔧 Mechanic Features
- **Availability Toggle**: Turn on/off to receive requests
- **Request Queue**: View incoming help requests
- **Profile Verification**: Submit documents for verification
- **Location Tracking**: Real-time location sharing with customers

### 🛠 Technical Features
- **TypeScript**: Full type safety across the application
- **State Management**: Zustand for efficient global state
- **API Integration**: Axios-based API client with interceptors
- **Persistent Auth**: Token storage and automatic refresh
- **Error Handling**: Toast notifications for user feedback
- **Loading States**: Skeleton screens and loading indicators

## 🏗 Project Structure

```
roadrescue-frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── PrivateRoute.tsx # Protected route wrapper
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx      # Public landing page
│   │   ├── LoginPage.tsx        # Login form
│   │   ├── RegisterPage.tsx     # Registration form
│   │   ├── CustomerDashboard.tsx # Customer main dashboard
│   │   ├── MechanicDashboard.tsx # Mechanic main dashboard
│   │   ├── ProfilePage.tsx       # User profile
│   │   ├── RequestPage.tsx       # Create new request
│   │   └── MechanicRegistrationPage.tsx # Become mechanic
│   ├── services/           # API services
│   │   └── api.ts         # Axios instance and API calls
│   ├── store/             # Zustand stores
│   │   └── index.ts       # Auth, Request, and Mechanic stores
│   ├── types/             # TypeScript types
│   │   └── index.ts       # All type definitions
│   ├── App.tsx            # Main app component with routing
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite configuration
└── tailwind.config.js     # Tailwind CSS config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment (optional):**
```bash
# The app uses proxy configuration in vite.config.ts
# API calls to /api/* are proxied to http://localhost:8080
```

3. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Design System

### Color Palette
- **Primary (Orange)**: `#f95d13` - Main brand color for CTAs and highlights
- **Dark Background**: `#1a1c23` - Main background
- **Dark Surface**: `#2a2c33` - Cards and elevated surfaces
- **Text**: White with varying opacity for hierarchy

### Typography
- **Display Font**: Space Grotesk - Bold, modern headings
- **Body Font**: DM Sans - Clean, readable body text

### Components
- **Buttons**: Three variants (primary, secondary, ghost) with hover effects
- **Cards**: Glass-morphism style with backdrop blur
- **Inputs**: Dark theme with focus states
- **Status Badges**: Color-coded for different request states

## 🔌 API Integration

### Base Configuration
```typescript
// All API calls go through /api proxy
const api = axios.create({
  baseURL: '/api',
});
```

### Authentication Flow
1. User logs in → JWT token received
2. Token stored in localStorage
3. Token added to all requests via interceptor
4. On 401 error → Auto logout and redirect to login

### Available APIs
- **Auth**: `/auth/login`, `/auth/register`, `/auth/validate`
- **Users**: `/users/me`, `/users/me/vehicles`
- **Mechanics**: `/mechanics/register`, `/mechanics/availability`
- **Requests**: `/requests`, `/requests/my-requests`

## 🎯 Key User Flows

### Customer Registration & Request
1. User registers → Receives JWT token
2. Redirected to customer dashboard
3. Clicks "Request Help" → Fills form with issue details
4. Request created → Matches with nearby mechanic
5. Tracks mechanic in real-time → Service completed

### Mechanic Onboarding
1. Customer can become mechanic
2. Submits license and Aadhaar details
3. Admin verifies documents
4. Profile approved → Can receive requests
5. Toggle availability → Start receiving help requests

## 🧩 State Management

### Auth Store (Zustand)
```typescript
{
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email, password) => Promise<void>
  register: (...) => Promise<void>
  logout: () => void
}
```

### Request Store
```typescript
{
  activeRequests: BreakdownRequest[]
  currentRequest: BreakdownRequest | null
  setActiveRequests: (requests) => void
  updateRequest: (id, updates) => void
}
```

## 🎨 Custom Styling

### Utility Classes
- `.btn-primary` - Primary button with gradient
- `.btn-secondary` - Secondary button style
- `.card` - Card container with border
- `.glass-card` - Glassmorphism card
- `.input-field` - Styled input field
- `.gradient-text` - Gradient text effect

### Animations
- Page transitions with Framer Motion
- Hover effects on interactive elements
- Skeleton loading states
- Smooth scrolling

## 📱 Responsive Design

- **Mobile**: < 768px - Stacked layout
- **Tablet**: 768px - 1024px - 2-column grid
- **Desktop**: > 1024px - Full multi-column layout

## 🔒 Security

- JWT token stored in localStorage (consider httpOnly cookies for production)
- Protected routes require authentication
- Automatic token refresh on API calls
- XSS protection via React's built-in escaping
- CSRF protection (implement when using cookies)

## 🚦 Request Status Flow

```
PENDING → SEARCHING → ASSIGNED → EN_ROUTE → IN_PROGRESS → COMPLETED
                                                   ↓
                                            PAYMENT_PENDING
```

Possible cancellation at any stage → `CANCELLED`

## 🎭 Features Implemented

✅ Landing page with hero section
✅ User authentication (login/register)
✅ Customer dashboard
✅ Mechanic dashboard
✅ Profile management
✅ Create breakdown request
✅ Mechanic registration
✅ Real-time status updates (UI ready)
✅ Responsive design
✅ Dark theme
✅ Toast notifications
✅ Protected routes
✅ Type-safe API calls

## 🔮 Future Enhancements

- [ ] Real-time WebSocket integration for live updates
- [ ] Google Maps integration for location picking
- [ ] Payment gateway integration
- [ ] Push notifications
- [ ] Chat system between customer and mechanic
- [ ] Rating and review system
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Multi-language support
- [ ] PWA capabilities

## 🤝 Backend Integration Points

The frontend expects these backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/validate` - Validate JWT token

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/vehicles` - Add vehicle
- `GET /api/users/me/vehicles` - Get user vehicles

### Mechanics
- `POST /api/mechanics/register` - Register as mechanic
- `GET /api/mechanics/{id}/profile` - Get mechanic profile
- `PUT /api/mechanics/availability` - Update availability
- `POST /api/mechanics/location` - Update location
- `POST /api/mechanics/verification` - Verify mechanic

### Requests
- `POST /api/requests` - Create breakdown request
- `GET /api/requests/my-requests` - Get user's requests
- `GET /api/requests/{id}` - Get request details
- `PUT /api/requests/{id}/cancel` - Cancel request
- `PUT /api/requests/{id}/accept` - Accept request (mechanic)
- `PUT /api/requests/{id}/complete` - Complete request

## 📝 Notes

- Currently using demo authentication (any email/password works for testing)
- API proxy configured for `http://localhost:8080`
- Production build should update API baseURL
- Consider environment variables for different environments
- Images and icons use Lucide React library

## 🐛 Known Issues

- Location picker needs Google Maps integration
- Real-time tracking requires WebSocket implementation
- Payment flow is placeholder
- Chat system not yet implemented

## 📄 License

This project is part of the RoadRescue platform.

---

Built with ❤️ using React, TypeScript, Tailwind CSS, and Framer Motion
>>>>>>> f8fd1546653b1988674fbaf670e403f4fba1d953
