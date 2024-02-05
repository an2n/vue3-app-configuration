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
  FeatureFlagsManagerKey: () => FeatureFlagsManagerKey
});
module.exports = __toCommonJS(src_exports);
var import_app_configuration = require("@azure/app-configuration");
var import_vue = require("vue");
var FeatureFlagsManagerKey = Symbol("FeatureFlagsManager");
var featureFlagsManager = (connectionString) => {
  let client = null;
  if (connectionString) {
    client = new import_app_configuration.AppConfigurationClient(connectionString);
  }
  const getFeatureFlag = (name, label) => __async(void 0, null, function* () {
    if (!client)
      return false;
    try {
      const response = yield client.getConfigurationSetting({
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
  const getFeatureFlagRef = (name, label) => {
    const isEnabled = (0, import_vue.ref)(false);
    if (!client)
      return isEnabled;
    try {
      client.getConfigurationSetting({
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
  return { getFeatureFlag, getFeatureFlagRef };
};
function AppConfigurationPlugin(app, connectionString) {
  app.provide(FeatureFlagsManagerKey, featureFlagsManager(connectionString));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AppConfigurationPlugin,
  FeatureFlagsManagerKey
});
//# sourceMappingURL=index.js.map