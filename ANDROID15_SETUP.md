# Android 15 (API Level 35) Configuration with 16KB Memory Pages Support

This app has been configured to support Android 15 requirements, edge-to-edge display, and 16KB memory pages.

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
  - **NEW**: 16KB memory pages support configuration
  - **NEW**: ART profiles and R8 optimization enabled
  - **NEW**: Build.gradle modifications for memory optimization

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
            "minSdkVersion": 24,
            "enableProguardInReleaseBuilds": true,
            "enableHermes": true,
            "packagingOptions": {
              "pickFirst": [
                "**/libc++_shared.so",
                "**/libjsc.so"
              ]
            },
            "proguardFiles": [
              "proguard-android-optimize.txt",
              "proguard-rules.pro"
            ]
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
5. **16KB Memory Pages Support**: 
   - Optimized memory allocation for Android 15 devices
   - ART profiles enabled for better performance
   - R8 optimization for reduced app size
   - Proper JNI library packaging
6. **Enhanced Build Configuration**:
   - Hermes JavaScript engine enabled
   - ProGuard optimization in release builds
   - Java 17 compatibility

## Testing

- Test on Android 15 devices or emulators
- Verify edge-to-edge display works correctly
- Check that content doesn't overlap with system bars
- Ensure tab bar positioning is correct with different navigation modes

## Dependencies Added

- `expo-build-properties`: For build configuration and 16KB pages support
- `react-native-edge-to-edge`: For enhanced edge-to-edge support (optional)

## 16KB Memory Pages Support Details

Android 15 introduces support for devices with 16KB memory pages (instead of the traditional 4KB). This configuration ensures your app works optimally on these devices:

### Gradle Properties Added:
- `android.experimental.enableArtProfiles=true`: Enables ART profiles for better performance
- `android.experimental.r8.dex-startup-optimization=true`: Optimizes app startup time

### Manifest Configuration:
- `android:supports_16kb_pages=true`: Declares support for 16KB memory pages
- `android:largeHeap=true`: Allows larger heap allocation when needed
- `android:hardwareAccelerated=true`: Enables hardware acceleration

### Build Configuration:
- Java 17 compatibility for better performance
- Optimized JNI library packaging
- ProGuard optimization enabled for release builds

## Notes

- Expo SDK 53 has edge-to-edge enabled by default for new projects
- The app uses proper safe area insets to handle different device configurations
- System UI is configured to be transparent for immersive experience
- 16KB memory pages support is backward compatible with 4KB page devices
- The configuration automatically optimizes for both memory page sizes

## Troubleshooting 16KB Pages Issues

If you encounter crashes related to memory allocation:

1. **Check native modules**: Ensure all native dependencies support 16KB pages
2. **Verify JNI libraries**: Make sure all .so files are properly packaged
3. **Test on different devices**: Test on both 4KB and 16KB page devices
4. **Monitor memory usage**: Use Android Studio profiler to check memory allocation patterns

## Performance Benefits

With 16KB memory pages support enabled:
- Reduced memory fragmentation
- Better cache locality
- Improved app startup times
- More efficient memory allocation for large objects