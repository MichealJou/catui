import { defineComponent, h, shallowRef } from 'vue'
import type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits
} from './types'
import CPagination from '../components/CPagination.vue'

let ElementPlusPagination: any = null
let loadingPromise: Promise<any> | null = null

function loadElementPlusPagination() {
  if (ElementPlusPagination) return Promise.resolve(ElementPlusPagination)
  if (loadingPromise) return loadingPromise
  loadingPromise = import('element-plus')
    .then((mod: any) => {
      ElementPlusPagination = mod?.ElPagination ?? null
      return ElementPlusPagination
    })
    .catch(() => null)
    .finally(() => {
      loadingPromise = null
    })
  return loadingPromise
}

function createFallbackPagination(config: PaginationConfig, emits: PaginationEmits) {
  return h(CPagination as any, {
    ...config,
    onChange: emits.change,
    onShowSizeChange: emits.showSizeChange,
    themePreset: 'element-plus'
  })
}

function createElementPaginationProps(config: PaginationConfig, emits: PaginationEmits) {
  return {
    currentPage: config.current ?? config.defaultCurrent ?? 1,
    pageSize: config.pageSize ?? config.defaultPageSize ?? 10,
    total: config.total ?? 0,
    disabled: config.disabled,
    pageSizes: config.pageSizeOptions || [10, 20, 50, 100],
    small: config.size === 'small',
    hideOnSinglePage: config.hideOnSinglePage,
    layout: [
      'total',
      'prev',
      'pager',
      'next',
      config.showQuickJumper ? 'jumper' : '',
      config.showSizeChanger ? 'sizes' : ''
    ]
      .filter(Boolean)
      .join(', '),
    onCurrentChange: (page: number) => {
      emits.change(page, config.pageSize || config.defaultPageSize || 10)
    },
    onSizeChange: (size: number) => {
      const page = config.current || config.defaultCurrent || 1
      emits.showSizeChange?.(page, size)
      emits.change(page, size)
    }
  }
}

export const ElementPlusPaginationAdapter: PaginationAdapter = {
  name: 'ElementPlusPaginationAdapter',
  source: 'element-plus',

  isAvailable(): boolean {
    return true
  },

  createComponent(config: PaginationConfig, emits: PaginationEmits) {
    return defineComponent({
      name: 'ElementPlusPaginationWrapper',
      setup() {
        const compRef = shallowRef<any>(ElementPlusPagination)
        if (!compRef.value) {
          loadElementPlusPagination().then(comp => {
            if (comp) {
              compRef.value = comp
            }
          })
        }

        return () => {
          if (!compRef.value) {
            return createFallbackPagination(config, emits)
          }
          return h(compRef.value, createElementPaginationProps(config, emits))
        }
      }
    })
  }
}
