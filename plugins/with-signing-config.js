/* eslint-disable no-undef */
const {withAppBuildGradle} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withSigningConfig(config) {   
  return withAppBuildGradle(config, config => {
    config.modResults.contents = config.modResults.contents.replace(
      /signingConfigs\s*{[\s\S]*?buildTypes/,
      `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('KEYSTORE_PATH')) {
                storeFile file(KEYSTORE_PATH)
                storePassword KEYSTORE_PASSWORD
                keyAlias KEY_ALIAS
                keyPassword KEY_PASSWORD
            }
        }
    }
    buildTypes`,
    );
    config.modResults.contents = config.modResults.contents.replace(
      /buildTypes\s*{[\s\S]*?packagingOptions/,
      `buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
        }
    }
    packagingOptions`,
    );

    const source = path.resolve(__dirname, '../sherpa.keystore');
    const target = path.resolve(__dirname, '../android/app/sherpa.keystore');

    if (!fs.existsSync(target)) {
      console.log('Copying sherpa.keystore to android/app/');
      fs.copyFileSync(source, target);
    }

    return config;
  });
};
