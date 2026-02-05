export interface IEventSystem {
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
    once(event: string, handler: Function): void;
    remove(event: string): void;
    removeAll(): void;
    has(event: string): boolean;
    getListeners(event: string): Function[];
    count(): number;
}
export interface IEventContext {
    preventDefault(): void;
    stopPropagation(): void;
    target: any;
    currentTarget: any;
    data?: any;
}
export interface IEventListener {
    handler: Function;
    once: boolean;
    priority: number;
}
export interface EventMap {
    [key: string]: IEventListener[];
}
export interface IEventHandler {
    (event: EventMap[string], context: IEventContext): void;
}
