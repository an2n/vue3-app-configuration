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

This plugin provides a non-reactive, one-time check called getFeatureFlag

```html
<script setup lang="ts">
  import { inject, onMounted } from "vue";
  import { FeatureFlagsManagerKey } from "vue3-app-configuration";

  const isFeatureEnabled = ref(false);
  const featureFlagsManager = inject(FeatureFlagsManagerKey);

  onMounted(async () => {
    if (featureFlagsManager) {
      isFeatureEnabled.value = await getFeatureFlag(
        "your-feature-flag-name', 'your-label"
      );
    }
  });
</script>

<template>
  <p v-if="isFeatureEnabled">This feature is enabled!</p>
  <p v-else>This feature is disabled.</p>
</template>
```

Inspired by [@azure/app-configuration](https://www.npmjs.com/package/@azure/app-configuration), [vue3-application-insights](https://www.npmjs.com/package/vue3-application-insights) and
[Feature Flags in Vue with Azure App Configuration](https://www.tvaidyan.com/2022/07/14/feature-flags-in-vue-with-azure-app-configuration)
