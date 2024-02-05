import { App, InjectionKey } from 'vue';

interface FeatureFlagsManager {
    getFeaturedFlag(name: string, label?: string): Promise<boolean>;
}
declare const _default: {
    install(app: App, connectionString: string): void;
    FeatureFlagsManagerKey: InjectionKey<FeatureFlagsManager>;
};

export { _default as default };
