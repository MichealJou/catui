class EventSystem {
    constructor() {
        this.events = {};
        this.context = null;
        this.events = {};
    }
    /**
     * 注册事件监听器
     */
    on(event, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }
        if (!this.events[event]) {
            this.events[event] = [];
        }
        // 检查是否已存在相同的处理器
        const existingHandler = this.events[event].find(h => h.handler === handler);
        if (!existingHandler) {
            this.events[event].push({
                handler,
                once: false,
                priority: 0
            });
        }
    }
    /**
     * 移除事件监听器
     */
    off(event, handler) {
        if (!this.events[event]) {
            return;
        }
        if (handler) {
            this.events[event] = this.events[event].filter(h => h.handler !== handler);
        }
        else {
            // 如果没有提供 handler，移除所有监听器
            this.events[event] = [];
        }
        // 如果事件没有监听器了，删除事件
        if (this.events[event].length === 0) {
            delete this.events[event];
        }
    }
    /**
     * 触发事件
     */
    emit(event, data) {
        if (!this.events[event]) {
            return;
        }
        // 创建事件上下文
        const context = {
            preventDefault: () => {
                // 可以在这里添加默认行为阻止逻辑
            },
            stopPropagation: () => {
                // 可以在这里添加事件传播阻止逻辑
            },
            target: this,
            currentTarget: this,
            data
        };
        // 按优先级排序处理器
        const handlers = [...this.events[event]].sort((a, b) => b.priority - a.priority);
        // 执行处理器
        for (const listener of handlers) {
            try {
                listener.handler.call(this, { ...listener, context }, context);
                // 如果是一次性监听器，移除它
                if (listener.once) {
                    this.off(event, listener.handler);
                }
            }
            catch (error) {
                console.error(`Error in event handler for "${event}":`, error);
            }
        }
    }
    /**
     * 注册一次性事件监听器
     */
    once(event, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }
        if (!this.events[event]) {
            this.events[event] = [];
        }
        // 检查是否已存在相同的处理器
        const existingHandler = this.events[event].find(h => h.handler === handler);
        if (!existingHandler) {
            this.events[event].push({
                handler,
                once: true,
                priority: 0
            });
        }
    }
    /**
     * 移除指定事件的所有监听器
     */
    remove(event) {
        delete this.events[event];
    }
    /**
     * 移除所有事件监听器
     */
    removeAll() {
        this.events = {};
    }
    /**
     * 检查是否有指定事件的监听器
     */
    has(event) {
        return !!this.events[event] && this.events[event].length > 0;
    }
    /**
     * 获取指定事件的所有监听器
     */
    getListeners(event) {
        if (!this.events[event]) {
            return [];
        }
        return this.events[event].map(listener => listener.handler);
    }
    /**
     * 获取事件监听器总数
     */
    count() {
        let total = 0;
        for (const event in this.events) {
            total += this.events[event].length;
        }
        return total;
    }
    /**
     * 批量注册事件
     */
    onBatch(events) {
        for (const [event, handler] of Object.entries(events)) {
            this.on(event, handler);
        }
    }
    /**
     * 批量移除事件
     */
    offBatch(events) {
        for (const [event, handler] of Object.entries(events)) {
            this.off(event, handler);
        }
    }
    /**
     * 添加优先级支持
     */
    onWithPriority(event, handler, priority = 0) {
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }
        if (!this.events[event]) {
            this.events[event] = [];
        }
        // 移除相同的处理器
        this.events[event] = this.events[event].filter(h => h.handler !== handler);
        // 添加带优先级的处理器
        this.events[event].push({
            handler,
            once: false,
            priority
        });
        // 重新排序
        this.events[event].sort((a, b) => b.priority - a.priority);
    }
    /**
     * 获取事件统计信息
     */
    getStats() {
        const stats = {};
        for (const event in this.events) {
            stats[event] = this.events[event].length;
        }
        return stats;
    }
    /**
     * 检查是否是特定事件的监听器
     */
    hasListener(event, handler) {
        if (!this.events[event]) {
            return false;
        }
        return this.events[event].some(h => h.handler === handler);
    }
    /**
     * 获取处理器信息
     */
    getListenerInfo(event) {
        if (!this.events[event]) {
            return [];
        }
        return [...this.events[event]];
    }
}

class LifecycleManager {
    constructor(eventSystem) {
        this.hooks = new Map();
        this.isActive = false;
        this.destroyed = false;
        this.eventSystem = eventSystem;
        this.isActive = true;
    }
    /**
     * 注册生命周期钩子
     */
    on(event, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Lifecycle hook must be a function');
        }
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(handler);
    }
    /**
     * 移除生命周期钩子
     */
    off(event, handler) {
        if (!this.hooks.has(event)) {
            return;
        }
        const handlers = this.hooks.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
            this.hooks.delete(event);
        }
    }
    /**
     * 触发生命周期钩子
     */
    trigger(event, ...args) {
        if (!this.isActive || this.destroyed) {
            return [];
        }
        const handlers = this.hooks.get(event);
        if (!handlers || handlers.length === 0) {
            return [];
        }
        const results = [];
        for (const handler of handlers) {
            try {
                const result = handler(...args);
                results.push(result);
                // 如果返回 false，可以阻止后续处理
                if (result === false) {
                    break;
                }
            }
            catch (error) {
                console.error(`Error in lifecycle hook "${event}":`, error);
            }
        }
        return results;
    }
    /**
     * 触发前置生命周期钩子
     */
    triggerBefore(event, ...args) {
        const results = this.trigger(event, ...args);
        return !results.some(result => result === false);
    }
    /**
     * 触发后置生命周期钩子
     */
    triggerAfter(event, ...args) {
        this.trigger(event, ...args);
    }
    /**
     * 执行完整的生命周期流程
     */
    async executeLifecycle(phase, beforeHook, mainHook, afterHook, ...args) {
        try {
            // 执行前置钩子
            const canContinue = this.triggerBefore(beforeHook, ...args);
            if (!canContinue) {
                return false;
            }
            // 执行主要逻辑
            this.trigger(mainHook, ...args);
            // 执行后置钩子
            this.triggerAfter(afterHook, ...args);
            return true;
        }
        catch (error) {
            console.error(`Error executing lifecycle phase "${phase}":`, error);
            return false;
        }
    }
    /**
     * 初始化生命周期
     */
    init() {
        if (this.destroyed) {
            throw new Error('Lifecycle manager has been destroyed');
        }
        this.trigger('init');
    }
    /**
     * 挂载生命周期
     */
    mount() {
        if (this.destroyed) {
            throw new Error('Lifecycle manager has been destroyed');
        }
        this.isActive = true;
        this.trigger('mount');
    }
    /**
     * 更新生命周期
     */
    update() {
        if (!this.isActive || this.destroyed) {
            return;
        }
        this.trigger('update');
    }
    /**
     * 渲染生命周期
     */
    render() {
        if (!this.isActive || this.destroyed) {
            return;
        }
        this.trigger('beforeRender');
        this.trigger('render');
        this.trigger('afterRender');
    }
    /**
     * 调整大小生命周期
     */
    resize() {
        if (!this.isActive || this.destroyed) {
            return;
        }
        this.trigger('resize');
    }
    /**
     * 滚动生命周期
     */
    scroll() {
        if (!this.isActive || this.destroyed) {
            return;
        }
        this.trigger('scroll');
    }
    /**
     * 数据变化生命周期
     */
    dataChange(data) {
        if (!this.isActive || this.destroyed) {
            return data;
        }
        const results = this.trigger('dataChange', data);
        return results.length > 0 ? results[results.length - 1] : data;
    }
    /**
     * 列变化生命周期
     */
    columnChange(columns) {
        if (!this.isActive || this.destroyed) {
            return columns;
        }
        const results = this.trigger('columnChange', columns);
        return results.length > 0 ? results[results.length - 1] : columns;
    }
    /**
     * 视口变化生命周期
     */
    viewportChange(viewport) {
        if (!this.isActive || this.destroyed) {
            return viewport;
        }
        const results = this.trigger('viewportChange', viewport);
        return results.length > 0 ? results[results.length - 1] : viewport;
    }
    /**
     * 主题变化生命周期
     */
    themeChange(theme) {
        if (!this.isActive || this.destroyed) {
            return theme;
        }
        const results = this.trigger('themeChange', theme);
        return results.length > 0 ? results[results.length - 1] : theme;
    }
    /**
     * 事件处理生命周期
     */
    handleEvent(event, data) {
        if (!this.isActive || this.destroyed) {
            return true;
        }
        // 执行前置事件钩子
        const beforeResult = this.trigger('beforeEvent', event, data);
        if (beforeResult.some(result => result === false)) {
            return false;
        }
        // 执行主要事件处理
        this.trigger('event', event, data);
        // 执行后置事件钩子
        this.trigger('afterEvent', event, data);
        return true;
    }
    /**
     * 销毁生命周期
     */
    destroy() {
        if (this.destroyed) {
            return;
        }
        this.isActive = false;
        this.trigger('beforeDestroy');
        this.trigger('destroy');
        // 清理所有钩子
        this.hooks.clear();
        this.destroyed = true;
        console.log('Lifecycle manager destroyed');
    }
    /**
     * 重置生命周期管理器
     */
    reset() {
        if (this.destroyed) {
            throw new Error('Cannot reset destroyed lifecycle manager');
        }
        this.isActive = true;
        this.hooks.clear();
        this.init();
    }
    /**
     * 暂停生命周期
     */
    pause() {
        this.isActive = false;
        this.trigger('pause');
    }
    /**
     * 恢复生命周期
     */
    resume() {
        this.isActive = true;
        this.trigger('resume');
    }
    /**
     * 获取生命周期状态
     */
    getStatus() {
        const hooksStatus = {};
        for (const [event, handlers] of this.hooks) {
            hooksStatus[event] = handlers.length;
        }
        return {
            isActive: this.isActive,
            destroyed: this.destroyed,
            hooks: hooksStatus
        };
    }
    /**
     * 检查是否有特定钩子
     */
    hasHook(event) {
        return this.hooks.has(event) && this.hooks.get(event).length > 0;
    }
    /**
     * 获取特定钩子的数量
     */
    getHookCount(event) {
        return this.hooks.get(event)?.length || 0;
    }
    /**
     * 获取所有钩子列表
     */
    getHookList() {
        return Array.from(this.hooks.keys());
    }
    /**
     * 清理特定事件的钩子
     */
    clearHooks(event) {
        if (event) {
            this.hooks.delete(event);
        }
        else {
            this.hooks.clear();
        }
    }
    /**
     * 绑定到事件系统
     */
    bindEvents() {
        this.eventSystem.on('init', () => this.init());
        this.eventSystem.on('mount', () => this.mount());
        this.eventSystem.on('update', () => this.update());
        this.eventSystem.on('render', () => this.render());
        this.eventSystem.on('resize', () => this.resize());
        this.eventSystem.on('scroll', () => this.scroll());
        this.eventSystem.on('destroy', () => this.destroy());
    }
    /**
     * 解绑事件系统
     */
    unbindEvents() {
        this.eventSystem.off('init');
        this.eventSystem.off('mount');
        this.eventSystem.off('update');
        this.eventSystem.off('render');
        this.eventSystem.off('resize');
        this.eventSystem.off('scroll');
        this.eventSystem.off('destroy');
    }
}

class PluginManager {
    constructor(eventSystem) {
        this.state = {
            plugins: new Map(),
            loaded: new Set(),
            table: null
        };
        this.eventSystem = eventSystem;
    }
    /**
     * 设置表格实例
     */
    setTable(table) {
        this.state.table = table;
    }
    /**
     * 注册插件
     */
    register(plugin) {
        if (this.state.plugins.has(plugin.name)) {
            console.warn(`Plugin "${plugin.name}" is already registered`);
            return;
        }
        // 检查依赖
        this.checkDependencies(plugin);
        // 注册到插件管理器
        this.state.plugins.set(plugin.name, plugin);
        console.log(`Plugin "${plugin.name}" registered successfully`);
    }
    /**
     * 注销插件
     */
    unregister(name) {
        if (!this.state.plugins.has(name)) {
            console.warn(`Plugin "${name}" is not registered`);
            return;
        }
        // 如果插件已加载，先卸载
        if (this.state.loaded.has(name)) {
            this.unload(name);
        }
        // 从插件管理器中移除
        this.state.plugins.delete(name);
        console.log(`Plugin "${name}" unregistered successfully`);
    }
    /**
     * 获取插件
     */
    get(name) {
        return this.state.plugins.get(name);
    }
    /**
     * 获取所有已注册的插件名称
     */
    list() {
        return Array.from(this.state.plugins.keys());
    }
    /**
     * 获取所有已加载的插件名称
     */
    getLoaded() {
        return Array.from(this.state.loaded);
    }
    /**
     * 检查插件是否已加载
     */
    isLoaded(name) {
        return this.state.loaded.has(name);
    }
    /**
     * 加载插件
     */
    async load(name) {
        if (!this.state.plugins.has(name)) {
            console.error(`Plugin "${name}" is not registered`);
            return false;
        }
        if (this.state.loaded.has(name)) {
            console.warn(`Plugin "${name}" is already loaded`);
            return true;
        }
        const plugin = this.state.plugins.get(name);
        try {
            // 加载依赖
            await this.loadDependencies(plugin);
            // 安装插件
            plugin.install(this.state.table);
            // 标记为已加载
            this.state.loaded.add(name);
            console.log(`Plugin "${name}" loaded successfully`);
            return true;
        }
        catch (error) {
            console.error(`Failed to load plugin "${name}":`, error);
            return false;
        }
    }
    /**
     * 卸载插件
     */
    async unload(name) {
        if (!this.state.plugins.has(name)) {
            console.error(`Plugin "${name}" is not registered`);
            return false;
        }
        if (!this.state.loaded.has(name)) {
            console.warn(`Plugin "${name}" is not loaded`);
            return true;
        }
        const plugin = this.state.plugins.get(name);
        try {
            // 卸载插件
            plugin.uninstall(this.state.table);
            // 标记为未加载
            this.state.loaded.delete(name);
            console.log(`Plugin "${name}" unloaded successfully`);
            return true;
        }
        catch (error) {
            console.error(`Failed to unload plugin "${name}":`, error);
            return false;
        }
    }
    /**
     * 批量加载插件
     */
    async loadBatch(names) {
        const promises = names.map(name => this.load(name));
        await Promise.allSettled(promises);
    }
    /**
     * 批量卸载插件
     */
    async unloadBatch(names) {
        const promises = names.map(name => this.unload(name));
        await Promise.allSettled(promises);
    }
    /**
     * 重新加载插件
     */
    async reload(name) {
        if (this.state.loaded.has(name)) {
            await this.unload(name);
        }
        return await this.load(name);
    }
    /**
     * 重新加载所有插件
     */
    async reloadAll() {
        const loadedPlugins = Array.from(this.state.loaded);
        await this.unloadBatch(loadedPlugins);
        await this.loadBatch(loadedPlugins);
    }
    /**
     * 获取插件状态
     */
    getStatus() {
        const status = {};
        for (const [name] of this.state.plugins) {
            if (this.state.loaded.has(name)) {
                status[name] = 'loaded';
            }
            else {
                status[name] = 'registered';
            }
        }
        return status;
    }
    /**
     * 获取插件信息
     */
    getPluginInfo(name) {
        const plugin = this.state.plugins.get(name);
        if (!plugin) {
            return null;
        }
        return {
            name: plugin.name,
            version: plugin.version,
            dependencies: plugin.dependencies,
            loaded: this.state.loaded.has(name)
        };
    }
    /**
     * 获取所有插件信息
     */
    getAllPluginInfo() {
        const info = [];
        for (const [name, plugin] of this.state.plugins) {
            info.push({
                name: plugin.name,
                version: plugin.version,
                dependencies: plugin.dependencies,
                loaded: this.state.loaded.has(name)
            });
        }
        return info;
    }
    /**
     * 检查并安装缺失的依赖
     */
    checkDependencies(plugin) {
        if (!plugin.dependencies || plugin.dependencies.length === 0) {
            return;
        }
        const missingDependencies = plugin.dependencies.filter(dep => !this.state.plugins.has(dep));
        if (missingDependencies.length > 0) {
            throw new Error(`Plugin "${plugin.name}" depends on missing plugins: ${missingDependencies.join(', ')}`);
        }
    }
    /**
     * 加载插件依赖
     */
    async loadDependencies(plugin) {
        if (!plugin.dependencies || plugin.dependencies.length === 0) {
            return;
        }
        const loadPromises = plugin.dependencies.map(dep => this.load(dep).catch(error => {
            console.error(`Failed to load dependency "${dep}" for plugin "${plugin.name}":`, error);
            throw error;
        }));
        await Promise.all(loadPromises);
    }
    /**
     * 卸载插件的所有依赖
     */
    async unloadDependencies(plugin) {
        if (!plugin.dependencies || plugin.dependencies.length === 0) {
            return;
        }
        // 注意：这里可能需要更复杂的依赖关系处理
        // 简单实现：卸载所有依赖
        const unloadPromises = plugin.dependencies.map(dep => this.unload(dep).catch(error => {
            console.error(`Failed to unload dependency "${dep}" for plugin "${plugin.name}":`, error);
        }));
        await Promise.all(unloadPromises);
    }
    /**
     * 获取插件配置
     */
    getPluginConfig(name) {
        const plugin = this.state.plugins.get(name);
        return plugin ? {} : null; // 这里将在后续实现配置管理
    }
    /**
     * 设置插件配置
     */
    setPluginConfig(name, config) {
        const plugin = this.state.plugins.get(name);
        if (!plugin) {
            console.error(`Plugin "${name}" is not registered`);
            return;
        }
        // 这里将在后续实现配置管理
        console.log(`Configuration set for plugin "${name}"`, config);
    }
    /**
     * 卸载所有插件
     */
    async unregisterAll() {
        const loadedPlugins = Array.from(this.state.loaded);
        await this.unloadBatch(loadedPlugins);
        this.state.plugins.clear();
        this.state.loaded.clear();
        console.log('All plugins unregistered');
    }
    /**
     * 检查插件循环依赖
     */
    checkCircularDependency(pluginName, visited = new Set()) {
        if (visited.has(pluginName)) {
            return true;
        }
        const plugin = this.state.plugins.get(pluginName);
        if (!plugin || !plugin.dependencies) {
            return false;
        }
        visited.add(pluginName);
        for (const dep of plugin.dependencies) {
            if (this.checkCircularDependency(dep, visited)) {
                return true;
            }
        }
        visited.delete(pluginName);
        return false;
    }
    /**
     * 验证插件依赖关系
     */
    validateDependencies() {
        const errors = [];
        for (const [name, plugin] of this.state.plugins) {
            // 检查循环依赖
            if (this.checkCircularDependency(name)) {
                errors.push(`Plugin "${name}" has circular dependency`);
                continue;
            }
            // 检查缺失依赖
            if (plugin.dependencies) {
                const missingDeps = plugin.dependencies.filter(dep => !this.state.plugins.has(dep));
                if (missingDeps.length > 0) {
                    errors.push(`Plugin "${name}" has missing dependencies: ${missingDeps.join(', ')}`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}

class CanvasRenderer {
    constructor(canvas, viewport, theme) {
        this.cellHeight = 40;
        this.cellWidth = 120;
        this.dirtyRegions = [];
        this.canvas = canvas;
        this.viewport = viewport;
        this.theme = theme;
        this.ctx = canvas.getContext('2d');
        // 设置画布尺寸
        this.resizeCanvas();
        // 设置默认样式
        this.setupDefaultStyles();
    }
    /**
     * 获取画布上下文
     */
    getContext() {
        return this.ctx;
    }
    /**
     * 渲染
     */
    render(params) {
        this.viewport = params.viewport;
        this.theme = params.theme;
        // 清除画布
        this.clear();
        // 绘制背景
        this.drawBackground(0, 0, this.viewport.width, this.viewport.height);
        // 绘制表头
        if (params.columns.length > 0) {
            this.drawHeader(params.columns);
        }
        // 绘制数据行
        this.drawRows(params.data, params.columns, params.selected);
        // 绘制选中状态
        this.drawSelections(params.selected, params.columns);
        // 绘制滚动条
        if (params.viewport.showScrollbar !== false) {
            this.drawScrollbar();
        }
    }
    /**
     * 更新渲染
     */
    update(params) {
        if (params.viewport) {
            this.viewport = params.viewport;
            this.resizeCanvas();
        }
        if (params.theme) {
            this.theme = params.theme;
        }
        // 重新渲染
        this.render(params);
    }
    /**
     * 清除画布
     */
    clear() {
        if (!this.ctx)
            return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dirtyRegions = [];
    }
    /**
     * 调整尺寸
     */
    resize(width, height) {
        this.viewport.width = width;
        this.viewport.height = height;
        this.resizeCanvas();
    }
    /**
     * 销毁渲染器
     */
    destroy() {
        this.clear();
        this.ctx = null;
        this.dirtyRegions = [];
    }
    /**
     * 设置画布尺寸
     */
    resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        // 设置画布显示尺寸
        this.canvas.width = this.viewport.width * dpr;
        this.canvas.height = this.viewport.height * dpr;
        // 设置画布样式尺寸
        this.canvas.style.width = `${this.viewport.width}px`;
        this.canvas.style.height = `${this.viewport.height}px`;
        // 缩放上下文以支持高DPI
        if (this.ctx) {
            this.ctx.scale(dpr, dpr);
        }
    }
    /**
     * 设置默认样式
     */
    setupDefaultStyles() {
        if (!this.ctx)
            return;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = '14px Arial, sans-serif';
    }
    /**
     * 绘制背景
     */
    drawBackground(x, y, width, height) {
        if (!this.ctx)
            return;
        // 保存当前状态
        this.ctx.save();
        // 设置背景样式
        this.ctx.fillStyle = this.theme.background || '#ffffff';
        this.ctx.fillRect(x, y, width, height);
        // 恢复状态
        this.ctx.restore();
    }
    /**
     * 绘制边框
     */
    drawBorder(x, y, width, height) {
        if (!this.ctx)
            return;
        // 保存当前状态
        this.ctx.save();
        // 设置边框样式
        this.ctx.strokeStyle = this.theme.border || '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        // 恢复状态
        this.ctx.restore();
    }
    /**
     * 绘制表头
     */
    drawHeader(arg1, arg2, arg3, arg4, arg5) {
        // 重载处理
        if (Array.isArray(arg1)) {
            // 绘制完整表头
            this.drawHeaderColumns(arg1);
        }
        else {
            // 绘制单个表头单元格
            this.drawHeaderCell(arg1, arg2, arg3, arg4, arg5);
        }
    }
    drawHeaderColumns(columns) {
        if (!this.ctx || columns.length === 0)
            return;
        const headerHeight = this.cellHeight;
        // 绘制表头背景
        this.ctx.fillStyle = this.theme.header || '#f5f5f5';
        this.ctx.fillRect(0, 0, this.viewport.width, headerHeight);
        // 绘制表头边框
        this.ctx.strokeStyle = this.theme.headerBorder || '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(0, 0, this.viewport.width, headerHeight);
        // 绘制表头文本
        this.ctx.fillStyle = this.theme.textPrimary || '#333333';
        this.ctx.font = 'bold 14px Arial, sans-serif';
        let x = 0;
        for (const column of columns) {
            const width = column.width || this.cellWidth;
            // 绘制表头背景
            if (column.fixed === 'left') {
                this.ctx.fillStyle = this.theme.header || '#f0f0f0';
                this.ctx.fillRect(x, 0, width, headerHeight);
            }
            // 绘制表头文本
            this.ctx.fillStyle = this.theme.textPrimary || '#333333';
            this.drawText(column.title, x + 10, headerHeight / 2, width - 20, headerHeight);
            // 绘制分隔线
            if (x < this.viewport.width - width) {
                this.ctx.strokeStyle = this.theme.headerBorder || '#e0e0e0';
                this.ctx.beginPath();
                this.ctx.moveTo(x + width, 0);
                this.ctx.lineTo(x + width, headerHeight);
                this.ctx.stroke();
            }
            x += width;
        }
    }
    drawHeaderCell(x, y, width, height, content) {
        if (!this.ctx)
            return;
        // 绘制表头背景
        this.ctx.fillStyle = this.theme.header || '#f5f5f5';
        this.ctx.fillRect(x, y, width, height);
        // 绘制表头边框
        this.drawBorder(x, y, width, height);
        // 绘制表头内容
        this.drawText(content.toString(), x + 10, y + height / 2, width - 20, height, 'center');
    }
    /**
     * 绘制数据行
     */
    drawRows(data, columns, selected) {
        if (!this.ctx || data.length === 0)
            return;
        const startY = this.cellHeight; // 从表头下方开始
        let currentY = startY;
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            const isSelected = selected.includes(row);
            const isHovered = false; // 这里需要传入悬停状态
            // 绘制行背景
            this.drawRowBackground(0, currentY, this.viewport.width, this.cellHeight, isSelected, isHovered);
            // 绘制行数据
            this.drawRowData(row, columns, currentY, rowIndex);
            currentY += this.cellHeight;
            // 如果超出视口，停止绘制
            if (currentY > this.viewport.height) {
                break;
            }
        }
    }
    /**
     * 绘制行背景
     */
    drawRowBackground(x, y, width, height, isSelected, isHovered) {
        if (!this.ctx)
            return;
        // 保存当前状态
        this.ctx.save();
        // 设置背景样式
        if (isSelected) {
            this.ctx.fillStyle = this.theme.rowSelected || '#e6f7ff';
        }
        else if (isHovered) {
            this.ctx.fillStyle = this.theme.rowHover || '#f9f9f9';
        }
        else {
            this.ctx.fillStyle = this.theme.background || '#ffffff';
        }
        this.ctx.fillRect(x, y, width, height);
        // 绘制分隔线
        this.ctx.strokeStyle = this.theme.border || '#e0e0e0';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.stroke();
        // 恢复状态
        this.ctx.restore();
    }
    /**
     * 绘制行数据
     */
    drawRowData(row, columns, y, rowIndex) {
        if (!this.ctx)
            return;
        let x = 0;
        for (const column of columns) {
            const width = column.width || this.cellWidth;
            // 绘制单元格内容
            if (column.render) {
                // 自定义渲染
                const content = column.render(row[column.key], row, column, rowIndex);
                this.drawCellContent(content, x, y, width, this.cellHeight, column);
            }
            else {
                // 默认文本渲染
                const text = row[column.key] || '';
                this.drawText(text.toString(), x + 10, y + this.cellHeight / 2, width - 20, this.cellHeight, column.align || 'left');
            }
            x += width;
        }
    }
    /**
     * 绘制单元格内容
     */
    drawCellContent(content, x, y, width, height, column) {
        if (!this.ctx)
            return;
        // 根据内容类型进行绘制
        if (typeof content === 'string') {
            this.drawText(content, x + 10, y + height / 2, width - 20, height, column.align || 'left');
        }
        else if (typeof content === 'number') {
            this.drawText(content.toString(), x + 10, y + height / 2, width - 20, height, column.align || 'right');
        }
        else if (content instanceof HTMLElement) {
            // 如果是HTML元素，需要特殊处理
            // 这里简化为文本渲染
            const text = content.textContent || '';
            this.drawText(text, x + 10, y + height / 2, width - 20, height, column.align || 'left');
        }
    }
    /**
     * 绘制文本
     */
    drawText(text, x, y, maxWidth, height, align = 'left') {
        if (!this.ctx)
            return;
        // 保存当前状态
        this.ctx.save();
        // 设置文本样式
        this.ctx.fillStyle = this.theme.textPrimary || '#333333';
        this.ctx.font = '14px Arial, sans-serif';
        // 处理文本对齐
        if (align === 'center') {
            this.ctx.textAlign = 'center';
            x = x + maxWidth / 2;
        }
        else if (align === 'right') {
            this.ctx.textAlign = 'right';
            x = x + maxWidth;
        }
        else {
            this.ctx.textAlign = 'left';
        }
        // 文本换行处理
        this.wrapText(text, x, y, maxWidth, height);
        // 恢复状态
        this.ctx.restore();
    }
    /**
     * 文本换行处理
     */
    wrapText(text, x, y, maxWidth, maxHeight) {
        if (!this.ctx)
            return;
        const words = text.split(' ');
        let line = '';
        let lineY = y - maxHeight / 2 + 14; // 从顶部开始
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && i > 0) {
                this.ctx.fillText(line, x, lineY);
                line = words[i] + ' ';
                lineY += 20; // 行高
            }
            else {
                line = testLine;
            }
        }
        this.ctx.fillText(line, x, lineY);
    }
    /**
     * 绘制选择状态
     */
    drawSelections(selected, columns) {
        if (!this.ctx || selected.length === 0)
            return;
        const startY = this.cellHeight;
        let currentY = startY;
        for (const row of selected) {
            // 找到行索引
            const rowIndex = this.findRowIndex(row);
            if (rowIndex === -1)
                continue;
            // 绘制选择框
            this.drawSelection(0, currentY, this.viewport.width, this.cellHeight);
            currentY += this.cellHeight;
        }
    }
    /**
     * 绘制单个选择框
     */
    drawSelection(x, y, width, height) {
        if (!this.ctx)
            return;
        // 保存当前状态
        this.ctx.save();
        // 设置选择样式
        this.ctx.fillStyle = this.theme.rowSelected || '#e6f7ff';
        this.ctx.fillRect(x, y, width, height);
        // 设置边框样式
        this.ctx.strokeStyle = this.theme.rowSelected || '#1890ff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);
        // 恢复状态
        this.ctx.restore();
    }
    /**
     * 绘制滚动条
     */
    drawScrollbar() {
        if (!this.ctx)
            return;
        const scrollbarWidth = 10;
        const scrollbarHeight = 100;
        const scrollbarX = this.viewport.width - scrollbarWidth;
        const scrollbarY = this.viewport.height - scrollbarHeight;
        // 绘制滚动条背景
        this.ctx.fillStyle = this.theme.scrollbarBg || '#f0f0f0';
        this.ctx.fillRect(scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
        // 绘制滚动条滑块
        this.ctx.fillStyle = this.theme.scrollbarThumb || '#c0c0c0';
        this.ctx.fillRect(scrollbarX + 2, scrollbarY + 10, scrollbarWidth - 4, 20);
    }
    /**
     * 绘制单元格
     */
    drawCell(x, y, width, height, content) {
        if (!this.ctx)
            return;
        // 绘制单元格背景
        this.drawBackground(x, y, width, height);
        // 绘制单元格边框
        this.drawBorder(x, y, width, height);
        // 绘制单元格内容
        this.drawCellContent(content, x, y, width, height, {});
    }
    /**
     * 添加脏区域
     */
    addDirtyRegion(x, y, width, height) {
        this.dirtyRegions.push({ x, y, width, height });
    }
    /**
     * 渲染脏区域
     */
    renderDirtyRegions() {
        for (const region of this.dirtyRegions) {
            // 重新渲染脏区域
            this.renderRegion(region.x, region.y, region.width, region.height);
        }
        this.dirtyRegions = [];
    }
    /**
     * 渲染指定区域
     */
    renderRegion(x, y, width, height) {
        // 这里需要根据具体的数据重新渲染指定区域
        // 简化实现，清除区域并重新绘制
        if (this.ctx) {
            this.ctx.clearRect(x, y, width, height);
        }
    }
    /**
     * 查找行索引
     */
    findRowIndex(row) {
        // 这里需要根据实际的数据结构查找行索引
        // 简化实现，返回 -1
        return -1;
    }
    /**
     * 设置单元格高度
     */
    setCellHeight(height) {
        this.cellHeight = height;
    }
    /**
     * 设置单元格宽度
     */
    setCellWidth(width) {
        this.cellWidth = width;
    }
    /**
     * 获取脏区域数量
     */
    getDirtyRegionCount() {
        return this.dirtyRegions.length;
    }
    /**
     * 清除脏区域
     */
    clearDirtyRegions() {
        this.dirtyRegions = [];
    }
}

export { CanvasRenderer, EventSystem, LifecycleManager, PluginManager };
//# sourceMappingURL=index.esm.js.map
