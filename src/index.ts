import {
  AppConfigurationClient,
  featureFlagPrefix,
  isFeatureFlag,
  parseFeatureFlag,
} from "@azure/app-configuration";
import { type App, type InjectionKey } from "vue";

type GetFeatureFlagFunction = (
  name: string,
  label?: string
) => Promise<boolean>;

interface FeatureFlagsManager {
  getFeatureFlag: GetFeatureFlagFunction;
}

const FeatureFlagsManagerKey: InjectionKey<{
  getFeatureFlag: GetFeatureFlagFunction;
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

  return { getFeatureFlag };
};

function AppConfigurationPlugin(app: App, connectionString?: string) {
  app.provide(FeatureFlagsManagerKey, featureFlagsManager(connectionString));
}

export { AppConfigurationPlugin, FeatureFlagsManagerKey };
