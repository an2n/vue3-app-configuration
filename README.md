# vue3-app-configuration

Vue 3 plugin that provides an easy way to manage feature flags in your Vue 3 application through Azure App Configuration. This plugin allows you to use feature flags and toggle between different environments.

## Installation

```
npm install vue3-app-configuration
```

## Get started

To integrate vue3-app-configuration into your application, you'll need to initialize it in your main application file, usually named main.ts or main.js. You can either fetch your feature flags before or after the app has mounted, depending on your specific requirements and preferences.

## After the app has mounted (non-blocking)

In this setup, feature flags are reactive and synchronous.

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { AppConfigurationPlugin } from "vue3-app-configuration";

const app = createApp(App);

app.use(AppConfigurationPlugin, {
  connectionString: "your-azure-configuration-readonly-connection-string",
  cacheEnabled: true, // optional, defaults to true
  flagsToPrefetchOptimistic: [{ name: "featureFlag1" }], // optional
});

app.mount("#app");
```

## Before the app has mounted (blocking)

In this setup, feature flags are also reactive, but fetched before your application mounts.

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { AppConfigurationPluginAsync } from "vue3-app-configuration";

const app = createApp(App);

app.use(AppConfigurationPluginAsync, {
  connectionString: "your-azure-configuration-readonly-connection-string",
  flagsToPrefetch: [{ name: "featureFlag1" }],
});

AppConfigurationPluginAsync.isReady().then(() => {
  app.mount("#app");
});
```

Remember to replace 'your-azure-configuration-readonly-connection-string' with your actual connection string. For help with setting up a connection string and using feature flags in Azure, check out this guide: [Feature Flags in Vue with Azure App Configuration](https://www.tvaidyan.com/2022/07/14/feature-flags-in-vue-with-azure-app-configuration).

## Vue component usage

```html
<script setup lang="ts">
  import { useFeatureFlags } from "vue3-app-configuration";

  const { getFeatureFlag } = useFeatureFlags();

  const { isFeatureEnabled, featureDescription } = getFeatureFlag({
    name: "your-feature-flag-name",
    label: "your-feature-flag-label", // optional
  });
</script>
```

## AppConfigurationClient

The AppConfigurationClient instance is exposed at `this.featureFlagsManager.appConfigurationClient`.

## Inspired by

- [@azure/app-configuration](https://www.npmjs.com/package/@azure/app-configuration)
- [vue3-application-insights](https://www.npmjs.com/package/vue3-application-insights)
- [Feature Flags in Vue with Azure App Configuration](https://www.tvaidyan.com/2022/07/14/feature-flags-in-vue-with-azure-app-configuration)
