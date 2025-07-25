# Android 15 (API Level 35) Configuration

This app has been configured to support Android 15 requirements and edge-to-edge display.

## Configuration Applied

### 1. App Layout Updates
- **Root Layout (`app/_layout.tsx`)**: 
  - Configured transparent status bar for Android
  - Added proper system UI configuration
  - Edge-to-edge is enabled by default in Expo SDK 53

### 2. Tab Layout Updates
- **Tab Layout (`app/(tabs)/_layout.tsx`)**:
  - Enhanced safe area handling for edge-to-edge display
  - Proper bottom insets calculation for navigation bars
  - Absolute positioning for tab bar to handle edge-to-edge

### 3. Configuration Plugin
- **Android 15 Config (`android15-config.js`)**:
  - Plugin to set target SDK to 35
  - Configures compile SDK to 35
  - Sets minimum SDK to 24
  - Adds Android manifest configuration for edge-to-edge

## Manual Configuration Required

Since `app.json` cannot be modified directly, you need to manually add the following to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      "./android15-config",
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "minSdkVersion": 24
          }
        }
      ]
    ]
  }
}
```

## Key Features for Android 15

1. **Edge-to-Edge Display**: Content flows seamlessly beneath system bars
2. **Proper Safe Area Handling**: Uses React Native Safe Area Context for proper insets
3. **Transparent System Bars**: Status bar and navigation bar are transparent
4. **Target SDK 35**: Meets Google Play Store requirements for Android 15

## Testing

- Test on Android 15 devices or emulators
- Verify edge-to-edge display works correctly
- Check that content doesn't overlap with system bars
- Ensure tab bar positioning is correct with different navigation modes

## Dependencies Added

- `expo-build-properties`: For build configuration
- `react-native-edge-to-edge`: For enhanced edge-to-edge support (optional)

## Notes

- Expo SDK 53 has edge-to-edge enabled by default for new projects
- The app uses proper safe area insets to handle different device configurations
- System UI is configured to be transparent for immersive experience