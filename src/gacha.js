import { createGachaInfo } from './stores'
import { get } from 'svelte/store'
import { infoKeys, randomItem } from './utils'

const rate5 = 0.006
const rate5p = 0.053
const rate4 = 0.051
const rate4p = 0.51

const decideRarity = (info) => {
  let { count3, count4, count5, until4, until5 } = info
  until4++
  until5++
  let type = 3
  const result = Math.random()
  const rate5c = until5 > 73 ? rate5 + rate5p * (until5 - 73) : rate5
  const rate4c = until4 > 8 ? rate4p + rate5c : rate4 + rate5c
  if (until5 >= 90 || result < rate5c) {
    count5++
    until5 = 0
    type = 5
  } else if (until4 >= 10 || result < rate4c) {
    count4++
    until4 = 0
    type = 4
  } else {
    count3++
    type = 3
  }
  return [type, Object.assign({}, info, { count3, count4, count5, until4, until5 })]
}

const gacha301 = (type, data, info) => {
  let item
  let { isUp4, isUp5, count4Up, count5Up } = info
  if (type === 5) {
    if (!isUp5 || Math.random() < 0.5) {
      isUp5 = 1
      count5Up++
      item = randomItem(data.r5up)
    } else {
      isUp5 = 0
      item = randomItem(data.r5)
    }
  } else if (type === 4) {
    if (!isUp4 || Math.random() < 0.5) {
      isUp4 = 1
      count4Up++
      item = randomItem(data.r4up)
    } else {
      isUp4 = 0
      item = randomItem(data.r4)
    }
  } else {
    item = randomItem(data.r3)
  }
  return [item, Object.assign({}, info, { isUp4, isUp5, count4Up, count5Up })]
}

const compareInfo = (newInfo, info) => {
  const obj = {}
  infoKeys.forEach(key => {
    if (newInfo[key] !== info[key]) {
      obj[key] = newInfo[key]
    }
  })
  return obj
}

const detectGachType = (info, data, times = 1) => {
  const result = []
  let infoTmp = info
  let n = 0
  let got5 = false
  while (times === 'to5' ? !got5 : n < times) {
    n++
    const [type, infoTmp] = decideRarity(info)
    if (type === 5) {
      got5 = true
    }
    const [item, newInfo] = gacha301(type, data, infoTmp)
    info = newInfo
    result.push(item)
  }
  const newInfo = compareInfo(info, infoTmp)
  return [result, newInfo]
}

const preData = (data) => {
  let obj = {}
  obj.r3 = data.r3_prob_list
  obj.r4up = data.r4_up_items.map(item => {
    item.rank = '4'
    return item
  })
  let r4List = []
  data.r4_prob_list.forEach(item => {
    if (!obj.r4up.find(r4 => r4.item_id === item.item_id)) {
      r4List.push(item)
    }
  })
  obj.r4 = r4List
  obj.r5up = data.r5_up_items.map(item => {
    item.rank = '5'
    return item
  })
  let r5List = []
  data.r5_prob_list.forEach(item => {
    if (!obj.r5up.find(r5 => r5.item_id === item.item_id)) {
      r5List.push(item)
    }
  })
  obj.r5 = r5List
  return obj
}

const gachaWith = (id, data, times = 1) => {
  const store = createGachaInfo(id)
  let info = get(store)
  let obj = preData(data)
  const [result, newInfo] = detectGachType(info, obj, times)
  store.setMulti(newInfo)
  return result
}

export default gachaWith