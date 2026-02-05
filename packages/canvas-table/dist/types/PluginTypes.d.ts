import { ITablePlugin } from './TableTypes';
export interface IPluginManager {
    register(plugin: ITablePlugin): void;
    unregister(name: string): void;
    get(name: string): ITablePlugin | undefined;
    list(): string[];
    load(name: string): Promise<boolean>;
    unload(name: string): Promise<boolean>;
    isLoaded(name: string): boolean;
    getLoaded(): string[];
}
export interface IPluginContext {
    table: any;
    registerCommand(name: string, command: Function): void;
    registerEvent(event: string, handler: Function): void;
    unregisterEvent(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
    getProps(): any;
    getData(): any;
}
export interface PluginLifecycle {
    onInstall?(): void;
    onUninstall?(): void;
    onBeforeRender?(): void;
    onAfterRender?(): void;
    onDataChange?(data: any): any;
    onViewportChange?(viewport: any): void;
}
