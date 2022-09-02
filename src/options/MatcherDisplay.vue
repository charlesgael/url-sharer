<script lang="ts" setup>
import { useAsyncState } from '@vueuse/core'

const props = defineProps<{
  matcher: string
}>()

const tabs = useAsyncState((matcher: string) => browser.tabs.query({ url: matcher }), [], { immediate: false })
tabs.execute(undefined, props.matcher)

watch(() => props.matcher, m => tabs.execute(undefined, m))
</script>

<template lang="pug">
n-scrollbar.border.rounded.mb-4(:style="{'height': '350px'}")
  .tab-list.m-2
    .item(v-for="tab in tabs.state.value")
      .title {{tab.title}}
      .url {{tab.url}}
</template>

<style lang="sass" scoped>
.tab-list
  @apply flex flex-col space-y-2

.item
  @apply border rounded p-2

  .title, .url
    @apply truncate

  .url
    @apply text-sm text-gray-300
</style>
