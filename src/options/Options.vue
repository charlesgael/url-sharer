<script lang="ts" setup>
import type { MenuMixedOption } from 'naive-ui/es/menu/src/interface'
// import '../logic/stored.config'
import { Config, useSaveData } from '../logic/stored.config'
import EditConfig from './EditConfig.vue'

const saveData = useSaveData()
const selected = ref<number>()

const configsMenuOptions = computed<MenuMixedOption[]>(() => saveData.value.configs?.map((it, idx) => ({
  label: it.title,
  key: idx,
})))

const isSelected = computed<boolean>(() => typeof selected.value === 'number')

const addConfig = () => selected.value = saveData.value.configs.push(new Config()) - 1
const removeConfig = () => {
  saveData.value.configs.splice(selected.value, 1)
  selected.value = undefined
}
</script>

<template lang="pug">
n-layout(position="absolute" has-sider)
  n-layout-sider.p-2(bordered width="100%" :collapsed-width="350" :collapsed="isSelected")
    n-menu.w-full(v-model:value="selected" :options="configsMenuOptions")

    .p-2
      n-button.w-full(dashed type="success" @click="addConfig")
        template(#icon)
          ic:outline-plus
        | New Configuration

  n-layout-content
    EditConfig(v-if="isSelected" v-model="saveData.configs[selected]" @delete="removeConfig(selected)")
</template>

<style lang="sass" scoped>
</style>
