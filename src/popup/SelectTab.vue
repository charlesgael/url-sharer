<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'
import type { Tabs } from 'webextension-polyfill'

const props = defineProps<{
  modelValue: Tabs.Tab[]
  filter: string
  replace: string
  by: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: Tabs.Tab[]): void
}>()

const modelValue = ref(props.modelValue)
watch(modelValue, val => emit('update:modelValue', val))

const replace = computed(() => new RegExp(`^${props.replace}$`))

const tabs = useAsyncState(browser.tabs.query({ url: props.filter }), [])
</script>

<template lang="pug">
.flex.flex-col.space-y-2
  label.item(v-for="tab in tabs.state.value")
    input(type="checkbox" v-model="modelValue" :value="tab")
    .inner
      .font-bold {{tab.title?.replace(replace, by)}}
      .truncate(:title="tab.title") {{tab.title}}
      .truncate(:title="tab.url") {{tab.url}}
</template>

<style lang="sass" scoped>
.item
  & > input[type=checkbox]
    @apply hidden

    & + .inner
      @apply border opacity-40 p-2

    &:checked + .inner
      @apply opacity-100 bg-green-50
</style>
