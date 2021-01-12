<script>
	import { createGachaInfo } from './stores'
	import gachaWith from './gacha'

	let id = '2ffa459718702872a52867fa0521e32b6843b0'
	let data
	let list = []
	$: gachaInfo = createGachaInfo(id)
	$: count = list.length
	$: total = $gachaInfo.count5 + $gachaInfo.count4 + $gachaInfo.count3
	$: r5 = ($gachaInfo.count5 / total * 100 || 0).toFixed(5)
	$: r5up = ($gachaInfo.count5Up / total * 100 || 0).toFixed(5)
	$: r4 = ($gachaInfo.count4 / total * 100 || 0).toFixed(5)
	$: r4up = ($gachaInfo.count4Up / total * 100 || 0).toFixed(5)
	$: r3 = ($gachaInfo.count3 / total * 100 || 0).toFixed(5)

	const gacha = () => {
		list = gachaWith(id, data, 'to5')
	}

	const getData = async () => {
		const response = await fetch(`/data/raw/${id}-zh-cn.json`)
		data = await response.json()
	}

	getData()

</script>


<button on:click={gacha}>click</button><span>本次：{count} | 一共：{total}(￥{total * 13})</span>
<div>5星：{$gachaInfo.count5}({r5}%) | 5星UP：{$gachaInfo.count5Up}({r5up}%)</div>
<div>4星：{$gachaInfo.count4}({r4}%) | 4星UP：{$gachaInfo.count4Up}({r4up}%)</div>
<div>3星：{$gachaInfo.count3}({r3}%)</div>
<div class="stage">
	{#each list as item}
		<span class={`rank rank-${item.rank}`}> {item.item_name} </span>
	{/each}
</div>

<style>
.stage {
	word-break: keep-all;
	margin-top: 8px;
}
button {
	margin-right: 8px;
	cursor: pointer;
}
.rank {
	color: #fff;
	padding: 0 5px;
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