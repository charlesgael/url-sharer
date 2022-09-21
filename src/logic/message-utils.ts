import type { VNodeChild } from 'vue'

export const titleBody = (title: string, body: string): (() => VNodeChild) => () => h('div', [
  h('div', { class: 'font-bold' }, title),
  h('div', body),
])
