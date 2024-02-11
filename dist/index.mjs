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
var featureFlagsManager = (connectionString, cacheEnabled = true, flagsToPrefetchOptmistic = []) => {
  let appConfigurationClient = null;
  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }
  const cache = {};
  function prefetchFeatureFlagsOptimistic(flags) {
    if (!appConfigurationClient) {
      return;
    }
    for (const { name, label } of flags) {
      appConfigurationClient.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label
      }).then((response) => {
        if (isFeatureFlag(response)) {
          const {
            value: { enabled, description = "" }
          } = parseFeatureFlag(response);
          const cacheKey = `cache-${name}-${label != null ? label : "empty-label"}`;
          cache[cacheKey] = {
            isFeatureEnabled: ref(enabled),
            featureDescription: ref(description)
          };
        }
      }).catch((error) => {
        console.error(
          "[App Configuration Plugin] Error prefetching feature flag.",
          error
        );
      });
    }
  }
  if (flagsToPrefetchOptmistic.length) {
    prefetchFeatureFlagsOptimistic(flagsToPrefetchOptmistic);
  }
  const getFeatureFlag = ({ name, label }) => {
    const cacheKey = `cache-${name}-${label != null ? label : "empty-label"}`;
    if (cacheEnabled && cache[cacheKey]) {
      return cache[cacheKey];
    }
    const isFeatureEnabled = ref(false);
    const featureDescription = ref("");
    if (!appConfigurationClient) {
      if (cacheEnabled) {
        cache[cacheKey] = { isFeatureEnabled, featureDescription };
      }
      return { isFeatureEnabled, featureDescription };
    }
    appConfigurationClient.getConfigurationSetting({
      key: `${featureFlagPrefix}${name}`,
      label
    }).then((response) => {
      if (isFeatureFlag(response)) {
        const {
          value: { enabled, description = "" }
        } = parseFeatureFlag(response);
        isFeatureEnabled.value = enabled;
        featureDescription.value = description;
        if (cacheEnabled) {
          cache[cacheKey] = { isFeatureEnabled, featureDescription };
        }
      }
    }).catch((error) => {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
    });
    return { isFeatureEnabled, featureDescription };
  };
  return { getFeatureFlag, appConfigurationClient };
};
var featureFlagsManagerAsync = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (connectionString, flagsToPrefetch = []) {
  let appConfigurationClient = null;
  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }
  const cache = {};
  function prefetchFeatureFlags(flags) {
    return __async(this, null, function* () {
      if (!appConfigurationClient) {
        return;
      }
      yield Promise.all(
        flags.map((_02) => __async(this, [_02], function* ({ name, label }) {
          try {
            const response = yield appConfigurationClient.getConfigurationSetting({
              key: `${featureFlagPrefix}${name}`,
              label
            });
            if (isFeatureFlag(response)) {
              const {
                value: { enabled, description = "" }
              } = parseFeatureFlag(response);
              const cacheKey = `cache-${name}-${label != null ? label : "empty-label"}`;
              cache[cacheKey] = {
                isFeatureEnabled: ref(enabled),
                featureDescription: ref(description)
              };
            }
          } catch (error) {
            console.error(
              "[App Configuration Plugin] Error prefetching feature flag.",
              error
            );
          }
        }))
      );
    });
  }
  yield prefetchFeatureFlags(flagsToPrefetch);
  const getFeatureFlag = ({ name, label }) => {
    const cacheKey = `cache-${name}-${label != null ? label : "empty-label"}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    cache[cacheKey] = {
      isFeatureEnabled: ref(false),
      featureDescription: ref("")
    };
    return cache[cacheKey];
  };
  return { getFeatureFlag, appConfigurationClient };
});
var AppConfigurationPlugin = {
  install: (app, options) => {
    const manager = featureFlagsManager(
      options.connectionString,
      options.cacheEnabled,
      options.flagsToPrefetchOptmistic
    );
    app.provide(FeatureFlagsManagerKey, manager);
  }
};
var AppConfigurationPluginAsync = {
  _installPromise: null,
  install: (app, options) => {
    AppConfigurationPluginAsync._installPromise = new Promise(
      (resolve) => __async(void 0, null, function* () {
        const manager = yield featureFlagsManagerAsync(
          options.connectionString,
          options.flagsToPrefetch
        );
        app.provide(FeatureFlagsManagerKey, manager);
        resolve();
      })
    );
  },
  isReady: () => AppConfigurationPluginAsync._installPromise || Promise.resolve()
};
var useFeatureFlags = () => {
  const featureFlagsManager2 = inject(FeatureFlagsManagerKey);
  if (!featureFlagsManager2) {
    throw new Error(
      "[App Configuration Plugin] FeatureFlagsManager is not provided."
    );
  }
  return featureFlagsManager2;
};
export {
  AppConfigurationPlugin,
  AppConfigurationPluginAsync,
  useFeatureFlags
};
//# sourceMappingURL=index.mjs.map