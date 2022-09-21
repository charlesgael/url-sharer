import { a, an, cast, is, nestedArray, nestedType, schema } from 'yup-decorator'
import { useStorageLocal } from '~/composables/useStorageLocal'

@schema()
export class Replacer {
  @is(a.string().default('(.*)'))
    replace = '(.*)'

  @is(a.string().default('$1'))
    by = '$1'
}

@schema()
export class Group {
  @is(a.string().required().min(3))
    title = 'New group'

  @is(a.string().required())
    urlMatcher = '*:\/\/*\/*'

  @nestedType(() => Replacer, an.object().required())
    titleReplace: Replacer = new Replacer()
}

@schema()
export class Config {
  @is(a.string().required().min(3))
    title = 'New config'

  @is(a.string().trim().default(''))
    before = ''

  @nestedArray(() => Group, an.array().default([]))
    groups: Group[] = []

  @is(a.string().trim().default(''))
    after = ''
}

@schema()
export class SaveData {
  @is(a.number().required())
    version = 1

  @nestedArray(() => Config, an.array().default([]))
    configs: Config[] = []
}

export const stringify = (config: SaveData): string => JSON.stringify(config)
export const parse = async (str: string): Promise<SaveData> => {
  let obj: SaveData
  try {
    obj = JSON.parse(str)
    Object.setPrototypeOf(obj, SaveData.prototype)
  }
  catch (err) {
    console.error('Error during parsing', err)
    return new SaveData()
  }

  return cast({
    object: obj,
  }) as any
}

export const useSaveData = () => useStorageLocal<SaveData>('url-sharer-config', new SaveData(), {
  serializer: {
    write: stringify,
    read: parse,
  },
})
