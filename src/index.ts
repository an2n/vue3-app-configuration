import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { inject, ref, type App, type InjectionKey, type Ref } from "vue";

type TypeAppConfigurationClient = AppConfigurationClient | null;

type TypeGetFeatureFlag = (
  name: string,
  label?: string
) => {
  isFeatureEnabled: Ref<boolean>;
  featureDescription: Ref<string>;
};

type TypeGetFeatureFlagAsync = (
  name: string,
  label?: string
) => Promise<{
  isFeatureEnabled: boolean;
  featureDescription: string;
}>;

interface IFeatureFlagsManager {
  appConfigurationClient: TypeAppConfigurationClient;
  getFeatureFlag: TypeGetFeatureFlag;
  getFeatureFlagAsync: TypeGetFeatureFlagAsync;
}

const FeatureFlagsManagerKey: InjectionKey<IFeatureFlagsManager> = Symbol(
  "FeatureFlagsManager"
);

const featureFlagsManager = (
  connectionString?: string
): IFeatureFlagsManager => {
  let appConfigurationClient: TypeAppConfigurationClient = null;

  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }

  const getFeatureFlag: TypeGetFeatureFlag = (name, label) => {
    const isFeatureEnabled = ref(false);
    const featureDescription = ref("");

    if (!appConfigurationClient) {
      return { isFeatureEnabled, featureDescription };
    }
    try {
      appConfigurationClient
        .getConfigurationSetting({
          key: `${featureFlagPrefix}${name}`,
          label,
        })
        .then((response) => {
          if (!isFeatureFlag(response)) {
            return { isFeatureEnabled, featureDescription };
          }

          const {
            value: { enabled, description = "" },
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

  const getFeatureFlagAsync: TypeGetFeatureFlagAsync = async (name, label) => {
    let isFeatureEnabled = false;
    let featureDescription = "";

    if (!appConfigurationClient) {
      return { isFeatureEnabled, featureDescription };
    }
    try {
      const response = await appConfigurationClient.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label,
      });
      if (!isFeatureFlag(response)) {
        return { isFeatureEnabled, featureDescription };
      }
      const {
        value: { enabled, description = "" },
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
  };

  return { appConfigurationClient, getFeatureFlag, getFeatureFlagAsync };
};

function AppConfigurationPlugin(app: App, connectionString?: string) {
  const manager = featureFlagsManager(connectionString);
  app.provide(FeatureFlagsManagerKey, manager);
  app.config.globalProperties.featureFlagsManager = manager;
}

const useFeatureFlags = () => {
  const featureFlagsManager = inject(
    FeatureFlagsManagerKey
  ) as IFeatureFlagsManager;
  if (!featureFlagsManager) {
    throw new Error(
      "[App Configuration Plugin] FeatureFlagsManager is not provided."
    );
  }
  return featureFlagsManager;
};

export { AppConfigurationPlugin, useFeatureFlags };
