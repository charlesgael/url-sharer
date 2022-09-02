<script lang="ts" setup>
import clone from 'deep-clone'
import type { NForm } from 'naive-ui'
import { useDialog } from 'naive-ui'
import { getSchemaByType } from 'yup-decorator'
import MatcherDisplay from './MatcherDisplay.vue'
import ReplacerDisplay from './ReplacerDisplay.vue'
import { Config, Group } from '~/logic/stored.config'
import { genRules } from '~/logic/yup-naive-validator'

const props = defineProps<{
  modelValue: Config
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: Config): void
  (e: 'delete'): void
}>()

const internalValue = ref(clone(props.modelValue))
const urlMatcherFocused = ref<boolean[]>([])
const replacerFocused = ref<boolean[]>([])
watch(() => props.modelValue, (config) => {
  internalValue.value = clone(config)
  urlMatcherFocused.value = config.groups.map(() => false)
  replacerFocused.value = config.groups.map(() => false)
})

const form = ref<InstanceType<typeof NForm>>()
const groupForms = ref<InstanceType<typeof NForm>[]>([])
const save = async () => {
  try {
    await form.value?.validate()
    await Promise.all(groupForms.value?.map(it => it.validate()))
    emit('update:modelValue', internalValue.value)
    internalValue.value = clone(internalValue.value)
  }
  catch { /* ignored */ }
}

const dialog = useDialog()

const configRules = genRules(getSchemaByType(Config))
const groupRules = genRules(getSchemaByType(Group))
const addGroup = () => internalValue.value.groups.push(new Group())
const removeGroup = (idx: number) => internalValue.value.groups.splice(idx, 1)
const tryMatcher = (matcher: string) => dialog.info({ title: 'Matched tabs', content: () => h(MatcherDisplay, { matcher }), style: { width: '650px' } })
const tryReplacer = (matcher: string, replace: string, by: string) => dialog.info({ title: 'Computed titles', content: () => h(ReplacerDisplay, { matcher, replace, by }), style: { width: '650px' } })
</script>

<template lang="pug">
n-scrollbar
  .w-4xl.m-auto
    n-form(
      ref="form"
      label-placement="left"
      :model="internalValue"
      :rules="configRules"
      @submit.prevent="save"
      :label-width="120"
    )
      n-form-item(label="Title" path="title")
        n-input(v-model:value="internalValue.title")

      n-form-item(label="Before" path="before")
        n-input(v-model:value="internalValue.before" type="textarea")

      n-form-item(label="Groups")
        .flex.flex-col.w-full.space-y-2
          n-form.border.p-2.relative(v-for="(group, idx) in internalValue.groups" ref="groupForms" label-placement="top" :rules="groupRules" :model="group")
            n-button.absolute.top-2.right-2(size="tiny" secondary type="error" circle @click="removeGroup(idx)")
              template(#icon)
              material-symbols:close

            n-form-item(label="Title" path="title")
              n-input(v-model:value="group.title")

            n-form-item(label="Url matcher" path="urlMatcher")
              n-input(v-model:value="group.urlMatcher" placeholder="eg: .*" @focus="urlMatcherFocused[idx] = true" @blur="urlMatcherFocused[idx] = false")
            MatcherDisplay(v-if="urlMatcherFocused[idx]" :matcher="group.urlMatcher")

            .grid.grid-replacer.gap-2
              n-form-item(label="Replace" path="titleReplace.replace")
                n-input-group
                  n-input-group-label ^
                  n-input(v-model:value="group.titleReplace.replace" placeholder="eg: (.*)" @focus="replacerFocused[idx] = true" @blur="replacerFocused[idx] = false")
                  n-input-group-label $
              n-form-item(label="By" path="titleReplace.by")
                n-input(v-model:value="group.titleReplace.by" placeholder="eg: $1" @focus="replacerFocused[idx] = true" @blur="replacerFocused[idx] = false")

            ReplacerDisplay(v-if="replacerFocused[idx]" :matcher="group.urlMatcher" :replace="group.titleReplace.replace" :by="group.titleReplace.by")

          n-button.w-full(dashed type="success" @click="addGroup")
            template(#icon)
              ic:outline-plus
            | New Group

      n-form-item(label="After" path="after")
        n-input(v-model:value="internalValue.after" type="textarea")

      .flex
        .flex-1
          n-popconfirm(@positive-click="emit('delete')")
            template(#trigger)
              n-button(type="error")
                template(#icon)
                  material-symbols:delete-forever
                | Supprimer
            | Are you sure ? You can't undo this.
        div
          n-button(type="primary" attr-type="submit")
            template(#icon)
              mdi:floppy
            | Save
</template>

<style lang="sass" scoped>
.grid-replacer
  grid-template-columns: 4fr 3fr
</style>
