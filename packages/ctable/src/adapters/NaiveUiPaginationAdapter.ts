import { defineComponent, h, shallowRef } from 'vue'
import type {
  PaginationAdapter,
  PaginationConfig,
  PaginationEmits
} from './types'
import CPagination from '../components/CPagination.vue'

let NaivePagination: any = null
let loadingPromise: Promise<any> | null = null

function loadNaivePagination() {
  if (NaivePagination) return Promise.resolve(NaivePagination)
  if (loadingPromise) return loadingPromise
  loadingPromise = import('naive-ui')
    .then((mod: any) => {
      NaivePagination = mod?.NPagination ?? null
      return NaivePagination
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
    themePreset: 'naive'
  })
}

function createNaiveProps(config: PaginationConfig, emits: PaginationEmits) {
  return {
    page: config.current ?? config.defaultCurrent ?? 1,
    pageSize: config.pageSize ?? config.defaultPageSize ?? 10,
    itemCount: config.total ?? 0,
    disabled: config.disabled,
    showSizePicker: config.showSizeChanger,
    showQuickJumper: config.showQuickJumper,
    pageSizes: config.pageSizeOptions || [10, 20, 50, 100],
    size: config.size === 'small' ? 'small' : 'medium',
    simple: !!config.simple,
    'onUpdate:page': (page: number) => {
      emits.change(page, config.pageSize ?? config.defaultPageSize ?? 10)
    },
    'onUpdate:pageSize': (size: number) => {
      const page = config.current ?? config.defaultCurrent ?? 1
      emits.showSizeChange?.(page, size)
      emits.change(page, size)
    }
  }
}

export const NaiveUiPaginationAdapter: PaginationAdapter = {
  name: 'NaiveUiPaginationAdapter',
  source: 'naive-ui',

  isAvailable(): boolean {
    return true
  },

  createComponent(config: PaginationConfig, emits: PaginationEmits) {
    return defineComponent({
      name: 'NaiveUiPaginationWrapper',
      setup() {
        const compRef = shallowRef<any>(NaivePagination)
        if (!compRef.value) {
          loadNaivePagination().then(comp => {
            if (comp) {
              compRef.value = comp
            }
          })
        }
        return () => {
          if (!compRef.value) {
            return createFallbackPagination(config, emits)
          }
          return h(compRef.value, createNaiveProps(config, emits))
        }
      }
    })
  }
}
