<script>
	import { createGachaInfo } from './stores'
	import gachaWith from './gacha'

	let id = '8b5ca18f79ee64a0cd71826c24a0c0808ac813'
	let data
	let list = []
	$: gachaInfo = createGachaInfo(id)
	$: count = list.length
	$: r5 = $gachaInfo.count5 / ($gachaInfo.count5 + $gachaInfo.count4 + $gachaInfo.count3) * 100
	$: r4 = $gachaInfo.count4 / ($gachaInfo.count5 + $gachaInfo.count4 + $gachaInfo.count3) * 100
	$: r3 = $gachaInfo.count3 / ($gachaInfo.count5 + $gachaInfo.count4 + $gachaInfo.count3) * 100

	const gacha = () => {
		list = gachaWith(id, data, 'to5')
	}

	const getData = async () => {
		const response = await fetch(`/data/raw/${id}-zh-cn.json`)
		data = await response.json()
	}

	getData()

</script>


<button on:click={gacha}>click</button>
<span>{count}</span>
<div>5星：{r5}%</div>
<div>4星：{r4}%</div>
<div>3星：{r3}%</div>
<div>
	{#each list as item}
		<span class={`rank rank-${item.rank}`}> {item.item_name} </span>
	{/each}
</div>

<style>
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