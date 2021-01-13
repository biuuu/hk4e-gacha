<script>
	import { createGachaInfo } from './stores'
	import gachaWith from './gacha'
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	let id = ''
	let data
	let info
	let infoCache = {}
	let list = []
	let type = '301'
	let idIndex = 0
	let types = [
		{ id: '301', text: '角色UP' },
		{ id: '200', text: '常驻' }
	]

	const initCount = (val) => tweened(val, {
		duration: 400,
		easing: cubicOut,
		interpolate: (a, b) => t => Math.round(a+ (b - a) * t)
	})

	const count = initCount(0)
	const total = initCount(0)
	const twCount3 = initCount(0)
	const twCount4 = initCount(0)
	const twCount5 = initCount(0)
	const twCount4Up = initCount(0)
	const twCount5Up = initCount(0)

	$: gachaInfo = createGachaInfo(id)
	$: id = info && info.data[type][idIndex].id
	$: recordList = $gachaInfo.list
	$: count.set(list.length)
	$: total.set($gachaInfo.count5 + $gachaInfo.count4 + $gachaInfo.count3)
	$: staticTotal = $gachaInfo.count5 + $gachaInfo.count4 + $gachaInfo.count3
	$: r5 = ($gachaInfo.count5 / staticTotal * 100 || 0).toFixed(2)
	$: r5up = ($gachaInfo.count5Up / staticTotal * 100 || 0).toFixed(2)
	$: r4 = ($gachaInfo.count4 / staticTotal * 100 || 0).toFixed(2)
	$: r4up = ($gachaInfo.count4Up / staticTotal * 100 || 0).toFixed(2)
	$: r3 = ($gachaInfo.count3 / staticTotal * 100 || 0).toFixed(2)
	$: twCount3.set($gachaInfo.count3)
	$: twCount4.set($gachaInfo.count4)
	$: twCount5.set($gachaInfo.count5)
	$: twCount4Up.set($gachaInfo.count4Up)
	$: twCount5Up.set($gachaInfo.count5Up)
	$: if (type) {
		getData()
	}

	const gacha = () => {
		list = gachaWith(id, data, 'to5')
	}

	const gacha10 = () => {
		list = gachaWith(id, data, 10)
	}

	const gacha1 = () => {
		list = gachaWith(id, data, 1)
	}

	const getInfo = async () => {
		if (info) return
		const response = await fetch(`/data/info.json`)
		info = await response.json()
	}

	const getData = async () => {
		await getInfo()
		setTimeout(async () => {
			if (!id) return
			if (infoCache[id]) data = infoCache[id]
			const response = await fetch(`/data/raw/${id}-zh-cn.json`)
			data = await response.json()
			infoCache[id] = data
		})
	}

	const clear = () => {
		gachaInfo.resetAll()
		list = []
		count.set(0)
	}

</script>

<div class="content">
<button on:click={gacha}>SSR</button>
<button on:click={gacha10}>10</button>
<button on:click={gacha1}>1</button>
<button on:click={clear}>clear</button>
<select bind:value={type}>
	{#each types as item}
	<option value={item.id}>{item.text}</option>
	{/each}
</select>
<div>
	<span>本次：{$count} | 一共：{$total}抽(￥{($total * 648 / (8080 / 160)).toFixed(2)})</span>
	{#if $gachaInfo.until5}
	<span>距离保底：90 - {$gachaInfo.until5} = {90 - $gachaInfo.until5}</span>
	{/if}
</div>
<div>5星：{$twCount5}({r5}%) | 5星UP：<span class={$twCount5Up === 7 ? 'red': ''}>{$twCount5Up}</span>({r5up}%)</div>
<div>4星：{$twCount4}({r4}%) | 4星UP：{$twCount4Up}({r4up}%)</div>
<div>3星：{$twCount3}({r3}%)</div>
<div class="count-box">
	{#each recordList as item}
	<div class="{item.item_type === '武器' ? 'item-w': ''} rank rank-{item.rank}"><span>{item.item_name}</span><span class="no">{item.count}</span></div>
	{/each}
</div>
<div class="stage">
	{#each list as item}
		<span class={`rank rank-${item.rank} ${item.item_type === '武器' ? 'item-w': ''}`}> {item.item_name} </span>
	{/each}
</div>
</div>

<style>
.content {
	max-width: 1000px;
}
.stage {
	word-break: keep-all;
	margin-top: 8px;
	display: flex;
	flex-wrap: wrap;
}
.red {
	color: red;
}
button {
	margin-right: 8px;
	cursor: pointer;
	min-width: 62px;
}
div {
	margin: 2px 0;
}
.count-box {
	display: flex;
	flex-wrap: wrap;
	font-size: 12px;
}
.no {
	padding-left: 4px;
}
.rank {
	color: #fff;
	padding: 2px 5px;
	margin: 2px;
	/* writing-mode: vertical-rl;
	text-orientation: upright; */
}
.rank-4 {
	background-color: #9C27B0;
}
.rank-5 {
	background-color: #FF5722;
}
.rank-3 {
	background-color: #00BCD4;
}
.rank-4.item-w {
	background-color: #673AB7;
}
.rank-5.item-w {
	background-color: #FF9800;
}
</style>