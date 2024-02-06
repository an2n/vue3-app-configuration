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
  useFeatureFlags: () => useFeatureFlags
});
module.exports = __toCommonJS(src_exports);
var import_app_configuration = require("@azure/app-configuration");
var import_vue = require("vue");
var FeatureFlagsManagerKey = Symbol(
  "FeatureFlagsManager"
);
var featureFlagsManager = (connectionString) => {
  let appConfigurationClient = null;
  if (connectionString) {
    appConfigurationClient = new import_app_configuration.AppConfigurationClient(connectionString);
  }
  const getFeatureFlag = (name, label) => {
    const isEnabled = (0, import_vue.ref)(false);
    if (!appConfigurationClient)
      return isEnabled;
    try {
      appConfigurationClient.getConfigurationSetting({
        key: `${import_app_configuration.featureFlagPrefix}${name}`,
        label
      }).then((response) => {
        if (!(0, import_app_configuration.isFeatureFlag)(response))
          return isEnabled;
        isEnabled.value = (0, import_app_configuration.parseFeatureFlag)(response).value.enabled;
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
  const getFeatureFlagAsync = (name, label) => __async(void 0, null, function* () {
    if (!appConfigurationClient)
      return false;
    try {
      const response = yield appConfigurationClient.getConfigurationSetting({
        key: `${import_app_configuration.featureFlagPrefix}${name}`,
        label
      });
      if (!(0, import_app_configuration.isFeatureFlag)(response))
        return false;
      return (0, import_app_configuration.parseFeatureFlag)(response).value.enabled;
    } catch (error) {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
      return false;
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
  const featureFlagsManager2 = (0, import_vue.inject)(
    FeatureFlagsManagerKey
  );
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
  useFeatureFlags
});
//# sourceMappingURL=index.js.map