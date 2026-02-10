/**
 * 默认分页适配器
 * 使用 CTable 内置的 CPagination 组件
 */

import { defineComponent, h, ref, computed, watch } from 'vue'
import type { PaginationAdapter, PaginationConfig, PaginationEmits, PaginationSlots } from './types'

/**
 * 默认分页组件（内置实现）
 */
const DefaultPaginationComponent = defineComponent({
  name: 'DefaultPagination',
  props: {
    config: {
      type: Object as () => PaginationConfig,
      required: true
    }
  },
  emits: ['change', 'showSizeChange'],
  setup(props, { emit, slots }) {
    const config = props.config

    // 内部状态
    const current = ref(config.current || config.defaultCurrent || 1)
    const pageSize = ref(config.pageSize || config.defaultPageSize || 10)
    const jumpPage = ref('')

    // 监听外部变化
    watch(() => config.current, (newVal) => {
      if (newVal !== undefined) {
        current.value = newVal
      }
    })

    watch(() => config.pageSize, (newVal) => {
      if (newVal !== undefined) {
        pageSize.value = newVal
      }
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(config.total / pageSize.value) || 1
    })

    // 计算当前页的数据范围
    const currentRange = computed<[number, number]>(() => {
      const start = (current.value - 1) * pageSize.value + 1
      const end = Math.min(current.value * pageSize.value, config.total)
      return [start, end]
    })

    // 显示总数文本
    const showTotalText = computed(() => {
      if (config.showTotal) {
        return config.showTotal(config.total, currentRange.value)
      }
      return ''
    })

    // 计算可见的页码
    const visiblePages = computed(() => {
      const pages: number[] = []
      const total = totalPages.value
      const curr = current.value
      const showLess = config.showLessItems || false
      const maxVisible = showLess ? 5 : 7

      if (total <= maxVisible) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (curr <= 3) {
          for (let i = 1; i <= (showLess ? 4 : 5); i++) {
            pages.push(i)
          }
          pages.push(-1)
          pages.push(total)
        } else if (curr >= total - 2) {
          pages.push(1)
          pages.push(-1)
          for (let i = total - (showLess ? 3 : 4); i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push(-1)
          for (let i = curr - 1; i <= curr + 1; i++) {
            pages.push(i)
          }
          pages.push(-1)
          pages.push(total)
        }
      }

      return pages
    })

    // 事件处理
    const handlePageClick = (page: number) => {
      if (page === -1 || page === current.value || config.disabled) return
      current.value = page
      emit('change', page, pageSize.value)
    }

    const handlePrev = () => {
      if (current.value > 1 && !config.disabled) {
        handlePageClick(current.value - 1)
      }
    }

    const handleNext = () => {
      if (current.value < totalPages.value && !config.disabled) {
        handlePageClick(current.value + 1)
      }
    }

    const handleJump = (event: Event) => {
      const target = event.target as HTMLInputElement
      const page = parseInt(target.value)

      if (!isNaN(page) && page >= 1 && page <= totalPages.value && !config.disabled) {
        current.value = page
        emit('change', page, pageSize.value)
      }

      target.value = ''
      jumpPage.value = ''
    }

    const handleSizeChange = (event: Event) => {
      const target = event.target as HTMLSelectElement
      const newSize = parseInt(target.value)

      if (newSize !== pageSize.value && !config.disabled) {
        const startIndex = (current.value - 1) * pageSize.value
        current.value = Math.floor(startIndex / newSize) + 1
        pageSize.value = newSize
        emit('showSizeChange', current.value, newSize)
        emit('change', current.value, newSize)
      }
    }

    // 渲染
    return () => {
      if (config.hideOnSinglePage && totalPages.value <= 1) {
        return null
      }

      const isDisabled = config.disabled || false
      const isSimple = config.simple || false
      const isSmall = config.size === 'small'

      return h('div', {
        class: [
          'cpagination',
          {
            'cpagination-mini': isSmall,
            'cpagination-simple': isSimple,
            'cpagination-disabled': isDisabled
          }
        ]
      }, [
        // ========== 总数显示插槽 ==========
        (config.showTotal && !isSimple) && (
          slots.total
            ? slots.total({ total: config.total, range: currentRange.value })
            : h('div', { class: 'cpagination-total' }, showTotalText.value)
        ),

        // ========== 简洁模式 ==========
        isSimple ? [
          // 上一页按钮
          h('button', {
            class: 'cpagination-prev',
            disabled: current.value <= 1 || isDisabled,
            onClick: handlePrev
          }, slots.prevText ? slots.prevText() : (config.prevText || '<')),

          // 页码输入
          h('span', { class: 'cpagination-simple-pager' }, [
            h('input', {
              value: current.value,
              disabled: isDisabled,
              onChange: handleJump,
              onKeypress: (e: KeyboardEvent) => {
                if (e.key === 'Enter') handleJump(e)
              }
            }),
            h('span', { class: 'cpagination-slash' }, '/'),
            totalPages.value
          ]),

          // 下一页按钮
          h('button', {
            class: 'cpagination-next',
            disabled: current.value >= totalPages.value || isDisabled,
            onClick: handleNext
          }, slots.nextText ? slots.nextText() : (config.nextText || '>'))
        ] : [
          // ========== 完整模式 ==========

          // 上一页按钮
          !isSimple && h('button', {
            class: ['cpagination-item', 'cpagination-prev'],
            disabled: current.value <= 1 || isDisabled,
            onClick: handlePrev
          }, slots.prev ? slots.prev({ disabled: current.value <= 1 }) : (config.prevText || '<')),

          // 页码列表
          h('ul', { class: 'cpagination-list' },
            visiblePages.value.map(page => {
              if (page === -1) {
                // 省略号
                return h('li', {
                  key: `ellipsis-${page}`,
                  class: 'cpagination-item cpagination-item-disabled'
                }, '...')
              }

              const isActive = page === current.value
              return slots.pageItem
                ? slots.pageItem({ page, active: isActive, disabled: isDisabled })
                : h('li', {
                    key: page,
                    class: [
                      'cpagination-item',
                      {
                        'cpagination-item-active': isActive,
                        'cpagination-item-disabled': isDisabled
                      }
                    ],
                    onClick: () => handlePageClick(page)
                  }, page)
            })
          ),

          // 下一页按钮
          !isSimple && h('button', {
            class: ['cpagination-item', 'cpagination-next'],
            disabled: current.value >= totalPages.value || isDisabled,
            onClick: handleNext
          }, slots.next ? slots.next({ disabled: current.value >= totalPages.value }) : (config.nextText || '>')),

          // 快速跳转
          config.showQuickJumper && !isSimple && h('div', { class: 'cpagination-options' }, [
            h('span', { class: 'cpagination-options-quick-jumper' }, [
              '跳至',
              h('input', {
                value: jumpPage.value,
                disabled: isDisabled,
                type: 'text',
                onChange: handleJump,
                onKeypress: (e: KeyboardEvent) => {
                  if (e.key === 'Enter') handleJump(e)
                }
              }),
              '页'
            ])
          ]),

          // 每页条数选择器
          config.showSizeChanger && !isSimple && h('div', { class: 'cpagination-options' }, [
            h('select', {
              class: 'cpagination-options-changer',
              value: pageSize.value,
              disabled: isDisabled,
              onChange: handleSizeChange
            }, (config.pageSizeOptions || [10, 20, 50, 100]).map(size =>
              slots.pageSizeOption
                ? slots.pageSizeOption({ size })
                : h('option', { key: size, value: size }, `${size} 条/页`)
            ))
          ])
        ]
      ])
    }
  }
})

/**
 * 默认分页适配器
 */
export const DefaultPaginationAdapter: PaginationAdapter = {
  name: 'DefaultPaginationAdapter',
  source: 'default',

  isAvailable() {
    // 默认适配器始终可用
    return true
  },

  createComponent(config: PaginationConfig, emits: PaginationEmits, slots?: PaginationSlots) {
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

        return () => h(DefaultPaginationComponent, {
          config,
          onChange: handleChange,
          onShowSizeChange: handleShowSizeChange
        }, slots as any)
      }
    })
  }
}
