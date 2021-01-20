import { writable, derived } from 'svelte/store'
import { getLocalInfo, saveInfo, infoKeys } from './utils'

const gachaInfoMap = new Map()

function createGachaInfo(id) {
  if (gachaInfoMap.has(id)) return gachaInfoMap.get(id)
  const info = getLocalInfo(id)
  const infoCollection = {}
  const args = []
  infoKeys.forEach(key => {
    let count = writable(info[key])
    args.push(count)
    infoCollection[key] = count
  })

  const { subscribe } = derived(args, (list) => {
    let obj = {}
    infoKeys.forEach((key, idx) => {
      obj[key] = list[idx]
    })
    return obj
  })

	const store = {
    subscribe,
    increment: (key) => {
      infoCollection[key].update(n => n + 1)
      info[key] += 1
      saveInfo(id, info)
    },
    setMulti: (obj, mode) => {
      for (let key in obj) {
        if (infoKeys.includes(key)) {
          infoCollection[key].set(obj[key])
          info[key] = obj[key]
        }
      }
      if (mode !== 'skip') saveInfo(id, info)
    },
    reset: (key) => {
      infoCollection[key].set(0)
      info[key] = 0
      saveInfo(id, info)
    },
    resetAll: () => {
      infoKeys.forEach(key => {
        if (key === 'list') {
          infoCollection[key].set([])
          info[key] = []
        } else {
          infoCollection[key].set(0)
          info[key] = 0
        }
      })
      saveInfo(id, info)
    }
  }
  gachaInfoMap.set(id, store)
  return store
}

export { createGachaInfo }