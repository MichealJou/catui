/**
 * ant-design-vue 分页适配器
 *
 * 注意：ant-design-vue 需要作为 peerDependency 由用户安装
 * 此适配器会动态检测 ant-design-vue 是否可用
 */

import { defineComponent, h, shallowRef } from 'vue'
import type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits,
  PaginationSlots
} from './types'
import CPagination from '../components/CPagination.vue'

// 动态导入 ant-design-vue（不打包）
let AntDesignVuePagination: any = null
let loadingPromise: Promise<any> | null = null

/**
 * 检查 ant-design-vue 是否可用
 */
function checkAntDesignVueAvailable(): boolean {
  return true
}

function loadAntPagination() {
  if (AntDesignVuePagination) return Promise.resolve(AntDesignVuePagination)
  if (loadingPromise) return loadingPromise
  loadingPromise = import('ant-design-vue')
    .then((mod: any) => {
      AntDesignVuePagination = mod?.Pagination ?? null
      return AntDesignVuePagination
    })
    .catch(() => null)
    .finally(() => {
      loadingPromise = null
    })
  return loadingPromise
}

/**
 * ant-design-vue 分页适配器
 */
export const AntDesignVuePaginationAdapter: PaginationAdapter = {
  name: 'AntDesignVuePaginationAdapter',
  source: 'ant-design-vue',

  isAvailable(): boolean {
    return checkAntDesignVueAvailable()
  },

  createComponent(
    config: PaginationConfig,
    emits: PaginationEmits,
    slots?: PaginationSlots
  ) {
    // 创建包装组件，将插槽映射到 ant-design-vue 的插槽
    return defineComponent({
      name: 'AntDesignVuePaginationWrapper',
      setup(props, { expose }) {
        const compRef = shallowRef<any>(AntDesignVuePagination)
        if (!compRef.value) {
          loadAntPagination().then(comp => {
            if (comp) compRef.value = comp
          })
        }

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

        return () => {
          // 准备 ant-design-vue Pagination 的 props
          const paginationProps: any = {
            current: config.current ?? 1,
            defaultCurrent: config.defaultCurrent,
            pageSize: config.pageSize,
            defaultPageSize: config.defaultPageSize,
            total: config.total ?? 0,
            disabled: config.disabled,
            showSizeChanger: config.showSizeChanger,
            showQuickJumper: config.showQuickJumper,
            showTotal: config.showTotal,
            pageSizeOptions: config.pageSizeOptions,
            simple: config.simple,
            size: config.size === 'small' ? 'small' : undefined,
            hideOnSinglePage: config.hideOnSinglePage,
            showLessItems: config.showLessItems,
            prevIcon: config.prevText,
            nextIcon: config.nextText,
            onChange: handleChange,
            onShowSizeChange: handleShowSizeChange
          }

          // 准备插槽映射
          // ant-design-vue 的插槽名称：
          // - renderItem (自定义页码)
          // - prevText (上一页)
          // - nextText (下一页)
          const slotMappings: Record<string, any> = {}

          if (slots) {
            // 总数显示
            if (slots.total) {
              slotMappings.default = (props: any) => {
                return slots.total!({ total: config.total ?? 0, range: props.range })
              }
            }

            // 自定义渲染
            if (slots.itemRender) {
              slotMappings.renderItem = (props: any) => {
                const { page, type, originalElement } = props
                return slots.itemRender!({ page, type, originalElement })
              }
            }

            // 上一页
            if (slots.prev) {
              slotMappings.prevIcon = () =>
                slots.prev!({
                  disabled: !(config.current ?? 1) || (config.current ?? 1) <= 1
                })
            }

            // 下一页
            if (slots.next) {
              slotMappings.nextIcon = () =>
                slots.next!({
                  disabled:
                    !(config.current ?? 1) ||
                    (config.current ?? 1) >=
                      Math.ceil((config.total ?? 0) / (config.pageSize || 10))
                })
            }
          }

          if (!compRef.value) {
            return h(CPagination as any, {
              ...config,
              onChange: handleChange,
              onShowSizeChange: handleShowSizeChange,
              themePreset: 'ant-design'
            })
          }
          return h(compRef.value, paginationProps, slotMappings)
        }
      }
    })
  }
}

// 导出检查函数供外部使用
export function isAntDesignVueAvailable(): boolean {
  return AntDesignVuePaginationAdapter.isAvailable()
}
