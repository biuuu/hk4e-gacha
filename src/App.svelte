<script>
	import { createGachaInfo } from './stores'
	import { afterUpdate, onMount } from 'svelte'
	import gachaWith from './gacha'
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	let id = '2ffa459718702872a52867fa0521e32b6843b0'
	let data
	let list = []

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
	
	const gacha = () => {
		list = gachaWith(id, data, 'to5')
	}

	const gacha10 = () => {
		list = gachaWith(id, data, 10)
	}

	const gacha1 = () => {
		list = gachaWith(id, data, 1)
	}

	const getData = async () => {
		const response = await fetch(`/data/raw/${id}-zh-cn.json`)
		data = await response.json()
	}

	const clear = () => {
		gachaInfo.resetAll()
		count.set(0)
	}

	const click = (key) => () => {
		const func = { gacha, gacha1, gacha10, clear }
		func[key]()
	}

	getData()

</script>


<button on:click={click('gacha')}>SSR</button>
<button on:click={click('gacha10')}>10</button>
<button on:click={click('gacha1')}>1</button>
<button on:click={click('clear')}>clear</button>
<div>
<span>本次：{$count} | 一共：{$total}抽(￥{($total * 648 / (8080 / 160)).toFixed(2)})</span>
{#if $gachaInfo.until5}
<span>距离保底：90 - {$gachaInfo.until5} = {90 - $gachaInfo.until5}</span>
{/if}
</div>
<div>5星：{$twCount5}({r5}%) | 5星UP：<span class={$twCount5Up === 7 ? 'red': ''}>{$twCount5Up}</span>({r5up}%)</div>
<div>4星：{$twCount4}({r4}%) | 4星UP：{$twCount4Up}({r4up}%)</div>
<div>3星：{$twCount3}({r3}%)</div>
<div class="stage">
	{#each list as item}
		<span class={`rank rank-${item.rank}`}> {item.item_name} </span>
	{/each}
</div>

<style>
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
.rank {
	color: #fff;
	padding: 0 5px;
	margin: 2px;
}
.rank-4 {
	background-color: purple;
}
.rank-5 {
	background-color: gold;
}
.rank-3 {
	background-color: rgb(101, 203, 250);
}
</style>