import { ITablePlugin, IPluginManager, PluginConfig } from '../types';
import { EventSystem } from './EventSystem';
export declare class PluginManager implements IPluginManager {
    private state;
    private eventSystem;
    constructor(eventSystem: EventSystem);
    /**
     * 设置表格实例
     */
    setTable(table: any): void;
    /**
     * 注册插件
     */
    register(plugin: ITablePlugin): void;
    /**
     * 注销插件
     */
    unregister(name: string): void;
    /**
     * 获取插件
     */
    get(name: string): ITablePlugin | undefined;
    /**
     * 获取所有已注册的插件名称
     */
    list(): string[];
    /**
     * 获取所有已加载的插件名称
     */
    getLoaded(): string[];
    /**
     * 检查插件是否已加载
     */
    isLoaded(name: string): boolean;
    /**
     * 加载插件
     */
    load(name: string): Promise<boolean>;
    /**
     * 卸载插件
     */
    unload(name: string): Promise<boolean>;
    /**
     * 批量加载插件
     */
    loadBatch(names: string[]): Promise<void>;
    /**
     * 批量卸载插件
     */
    unloadBatch(names: string[]): Promise<void>;
    /**
     * 重新加载插件
     */
    reload(name: string): Promise<boolean>;
    /**
     * 重新加载所有插件
     */
    reloadAll(): Promise<void>;
    /**
     * 获取插件状态
     */
    getStatus(): {
        [key: string]: 'registered' | 'loaded' | 'not-registered';
    };
    /**
     * 获取插件信息
     */
    getPluginInfo(name: string): {
        name: string;
        version: string;
        dependencies?: string[];
        loaded: boolean;
    } | null;
    /**
     * 获取所有插件信息
     */
    getAllPluginInfo(): {
        name: string;
        version: string;
        dependencies?: string[];
        loaded: boolean;
    }[];
    /**
     * 检查并安装缺失的依赖
     */
    private checkDependencies;
    /**
     * 加载插件依赖
     */
    private loadDependencies;
    /**
     * 卸载插件的所有依赖
     */
    private unloadDependencies;
    /**
     * 获取插件配置
     */
    getPluginConfig(name: string): PluginConfig | null;
    /**
     * 设置插件配置
     */
    setPluginConfig(name: string, config: PluginConfig): void;
    /**
     * 卸载所有插件
     */
    unregisterAll(): Promise<void>;
    /**
     * 检查插件循环依赖
     */
    checkCircularDependency(pluginName: string, visited?: Set<string>): boolean;
    /**
     * 验证插件依赖关系
     */
    validateDependencies(): {
        valid: boolean;
        errors: string[];
    };
}
