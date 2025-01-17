"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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
var src_exports = {};
__export(src_exports, {
  AppConfigurationPlugin: () => AppConfigurationPlugin,
  AppConfigurationPluginAsync: () => AppConfigurationPluginAsync,
  useFeatureFlags: () => useFeatureFlags
});
module.exports = __toCommonJS(src_exports);
var import_app_configuration = require("@azure/app-configuration");
var import_vue = require("vue");
var FeatureFlagsManagerKey = Symbol(
  "FeatureFlagsManager"
);
var featureFlagsManager = (connectionString, cacheEnabled = true, flagsToPrefetchOptmistic = []) => {
  let appConfigurationClient = null;
  if (connectionString) {
    appConfigurationClient = new import_app_configuration.AppConfigurationClient(connectionString);
  }
  const cache = {};
  function prefetchFeatureFlagsOptimistic(flags) {
    if (!appConfigurationClient) {
      return;
    }
    for (const { name, label } of flags) {
      appConfigurationClient.getConfigurationSetting({
        key: `${import_app_configuration.featureFlagPrefix}${name}`,
        label
      }).then((response) => {
        var _a;
        if ((0, import_app_configuration.isFeatureFlag)(response)) {
          const {
            value: { enabled, description = "", conditions }
          } = (0, import_app_configuration.parseFeatureFlag)(response);
          const cacheKey = `cache-${name}-${label != null ? label : "empty-label"}`;
          cache[cacheKey] = {
            isFeatureEnabled: (0, import_vue.ref)(enabled),
            featureDescription: (0, import_vue.ref)(description),
            featureConditions: (0, import_vue.reactive)({
              clientFilters: (_a = conditions.clientFilters) != null ? _a : []
            })
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
    const isFeatureEnabled = (0, import_vue.ref)(false);
    const featureDescription = (0, import_vue.ref)("");
    const featureConditions = (0, import_vue.reactive)({});
    if (!appConfigurationClient) {
      if (cacheEnabled) {
        cache[cacheKey] = { isFeatureEnabled, featureDescription, featureConditions };
      }
      return { isFeatureEnabled, featureDescription, featureConditions };
    }
    appConfigurationClient.getConfigurationSetting({
      key: `${import_app_configuration.featureFlagPrefix}${name}`,
      label
    }).then((response) => {
      if ((0, import_app_configuration.isFeatureFlag)(response)) {
        const {
          value: { enabled, description = "", conditions }
        } = (0, import_app_configuration.parseFeatureFlag)(response);
        isFeatureEnabled.value = enabled;
        featureDescription.value = description;
        Object.assign(conditions, featureConditions);
        if (cacheEnabled) {
          cache[cacheKey] = { isFeatureEnabled, featureDescription, featureConditions };
        }
      }
    }).catch((error) => {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
    });
    return { isFeatureEnabled, featureDescription, featureConditions };
  };
  return { getFeatureFlag, appConfigurationClient };
};
var featureFlagsManagerAsync = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (connectionString, flagsToPrefetch = []) {
  let appConfigurationClient = null;
  if (connectionString) {
    appConfigurationClient = new import_app_configuration.AppConfigurationClient(connectionString);
  }
  const cache = {};
  function prefetchFeatureFlags(flags) {
    return __async(this, null, function* () {
      if (!appConfigurationClient) {
        return;
      }
      yield Promise.all(
        flags.map((_02) => __async(this, [_02], function* ({ name, label }) {
          var _a;
          try {
            const response = yield appConfigurationClient.getConfigurationSetting({
              key: `${import_app_configuration.featureFlagPrefix}${name}`,
              label
            });
            if ((0, import_app_configuration.isFeatureFlag)(response)) {
              const {
                value: { enabled, description = "", conditions }
              } = (0, import_app_configuration.parseFeatureFlag)(response);
              const cacheKey = `cache-${name}-${label != null ? label : "empty-label"}`;
              cache[cacheKey] = {
                isFeatureEnabled: (0, import_vue.ref)(enabled),
                featureDescription: (0, import_vue.ref)(description),
                featureConditions: (0, import_vue.reactive)({
                  clientFilters: (_a = conditions.clientFilters) != null ? _a : []
                })
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
      isFeatureEnabled: (0, import_vue.ref)(false),
      featureDescription: (0, import_vue.ref)(""),
      featureConditions: (0, import_vue.reactive)({
        clientFilters: []
      })
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
  const featureFlagsManager2 = (0, import_vue.inject)(FeatureFlagsManagerKey);
  if (!featureFlagsManager2) {
    throw new Error(
      "[App Configuration Plugin] FeatureFlagsManager is not provided."
    );
  }
  return featureFlagsManager2;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppConfigurationPlugin,
  AppConfigurationPluginAsync,
  useFeatureFlags
});
//# sourceMappingURL=index.js.map