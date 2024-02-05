var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag
} from "@azure/app-configuration";
var FeatureFlagsManagerKey = Symbol("FeatureFlagsManager");
var featureFlagsManager = (connectionString) => {
  let client = null;
  if (connectionString) {
    client = new AppConfigurationClient(connectionString);
  }
  const getFeatureFlag = (name, label) => __async(void 0, null, function* () {
    if (!client)
      return false;
    try {
      const response = yield client.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label
      });
      if (!isFeatureFlag(response))
        return false;
      return parseFeatureFlag(response).value.enabled;
    } catch (error) {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
      return false;
    }
  });
  return { getFeatureFlag };
};
function AppConfigurationPlugin(app, connectionString) {
  app.provide(FeatureFlagsManagerKey, featureFlagsManager(connectionString));
}
export {
  AppConfigurationPlugin,
  FeatureFlagsManagerKey
};
//# sourceMappingURL=index.mjs.map