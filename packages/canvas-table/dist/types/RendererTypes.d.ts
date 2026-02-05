export interface IRenderer {
    render(params: RenderParams): void;
    clear(): void;
    update(params: UpdateParams): void;
    resize(width: number, height: number): void;
    destroy(): void;
}
export interface ICanvasRenderer extends IRenderer {
    getContext(): CanvasRenderingContext2D | null;
    drawCell(x: number, y: number, width: number, height: number, content: any): void;
    drawHeader(x: number, y: number, width: number, height: number, content: any): void;
    drawBackground(x: number, y: number, width: number, height: number): void;
    drawBorder(x: number, y: number, width: number, height: number): void;
    drawSelection(x: number, y: number, width: number, height: number): void;
    drawScrollbar(x: number, y: number, width: number, height: number): void;
}
export interface IDOMRenderer extends IRenderer {
    createElement(tag: string, options?: any): HTMLElement;
    updateElement(element: HTMLElement, content: any): void;
    removeElement(element: HTMLElement): void;
    appendChild(parent: HTMLElement, child: HTMLElement): void;
    removeChild(parent: HTMLElement, child: HTMLElement): void;
}
export interface HybridRenderer extends IRenderer {
    canvasRenderer: ICanvasRenderer;
    domRenderer: IDOMRenderer;
    renderMode: 'canvas' | 'dom' | 'hybrid';
    switchRenderMode(mode: 'canvas' | 'dom' | 'hybrid'): void;
}
export interface RenderParams {
    data: any[];
    columns: any[];
    viewport: Viewport;
    selected: any[];
    theme: ThemeConfig;
}
export interface UpdateParams {
    data?: any[];
    columns?: any[];
    viewport?: Viewport;
    selected?: any[];
    theme?: ThemeConfig;
}
export interface Viewport {
    width: number;
    height: number;
    scrollTop: number;
    scrollLeft: number;
    clientWidth: number;
    clientHeight: number;
    showScrollbar?: boolean;
}
export interface ThemeConfig {
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
