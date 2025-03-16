# Joyventory Mobile

A React Native mobile app for inventory management, built with Expo.

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac users) or Android Emulator
- For physical devices: Expo Go app installed

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/joyventory-mobile.git
cd joyventory-mobile
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Run on a device or simulator:
   - Press `i` to open in iOS Simulator
   - Press `a` to open in Android Emulator
   - Scan the QR code with Expo Go app on your physical device

## Project Structure

```
joyventory-mobile/
├── assets/              # Images, fonts, and other static assets
├── src/                 # Source code
│   ├── api/             # API services
│   ├── components/      # Reusable components
│   ├── lib/             # Utilities and store
│   ├── screens/         # Screen components
│   └── types/           # TypeScript type definitions
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
└── package.json         # Dependencies and scripts
```

## Features

- Inventory management
- Barcode scanning (using Bluetooth scanner)
- Square integration
- Item creation and editing
- Category management
- Label printing

## API Configuration

The app connects to a backend API. By default, it uses `http://localhost:3000/api` in development mode. 
You can change this in `src/api/apiService.ts` or by setting the `apiUrl` in `app.json`.

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed:
```bash
npm install
```

2. Clear the cache:
```bash
expo start -c
```

3. Make sure your backend API is running and accessible.

4. For device connection issues, make sure your device and computer are on the same network.

## License

[MIT](LICENSE)
