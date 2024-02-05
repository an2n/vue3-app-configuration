# vue3-app-configuration

Vue 3 plugin that provides an easy way to manage feature flags in your Vue application using Azure App Configuration. This plugin allows you to use feature flags and toggling in different environments.

## Installation

```
npm install vue3-app-configuration
```

## Get started

To use vue3-app-configuration, you need to initialize it in your main Vue application file, typically main.ts or main.js.

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { AppConfigurationPlugin } from "vue3-app-configuration";

const app = createApp(App);

app.use(
  AppConfigurationPlugin,
  "your-azure-configuration-readonly-connection-string"
);

app.mount("#app");
```

Replace 'your-azure-configuration-readonly-connection-string' with your actual connection string.

## Using in Vue Components

You can use the `vue3-app-configuration` plugin in your Vue components in two ways: using a non-reactive method for a one-time check or a reactive method for ongoing checks and shorter code.

### Non-Reactive Usage

For a one-time check of the feature flag, you can use the `getFeatureFlag` method. This is useful when you need to check the feature flag status once, such as on component mount.

```html
<script setup lang="ts">
  import { inject, onMounted } from "vue";
  import { FeatureFlagsManagerKey } from "vue3-app-configuration";

  const isFeatureEnabled = ref(false);
  const featureFlagsManager = inject(FeatureFlagsManagerKey);

  onMounted(async () => {
    if (featureFlagsManager) {
      isFeatureEnabled.value = await getFeatureFlag(
        "your-feature-flag-name",
        "your-label"
      );
    }
  });
</script>

<template>
  <p v-if="isFeatureEnabled">This feature is enabled!</p>
  <p v-else>This feature is disabled.</p>
</template>
```

### Reactive Usage

For ongoing checks where you want the component to reactively update based on the feature flag status, use the getFeatureFlagReactive method. This returns a Vue ref and features a shorter code snippet.

```html
<script setup lang="ts">
  import { inject } from "vue";
  import { FeatureFlagsManagerKey } from "vue3-app-configuration";

  const featureFlagsManager = inject(FeatureFlagsManagerKey);

  const isFeatureEnabled = featureFlagsManager
    ? featureFlagsManager.getFeatureFlagReactive(
        "your-feature-flag-name",
        "your-label"
      )
    : ref(false);
</script>

<template>
  <p v-if="isFeatureEnabled">This feature is enabled!</p>
  <p v-else>This feature is disabled.</p>
</template>
```

Inspired by
[@azure/app-configuration](https://www.npmjs.com/package/@azure/app-configuration),
[vue3-application-insights](https://www.npmjs.com/package/vue3-application-insights)
and [Feature Flags in Vue with Azure App
Configuration](https://www.tvaidyan.com/2022/07/14/feature-flags-in-vue-with-azure-app-configuration)
