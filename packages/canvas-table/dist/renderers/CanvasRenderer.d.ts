import { ICanvasRenderer, RenderParams, UpdateParams, Viewport, ThemeConfig } from '../types/RendererTypes';
export interface CanvasStyle {
    background?: string;
    border?: string;
    header?: string;
    headerBorder?: string;
    rowHover?: string;
    rowSelected?: string;
    textPrimary?: string;
    textSecondary?: string;
    scrollbarBg?: string;
    scrollbarThumb?: string;
}
export interface CellConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    text?: string;
    value?: any;
    row?: number;
    column?: number;
    selected?: boolean;
    hovered?: boolean;
    header?: boolean;
}
export declare class CanvasRenderer implements ICanvasRenderer {
    private canvas;
    private ctx;
    private viewport;
    private theme;
    private cellHeight;
    private cellWidth;
    private dirtyRegions;
    constructor(canvas: HTMLCanvasElement, viewport: Viewport, theme: ThemeConfig);
    /**
     * 获取画布上下文
     */
    getContext(): CanvasRenderingContext2D | null;
    /**
     * 渲染
     */
    render(params: RenderParams): void;
    /**
     * 更新渲染
     */
    update(params: UpdateParams): void;
    /**
     * 清除画布
     */
    clear(): void;
    /**
     * 调整尺寸
     */
    resize(width: number, height: number): void;
    /**
     * 销毁渲染器
     */
    destroy(): void;
    /**
     * 设置画布尺寸
     */
    private resizeCanvas;
    /**
     * 设置默认样式
     */
    private setupDefaultStyles;
    /**
     * 绘制背景
     */
    drawBackground(x: number, y: number, width: number, height: number): void;
    /**
     * 绘制边框
     */
    drawBorder(x: number, y: number, width: number, height: number): void;
    /**
     * 绘制表头
     */
    drawHeader(arg1: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void;
    private drawHeaderColumns;
    private drawHeaderCell;
    /**
     * 绘制数据行
     */
    drawRows(data: any[], columns: any[], selected: any[]): void;
    /**
     * 绘制行背景
     */
    private drawRowBackground;
    /**
     * 绘制行数据
     */
    private drawRowData;
    /**
     * 绘制单元格内容
     */
    drawCellContent(content: any, x: number, y: number, width: number, height: number, column: any): void;
    /**
     * 绘制文本
     */
    drawText(text: string, x: number, y: number, maxWidth: number, height: number, align?: string): void;
    /**
     * 文本换行处理
     */
    private wrapText;
    /**
     * 绘制选择状态
     */
    drawSelections(selected: any[], columns: any[]): void;
    /**
     * 绘制单个选择框
     */
    drawSelection(x: number, y: number, width: number, height: number): void;
    /**
     * 绘制滚动条
     */
    drawScrollbar(): void;
    /**
     * 绘制单元格
     */
    drawCell(x: number, y: number, width: number, height: number, content: any): void;
    /**
     * 添加脏区域
     */
    addDirtyRegion(x: number, y: number, width: number, height: number): void;
    /**
     * 渲染脏区域
     */
    renderDirtyRegions(): void;
    /**
     * 渲染指定区域
     */
    private renderRegion;
    /**
     * 查找行索引
     */
    private findRowIndex;
    /**
     * 设置单元格高度
     */
    setCellHeight(height: number): void;
    /**
     * 设置单元格宽度
     */
    setCellWidth(width: number): void;
    /**
     * 获取脏区域数量
     */
    getDirtyRegionCount(): number;
    /**
     * 清除脏区域
     */
    clearDirtyRegions(): void;
}
