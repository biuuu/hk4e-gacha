<script>
  import * as echarts from 'echarts/core'
  import { GridComponent } from 'echarts/components'
  import { LineChart } from 'echarts/charts'
  import { CanvasRenderer } from 'echarts/renderers'
  import { onMount } from 'svelte'
  import throttle from 'lodash/throttle'

  export let data = {}
  export let total = 0

  echarts.use(
    [GridComponent, LineChart, CanvasRenderer]
  )
  let myChart
  let chartDom
  let chartData

  $: {
    chartData = processData(data)
    updateChart()
  }

  const processData = () => {
    const keys = Object.keys(data).sort((a, b) => a - b)
    const values = []
    keys.forEach(key => {
      values.push(data[key])
    })
    return [keys, values]
  }

  const updateChart = throttle(() => {
    const option = {
        xAxis: {
            type: 'category',
            data: chartData[0]
        },
        yAxis: {
            type: 'value',
            axisLabel: {
              formatter: function (value) {
                return `${Math.round(value / total * 100)}%`
              }
            }

        },
        series: [{
            data: chartData[1],
            type: 'line'
        }]
    }
    myChart &&　myChart.setOption(option)
  }, 1000)

  onMount(() => {
    myChart = echarts.init(chartDom)
    updateChart()
  })
</script>

<div bind:this={chartDom} class="chart">

</div>

<style>
  .chart {
    width: 100%;
    height: 500px;
  }
</style>