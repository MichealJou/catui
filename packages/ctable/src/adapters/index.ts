/**
 * CTable 组件适配器
 *
 * 支持多种组件库和自定义插槽
 *
 * @example
 * ```vue
 * <template>
 *   <CTable
 *     :pagination="paginationConfig"
 *     :adapter="{ library: 'ant-design-vue' }"
 *   >
 *     <template #pagination-total="{ total, range }">
 *       共 {{ total }} 条，第 {{ range[0] }}-{{ range[1] }} 条
 *     </template>
 *   </CTable>
 * </template>
 * ```
 */

// 导出工厂和管理器
export {
  AdapterManager,
  getAdapterManager,
  initAdapterManager,
  createPaginationComponent,
  isLibraryAvailable
} from './AdapterFactory'

// 导出适配器
export { DefaultPaginationAdapter } from './DefaultPaginationAdapter'
export { AntDesignVuePaginationAdapter } from './AntDesignVuePaginationAdapter'

// 导出类型
export type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits,
  PaginationSlots,
  AdapterConfig,
  ComponentLibrary
} from './types'

// 导出工具函数
export { isAntDesignVueAvailable } from './AntDesignVuePaginationAdapter'
