# 🚀 Quick Start Guide

## Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd roadrescue-frontend
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 3: Test the Application

#### As a Customer:
1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Sign Up"
3. Fill in the registration form:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +91 9876543210
   - Password: password123
4. Click "Create Account"
5. You'll be redirected to the Customer Dashboard
6. Click "Request Help" to create a breakdown request

#### As a Mechanic:
1. From Customer Dashboard, click "Become a Mechanic"
2. Enter verification details:
   - License Number: DL-1420110012345
   - Aadhaar Number: 123456789012
3. Submit application
4. Access Mechanic Dashboard
5. Toggle availability to receive requests

## 📁 Project Structure Overview

```
roadrescue-frontend/
├── src/
│   ├── pages/              # All page components
│   ├── components/         # Reusable components
│   ├── services/          # API integration
│   ├── store/             # State management
│   ├── types/             # TypeScript types
│   └── App.tsx            # Main app with routing
├── public/                # Static assets
└── package.json           # Dependencies
```

## 🎨 Key Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing Page | Public homepage |
| `/login` | Login | User authentication |
| `/register` | Register | User registration |
| `/dashboard` | Customer Dashboard | Customer main view |
| `/request/new` | Request Page | Create breakdown request |
| `/mechanic/dashboard` | Mechanic Dashboard | Mechanic main view |
| `/become-mechanic` | Mechanic Registration | Register as mechanic |
| `/profile` | Profile | User profile management |

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🌐 Backend Requirements

The frontend expects a backend API running at `http://localhost:8080` with these endpoints:

### Must-Have Endpoints:
- `POST /api/auth/login` - Authentication
- `POST /api/auth/register` - User registration
- `GET /api/users/me` - Get current user
- `POST /api/requests` - Create breakdown request
- `GET /api/requests/my-requests` - Get user's requests
- `POST /api/mechanics/register` - Register as mechanic

## 🎯 Testing Flow

### 1. Customer Journey
```
Register → Login → Dashboard → Create Request → View Status
```

### 2. Mechanic Journey
```
Register → Login → Become Mechanic → Verify → Toggle Available → Receive Requests
```

## ⚡ Quick Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#f95d13',  // Change to your brand color
  }
}
```

### Change Fonts
Edit `index.html` and `tailwind.config.js` font imports

### Add New Page
1. Create file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Import and use in navigation

## 🐛 Common Issues

### Port 3000 already in use
```bash
# Change port in vite.config.ts
server: {
  port: 3001,
}
```

### API not connecting
- Check backend is running on port 8080
- Check proxy configuration in `vite.config.ts`
- Verify CORS is enabled on backend

### Type errors
```bash
npm run build  # Check all type errors
```

## 📦 Production Deployment

```bash
# Build
npm run build

# The dist/ folder contains production build
# Deploy to:
# - Vercel: vercel deploy
# - Netlify: netlify deploy
# - Firebase: firebase deploy
```

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://zustand-demo.pmnd.rs)

## 💡 Pro Tips

1. **Use React DevTools** - Install browser extension for debugging
2. **Check Network Tab** - Monitor API calls in browser DevTools
3. **Hot Reload** - Changes reflect immediately in dev mode
4. **Type Safety** - Use TypeScript types for better DX
5. **State Inspector** - Use Zustand DevTools for state debugging

## 🤝 Need Help?

- Check the main README.md for detailed documentation
- Review component source code for examples
- Check browser console for errors
- Verify backend API is responding

---

Happy Coding! 🎉
