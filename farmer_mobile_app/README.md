# AgriConnect Mobile App

A comprehensive mobile application for smart farming and agriculture management, built with React Native and Expo.

## Features

- **User Authentication**: Secure login/signup with role-based access
- **Dashboard**: Real-time farming insights and analytics
- **Field Management**: Track crops, soil health, and equipment
- **AI Chat Agent**: Get farming advice and support
- **Location Services**: Local deals and delivery optimization
- **Multi-language Support**: English, Sinhala, and Tamil
- **Cross-platform**: Works on both iOS and Android

## 📱 Screenshots

_Screenshots will be added here_

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS (NativeWind)
- **UI Components**: React Native Paper
- **Icons**: Material Icons
- **Storage**: AsyncStorage
- **Authentication**: JWT with custom backend
- **Location**: Google Places API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd agriConnect
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Google Places API Key
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Backend API URLs
BACKEND_AUTH_URL=your_backend_authentication_url
BACKEND_API_URL=your_backend_api_url
```

### 4. Configure Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API**
4. Create credentials (API Key)
5. Restrict the API key to your app bundle ID for security
6. Add the API key to your `.env` file

## 🚀 Running the Application

### Development Mode

#### 1. Start the Development Server

```bash
npm start
# or
yarn start
# or
expo start
```

#### 2. Choose Your Platform

- **Press `i`** - Open iOS Simulator
- **Press `a`** - Open Android Emulator
- **Press `w`** - Open in web browser
- **Scan QR code** - Open on physical device using Expo Go app

### Physical Device Testing

#### iOS

1. Install **Expo Go** from App Store
2. Scan the QR code with your camera
3. Open in Expo Go app

#### Android

1. Install **Expo Go** from Google Play Store
2. Open Expo Go app
3. Scan the QR code

### Emulator/Simulator Testing

#### iOS Simulator (macOS only)

```bash
npm run ios
# or
yarn ios
```

#### Android Emulator

```bash
npm run android
# or
yarn android
```

## 📱 Building for Production

### 1. Build Configuration

Update `app.json` with your app details:

```json
{
  "expo": {
    "name": "AgriConnect",
    "slug": "agriConnect_mobile_app",
    "version": "1.3.1",
    "orientation": "portrait",
    "icon": "./assets/images/applogo.png",
    "scheme": "myapp",
    "userInterfaceStyle": "light"
  }
}
```

### 2. Build Commands

#### Android APK

```bash
expo build:android
# or
eas build --platform android
```

#### iOS IPA

```bash
expo build:ios
# or
eas build --platform ios
```

## 🏗️ Project Structure

```
agriConnect/
├── app/                    # Expo Router screens
│   ├── auth/              # Authentication screens
│   ├── dashboard/         # Main app screens
│   └── _layout.tsx       # Root layout
├── assets/                # Images, fonts, icons
├── components/            # Reusable UI components
├── config/                # Configuration files
├── constants/             # App constants and images
├── hooks/                 # Custom React hooks
├── slice/                 # Redux store slices
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── tailwind.config.js     # Tailwind CSS configuration
```

## 🔐 Authentication Flow

1. **Landing Screen** → Welcome and app introduction
2. **Login Selector** → Choose between Sign In/Sign Up
3. **Authentication** → Login or registration forms
4. **Language Selection** → Choose preferred language
5. **Location Setup** → Set delivery location
6. **Dashboard** → Main application interface

## 🎨 Styling

The app uses **Tailwind CSS** through **NativeWind**:

```tsx
// Example usage
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-800">Welcome to AgriConnect</Text>
</View>
```

## 📊 State Management

Redux Toolkit is used for state management:

- **Auth Slice**: User authentication and roles
- **OTP Slice**: One-time password management
- **Snackbar Slice**: Toast notifications

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🐛 Troubleshooting

### Common Issues

#### Metro Bundler Issues

```bash
# Clear Metro cache
npx react-native start --reset-cache
# or
expo start --clear
```

#### Dependencies Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### iOS Build Issues

```bash
# Clean Xcode build
cd ios && xcodebuild clean
cd ..

# Reset iOS Simulator
xcrun simctl erase all
```

#### Android Build Issues

```bash
# Clean Android build
cd android && ./gradlew clean
cd ..

# Reset Android Emulator
adb emu kill
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- **Email**: support@agriconnect.com
- **Documentation**: [docs.agriconnect.com](https://docs.agriconnect.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/agriConnect/issues)

## 🙏 Acknowledgments

- React Native community
- Expo team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All contributors and supporters

---

**Made with ❤️ for the farming community**
