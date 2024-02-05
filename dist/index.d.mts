import { InjectionKey, App } from 'vue';

type GetFeatureFlagFunction = (name: string, label?: string) => Promise<boolean>;
declare const FeatureFlagsManagerKey: InjectionKey<{
    getFeatureFlag: GetFeatureFlagFunction;
}>;
declare function AppConfigurationPlugin(app: App, connectionString?: string): void;

export { AppConfigurationPlugin, FeatureFlagsManagerKey };
