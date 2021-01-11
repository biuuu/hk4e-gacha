const axios = require('axios')
const fs = require('fs-extra')

const info = fs.readJsonSync('./data/info.json')
const timestamp = Math.floor(Date.now() / 1000)

const getIds = async () => {
  const str = await fs.readFile('./data/id.txt', 'utf8')
  const ids = []
  str.split('\n').forEach(id => {
    const _id = id.trim()
    if (_id && !info.id.includes(_id)) {
      ids.push(_id)
    }
  })
  return ids
}

const saveData = async (data, id, lang) => {
  let list = info.data[data.gacha_type]
  if (!list) {
    list = []
    info.data[data.gacha_type] = list
  }
  let obj = list.find(item => item.id === id)
  if (!obj) {
    obj = { id, title: {}, r5up: data.r5_up_items }
    list.unshift(obj)
  }
  obj.title[lang] = data.title
  await fs.outputJSON(`./data/raw/${id}-${lang}.json`, data)
  await fs.outputJson('./data/info.json', info, { spaces: 2 })
}

const getRawData = async (ids) => {
  for (let id of ids) {
    if (info.id.includes(id)) continue
    for (let lang of info.lang) {
      let url = `https://webstatic.mihoyo.com/hk4e/gacha_info/cn_gf01/${id}/${lang}.json?ts=${timestamp}`
      console.log(url)
      const res = await axios.get(url)
      await saveData(res.data, id, lang)
    }
    info.id.unshift(id)
    await fs.outputJson('./data/info.json', info, { spaces: 2 })
  }
}

const main = async () => {
  const ids = await  getIds()
  await getRawData(ids)
}

main()