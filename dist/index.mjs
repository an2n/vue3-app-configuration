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
import { inject, ref } from "vue";
var FeatureFlagsManagerKey = Symbol(
  "FeatureFlagsManager"
);
var featureFlagsManager = (connectionString) => {
  let appConfigurationClient = null;
  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }
  const getFeatureFlag = (name, label) => {
    const isFeatureEnabled = ref(false);
    const featureDescription = ref("");
    if (!appConfigurationClient) {
      return { isFeatureEnabled, featureDescription };
    }
    try {
      appConfigurationClient.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label
      }).then((response) => {
        if (!isFeatureFlag(response)) {
          return { isFeatureEnabled, featureDescription };
        }
        const {
          value: { enabled, description = "" }
        } = parseFeatureFlag(response);
        isFeatureEnabled.value = enabled;
        featureDescription.value = description;
        return { isFeatureEnabled, featureDescription };
      });
    } catch (error) {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
    }
    return { isFeatureEnabled, featureDescription };
  };
  const getFeatureFlagAsync = (name, label) => __async(void 0, null, function* () {
    let isFeatureEnabled = false;
    let featureDescription = "";
    if (!appConfigurationClient) {
      return { isFeatureEnabled, featureDescription };
    }
    try {
      const response = yield appConfigurationClient.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label
      });
      if (!isFeatureFlag(response)) {
        return { isFeatureEnabled, featureDescription };
      }
      const {
        value: { enabled, description = "" }
      } = parseFeatureFlag(response);
      isFeatureEnabled = enabled;
      featureDescription = description;
      return { isFeatureEnabled, featureDescription };
    } catch (error) {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
      return { isFeatureEnabled, featureDescription };
    }
  });
  return { appConfigurationClient, getFeatureFlag, getFeatureFlagAsync };
};
function AppConfigurationPlugin(app, connectionString) {
  const manager = featureFlagsManager(connectionString);
  app.provide(FeatureFlagsManagerKey, manager);
  app.config.globalProperties.featureFlagsManager = manager;
}
var useFeatureFlags = () => {
  const featureFlagsManager2 = inject(
    FeatureFlagsManagerKey
  );
  if (!featureFlagsManager2) {
    throw new Error(
      "[App Configuration Plugin] FeatureFlagsManager is not provided."
    );
  }
  return featureFlagsManager2;
};
export {
  AppConfigurationPlugin,
  useFeatureFlags
};
//# sourceMappingURL=index.mjs.map