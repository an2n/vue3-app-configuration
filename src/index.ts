import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { ref, type App, type InjectionKey, type Ref, inject } from "vue";

type TypeGetFeatureFlag = (name: string, label?: string) => Promise<boolean>;
type TypeGetFeatureFlagRef = (name: string, label?: string) => Ref<boolean>;

interface IFeatureFlagsManager {
  getFeatureFlag: TypeGetFeatureFlag;
  getFeatureFlagRef: TypeGetFeatureFlagRef;
}

const FeatureFlagsManagerKey: InjectionKey<{
  getFeatureFlag: TypeGetFeatureFlag;
  getFeatureFlagRef: TypeGetFeatureFlagRef;
}> = Symbol("FeatureFlagsManager");

const featureFlagsManager = (
  connectionString?: string
): IFeatureFlagsManager => {
  let client: AppConfigurationClient | null = null;

  if (connectionString) {
    client = new AppConfigurationClient(connectionString);
  }

  const getFeatureFlag = async (
    name: string,
    label?: string
  ): Promise<boolean> => {
    if (!client) return false;
    try {
      const response = await client.getConfigurationSetting({
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

  const getFeatureFlagRef = (name: string, label?: string): Ref<boolean> => {
    const isEnabled = ref(false);

    if (!client) return isEnabled;
    try {
      client
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

  return { getFeatureFlag, getFeatureFlagRef };
};

function AppConfigurationPlugin(app: App, connectionString?: string) {
  const manager = featureFlagsManager(connectionString);
  app.provide(FeatureFlagsManagerKey, manager);
  app.config.globalProperties.$featureFlags = manager;
}

export const useFeatureFlags = () => {
  const featureFlagsManager = inject(
    FeatureFlagsManagerKey
  ) as IFeatureFlagsManager;
  if (!featureFlagsManager) {
    throw new Error("FeatureFlagsManager is not provided");
  }
  return featureFlagsManager;
};

export { AppConfigurationPlugin, FeatureFlagsManagerKey };
