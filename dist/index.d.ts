import { InjectionKey, App, Ref } from 'vue';

type TypeGetFeatureFlag = (name: string, label?: string) => Promise<boolean>;
type TypeGetFeatureFlagRef = (name: string, label?: string) => Ref<boolean>;
interface IFeatureFlagsManager {
    getFeatureFlag: TypeGetFeatureFlag;
    getFeatureFlagRef: TypeGetFeatureFlagRef;
}
declare const FeatureFlagsManagerKey: InjectionKey<{
    getFeatureFlag: TypeGetFeatureFlag;
    getFeatureFlagRef: TypeGetFeatureFlagRef;
}>;
declare function AppConfigurationPlugin(app: App, connectionString?: string): void;
declare const useFeatureFlags: () => IFeatureFlagsManager;

export { AppConfigurationPlugin, FeatureFlagsManagerKey, useFeatureFlags };
