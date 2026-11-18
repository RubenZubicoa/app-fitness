const { withAndroidManifest } = require('@expo/config-plugins');

const PORTRAIT_FEATURE = 'android.hardware.screen.portrait';

/**
 * Marca android.hardware.screen.portrait como opcional.
 * Evita que Google Play filtre tablets/PC/XR por la orientación portrait de Expo.
 */
function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = manifest['uses-feature'] ?? [];
    const list = Array.isArray(features) ? features : [features];

    const existing = list.find((item) => item?.$?.['android:name'] === PORTRAIT_FEATURE);
    if (existing) {
      existing.$['android:required'] = 'false';
    } else {
      list.push({
        $: {
          'android:name': PORTRAIT_FEATURE,
          'android:required': 'false',
        },
      });
    }

    manifest['uses-feature'] = list;
    return config;
  });
}

module.exports = withOptionalPortraitFeature;
