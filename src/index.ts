import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { inject, ref, type App, type InjectionKey, type Ref } from "vue";

type FlagOptionsType = {
  name: string;
  label?: string;
};

type GetFeatureFlagType = (params: FlagOptionsType) => {
  isFeatureEnabled: Ref<boolean>;
  featureDescription: Ref<string>;
};

interface IFeatureFlagsManager {
  appConfigurationClient: AppConfigurationClientType;
  getFeatureFlag: GetFeatureFlagType;
}

type AppConfigurationClientType = AppConfigurationClient | null;

const FeatureFlagsManagerKey: InjectionKey<IFeatureFlagsManager> = Symbol(
  "FeatureFlagsManager"
);

interface IFeatureFlagCache {
  [key: string]: {
    isFeatureEnabled: Ref<boolean>;
    featureDescription: Ref<string>;
  };
}

const featureFlagsManager = (
  connectionString?: string,
  cacheEnabled = true,
  flagsToPrefetchOptmistic: FlagOptionsType[] = []
): IFeatureFlagsManager => {
  let appConfigurationClient: AppConfigurationClientType = null;

  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }

  const cache: IFeatureFlagCache = {};

  function prefetchFeatureFlagsOptimistic(flags: FlagOptionsType[]) {
    if (!appConfigurationClient) {
      return;
    }
    for (const { name, label } of flags) {
      appConfigurationClient
        .getConfigurationSetting({
          key: `${featureFlagPrefix}${name}`,
          label,
        })
        .then((response) => {
          if (isFeatureFlag(response)) {
            const {
              value: { enabled, description = "" },
            } = parseFeatureFlag(response);

            const cacheKey = `cache-${name}-${label ?? "empty-label"}`;

            cache[cacheKey] = {
              isFeatureEnabled: ref(enabled),
              featureDescription: ref(description),
            };
          }
        })
        .catch((error) => {
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

  const getFeatureFlag: GetFeatureFlagType = ({ name, label }) => {
    const cacheKey = `cache-${name}-${label ?? "empty-label"}`;

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

    appConfigurationClient
      .getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label,
      })
      .then((response) => {
        if (isFeatureFlag(response)) {
          const {
            value: { enabled, description = "" },
          } = parseFeatureFlag(response);

          isFeatureEnabled.value = enabled;
          featureDescription.value = description;

          if (cacheEnabled) {
            cache[cacheKey] = { isFeatureEnabled, featureDescription };
          }
        }
      })
      .catch((error) => {
        console.error(
          "[App Configuration Plugin] Error retrieving feature flag.",
          error
        );
      });

    return { isFeatureEnabled, featureDescription };
  };

  return { getFeatureFlag, appConfigurationClient };
};

const featureFlagsManagerAsync = async (
  connectionString?: string,
  flagsToPrefetch: FlagOptionsType[] = []
): Promise<IFeatureFlagsManager> => {
  let appConfigurationClient: AppConfigurationClientType = null;

  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }

  const cache: IFeatureFlagCache = {};

  async function prefetchFeatureFlags(flags: FlagOptionsType[]) {
    if (!appConfigurationClient) {
      return;
    }

    await Promise.all(
      flags.map(async ({ name, label }) => {
        try {
          const response =
            await appConfigurationClient!.getConfigurationSetting({
              key: `${featureFlagPrefix}${name}`,
              label,
            });

          if (isFeatureFlag(response)) {
            const {
              value: { enabled, description = "" },
            } = parseFeatureFlag(response);

            const cacheKey = `cache-${name}-${label ?? "empty-label"}`;

            cache[cacheKey] = {
              isFeatureEnabled: ref(enabled),
              featureDescription: ref(description),
            };
          }
        } catch (error) {
          console.error(
            "[App Configuration Plugin] Error prefetching feature flag.",
            error
          );
        }
      })
    );
  }

  await prefetchFeatureFlags(flagsToPrefetch);

  const getFeatureFlag: GetFeatureFlagType = ({ name, label }) => {
    const cacheKey = `cache-${name}-${label ?? "empty-label"}`;

    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    cache[cacheKey] = {
      isFeatureEnabled: ref(false),
      featureDescription: ref(""),
    };

    return cache[cacheKey];
  };

  return { getFeatureFlag, appConfigurationClient };
};

const AppConfigurationPlugin = {
  install: (
    app: App,
    options: {
      connectionString?: string;
      cacheEnabled?: boolean;
      flagsToPrefetchOptmistic?: FlagOptionsType[];
    }
  ) => {
    const manager = featureFlagsManager(
      options.connectionString,
      options.cacheEnabled,
      options.flagsToPrefetchOptmistic
    );
    app.provide(FeatureFlagsManagerKey, manager);
  },
};

const AppConfigurationPluginAsync = {
  _installPromise: null as Promise<void> | null,
  install: (
    app: App,
    options: { connectionString?: string; flagsToPrefetch?: FlagOptionsType[] }
  ) => {
    AppConfigurationPluginAsync._installPromise = new Promise<void>(
      async (resolve) => {
        const manager = await featureFlagsManagerAsync(
          options.connectionString,
          options.flagsToPrefetch
        );
        app.provide(FeatureFlagsManagerKey, manager);
        resolve();
      }
    );
  },
  isReady: (): Promise<void> =>
    AppConfigurationPluginAsync._installPromise || Promise.resolve(),
};

const useFeatureFlags = () => {
  const featureFlagsManager = inject(FeatureFlagsManagerKey);
  if (!featureFlagsManager) {
    throw new Error(
      "[App Configuration Plugin] FeatureFlagsManager is not provided."
    );
  }
  return featureFlagsManager;
};

export { AppConfigurationPlugin, AppConfigurationPluginAsync, useFeatureFlags };
