export interface ITablePlugin {
    name: string;
    version: string;
    dependencies?: string[];
    install(table: any): void;
    uninstall(table: any): void;
    on?(event: string, handler: Function): void;
    off?(event: string, handler: Function): void;
}
export interface IRenderer {
    render(params: RenderParams): void;
    clear(): void;
    update(params: UpdateParams): void;
    resize(width: number, height: number): void;
}
export interface IEventSystem {
    on(event: string, handler: Function): void;
    off(event: string, handler: Function): void;
    emit(event: string, data?: any): void;
    once(event: string, handler: Function): void;
}
export interface IPluginManager {
    register(plugin: ITablePlugin): void;
    unregister(name: string): void;
    get(name: string): ITablePlugin | undefined;
    list(): string[];
    load(name: string): boolean;
    unload(name: string): boolean;
}
export interface Column {
    key: string;
    title: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    fixed?: 'left' | 'right';
    sortable?: boolean;
    filterable?: boolean;
    editable?: boolean;
    align?: 'left' | 'center' | 'right';
    headerAlign?: 'left' | 'center' | 'right';
    className?: string;
    render?: (value: any, row: any, column: Column, index: number) => any;
    headerRender?: (column: Column, index: number) => any;
    sortableChildren?: Column[];
}
export interface TableProps {
    data: any[];
    columns: Column[];
    width: number;
    height: number;
    rowHeight?: number;
    columnWidth?: number;
    virtual?: boolean;
    showHeader?: boolean;
    showScrollbar?: boolean;
    showBorder?: boolean;
    highlightRow?: boolean;
    threshold?: number;
    bufferSize?: number;
    renderer?: 'canvas' | 'dom' | 'hybrid';
    theme?: ThemeConfig;
    onRowClick?: (row: any, index: number) => void;
    onCellClick?: (cell: any, row: any, col: Column) => void;
    onSort?: (column: Column, direction: string) => void;
    onFilter?: (column: Column, values: any[]) => void;
    onSelectionChange?: (selected: any[]) => void;
    onScroll?: (scrollTop: number, scrollLeft: number) => void;
}
export interface TableEvents {
    'row-click': [row: any, index: number];
    'cell-click': [cell: any, row: any, col: Column];
    'sort': [column: Column, direction: string];
    'filter': [column: Column, values: any[]];
    'selection-change': [selected: any[]];
    'scroll': [scrollTop: number, scrollLeft: number];
}
export interface Viewport {
    width: number;
    height: number;
    scrollTop: number;
    scrollLeft: number;
    clientWidth: number;
    clientHeight: number;
}
export interface RenderParams {
    data: any[];
    columns: Column[];
    viewport: Viewport;
    selected: any[];
    theme: ThemeConfig;
}
export interface UpdateParams {
    data?: any[];
    columns?: Column[];
    viewport?: Viewport;
    selected?: any[];
    theme?: ThemeConfig;
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
export interface PluginConfig {
    [key: string]: any;
}
export interface PluginManagerState {
    plugins: Map<string, ITablePlugin>;
    loaded: Set<string>;
    table: any;
}
export interface EventSystemState {
    events: Map<string, Function[]>;
}
export type RendererType = 'canvas' | 'dom' | 'hybrid';
export type SortDirection = 'asc' | 'desc' | null;
export interface Filter {
    column: string;
    values: any[];
    type?: 'equals' | 'contains' | 'range' | 'list';
}
export interface Selection {
    type: 'single' | 'multiple';
    selected: Set<any>;
    rowKey?: string | ((row: any) => string | number);
}
export interface EditConfig {
    mode: 'cell' | 'row' | 'inline';
    trigger: 'click' | 'dblclick' | 'manual';
    editableColumns?: string[];
    validator?: (value: any, row: any, column: Column) => boolean;
}
export interface VirtualScrollConfig {
    enabled: boolean;
    threshold: number;
    bufferSize: number;
    overscan: number;
    itemHeight?: number;
    itemWidth?: number;
}
export interface ColumnConfig {
    resizable?: boolean;
    draggable?: boolean;
    hideable?: boolean;
    fixedColumns?: 'left' | 'right';
    fixedHeader?: boolean;
    groupable?: boolean;
    summary?: boolean;
}
export interface ExportConfig {
    format: 'csv' | 'excel' | 'json';
    filename?: string;
    includeHeader?: boolean;
    selectedOnly?: boolean;
}
