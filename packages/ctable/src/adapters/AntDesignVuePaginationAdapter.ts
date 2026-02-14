/**
 * ant-design-vue 分页适配器
 *
 * 注意：ant-design-vue 需要作为 peerDependency 由用户安装
 * 此适配器会动态检测 ant-design-vue 是否可用
 */

import { defineComponent, h } from 'vue'
import type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits,
  PaginationSlots
} from './types'

// 动态导入 ant-design-vue（不打包）
let AntDesignVuePagination: any = null
let isAvailableChecked = false

/**
 * 检查 ant-design-vue 是否可用
 */
function checkAntDesignVueAvailable(): boolean {
  if (isAvailableChecked) {
    return AntDesignVuePagination !== null
  }

  isAvailableChecked = true

  try {
    // 尝试动态导入
    // 注意：这里使用 require 为了运行时检测
    // 在打包环境中，这个依赖不会被打包
    try {
      // @ts-ignore - 动态导入
      const module = require('ant-design-vue')
      AntDesignVuePagination = module.Pagination
      return true
    } catch {
      // ES Module 环境
      // @ts-ignore
      if (window && window.antDesignVue) {
        // @ts-ignore
        AntDesignVuePagination = window.antDesignVue.Pagination
        return true
      }
    }

    console.warn(
      '[CTable] ant-design-vue not found. Using default pagination component.'
    )
    console.warn(
      '[CTable] To use ant-design-vue pagination, install it: npm install ant-design-vue'
    )
    return false
  } catch {
    return false
  }
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
    // 如果 ant-design-vue 不可用，返回错误提示
    if (!this.isAvailable()) {
      console.error(
        '[CTable] ant-design-vue is not installed. Cannot use AntDesignVuePaginationAdapter.'
      )
      // 返回一个占位组件
      return defineComponent({
        name: 'AntDesignVuePaginationFallback',
        setup() {
          return () =>
            h(
              'div',
              {
                style: {
                  color: 'red',
                  padding: '20px',
                  border: '1px solid red',
                  borderRadius: '4px'
                }
              },
              [
                h(
                  'div',
                  { style: { fontWeight: 'bold', marginBottom: '8px' } },
                  'Error: ant-design-vue not installed'
                ),
                h('div', 'To use ant-design-vue pagination, please install:'),
                h(
                  'code',
                  {
                    style: {
                      display: 'block',
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f5f5f5'
                    }
                  },
                  'npm install ant-design-vue'
                )
              ]
            )
        }
      })
    }

    // 创建包装组件，将插槽映射到 ant-design-vue 的插槽
    return defineComponent({
      name: 'AntDesignVuePaginationWrapper',
      setup(props, { expose }) {
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

          return h(AntDesignVuePagination, paginationProps, slotMappings)
        }
      }
    })
  }
}

// 导出检查函数供外部使用
export function isAntDesignVueAvailable(): boolean {
  return AntDesignVuePaginationAdapter.isAvailable()
}
