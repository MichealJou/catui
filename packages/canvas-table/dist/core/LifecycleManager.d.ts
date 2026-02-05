import { EventSystem } from './EventSystem';
export interface LifecycleHooks {
    onInit?: () => void;
    onMount?: () => void;
    onUpdate?: () => void;
    onRender?: () => void;
    onBeforeRender?: () => void;
    onAfterRender?: () => void;
    onResize?: () => void;
    onScroll?: () => void;
    onBeforeDestroy?: () => void;
    onDestroy?: () => void;
    onDataChange?: (data: any) => any;
    onColumnChange?: (columns: any) => any;
    onViewportChange?: (viewport: any) => any;
    onThemeChange?: (theme: any) => any;
    onEvent?: (event: string, data: any) => boolean;
    onBeforeEvent?: (event: string, data: any) => boolean;
    onAfterEvent?: (event: string, data: any) => void;
}
export declare class LifecycleManager {
    private hooks;
    private eventSystem;
    private isActive;
    private destroyed;
    constructor(eventSystem: EventSystem);
    /**
     * 注册生命周期钩子
     */
    on(event: string, handler: Function): void;
    /**
     * 移除生命周期钩子
     */
    off(event: string, handler: Function): void;
    /**
     * 触发生命周期钩子
     */
    trigger(event: string, ...args: any[]): any[];
    /**
     * 触发前置生命周期钩子
     */
    triggerBefore(event: string, ...args: any[]): boolean;
    /**
     * 触发后置生命周期钩子
     */
    triggerAfter(event: string, ...args: any[]): void;
    /**
     * 执行完整的生命周期流程
     */
    executeLifecycle(phase: string, beforeHook: string, mainHook: string, afterHook: string, ...args: any[]): Promise<boolean>;
    /**
     * 初始化生命周期
     */
    init(): void;
    /**
     * 挂载生命周期
     */
    mount(): void;
    /**
     * 更新生命周期
     */
    update(): void;
    /**
     * 渲染生命周期
     */
    render(): void;
    /**
     * 调整大小生命周期
     */
    resize(): void;
    /**
     * 滚动生命周期
     */
    scroll(): void;
    /**
     * 数据变化生命周期
     */
    dataChange(data: any): any;
    /**
     * 列变化生命周期
     */
    columnChange(columns: any): any;
    /**
     * 视口变化生命周期
     */
    viewportChange(viewport: any): any;
    /**
     * 主题变化生命周期
     */
    themeChange(theme: any): any;
    /**
     * 事件处理生命周期
     */
    handleEvent(event: string, data: any): boolean;
    /**
     * 销毁生命周期
     */
    destroy(): void;
    /**
     * 重置生命周期管理器
     */
    reset(): void;
    /**
     * 暂停生命周期
     */
    pause(): void;
    /**
     * 恢复生命周期
     */
    resume(): void;
    /**
     * 获取生命周期状态
     */
    getStatus(): {
        isActive: boolean;
        destroyed: boolean;
        hooks: {
            [key: string]: number;
        };
    };
    /**
     * 检查是否有特定钩子
     */
    hasHook(event: string): boolean;
    /**
     * 获取特定钩子的数量
     */
    getHookCount(event: string): number;
    /**
     * 获取所有钩子列表
     */
    getHookList(): string[];
    /**
     * 清理特定事件的钩子
     */
    clearHooks(event?: string): void;
    /**
     * 绑定到事件系统
     */
    bindEvents(): void;
    /**
     * 解绑事件系统
     */
    unbindEvents(): void;
}
