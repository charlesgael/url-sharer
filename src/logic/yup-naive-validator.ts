import type { FormItemRule, FormRules } from 'naive-ui'
import * as yup from 'yup'
import capitalize from '~/utils/string/capitalize'

export function genRules(schema: yup.ObjectSchema<any, any, any, any>, root?: true): FormRules
export function genRules(schema: yup.ObjectSchema<any, any, any, any>, root?: false): FormItemRule
export function genRules(schema: yup.ArraySchema<any, any, any>): FormItemRule
export function genRules(schema: yup.AnySchema): FormItemRule
export function genRules(schema: yup.BaseSchema, root = true): any {
  if (schema instanceof yup.ObjectSchema) {
    if (root) { return Object.fromEntries(Object.entries(schema.fields).map(([name, subValidator]) => [name, genRules(subValidator as any, false)])) }
    else {
      console.log(schema)
      return <FormItemRule>{
        type: 'object',
        required: (schema as any).exclusiveTests.required,
        fields: genRules(schema.fields, true),
      }
    }
  }
  if (schema instanceof yup.ArraySchema) {
    return <FormItemRule>{
      type: 'array',
      required: (schema as any).exclusiveTests?.required,
      defaultField: genRules(schema.innerType, false),
    }
  }
  return <FormItemRule>{
    required: (schema as any).exclusiveTests?.required,
    validator: (_rule, value) => {
      try {
        schema.validateSync(value)
      }
      catch (e: unknown) {
        if (e instanceof yup.ValidationError)
          return new Error(capitalize(e.message))
      }
      return true
    },
  } as any
}
