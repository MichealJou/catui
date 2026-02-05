import { IEventSystem, IEventListener } from '../types/EventTypes';
export declare class EventSystem implements IEventSystem {
    private events;
    private context;
    constructor();
    /**
     * 注册事件监听器
     */
    on(event: string, handler: Function): void;
    /**
     * 移除事件监听器
     */
    off(event: string, handler?: Function): void;
    /**
     * 触发事件
     */
    emit(event: string, data?: any): void;
    /**
     * 注册一次性事件监听器
     */
    once(event: string, handler: Function): void;
    /**
     * 移除指定事件的所有监听器
     */
    remove(event: string): void;
    /**
     * 移除所有事件监听器
     */
    removeAll(): void;
    /**
     * 检查是否有指定事件的监听器
     */
    has(event: string): boolean;
    /**
     * 获取指定事件的所有监听器
     */
    getListeners(event: string): Function[];
    /**
     * 获取事件监听器总数
     */
    count(): number;
    /**
     * 批量注册事件
     */
    onBatch(events: Record<string, Function>): void;
    /**
     * 批量移除事件
     */
    offBatch(events: Record<string, Function>): void;
    /**
     * 添加优先级支持
     */
    onWithPriority(event: string, handler: Function, priority?: number): void;
    /**
     * 获取事件统计信息
     */
    getStats(): {
        [key: string]: number;
    };
    /**
     * 检查是否是特定事件的监听器
     */
    hasListener(event: string, handler: Function): boolean;
    /**
     * 获取处理器信息
     */
    getListenerInfo(event: string): IEventListener[];
}
