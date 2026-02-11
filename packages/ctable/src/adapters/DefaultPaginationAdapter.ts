/**
 * 默认分页适配器
 * 使用 CTable 内置的 CPagination 组件
 */

import { defineComponent, h } from 'vue'
import CPagination from '../components/CPagination.vue'
import type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits,
  PaginationSlots
} from './types'

/**
 * 默认分页适配器
 *
 * 直接使用 CPagination.vue 组件，避免重复代码
 * CPagination.vue 已经实现了完整的分页功能
 */
export const DefaultPaginationAdapter: PaginationAdapter = {
  name: 'DefaultPaginationAdapter',
  source: 'default',

  isAvailable() {
    // 默认适配器始终可用
    return true
  },

  createComponent(
    config: PaginationConfig,
    emits: PaginationEmits,
    slots?: PaginationSlots
  ) {
    return defineComponent({
      name: 'DefaultPaginationWrapper',
      setup(_, { expose }) {
        const handleChange = (page: number, pageSize: number) => {
          emits.change(page, pageSize)
        }

        const handleShowSizeChange = (current: number, size: number) => {
          if (emits.showSizeChange) {
            emits.showSizeChange(current, size)
          }
        }

        expose({
          handleChange,
          handleShowSizeChange
        })

        return () =>
          h(
            CPagination,
            {
              ...config,
              onChange: handleChange,
              onShowSizeChange: handleShowSizeChange
            },
            slots as any
          )
      }
    })
  }
}
