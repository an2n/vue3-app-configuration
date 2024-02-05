import { InjectionKey, App } from 'vue';

interface FeatureFlagsManager {
    getFeatureFlag(name: string, label?: string): Promise<boolean>;
}
declare const FeatureFlagsManagerKey: InjectionKey<FeatureFlagsManager>;
declare function AppConfigurationPlugin(app: App, connectionString?: string): void;

export { AppConfigurationPlugin, FeatureFlagsManagerKey };
