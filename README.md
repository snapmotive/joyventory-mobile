# Joyventory Mobile

A React Native mobile application for inventory management, built with Expo.

## Features

- Barcode scanning for quick item lookup
- Item management (add, edit, view)
- Square API integration
- Admin features for categories, item fields, and print settings
- Audit logs

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/joyventory-mobile.git
cd joyventory-mobile
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npx expo start
```

4. Run on iOS or Android
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## Project Structure

- `/src/api` - API service for backend communication
- `/src/components` - Reusable UI components
- `/src/lib` - Utilities and store management
- `/src/screens` - Application screens
- `/src/types` - TypeScript type definitions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_ENVIRONMENT=sandbox_or_production
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
