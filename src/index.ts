import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { ref, type App, type InjectionKey, type Ref } from "vue";

interface FeatureFlagsManager {
  getFeatureFlag(name: string, label?: string): Promise<boolean>;
  getFeatureFlagRef(name: string, label?: string): Ref<boolean>;
}

type GetFeatureFlagFunction = (
  name: string,
  label?: string
) => Promise<boolean>;

type GetFeatureFlagRefFunction = (name: string, label?: string) => Ref<boolean>;

const FeatureFlagsManagerKey: InjectionKey<{
  getFeatureFlag: GetFeatureFlagFunction;
  getFeatureFlagRef: GetFeatureFlagRefFunction;
}> = Symbol("FeatureFlagsManager");

const featureFlagsManager = (
  connectionString?: string
): FeatureFlagsManager => {
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

    client
      .getConfigurationSetting({ key: `${featureFlagPrefix}${name}`, label })
      .then((response) => {
        if (!isFeatureFlag(response)) return false;
        isEnabled.value = parseFeatureFlag(response).value.enabled;
      })
      .catch((error) => {
        console.error(
          "[App Configuration Plugin] Error retrieving feature flag",
          error
        );
      });

    return isEnabled;
  };

  return { getFeatureFlag, getFeatureFlagRef };
};

function AppConfigurationPlugin(app: App, connectionString?: string) {
  app.provide(FeatureFlagsManagerKey, featureFlagsManager(connectionString));
}

export { AppConfigurationPlugin, FeatureFlagsManagerKey };
