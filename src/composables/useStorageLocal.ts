import { storage } from 'webextension-polyfill'
import type {
  MaybeRef,
  RemovableRef,
  StorageLikeAsync,
  UseStorageAsyncOptions,
} from '@vueuse/core'
import {
  useStorageAsync,
} from '@vueuse/core'

const storageLocal: StorageLikeAsync = {
  removeItem(key: string) {
    console.log('removeItem', key)
    return storage.local.remove(key)
  },

  setItem(key: string, value: string) {
    console.log('setItem', key, value)
    return storage.local.set({ [key]: value })
  },

  async getItem(key: string) {
    console.log('getItem', key, (await storage.local.get(key))[key])
    return (await storage.local.get(key))[key]
  },
}

export const useStorageLocal = <T>(
  key: string,
  initialValue: MaybeRef<T>,
  options?: UseStorageAsyncOptions<T>,
): RemovableRef<T> => useStorageAsync(key, initialValue, storageLocal, options)
