<template>
  <div ref="chartRef" :class="className" :style="{ height: height, width: width }" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
// import 'echarts/theme/macarons'

const animationDuration = 3000

interface Props {
  className?: string
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: 'chart',
  width: '100%',
  height: '300px'
})

const chartRef = ref<HTMLElement>()
const chart = ref<echarts.ECharts>()

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

  chart.value.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    radar: {
      radius: '66%',
      center: ['50%', '42%'],
      splitNumber: 8,
      indicator: [
        { name: 'Sales', max: 10000 },
        { name: 'Administration', max: 20000 },
        { name: 'Information Techology', max: 20000 },
        { name: 'Customer Support', max: 20000 },
        { name: 'Development', max: 20000 },
        { name: 'Marketing', max: 20000 }
      ]
    },
    legend: {
      left: 'center',
      bottom: '10',
      data: ['Allocated Budget', 'Expected Spending', 'Actual Spending']
    },
    series: [
      {
        type: 'radar',
        symbolSize: 0,
        areaStyle: {
          shadowBlur: 13,
          shadowColor: 'rgba(0,0,0,.2)',
          shadowOffsetX: 0,
          shadowOffsetY: 10,
          opacity: 1
        },
        data: [
          {
            value: [5000, 7000, 12000, 11000, 15000, 14000],
            name: 'Allocated Budget'
          },
          {
            value: [4000, 9000, 15000, 15000, 13000, 11000],
            name: 'Expected Spending'
          },
          {
            value: [5500, 11000, 12000, 15000, 12000, 12000],
            name: 'Actual Spending'
          }
        ],
        animationDuration: animationDuration
      }
    ]
  })
}
</script>
