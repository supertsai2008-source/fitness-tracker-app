# VibeCode Weight Loss Tracker - Build Guide

## Overview
This guide will help you build and upload your Expo app that has been migrated from Supabase to InstantDB.

## Prerequisites
- Node.js installed
- Expo account (free)
- EAS CLI installed locally (already done)

## Build Configuration

### App Configuration
- **App Name**: VibeCode - Weight Loss Tracker
- **Bundle ID**: com.vibecode.weighttracker
- **Version**: 1.0.0
- **InstantDB App ID**: d10db7a8-30ac-4fdb-82a1-87cc0e993acd

### Build Profiles
- **Development**: For testing with development client
- **Preview**: For internal testing (simulator builds)
- **Production**: For app store submission

## Quick Start

### 1. Login to Expo (if not already logged in)
```bash
npx eas login
```

### 2. Build the App

#### Build for All Platforms
```bash
node build-app.js
```

#### Build for iOS Only
```bash
node build-app.js ios
```

#### Build for Android Only
```bash
node build-app.js android
```

#### Build for Development
```bash
npx eas build --platform all --profile development
```

#### Build for Preview/Testing
```bash
npx eas build --platform all --profile preview
```

## Build Process

### What Happens During Build
1. **Code Compilation**: TypeScript/JavaScript code is compiled
2. **Asset Processing**: Images and assets are optimized
3. **Dependency Bundling**: All dependencies are bundled
4. **Platform-Specific Builds**: iOS and Android builds are created
5. **Upload**: Builds are uploaded to Expo servers

### Build Time
- **iOS**: ~10-15 minutes
- **Android**: ~5-10 minutes
- **Both**: ~15-25 minutes

## Build Outputs

### iOS Build
- **File**: `.ipa` file
- **Size**: ~50-100 MB
- **Installation**: TestFlight or direct installation

### Android Build
- **File**: `.apk` or `.aab` file
- **Size**: ~30-80 MB
- **Installation**: Direct APK installation or Google Play

## Post-Build Steps

### 1. Download Builds
- Visit your [Expo Dashboard](https://expo.dev)
- Go to your project
- Click on the build to download

### 2. Test the App
- Install on device/simulator
- Test all InstantDB functionality
- Verify user authentication
- Test data synchronization

### 3. Submit to App Stores

#### iOS App Store
1. Download the `.ipa` file
2. Use Xcode or Transporter to upload
3. Submit for review

#### Google Play Store
1. Download the `.aab` file
2. Upload to Google Play Console
3. Submit for review

## Troubleshooting

### Common Issues

#### Build Fails with "No bundle identifier"
- Check `app.json` configuration
- Ensure bundle identifier is unique

#### Build Fails with "Missing assets"
- Run `node build-prep.js` to create basic assets
- Check `assets/` directory exists

#### Build Fails with "EAS CLI not found"
- Run `npm install --save-dev eas-cli`
- Use `npx eas` instead of `eas`

#### Build Fails with "Not logged in"
- Run `npx eas login`
- Check your Expo account

### Build Logs
- Check build logs in Expo dashboard
- Look for specific error messages
- Common issues are usually dependency or configuration related

## Environment Variables

### Required for Production
- `EXPO_PUBLIC_INSTANTDB_APP_ID`: d10db7a8-30ac-4fdb-82a1-87cc0e993acd

### Optional
- RevenueCat API keys (if using subscriptions)
- Analytics keys (if using analytics)

## Security Notes

### InstantDB Configuration
- App ID is public and safe to include in client code
- Permissions are configured server-side
- User data is isolated by authentication

### Build Security
- No sensitive keys in client code
- All API keys are environment variables
- Builds are signed and verified

## Performance Optimization

### Build Size
- Current build size: ~50-100 MB
- Optimized assets and dependencies
- Tree-shaking enabled

### Runtime Performance
- InstantDB provides real-time sync
- Local storage for offline functionality
- Optimized React Native performance

## Support

### Build Issues
1. Check build logs in Expo dashboard
2. Verify all dependencies are installed
3. Ensure configuration files are correct

### App Issues
1. Test on multiple devices
2. Check InstantDB permissions
3. Verify authentication flow

### Documentation
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS CLI Documentation](https://docs.expo.dev/build/setup/)
- [InstantDB Documentation](https://instantdb.com/docs)

## Next Steps After Build

1. **Test Thoroughly**: Test all features on real devices
2. **Configure InstantDB**: Set up permissions and data models
3. **Submit to Stores**: Upload to App Store and Google Play
4. **Monitor**: Use analytics to monitor app performance
5. **Update**: Plan for future updates and feature additions

## Build Commands Summary

```bash
# Preparation
node build-prep.js

# Build all platforms
node build-app.js

# Build specific platform
node build-app.js ios
node build-app.js android

# Development build
npx eas build --platform all --profile development

# Preview build
npx eas build --platform all --profile preview

# Production build
npx eas build --platform all --profile production
```

Your app is now ready to build and upload! 🚀
