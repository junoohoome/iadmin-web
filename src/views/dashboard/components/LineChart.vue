<template>
  <div ref="chartRef" :class="className" :style="{ height: height, width: width }" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
// import 'echarts/theme/macarons' // echarts theme

interface Props {
  className?: string
  width?: string
  height?: string
  autoResize?: boolean
  chartData: {
    expectedData: number[]
    actualData: number[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  className: 'chart',
  width: '100%',
  height: '350px',
  autoResize: true
})

const chartRef = ref<HTMLElement>()
const chart = ref<echarts.ECharts>()

watch(
  () => props.chartData,
  (val) => {
    setOptions(val)
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onBeforeUnmount(() => {
  if (!chart.value) {
    return
  }
  chart.value.dispose()
  chart.value = undefined
})

function initChart() {
  if (!chartRef.value) return
  chart.value = echarts.init(chartRef.value)
  setOptions(props.chartData)
}

function setOptions({ expectedData, actualData } = props.chartData) {
  if (!chart.value || !expectedData || !actualData) return

  chart.value.setOption({
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisTick: {
        show: false
      }
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 20,
      top: 30,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      padding: [5, 10]
    },
    yAxis: {
      axisTick: {
        show: false
      }
    },
    legend: {
      data: ['expected', 'actual']
    },
    series: [
      {
        name: 'expected',
        itemStyle: {
          color: '#ff005a'
        },
        lineStyle: {
          color: '#ff005a',
          width: 2
        },
        smooth: true,
        type: 'line',
        data: expectedData,
        animationDuration: 2800,
        animationEasing: 'cubicInOut'
      },
      {
        name: 'actual',
        smooth: true,
        type: 'line',
        itemStyle: {
          color: '#3888fa'
        },
        lineStyle: {
          color: '#3888fa',
          width: 2
        },
        areaStyle: {
          color: '#f3f8ff'
        },
        data: actualData,
        animationDuration: 2800,
        animationEasing: 'quadraticOut'
      }
    ]
  })
}
</script>
