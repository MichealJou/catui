import { ref, reactive, computed, watch, onMounted, onUnmounted, defineComponent, PropType } from 'vue'
import { TableProps, TableEvents, ITablePlugin, IPluginManager, IEventSystem } from '../types'
import { PluginManager } from '../plugins/PluginManager'
import { EventSystem } from '../core/EventSystem'
import { LifecycleManager } from '../core/LifecycleManager'

export interface CTable {
  // 核心属性
  props: TableProps
  data: any[]
  columns: any[]
  viewport: {
    width: number
    height: number
    scrollTop: number
    scrollLeft: number
    clientWidth: number
    clientHeight: number
  }
  
  // 插件系统
  pluginManager: IPluginManager
  
  // 事件系统
  eventSystem: IEventSystem
  
  // 生命周期管理
  lifecycle: LifecycleManager
  
  // 渲染器
  renderer: any
  
  // 公共方法
  usePlugin(plugin: ITablePlugin | string, config?: any): void
  unusePlugin(name: string): void
  emit(event: string, data?: any): void
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  
  // 数据方法
  setData(data: any[]): void
  getData(): any[]
  setColumns(columns: any[]): void
  getColumns(): any[]
  
  // 视图方法
  scrollToTop(): void
  scrollToBottom(): void
  scrollToRow(index: number): void
  scrollToColumn(index: number): void
  getViewport(): any
  
  // 渲染方法
  render(): void
  clear(): void
  resize(width: number, height: number): void
}

export const CTable = defineComponent({
  name: 'CTable',
  
  props: {
    // 数据相关
    data: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    columns: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    
    // 尺寸相关
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    rowHeight: {
      type: Number,
      default: 40
    },
    columnWidth: {
      type: Number,
      default: 120
    },
    
    // 功能开关
    virtual: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showScrollbar: {
      type: Boolean,
      default: true
    },
    showBorder: {
      type: Boolean,
      default: true
    },
    highlightRow: {
      type: Boolean,
      default: true
    },
    
    // 性能相关
    threshold: {
      type: Number,
      default: 10000
    },
    bufferSize: {
      type: Number,
      default: 5
    },
    
    // 渲染相关
    renderer: {
      type: String as PropType<'canvas' | 'dom' | 'hybrid'>,
      default: 'hybrid'
    },
    
    // 主题相关
    theme: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    }
  },
  
  emits: [
    'row-click',
    'cell-click',
    'sort',
    'filter',
    'selection-change',
    'scroll'
  ],
  
  setup(props: TableProps, { emit }: { emit: (event: TableEvents[keyof TableEvents], ...args: any[]) => void }) {
    // 响应式数据
    const tableData = ref<any[]>([])
    const tableColumns = ref<any[]>([])
    const selectedRows = ref<any[]>([])
    
    // 视口状态
    const viewport = reactive({
      width: 0,
      height: 0,
      scrollTop: 0,
      scrollLeft: 0,
      clientWidth: 0,
      clientHeight: 0
    })
    
    // 初始化插件管理器
    const pluginManager = ref<PluginManager | null>(null)
    const eventSystem = ref<EventSystem | null>(null)
    const lifecycle = ref<LifecycleManager | null>(null)
    
    // 计算属性
    const isVirtual = computed(() => props.virtual && tableData.value.length > props.threshold)
    const visibleData = computed(() => {
      if (!isVirtual.value) {
        return tableData.value
      }
      
      // 计算可见范围
      const startIndex = Math.floor(viewport.scrollTop / props.rowHeight)
      const endIndex = Math.min(
        startIndex + Math.ceil(viewport.clientHeight / props.rowHeight) + props.bufferSize * 2,
        tableData.value.length
      )
      
      return tableData.value.slice(
        Math.max(0, startIndex - props.bufferSize),
        endIndex
      )
    })
    
    // 生命周期钩子
    onMounted(() => {
      initializeTable()
    })
    
    onUnmounted(() => {
      destroyTable()
    })
    
    // 初始化表格
    const initializeTable = () => {
      // 初始化核心系统
      eventSystem.value = new EventSystem()
      lifecycle.value = new LifecycleManager()
      pluginManager.value = new PluginManager(lifecycle.value, eventSystem.value)
      
      // 设置初始数据
      tableData.value = [...props.data]
      tableColumns.value = [...props.columns]
      viewport.width = props.width
      viewport.height = props.height
      
      // 注册内置插件
      registerDefaultPlugins()
      
      // 渲染表格
      render()
    }
    
    // 销毁表格
    const destroyTable = () => {
      if (pluginManager.value) {
        pluginManager.value.unregisterAll()
      }
      if (eventSystem.value) {
        eventSystem.value.removeAll()
      }
      lifecycle.value?.destroy()
    }
    
    // 注册默认插件
    const registerDefaultPlugins = () => {
      // 这里将在后续实现具体插件时注册
      // registerPlugin('virtual-scroll', VirtualScrollPlugin)
      // registerPlugin('sort', SortPlugin)
      // registerPlugin('filter', FilterPlugin)
    }
    
    // 渲染表格
    const render = () => {
      if (!lifecycle.value) return
      
      lifecycle.value.trigger('beforeRender')
      
      // 执行渲染逻辑
      const renderParams = {
        data: visibleData.value,
        columns: tableColumns.value,
        viewport,
        selected: selectedRows.value,
        theme: props.theme
      }
      
      // 这里将在实现渲染器时使用
      console.log('渲染参数:', renderParams)
      
      lifecycle.value.trigger('afterRender')
    }
    
    // 公共方法实现
    const usePlugin = (plugin: ITablePlugin | string, config?: any) => {
      if (!pluginManager.value) return
      
      if (typeof plugin === 'string') {
        // 加载已注册的插件
        pluginManager.value.load(plugin)
      } else {
        // 注册并加载新插件
        pluginManager.value.register(plugin)
        pluginManager.value.load(plugin.name)
      }
    }
    
    const unusePlugin = (name: string) => {
      if (pluginManager.value) {
        pluginManager.value.unload(name)
        pluginManager.value.unregister(name)
      }
    }
    
    const emit = (event: string, data?: any) => {
      eventSystem.value?.emit(event, data)
      emit(event, data)
    }
    
    const on = (event: string, handler: Function) => {
      eventSystem.value?.on(event, handler)
    }
    
    const off = (event: string, handler: Function) => {
      eventSystem.value?.off(event, handler)
    }
    
    // 数据方法
    const setData = (data: any[]) => {
      tableData.value = [...data]
      selectedRows.value = []
      render()
    }
    
    const getData = () => {
      return [...tableData.value]
    }
    
    const setColumns = (columns: any[]) => {
      tableColumns.value = [...columns]
      render()
    }
    
    const getColumns = () => {
      return [...tableColumns.value]
    }
    
    // 视图方法
    const scrollToTop = () => {
      viewport.scrollTop = 0
      viewport.scrollLeft = 0
      emit('scroll', 0, 0)
      render()
    }
    
    const scrollToBottom = () => {
      const totalHeight = tableData.value.length * props.rowHeight
      viewport.scrollTop = totalHeight - viewport.clientHeight
      emit('scroll', viewport.scrollTop, viewport.scrollLeft)
      render()
    }
    
    const scrollToRow = (index: number) => {
      if (index >= 0 && index < tableData.value.length) {
        viewport.scrollTop = index * props.rowHeight
        emit('scroll', viewport.scrollTop, viewport.scrollLeft)
        render()
      }
    }
    
    const scrollToColumn = (index: number) => {
      if (index >= 0 && index < tableColumns.value.length) {
        const column = tableColumns.value[index]
        const scrollLeft = column ? (index * props.columnWidth) : 0
        viewport.scrollLeft = scrollLeft
        emit('scroll', viewport.scrollTop, viewport.scrollLeft)
        render()
      }
    }
    
    const getViewport = () => {
      return { ...viewport }
    }
    
    // 监听数据变化
    watch(() => props.data, (newData) => {
      setData(newData)
    }, { deep: true })
    
    watch(() => props.columns, (newColumns) => {
      setColumns(newColumns)
    }, { deep: true })
    
    watch(() => props.theme, (newTheme) => {
      render()
    }, { deep: true })
    
    // 返回公共 API
    const tableAPI = reactive<CTable>({
      props,
      data: tableData,
      columns: tableColumns,
      viewport,
      pluginManager: pluginManager.value!,
      eventSystem: eventSystem.value!,
      lifecycle: lifecycle.value!,
      renderer: null, // 将在实现渲染器时设置
      
      usePlugin,
      unusePlugin,
      emit,
      on,
      off,
      setData,
      getData,
      setColumns,
      getColumns,
      scrollToTop,
      scrollToBottom,
      scrollToRow,
      scrollToColumn,
      getViewport,
      render,
      clear: () => {
        tableData.value = []
        selectedRows.value = []
        render()
      },
      resize: (width: number, height: number) => {
        viewport.width = width
        viewport.height = height
        render()
      }
    })
    
    return {
      // 模板数据
      tableData: visibleData,
      tableColumns,
      selectedRows,
      viewport,
      isVirtual,
      
      // 公共方法
      usePlugin,
      unusePlugin,
      emit,
      on,
      off,
      scrollToTop,
      scrollToBottom,
      scrollToRow,
      scrollToColumn,
      
      // 调试用
      tableAPI
    }
  },
  
  template: `
    <div class="ctable-container" :style="{ width: props.width + 'px', height: props.height + 'px' }">
      <div class="ctable-viewport" :style="{ width: '100%', height: '100%', overflow: 'auto' }">
        <div class="ctable-content" :style="{ width: viewport.width + 'px', height: viewport.height + 'px' }">
          <!-- 表头 -->
          <div v-if="props.showHeader" class="ctable-header">
            <div class="ctable-row">
              <div 
                v-for="column in tableColumns" 
                :key="column.key"
                class="ctable-cell"
                :style="{ width: column.width || props.columnWidth + 'px' }"
              >
                {{ column.title }}
              </div>
            </div>
          </div>
          
          <!-- 表体 -->
          <div class="ctable-body">
            <div v-for="(row, rowIndex) in tableData" :key="rowIndex" class="ctable-row">
              <div 
                v-for="column in tableColumns" 
                :key="column.key"
                class="ctable-cell"
                :style="{ width: column.width || props.columnWidth + 'px' }"
                @click="handleCellClick(row, column, rowIndex)"
              >
                {{ row[column.key] }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})

export default CTable