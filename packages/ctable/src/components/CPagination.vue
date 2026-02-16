<template>
  <div
    v-if="!hideOnSinglePage || totalPages > 1"
    class="cpagination"
    :class="[
      {
        'cpagination-mini': size === 'small',
        'cpagination-simple': simple,
        'cpagination-disabled': disabled
      },
      `cpagination-theme-${themePreset}`
    ]"
  >
    <!-- 总数显示（左侧） -->
    <div v-if="showTotal && !simple" class="cpagination-total">
      <slot name="total" :total="total" :range="currentRange">
        {{ showTotalText }}
      </slot>
    </div>

    <!-- 简洁模式 -->
    <template v-if="simple">
      <button
        class="cpagination-prev"
        :disabled="current <= 1 || disabled"
        @click="handlePrev"
      >
        <slot name="prevText">
          {{ itemRender_prev }}
        </slot>
      </button>
      <span class="cpagination-simple-pager">
        <input
          :value="current"
          :disabled="disabled"
          @change="handleJump"
          @keypress.enter="handleJump"
        />
        <span class="cpagination-slash">/</span>
        {{ totalPages }}
      </span>
      <button
        class="cpagination-next"
        :disabled="current >= totalPages || disabled"
        @click="handleNext"
      >
        <slot name="nextText">
          {{ itemRender_next }}
        </slot>
      </button>
    </template>

    <!-- 完整模式 -->
    <template v-else>
      <!-- 上一步按钮 -->
      <button
        v-if="!simple"
        class="cpagination-item cpagination-prev"
        :disabled="current <= 1 || disabled"
        :class="{ 'cpagination-item-link': itemRender_link }"
        @click="handlePrev"
      >
        <slot name="prev" :disabled="current <= 1">
          <template v-if="itemRender_link">
            {{ prevText }}
          </template>
          <template v-else>&lt;</template>
        </slot>
      </button>

      <!-- 页码列表 -->
      <ul class="cpagination-list">
        <li
          v-for="page in visiblePages"
          :key="page"
          class="cpagination-item"
          :class="{
            'cpagination-item-active': page === current,
            'cpagination-item-disabled': disabled || page === -1
          }"
          @click="handlePageClick(page)"
        >
          {{ page === -1 ? '...' : page }}
        </li>
      </ul>

      <!-- 下一步按钮 -->
      <button
        v-if="!simple"
        class="cpagination-item cpagination-next"
        :disabled="current >= totalPages || disabled"
        :class="{ 'cpagination-item-link': itemRender_link }"
        @click="handleNext"
      >
        <slot name="next" :disabled="current >= totalPages">
          <template v-if="itemRender_link">
            {{ nextText }}
          </template>
          <template v-else>&gt;</template>
        </slot>
      </button>

      <!-- 快速跳转 -->
      <div v-if="showQuickJumper && !simple" class="cpagination-options">
        <span class="cpagination-options-quick-jumper">
          跳至
          <input
            :value="jumpPage"
            :disabled="disabled"
            type="text"
            @change="handleJump"
            @keypress.enter="handleJump"
          />
          页
        </span>
      </div>

      <!-- 每页条数选择器 -->
      <div v-if="showSizeChanger && !simple" class="cpagination-options">
        <select
          class="cpagination-options-changer"
          :value="pageSize"
          :disabled="disabled"
          @change="handleSizeChange"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            <slot name="pageSizeOption" :size="size"> {{ size }} 条/页 </slot>
          </option>
        </select>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'CPagination',

  props: {
    current: { type: Number, default: undefined },
    defaultCurrent: { type: Number, default: 1 },
    pageSize: { type: Number, default: undefined },
    defaultPageSize: { type: Number, default: 10 },
    total: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false },
    showSizeChanger: { type: Boolean, default: false },
    showQuickJumper: { type: Boolean, default: false },
    showTotal: { type: Function, default: undefined },
    pageSizeOptions: {
      type: Array as () => number[],
      default: () => [10, 20, 50, 100]
    },
    simple: { type: Boolean, default: false },
    size: { type: String as () => 'small' | 'default' | '', default: '' },
    hideOnSinglePage: { type: Boolean, default: false },
    showLessItems: { type: Boolean, default: false },
    itemRender: { type: Function, default: undefined },
    prevText: { type: String, default: '上一页' },
    nextText: { type: String, default: '下一页' },
    themePreset: {
      type: String as () => 'ant-design' | 'element-plus' | 'naive',
      default: 'ant-design'
    }
  },

  emits: ['change', 'showSizeChange'],

  setup(props, { emit }) {
    // 内部状态
    const current = ref(props.current || props.defaultCurrent)
    const pageSize = ref(props.pageSize || props.defaultPageSize)
    const jumpPage = ref('')

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(props.total / pageSize.value) || 1
    })

    // 计算当前页的数据范围
    const currentRange = computed(() => {
      const start = (current.value - 1) * pageSize.value + 1
      const end = Math.min(current.value * pageSize.value, props.total)
      return [start, end]
    })

    // 显示总数文本
    const showTotalText = computed(() => {
      if (props.showTotal) {
        return props.showTotal(props.total, currentRange.value)
      }
      return ''
    })

    // 计算可见的页码
    const visiblePages = computed(() => {
      const pages: number[] = []
      const total = totalPages.value
      const curr = current.value
      const showLess = props.showLessItems

      // 决定显示多少页码
      const maxVisible = showLess ? 5 : 7

      if (total <= maxVisible) {
        // 总页数少，全部显示
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总页数多，显示部分页码
        if (curr <= 3) {
          // 当前页在前面
          for (let i = 1; i <= (showLess ? 4 : 5); i++) {
            pages.push(i)
          }
          pages.push(-1) // 省略号
          pages.push(total)
        } else if (curr >= total - 2) {
          // 当前页在后面
          pages.push(1)
          pages.push(-1) // 省略号
          for (let i = total - (showLess ? 3 : 4); i <= total; i++) {
            pages.push(i)
          }
        } else {
          // 当前页在中间
          pages.push(1)
          pages.push(-1) // 省略号
          for (let i = curr - 1; i <= curr + 1; i++) {
            pages.push(i)
          }
          pages.push(-1) // 省略号
          pages.push(total)
        }
      }

      return pages
    })

    // itemRender 相关（用于自定义上一步/下一步文字）
    const itemRender_prev = computed(() => props.prevText || '上一页')
    const itemRender_next = computed(() => props.nextText || '下一页')
    const itemRender_link = computed(() => !!(props.prevText && props.nextText))

    // 事件处理
    const handlePageClick = (page: number) => {
      if (page === -1 || page === current.value || props.disabled) return
      current.value = page
      emit('change', page, pageSize.value)
    }

    const handlePrev = () => {
      if (current.value > 1 && !props.disabled) {
        handlePageClick(current.value - 1)
      }
    }

    const handleNext = () => {
      if (current.value < totalPages.value && !props.disabled) {
        handlePageClick(current.value + 1)
      }
    }

    const handleJump = (event: Event) => {
      const target = event.target as HTMLInputElement
      const page = parseInt(target.value)

      if (
        !isNaN(page) &&
        page >= 1 &&
        page <= totalPages.value &&
        !props.disabled
      ) {
        current.value = page
        emit('change', page, pageSize.value)
      }

      target.value = ''
      jumpPage.value = ''
    }

    const handleSizeChange = (event: Event) => {
      const target = event.target as HTMLSelectElement
      const newSize = parseInt(target.value)

      if (newSize !== pageSize.value && !props.disabled) {
        // 重新计算当前页，确保数据在视野中
        const startIndex = (current.value - 1) * pageSize.value
        current.value = Math.floor(startIndex / newSize) + 1

        pageSize.value = newSize
        emit('showSizeChange', current.value, newSize)
        emit('change', current.value, newSize)
      }
    }

    // 监听 props 变化
    watch(
      () => props.current,
      newVal => {
        if (newVal !== undefined) {
          current.value = newVal
        }
      }
    )

    watch(
      () => props.pageSize,
      newVal => {
        if (newVal !== undefined) {
          pageSize.value = newVal
        }
      }
    )

    return {
      current,
      pageSize,
      jumpPage,
      totalPages,
      currentRange,
      showTotalText,
      visiblePages,
      itemRender_prev,
      itemRender_next,
      itemRender_link,
      handlePageClick,
      handlePrev,
      handleNext,
      handleJump,
      handleSizeChange
    }
  }
})
</script>

<style scoped>
.cpagination {
  --cpg-primary: #1677ff;
  --cpg-primary-soft: rgba(22, 119, 255, 0.1);
  --cpg-border: #d9d9d9;
  --cpg-bg: #ffffff;
  --cpg-disabled-bg: #f5f5f5;
  --cpg-text: rgba(0, 0, 0, 0.88);
  --cpg-text-secondary: rgba(0, 0, 0, 0.65);
  --cpg-text-tertiary: rgba(0, 0, 0, 0.45);
  --cpg-disabled-text: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--cpg-text);
  user-select: none;
}

.cpagination.cpagination-theme-element-plus {
  --cpg-primary: #409eff;
  --cpg-primary-soft: rgba(64, 158, 255, 0.16);
}

.cpagination.cpagination-theme-naive {
  --cpg-primary: #18a058;
  --cpg-primary-soft: rgba(24, 160, 88, 0.16);
}

.cpagination-total {
  margin-right: 16px;
  color: var(--cpg-text-secondary);
}

.cpagination-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.cpagination-item {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--cpg-border);
  background: var(--cpg-bg);
  transition: all 0.2s;
}

.cpagination-item:hover:not(.cpagination-item-active):not(
    .cpagination-item-disabled
  ) {
  border-color: var(--cpg-primary);
  color: var(--cpg-primary);
}

.cpagination-item-active {
  border-color: var(--cpg-primary);
  background: var(--cpg-primary);
  color: #ffffff;
}

.cpagination-item-disabled {
  border-color: var(--cpg-border);
  background: var(--cpg-disabled-bg);
  color: var(--cpg-disabled-text);
  cursor: not-allowed;
}

.cpagination-item-link {
  border: none;
  background: transparent;
  min-width: auto;
  padding: 0 8px;
}

.cpagination-item-link:hover:not(.cpagination-item-disabled) {
  color: var(--cpg-primary);
}

.cpagination-options {
  margin-left: 16px;
  display: flex;
  gap: 8px;
}

.cpagination-options-quick-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cpagination-options-quick-jumper input {
  width: 50px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--cpg-border);
  border-radius: 6px;
  text-align: center;
}

.cpagination-options-quick-jumper input:focus {
  outline: none;
  border-color: var(--cpg-primary);
  box-shadow: 0 0 0 2px var(--cpg-primary-soft);
}

.cpagination-options-changer {
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--cpg-border);
  border-radius: 6px;
  background: var(--cpg-bg);
  cursor: pointer;
  transition: all 0.2s;
}

.cpagination-options-changer:hover {
  border-color: var(--cpg-primary);
}

.cpagination-options-changer:focus {
  outline: none;
  border-color: var(--cpg-primary);
  box-shadow: 0 0 0 2px var(--cpg-primary-soft);
}

/* 迷你版本 */
.cpagination-mini .cpagination-item {
  min-width: 24px;
  height: 24px;
  font-size: 12px;
}

.cpagination-mini .cpagination-options-quick-jumper input,
.cpagination-mini .cpagination-options-changer {
  height: 24px;
}

/* 简洁模式 */
.cpagination-simple {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cpagination-simple-pager {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cpagination-simple-pager input {
  width: 50px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--cpg-border);
  border-radius: 6px;
  text-align: center;
}

.cpagination-slash {
  color: var(--cpg-text-tertiary);
}

/* 禁用状态 */
.cpagination-disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
