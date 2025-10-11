# MITO Task Manager - Progressive Web App

A modern, responsive Progressive Web App (PWA) for task management, built with React and Material-UI. This PWA provides a native app-like experience with offline capabilities, push notifications, and real-time updates.

## Features

### Core Features

- **Task Management**: Create, update, delete, and track tasks
- **Real-time Updates**: Live synchronization across devices using WebSocket
- **Notifications**: Push notifications for task updates and deadlines
- **File Attachments**: Upload and manage files with tasks
- **User Authentication**: Secure login, registration, and password reset
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### PWA Features

- **Offline Support**: Work without internet connection
- **App Installation**: Install as a native app on any device
- **Background Sync**: Automatically sync data when connection is restored
- **Push Notifications**: Receive notifications even when app is closed
- **Caching**: Intelligent caching for fast loading
- **Service Worker**: Background processing and offline functionality

### Technical Features

- **Material-UI**: Modern, accessible UI components
- **React Router**: Client-side routing
- **IndexedDB**: Local data storage for offline functionality
- **WebSocket**: Real-time communication
- **Workbox**: Advanced service worker management
- **Vite**: Fast build tool and development server

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Modern web browser with PWA support

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd PWA-mobile-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   - Update `src/config/index.js` with your backend API URL
   - Configure WebSocket URL in the same file

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - For PWA testing, use Chrome DevTools > Application > Manifest

### Building for Production

1. **Build the app**

   ```bash
   npm run build:prod
   ```

2. **Preview production build**

   ```bash
   npm run serve
   ```

3. **Test PWA features**
   ```bash
   npm run test:pwa
   ```

## Configuration

### Backend Integration

Update the API configuration in `src/config/index.js`:

```javascript
const API_CONFIG = {
  BACKEND_API_URL: "https://your-backend-url.com/api",
  // ... other config
};
```

### PWA Configuration

Modify `vite.config.js` for PWA settings:

```javascript
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "Your App Name",
    short_name: "YourApp",
    // ... manifest settings
  },
});
```

## Deployment

### Static Hosting (Recommended)

Deploy to any static hosting service:

1. **Vercel**

   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Netlify**

   ```bash
   npm run build:prod
   # Upload dist folder to Netlify
   ```

3. **GitHub Pages**
   ```bash
   npm run build:prod
   # Push dist folder to gh-pages branch
   ```

### Server Deployment

For server deployment with custom domain:

1. **Build the app**

   ```bash
   npm run build:prod
   ```

2. **Configure web server**

   - Ensure HTTPS is enabled (required for PWA)
   - Set proper MIME types for service worker
   - Configure caching headers

3. **Upload files**
   - Upload `dist` folder contents to web server
   - Ensure `sw.js` and `manifest.json` are accessible

## PWA Features Guide

### Installation

- **Chrome/Edge**: Look for install button in address bar
- **Firefox**: Menu > Install
- **Safari**: Share > Add to Home Screen
- **Mobile**: Browser menu > Add to Home Screen

### Offline Usage

- App works offline after initial load
- Data syncs automatically when online
- Offline actions are queued and executed when connection is restored

### Notifications

- Grant permission when prompted
- Notifications work even when app is closed
- Customize notification settings in app

## Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # API and service integrations
├── theme/              # Material-UI theme configuration
├── utils/              # Utility functions
└── config/             # App configuration
```

### Key Files

- `src/App.jsx` - Main app component
- `src/main.jsx` - App entry point
- `vite.config.js` - Build configuration
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker

### Adding New Features

1. **New Pages**

   - Create component in `src/pages/`
   - Add route in `src/App.jsx`
   - Update navigation in `src/components/Layout.jsx`

2. **New API Endpoints**

   - Add methods to `src/services/api.js`
   - Update configuration in `src/config/index.js`

3. **New PWA Features**
   - Modify service worker in `public/sw.js`
   - Update manifest in `public/manifest.json`
   - Add PWA logic in `src/services/pwaManager.js`

## Testing

### PWA Testing

```bash
# Test PWA features
npm run test:pwa

# Analyze bundle
npm run analyze
```

### Manual Testing

1. **Installation**: Test app installation on different devices
2. **Offline**: Disconnect internet and test functionality
3. **Notifications**: Test push notifications
4. **Sync**: Test background sync when coming online

## Browser Support

### PWA Features

- **Chrome/Edge**: Full support
- **Firefox**: Most features supported
- **Safari**: Limited PWA support (iOS 11.3+)
- **Mobile Browsers**: Varies by platform

### Minimum Requirements

- Modern browser with ES6+ support
- Service Worker support
- IndexedDB support
- WebSocket support

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**

   - Ensure HTTPS in production
   - Check browser console for errors
   - Verify `sw.js` is accessible

2. **Offline Features Not Working**

   - Check IndexedDB support
   - Verify service worker is active
   - Check browser storage permissions

3. **Notifications Not Showing**

   - Grant notification permission
   - Check browser notification settings
   - Verify service worker is running

4. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Mode

Enable debug logging by setting `localStorage.setItem('debug', 'true')` in browser console.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

---

**MITO Task Manager PWA** - Built with ❤️ using React, Material-UI, and modern web technologies.
