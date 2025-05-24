const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

module.exports = function withGradleProperties(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const gradlePropsPath = path.join(config.modRequest.projectRoot, 'android', 'gradle.properties');

      const properties = `
KEYSTORE_PATH=${process.env.KEYSTORE_PATH}
KEY_ALIAS=${process.env.KEY_ALIAS}
KEYSTORE_PASSWORD=${process.env.KEYSTORE_PASSWORD}
KEY_PASSWORD=${process.env.KEY_PASSWORD}
`;

      // Ghi hoặc bổ sung nội dung vào file gradle.properties
      if (fs.existsSync(gradlePropsPath)) {
        const existing = fs.readFileSync(gradlePropsPath, 'utf8');
        if (!existing.includes('KEYSTORE_PATH')) {
          fs.appendFileSync(gradlePropsPath, properties);
        }
      } else {
        fs.writeFileSync(gradlePropsPath, properties);
      }

      return config;
    },
  ]);
};
