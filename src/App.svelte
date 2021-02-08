<script>
	import { createGachaInfo } from './stores'
	import gachaWith from './gacha'
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import LineChart from './LineChart.svelte'

	let id = ''
	let data
	let info
	let infoCache = {}
	let list = []
	let type = '301'
	let idIndex = 0
	let mode = 0
	let ssrLimit = 3
	let types = [
		{ id: '301', text: '角色UP' },
		{ id: '200', text: '常驻' }
	]

	const formatNum = new Intl.NumberFormat('zh-CN', { notation: "standard" })

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
	$: count4c = $gachaInfo.count4c
	$: count5c = $gachaInfo.count5c
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

	const sleep = (ts) => {
		return new Promise(rev => {
			setTimeout(rev, ts)
		})
	}

	const gacha = async () => {
		list = await gachaWith(id, data, 'to5')
	}

	const gacha10 = async () => {
		list = await gachaWith(id, data, 10)
	}

	const gacha1 = async () => {
		list = await gachaWith(id, data, 1)
	}

	let limitMode = 'init'
	const gachaLimit10 = async () => {
		if (limitMode === 'init' || limitMode === 'stop') {
			clear()
			limitMode = 'running'
		} else if (limitMode === 'running') {
			limitMode = 'pause'
			return
		} else {
			limitMode = 'running'
		}
		let step = 1000
		let ssr = 0

		if (ssrLimit > 10) ssrLimit = 10
		else if (ssrLimit < 1) ssrLimit = 1

		while (ssr < ssrLimit && limitMode !== 'pause') {
			for (let i = 0; i < step; i++) {
				list = await gachaWith(id, data, 10, 'skip')
				ssr = 0
				list.forEach(item => {
					if (item.rank === '5') {
						ssr++
					}
				})
				if (ssr >= ssrLimit) {
					break
				}
			}
			await sleep(100)
		}
		if (limitMode === 'running') {
			limitMode = 'stop'
		}
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

	const changeMode = () => {
		if (mode === 1) {
			mode = 0
		} else {
			mode = 1
		}
	}

	const clear = () => {
		gachaInfo.resetAll()
		list = []
		count.set(0)
	}



</script>

<div class="content">
	<div class="area-btn">
		<div>
			{#if mode === 1}
			<select bind:value={type}>
				{#each types as item}
				<option value={item.id}>{item.text}</option>
				{/each}
			</select>
			{#if limitMode === 'running'}
			<button on:click={gachaLimit10}>暂停</button>
			{:else}
			<button on:click={gachaLimit10}>10抽</button>
			{/if}
			<input type=number bind:value={ssrLimit} min=1 max=10>
			<span>个SSR</span>
			{:else}
			<button on:click={gacha}>SSR</button>
			<button on:click={gacha10}>10</button>
			<button on:click={gacha1}>1</button>
			<button on:click={clear}>clear</button>
			<select bind:value={type}>
				{#each types as item}
				<option value={item.id}>{item.text}</option>
				{/each}
			</select>
			{/if}
		</div>
		<div>
			{#if mode === 1}
			<button on:click={changeMode}>普通模式</button>
			{:else}
			<button on:click={changeMode}>特殊模式</button>
			{/if}
		</div>
	</div>
	<div style="white-space: nowrap">
		<div>
			<span>本次：{$count} | 一共：{formatNum.format($total)}抽(￥{formatNum.format($total * 648 / (8080 / 160))})</span>
			{#if $gachaInfo.until5 && mode !==1}
			<span>距离保底：90 - {$gachaInfo.until5} = {90 - $gachaInfo.until5}</span>
			{/if}
		</div>
		<div>5星：{formatNum.format($twCount5)}({r5}%) | 5星UP：<span class={$twCount5Up === 7 ? 'red': ''}>{formatNum.format($twCount5Up)}</span>({r5up}%)</div>
		<div>4星：{formatNum.format($twCount4)}({r4}%) | 4星UP：{formatNum.format($twCount4Up)}({r4up}%)</div>
		<div>3星：{formatNum.format($twCount3)}({r3}%)</div>
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
	<LineChart data={count4c} total={$gachaInfo.count4} />
	<LineChart data={count5c} total={$gachaInfo.count5} />
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
.area-btn {
	display: flex;
	justify-content: space-between;
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