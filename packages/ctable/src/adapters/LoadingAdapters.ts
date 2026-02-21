/**
 * 加载组件适配器
 * 支持 ant-design-vue、element-plus、naive-ui 等不同 UI 库的加载组件
 */

import { defineComponent, h, shallowRef } from 'vue'

// ========== 类型定义 ==========

export interface LoadingConfig {
  spinning?: boolean
  delay?: number
  size?: 'small' | 'default' | 'large'
  tip?: string
  wrapperClassName?: string
}

export interface LoadingAdapter {
  name: string
  source: 'ant-design-vue' | 'element-plus' | 'naive-ui' | 'custom' | 'default'
  isAvailable(): boolean
  createComponent(config: LoadingConfig, slots?: LoadingSlots): any
}

export interface LoadingSlots {
  default?: () => any
  indicator?: () => any
}

const createDefaultOverlay = (
  config: LoadingConfig,
  slots: LoadingSlots | undefined,
  color: string
) => {
  if (!config.spinning) {
    return slots?.default ? slots.default() : null
  }
  return h(
    'div',
    {
      class: ['ctable-loading-overlay', config.wrapperClassName],
      style: {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999'
      }
    },
    [
      slots?.indicator
        ? slots.indicator()
        : h('div', {
            class: 'ctable-loading-spinner',
            style: {
              width:
                config.size === 'small'
                  ? '20px'
                  : config.size === 'large'
                    ? '40px'
                    : '30px',
              height:
                config.size === 'small'
                  ? '20px'
                  : config.size === 'large'
                    ? '40px'
                    : '30px',
              border: '3px solid #f3f3f3',
              borderTop: `3px solid ${color}`,
              borderRadius: '50%',
              animation: 'ctable-spin 1s linear infinite'
            }
          }),
      config.tip
        ? h(
            'div',
            {
              style: {
                marginTop: '12px',
                color: '#666',
                fontSize: '14px'
              }
            },
            config.tip
          )
        : null
    ]
  )
}

// ========== 内置加载适配器 ==========

export const DefaultLoadingAdapter: LoadingAdapter = {
  name: 'DefaultLoadingAdapter',
  source: 'default',

  isAvailable() {
    return true
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    return defineComponent({
      name: 'DefaultLoading',
      setup() {
        return () => createDefaultOverlay(config, slots, '#1677ff')
      }
    })
  }
}

// ========== ant-design-vue 加载适配器 ==========

let AntDesignVueSpin: any = null
let antLoadingPromise: Promise<any> | null = null

function loadAntDesignSpin() {
  if (AntDesignVueSpin) return Promise.resolve(AntDesignVueSpin)
  if (antLoadingPromise) return antLoadingPromise
  antLoadingPromise = import('ant-design-vue')
    .then((mod: any) => {
      AntDesignVueSpin = mod?.Spin ?? null
      return AntDesignVueSpin
    })
    .catch(() => null)
    .finally(() => {
      antLoadingPromise = null
    })
  return antLoadingPromise
}

export const AntDesignVueLoadingAdapter: LoadingAdapter = {
  name: 'AntDesignVueLoadingAdapter',
  source: 'ant-design-vue',

  isAvailable(): boolean {
    return true
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    return defineComponent({
      name: 'AntDesignVueLoading',
      setup() {
        const compRef = shallowRef<any>(AntDesignVueSpin)
        if (!compRef.value) {
          loadAntDesignSpin().then(comp => {
            if (comp) compRef.value = comp
          })
        }

        return () => {
          if (!compRef.value) {
            return createDefaultOverlay(config, slots, '#1677ff')
          }
          return h(
            compRef.value,
            {
              spinning: config.spinning,
              delay: config.delay,
              size: config.size,
              tip: config.tip,
              wrapperClassName: config.wrapperClassName
            },
            {
              default: slots?.default || (() => null),
              indicator: slots?.indicator
            }
          )
        }
      }
    })
  }
}

// ========== element-plus 加载适配器 ==========

export const ElementPlusLoadingAdapter: LoadingAdapter = {
  name: 'ElementPlusLoadingAdapter',
  source: 'element-plus',

  isAvailable(): boolean {
    return true
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    return defineComponent({
      name: 'ElementPlusLoading',
      setup() {
        return () => {
          if (!config.spinning) {
            return slots?.default ? slots.default() : null
          }
          return h(
            'div',
            {
              class: ['ctable-loading-overlay', config.wrapperClassName],
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '9999'
              }
            },
            [
              slots?.indicator
                ? slots.indicator()
                : h('div', {
                    class: 'ctable-loading-spinner',
                    style: {
                      width:
                        config.size === 'small'
                          ? '20px'
                          : config.size === 'large'
                            ? '40px'
                            : '30px',
                      height:
                        config.size === 'small'
                          ? '20px'
                          : config.size === 'large'
                            ? '40px'
                            : '30px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #409eff',
                      borderRadius: '50%',
                      animation: 'ctable-spin 1s linear infinite'
                    }
                  }),
              config.tip
                ? h(
                    'div',
                    {
                      style: {
                        marginTop: '12px',
                        color: '#606266',
                        fontSize: '14px'
                      }
                    },
                    config.tip
                  )
                : null
            ]
          )
        }
      }
    })
  }
}

// ========== naive-ui 加载适配器 ==========

let NaiveUiSpin: any = null
let naiveLoadingPromise: Promise<any> | null = null

function loadNaiveSpin() {
  if (NaiveUiSpin) return Promise.resolve(NaiveUiSpin)
  if (naiveLoadingPromise) return naiveLoadingPromise
  naiveLoadingPromise = import('naive-ui')
    .then((mod: any) => {
      NaiveUiSpin = mod?.NSpin ?? null
      return NaiveUiSpin
    })
    .catch(() => null)
    .finally(() => {
      naiveLoadingPromise = null
    })
  return naiveLoadingPromise
}

export const NaiveUiLoadingAdapter: LoadingAdapter = {
  name: 'NaiveUiLoadingAdapter',
  source: 'naive-ui',

  isAvailable(): boolean {
    return true
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    return defineComponent({
      name: 'NaiveUiLoading',
      setup() {
        const compRef = shallowRef<any>(NaiveUiSpin)
        if (!compRef.value) {
          loadNaiveSpin().then(comp => {
            if (comp) compRef.value = comp
          })
        }

        return () => {
          if (!compRef.value) {
            return createDefaultOverlay(config, slots, '#18a058')
          }

          return h(
            compRef.value,
            {
              show: config.spinning,
              delay: config.delay,
              size:
                config.size === 'small'
                  ? 'small'
                  : config.size === 'large'
                    ? 'large'
                    : 'medium',
              description: config.tip,
              class: config.wrapperClassName
            },
            {
              default: slots?.default || (() => null),
              icon: slots?.indicator
            }
          )
        }
      }
    })
  }
}

// ========== 导出所有适配器 ==========

export const loadingAdapters: LoadingAdapter[] = [
  AntDesignVueLoadingAdapter,
  ElementPlusLoadingAdapter,
  NaiveUiLoadingAdapter,
  DefaultLoadingAdapter
]
