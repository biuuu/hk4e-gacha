import isPlainObject from 'lodash/isPlainObject'
import isNumber from 'lodash/isNumber'

const infoKeys = ['count3', 'count4', 'count5', 'until4', 'until5', 'count4Up', 'count5Up', 'isUp4', 'isUp5', 'list', 'count4c', 'count5c']

const validateInfo = (info) => {
  infoKeys.forEach(key => {
    if (key === 'list') {
      if (!Array.isArray(info[key])) {
        info[key] = []
      }
    } else if (key === 'count4c' || key === 'count5c') {
      if (!isPlainObject(info[key])) {
        info[key] = {}
      }
    } else if (!isNumber(info[key])) {
      info[key] = 0
    }
  })
}

const getLocalInfo = (id) => {
  try {
    let info = JSON.parse(localStorage.getItem('gachaInfo'))
    if (!isPlainObject(info)) info = {}
    if (!isPlainObject(info[id])) info[id] = {}
    validateInfo(info[id])
    return info[id]
  } catch (e) {}
}

const saveInfo = (id, data) => {
  try {
    let info = JSON.parse(localStorage.getItem('gachaInfo'))
    if (!isPlainObject(info)) info = {}
    info[id] = data
    localStorage.setItem('gachaInfo', JSON.stringify(info))
  } catch (e) {}
}

const randomItem = (arr) => {
  const idx = Math.floor(Math.random() * arr.length)
  return arr[idx]
}

export { randomItem, getLocalInfo, saveInfo, infoKeys }