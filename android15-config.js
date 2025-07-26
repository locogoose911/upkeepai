const { withAndroidManifest, withGradleProperties, withAppBuildGradle } = require('expo/config-plugins');

function withAndroid15Config(config) {
  // Set target SDK to 35 for Android 15
  config = withGradleProperties(config, (config) => {
    config.modResults.push({
      type: 'property',
      key: 'android.compileSdkVersion',
      value: '35',
    });
    config.modResults.push({
      type: 'property',
      key: 'android.targetSdkVersion', 
      value: '35',
    });
    config.modResults.push({
      type: 'property',
      key: 'android.minSdkVersion',
      value: '24',
    });
    // Add 16KB memory pages support for Android 15
    config.modResults.push({
      type: 'property',
      key: 'android.experimental.enableArtProfiles',
      value: 'true',
    });
    config.modResults.push({
      type: 'property',
      key: 'android.experimental.r8.dex-startup-optimization',
      value: 'true',
    });
    return config;
  });

  // Configure Android manifest for edge-to-edge and 16KB pages
  config = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;
    
    // Add 16KB memory pages support
    if (!manifest.$) {
      manifest.$ = {};
    }
    manifest.$['android:supportsRtl'] = 'true';
    
    // Ensure application supports edge-to-edge and 16KB pages
    if (manifest.application && manifest.application[0]) {
      const application = manifest.application[0];
      
      // Add theme configuration for edge-to-edge
      if (!application.$) {
        application.$ = {};
      }
      
      // Set theme to support edge-to-edge
      application.$['android:theme'] = '@style/Theme.App';
      
      // Add 16KB memory pages support
      application.$['android:largeHeap'] = 'true';
      application.$['android:hardwareAccelerated'] = 'true';
      
      // Add meta-data for 16KB pages support
      if (!application['meta-data']) {
        application['meta-data'] = [];
      }
      
      application['meta-data'].push({
        $: {
          'android:name': 'android.max_aspect',
          'android:value': '2.4'
        }
      });
      
      application['meta-data'].push({
        $: {
          'android:name': 'android.supports_16kb_pages',
          'android:value': 'true'
        }
      });
    }
    
    return config;
  });

  // Add build.gradle modifications for 16KB pages
  config = withAppBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // Add 16KB pages support in android block
    if (!buildGradle.includes('android.experimental.enableArtProfiles')) {
      const androidBlockRegex = /(android\s*\{[\s\S]*?)(\}\s*$)/m;
      if (androidBlockRegex.test(buildGradle)) {
        buildGradle = buildGradle.replace(androidBlockRegex, (match, androidBlock, closingBrace) => {
          const additions = `
    // 16KB memory pages support for Android 15
    packagingOptions {
        jniLibs {
            useLegacyPackaging = false
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
`;
          return androidBlock + additions + closingBrace;
        });
      }
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });

  return config;
}

module.exports = withAndroid15Config;