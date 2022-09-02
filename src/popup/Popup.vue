<script setup lang="ts">
import type { MenuMixedOption } from 'naive-ui/es/menu/src/interface'
import type { Tabs } from 'webextension-polyfill'
import { useMessage } from 'naive-ui'
import SelectTab from './SelectTab.vue'
import { useSaveData } from '~/logic/stored.config'

const saveData = useSaveData()
const message = useMessage()

const selectedConfig = ref<number>()
const selectedTabs = ref(false)
const textCopied = ref(false)
const config = computed(() => typeof selectedConfig.value === 'number' ? saveData.value.configs[selectedConfig.value] : undefined)
const groupsSelections = ref<Tabs.Tab[][]>([])
watch(config, (c) => {
  if (c)
    groupsSelections.value = c.groups.map(() => [])
})

const configsMenuOptions = computed<MenuMixedOption[]>(() => saveData.value.configs?.map((it, idx) => ({
  label: it.title,
  key: idx,
})))

// methods
const openOptionsPage = () => browser.runtime.openOptionsPage()
const tabsSelected = () => {
  if (groupsSelections.value.flatMap(i => i).length)
    selectedTabs.value = true
  else
    message.error('You cannot continue without at least one tab')
}

const copy = (text: string) => {
  navigator.clipboard.writeText(text)
  textCopied.value = true
}

const generateMarkdown = (): string => {
  return [
    config.value?.before,
    ...config.value?.groups.map((group, idx) => {
      const re = new RegExp(`^${group.titleReplace.replace}$`)
      if (!groupsSelections.value[idx].length)
        return null

      return [
        `${group.title}:\n`,
        ...groupsSelections.value[idx].map((tab) => {
          return [
            '* [',
            tab.title?.replace(re, group.titleReplace.by),
            '](',
            tab.url,
            ')',
          ].join('')
        }),
      ].join('\n')
    }).filter(it => it) || [],
    config.value?.after,
  ].join('\n\n')
}

const generators = [
  { title: 'Markdown', generate: generateMarkdown },
]
</script>

<template lang="pug">
main.w-100.h-150.flex.flex-col
  h1.bg-blue-500.p-2.text-white.text-xl.flex.items-center
    .flex-1 URL Sharer
    n-button.flex-shrink-0(circle type="warning" @click="openOptionsPage")
      template(#icon)
        mdi:wrench

  .relative.flex-1
    .panel.z-10(:class="{passed: typeof selectedConfig === 'number'}")
      .title Select your configuration
      n-scrollbar.flex-1
        n-menu.w-full(v-model:value="selectedConfig" :options="configsMenuOptions")

    .panel.z-9(:class="{'not-yet': typeof selectedConfig !== 'number', passed: selectedTabs}")
      .title Select the tabs to include in your message
      n-scrollbar.flex-1
        .mx-6.my-2(v-if="config" v-for="(group, idx) of config.groups")
          .font-bold {{group.title}}
          SelectTab(v-model="groupsSelections[idx]" :filter="group.urlMatcher" :replace="group.titleReplace.replace" :by="group.titleReplace.by")
      .actions
        n-button(type="success" icon-placement="right" @click="tabsSelected")
          template(#icon)
            ic:baseline-navigate-next
          | Next

    .panel.z-8(:class="{'not-yet': !selectedTabs, passed: textCopied}")
      .title Generator
      n-scrollbar.w-full
        .mx-6.my-2.flex-1.flex.flex-col.space-y-2
          n-button.h-20.text-xl(v-for="generator in generators" @click="copy(generator.generate())")
            | {{generator.title}}

    .panel.z-7.success(:class="{'not-yet': !textCopied}")
      .font-bold.text-xl Copied to clipboard
      div.mx-10.text-center You can now close the tool and paste it wherever you want !
</template>

<style lang="sass" scoped>
.panel
  @apply transition-all transform absolute top-0 left-0 right-0 bottom-0 scale-95 border shadow bg-white flex flex-col

  &.success
    @apply bg-green-50 items-center justify-center space-y-10

  .title
    @apply m-2 text-lg flex-shrink-0

  .actions
    @apply bg-gray-50 flex-shrink-0 flex space-x-1 mt-2 p-2

    &:before
      content: ''
      @apply flex-1

  &.passed
    @apply -rotate-2
    --tw-translate-x: -93%

  &.not-yet
    @apply rotate-2 border-gray-700
    --tw-translate-x: 93%
</style>
