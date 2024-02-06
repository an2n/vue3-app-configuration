import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { inject, ref, type App, type InjectionKey, type Ref } from "vue";

type TypeAppConfigurationClient = AppConfigurationClient | null;
type TypeGetFeatureFlag = (name: string, label?: string) => Ref<boolean>;
type TypeGetFeatureFlagAsync = (
  name: string,
  label?: string
) => Promise<boolean>;

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
  let appConfigurationClient: AppConfigurationClient | null = null;

  if (connectionString) {
    appConfigurationClient = new AppConfigurationClient(connectionString);
  }

  const getFeatureFlag = (name: string, label?: string): Ref<boolean> => {
    const isEnabled = ref(false);

    if (!appConfigurationClient) return isEnabled;
    try {
      appConfigurationClient
        .getConfigurationSetting({
          key: `${featureFlagPrefix}${name}`,
          label,
        })
        .then((response) => {
          if (!isFeatureFlag(response)) return isEnabled;
          isEnabled.value = parseFeatureFlag(response).value.enabled;
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

  const getFeatureFlagAsync = async (
    name: string,
    label?: string
  ): Promise<boolean> => {
    if (!appConfigurationClient) return false;
    try {
      const response = await appConfigurationClient.getConfigurationSetting({
        key: `${featureFlagPrefix}${name}`,
        label,
      });
      if (!isFeatureFlag(response)) return false;
      return parseFeatureFlag(response).value.enabled;
    } catch (error) {
      console.error(
        "[App Configuration Plugin] Error retrieving feature flag.",
        error
      );
      return false;
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
