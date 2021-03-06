import { createGachaInfo } from './stores'
import { get } from 'svelte/store'
import { infoKeys, randomItem } from './utils'

const rate5 = 0.006
const rate5p = 0.053
const rate4 = 0.051
const rate4p = 0.51

const rate301 = {
  rate5: 0.006,
  rate5p: 0.053,
  rate4: 0.06,
  rate4p: 0.6
}

const rate302 = {
  rate5: 0.007,
  rate5p: 0.0431,
  rate4: 0.06,
  rate4p: 0.4535
}

const incrColet = (data, count) => {
  if (!data[count]) {
    data[count] = 1
  } else {
    data[count] += 1
  }
}
const decideRarity = (info) => {
  let { count3, count4, count5, until4, until5, count4c, count5c } = info
  const { rate5, rate5p, rate4, rate4p } = rate301
  until4++
  until5++
  let type = 3
  const result = Math.random()
  const rate5c = until5 > 73 ? rate5 + rate5p * (until5 - 73) : rate5
  const rate4c = until4 > 8 ? rate4p + rate5c : rate4 + rate5c
  if (until5 >= 90 || result < rate5c) {
    count5++
    incrColet(count5c, until5)
    until5 = 0
    type = 5
  } else if (until4 >= 10 || result < rate4c) {
    count4++
    incrColet(count4c, until4)
    until4 = 0
    type = 4
  } else {
    count3++
    type = 3
  }
  return [type, Object.assign({}, info, { count3, count4, count5, until4, until5, count4c, count5c })]
}

const decideRarityW = (info) => {
  let { count3, count4, count5, until4, until5, count4c, count5c } = info
  const { rate5, rate5p, rate4, rate4p } = rate302
  until4++
  until5++
  let type = 3
  const result = Math.random()
  const rate5c = until5 > 62 ? rate5 + rate5p * (until5 - 62) : rate5
  const rate4c = until4 > 7 ? rate4p * (until4 - 7) + rate5c : rate4 + rate5c
  if (until5 >= 80 || result < rate5c) {
    count5++
    incrColet(count5c, until5)
    until5 = 0
    type = 5
  } else if (until4 >= 10 || result < rate4c) {
    count4++
    incrColet(count4c, until4)
    until4 = 0
    type = 4
  } else {
    count3++
    type = 3
  }
  return [type, Object.assign({}, info, { count3, count4, count5, until4, until5, count4c, count5c })]
}

const recordCardList = (item, { list }) => {
  if (item.rank <= 3) return
  const savedItem = list.find(obj => obj.item_id === item.item_id)
  if (!savedItem) {
    list.push(Object.assign({
      count: 1
    }, item))
  } else {
    savedItem.count++
  }
  list.sort((a, b) => b.count - a.count).sort((a, b) => b.rank - a.rank).sort((a, b) => {
    if (a.item_type === '武器' && b.item_type === '角色' && a.rank === b.rank) return 1
    if (a.item_type === b.item_type) return 0
    if (b.item_type === '武器' && a.item_type === '角色' && a.rank === b.rank) return -1
  })
}

const gacha301 = (type, data, info) => {
  let item
  let { isUp4, isUp5, count4Up, count5Up } = info
  if (type === 5) {
    if (isUp5 || Math.random() < 0.5) {
      isUp5 = 0
      count5Up++
      item = randomItem(data.r5up)
    } else {
      isUp5 = 1
      item = randomItem(data.r5)
    }
  } else if (type === 4) {
    if (isUp4 || Math.random() < 0.5) {
      isUp4 = 0
      count4Up++
      item = randomItem(data.r4up)
    } else {
      isUp4 = 1
      item = randomItem(data.r4)
    }
  } else {
    item = randomItem(data.r3)
  }
  return [item, Object.assign({}, info, { isUp4, isUp5, count4Up, count5Up })]
}

const gacha302 = (type, data, info) => {
  let item
  let { isUp4, isUp5, count4Up, count5Up } = info
  if (type === 5) {
    if (isUp5 || Math.random() < 0.75) {
      isUp5 = 0
      count5Up++
      item = randomItem(data.r5up)
    } else {
      isUp5 = 1
      item = randomItem(data.r5)
    }
  } else if (type === 4) {
    if (isUp4 || Math.random() < 0.75) {
      isUp4 = 0
      count4Up++
      item = randomItem(data.r4up)
    } else {
      isUp4 = 1
      item = randomItem(data.r4)
    }
  } else {
    item = randomItem(data.r3)
  }
  return [item, Object.assign({}, info, { isUp4, isUp5, count4Up, count5Up })]
}

const gacha200 = (type, data, info) => {
  let item
  if (type === 5) {
    item = randomItem(data.r5)
  } else if (type === 4) {
    item = randomItem(data.r4)
  } else {
    item = randomItem(data.r3)
  }
  return [item, info]
}

const compareInfo = (newInfo, info) => {
  const obj = {}
  infoKeys.forEach(key => {
    if (newInfo[key] !== info[key] || key === 'list') {
      obj[key] = newInfo[key]
    }
  })
  return obj
}

const detectGachType = async (info, data, times = 1) => {
  let result = []
  let infoTmp = info
  let n = 0
  let got5 = false

  while (times === 'to5' ? !got5 : n < times) {
    n++
    const [type, infoTmp] = data.type === '302' ? decideRarityW(info) : decideRarity(info)
    if (type === 5) {
      got5 = true
    }
    let gachaResult
    if (data.type === '301') {
      gachaResult = gacha301(type, data, infoTmp)
    } else if (data.type === '200') {
      gachaResult = gacha200(type, data, infoTmp)
    } else if (data.type === '302') {
      gachaResult = gacha302(type, data, infoTmp)
    }
    let [item, newInfo] = gachaResult
    info = newInfo
    item = Object.assign({}, item)
    result.push(item)
    recordCardList(item, info)
  }


  const newInfo = compareInfo(info, infoTmp)
  return [result, newInfo]
}

const preData = (data) => {
  let obj = { type: data.gacha_type }
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

const gachaWith = async (id, data, times = 1, mode) => {
  const store = createGachaInfo(id)
  let info = get(store)
  let obj = preData(data)
  const [result, newInfo] = await detectGachType(info, obj, times)
  store.setMulti(newInfo, mode)
  return result
}

export default gachaWith