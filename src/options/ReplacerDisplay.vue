<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'
import { useMessage } from 'naive-ui'

const props = defineProps<{
  matcher: string
  replace: string
  by: string
}>()

const message = useMessage()

const tabs = useAsyncState((matcher: string) => browser.tabs.query({ url: matcher }), [], { immediate: false })
tabs.execute(undefined, props.matcher)

const computeTitle = (title?: string) => {
  const re = new RegExp(`^${props.replace}$`)
  return title?.replace(re, props.by)
}

const copy = (title: string) => {
  navigator.clipboard.writeText(title)
  message.info('Tab title copied to clipboard')
}
</script>

<template lang="pug">
n-scrollbar.rounded.border.mb-4(:style="{'height': '300px'}")
  .tab-list.m-2
    .item(v-for="tab in tabs.state.value")
      .title(@click="copy(tab.title)") {{tab.title}}
      .result {{computeTitle(tab.title)}}
</template>

<style lang="sass" scoped>
  .tab-list
    @apply flex flex-col space-y-2

  .item
    @apply border rounded p-2

    .title, .url
      @apply truncate

    .result
      @apply text-sm text-blue-600
</style>
