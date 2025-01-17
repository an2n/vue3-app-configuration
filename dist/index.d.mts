import { AppConfigurationClient } from '@azure/app-configuration';
import { App, Ref } from 'vue';

type FlagOptionsType = {
    name: string;
    label?: string;
};
type GetFeatureFlagType = (params: FlagOptionsType) => {
    isFeatureEnabled: Ref<boolean>;
    featureDescription: Ref<string>;
    featureConditions: IConditions;
};
interface IFeatureFlagsManager {
    appConfigurationClient: AppConfigurationClientType;
    getFeatureFlag: GetFeatureFlagType;
}
type AppConfigurationClientType = AppConfigurationClient | null;
interface IConditions {
    clientFilters?: {
        name: string;
        parameters?: Record<string, unknown>;
    }[];
}
declare const AppConfigurationPlugin: {
    install: (app: App, options: {
        connectionString?: string;
        cacheEnabled?: boolean;
        flagsToPrefetchOptmistic?: FlagOptionsType[];
    }) => void;
};
declare const AppConfigurationPluginAsync: {
    _installPromise: Promise<void> | null;
    install: (app: App, options: {
        connectionString?: string;
        flagsToPrefetch?: FlagOptionsType[];
    }) => void;
    isReady: () => Promise<void>;
};
declare const useFeatureFlags: () => IFeatureFlagsManager;

export { AppConfigurationPlugin, AppConfigurationPluginAsync, useFeatureFlags };
