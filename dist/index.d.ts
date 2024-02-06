import { AppConfigurationClient } from '@azure/app-configuration';
import { App, Ref } from 'vue';

type TypeAppConfigurationClient = AppConfigurationClient | null;
type TypeGetFeatureFlag = (name: string, label?: string) => Ref<boolean>;
type TypeGetFeatureFlagAsync = (name: string, label?: string) => Promise<boolean>;
interface IFeatureFlagsManager {
    appConfigurationClient: TypeAppConfigurationClient;
    getFeatureFlag: TypeGetFeatureFlag;
    getFeatureFlagAsync: TypeGetFeatureFlagAsync;
}
declare function AppConfigurationPlugin(app: App, connectionString?: string): void;
declare const useFeatureFlags: () => IFeatureFlagsManager;

export { AppConfigurationPlugin, useFeatureFlags };
