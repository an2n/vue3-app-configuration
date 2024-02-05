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
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_app_configuration = require("@azure/app-configuration");
var featureFlagsManager = (connectionString) => {
  let client = null;
  if (connectionString) {
    client = new import_app_configuration.AppConfigurationClient(connectionString);
  }
  return {
    getFeaturedFlag(name, label = "default") {
      return __async(this, null, function* () {
        if (!client) {
          console.warn(
            "[App Configuration Plugin] AppConfigurationClient is not initialized."
          );
          return false;
        }
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
            "[App Configuration Plugin] Error fetching feature flag.",
            error
          );
          return false;
        }
      });
    }
  };
};
var FeatureFlagsManagerKey = Symbol(
  "FeatureFlagsManager"
);
var src_default = {
  install(app, connectionString) {
    app.provide(FeatureFlagsManagerKey, featureFlagsManager(connectionString));
  },
  FeatureFlagsManagerKey
};
//# sourceMappingURL=index.js.map