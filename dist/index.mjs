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
import { ref, inject } from "vue";
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
  const getFeatureFlagRef = (name, label) => {
    const isEnabled = ref(false);
    if (!client)
      return isEnabled;
    try {
      client.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label
      }).then((response) => {
        if (!isFeatureFlag(response))
          return isEnabled;
        isEnabled.value = parseFeatureFlag(response).value.enabled;
        return isEnabled;
      });
    } catch (error) {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
    }
    return isEnabled;
  };
  return { getFeatureFlag, getFeatureFlagRef };
};
function AppConfigurationPlugin(app, connectionString) {
  const manager = featureFlagsManager(connectionString);
  app.provide(FeatureFlagsManagerKey, manager);
  app.config.globalProperties.$featureFlags = manager;
}
var useFeatureFlags = () => {
  const featureFlagsManager2 = inject(
    FeatureFlagsManagerKey
  );
  if (!featureFlagsManager2) {
    throw new Error("FeatureFlagsManager is not provided");
  }
  return featureFlagsManager2;
};
export {
  AppConfigurationPlugin,
  FeatureFlagsManagerKey,
  useFeatureFlags
};
//# sourceMappingURL=index.mjs.map