/**
 * 加载组件适配器
 * 支持 ant-design-vue、element-plus、naive-ui 等不同 UI 库的加载组件
 */

import { defineComponent, h } from 'vue'

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
      setup(_, { slots }) {
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
              // 加载指示器
              h('div', {
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
                  borderTop: '3px solid #1890ff',
                  borderRadius: '50%',
                  animation: 'ctable-spin 1s linear infinite'
                }
              }),
              // 提示文字
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
      }
    })
  }
}

// ========== ant-design-vue 加载适配器 ==========

let AntDesignVueSpin: any = null

function checkAntDesignVueAvailable(): boolean {
  if (AntDesignVueSpin) return true

  try {
    const module = require('ant-design-vue')
    AntDesignVueSpin = module.Spin
    return true
  } catch (e) {
    return false
  }
}

export const AntDesignVueLoadingAdapter: LoadingAdapter = {
  name: 'AntDesignVueLoadingAdapter',
  source: 'ant-design-vue',

  isAvailable(): boolean {
    return checkAntDesignVueAvailable()
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    if (!this.isAvailable()) {
      console.warn(
        'ant-design-vue Spin component is not available, falling back to default loading'
      )
      return DefaultLoadingAdapter.createComponent(config, slots)
    }

    return defineComponent({
      name: 'AntDesignVueLoading',
      setup(_, { slots }) {
        return () =>
          h(
            AntDesignVueSpin,
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
    })
  }
}

// ========== element-plus 加载适配器 ==========

let ElementPlusLoading: any = null
let ElLoadingDirective: any = null

function checkElementPlusAvailable(): boolean {
  if (ElementPlusLoading) return true

  try {
    const module = require('element-plus')
    ElementPlusLoading = module.ElLoading
    ElLoadingDirective = module.vLoading
    return true
  } catch (e) {
    return false
  }
}

export const ElementPlusLoadingAdapter: LoadingAdapter = {
  name: 'ElementPlusLoadingAdapter',
  source: 'element-plus',

  isAvailable(): boolean {
    return checkElementPlusAvailable()
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    if (!this.isAvailable()) {
      console.warn(
        'element-plus loading is not available, falling back to default loading'
      )
      return DefaultLoadingAdapter.createComponent(config, slots)
    }

    return defineComponent({
      name: 'ElementPlusLoading',
      setup(_, { slots }) {
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
              h('div', {
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
      }
    })
  }
}

// ========== naive-ui 加载适配器 ==========

let NaiveUiSpin: any = null

function checkNaiveUiAvailable(): boolean {
  if (NaiveUiSpin) return true

  try {
    const module = require('naive-ui')
    NaiveUiSpin = module.NSpin
    return true
  } catch (e) {
    return false
  }
}

export const NaiveUiLoadingAdapter: LoadingAdapter = {
  name: 'NaiveUiLoadingAdapter',
  source: 'naive-ui',

  isAvailable(): boolean {
    return checkNaiveUiAvailable()
  },

  createComponent(config: LoadingConfig, slots?: LoadingSlots) {
    if (!this.isAvailable()) {
      console.warn(
        'naive-ui NSpin component is not available, falling back to default loading'
      )
      return DefaultLoadingAdapter.createComponent(config, slots)
    }

    return defineComponent({
      name: 'NaiveUiLoading',
      setup(_, { slots }) {
        return () =>
          h(
            NaiveUiSpin,
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
              default: slots?.default || (() => null)
            }
          )
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
