const { withAndroidManifest, withGradleProperties } = require('expo/config-plugins');

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
    return config;
  });

  // Configure Android manifest for edge-to-edge
  config = withAndroidManifest(config, (config) => {
    const { manifest } = config.modResults;
    
    // Ensure application supports edge-to-edge
    if (manifest.application && manifest.application[0]) {
      const application = manifest.application[0];
      
      // Add theme configuration for edge-to-edge
      if (!application.$) {
        application.$ = {};
      }
      
      // Set theme to support edge-to-edge
      application.$['android:theme'] = '@style/Theme.App';
    }
    
    return config;
  });

  return config;
}

module.exports = withAndroid15Config;