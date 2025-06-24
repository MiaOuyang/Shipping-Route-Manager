<template>
    <div class="chart-container">
        <el-row style="margin-bottom: 20px;" :gutter="20">
            <el-col :span="6">
                <div class="flex-box">
                    <span style="width: 50px;">港口：</span>
                    <el-select filterable v-model="harbor" @change="harborChange" clearable placeholder="请选择">
                        <el-option v-for="item in harborList" :key="item" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </div>
            </el-col>
        </el-row>
        <div ref="chartRef" class="chart" id="main"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
let chartInstance = null;
const harborList = ref([]);
const series = ref([]);
const harbor = ref("")
const props = defineProps({
    data: Array,
    title: String,
})
watch(() => props, (newVal, oldVal) => {
    console.log(newVal, oldVal, '122');
    harborList.value = props.data.map(item => item.harbor);
    console.log(props.data, props.title, '123');
    series.value = [];
    if (chartInstance) {
        chartInstance.clear();
        initChart();
    }
}, { immediate: true, deep: true });


// 图表 DOM 引用
const chartRef = ref(null);
// 初始化图表
const initChart = () => {
    if (!chartRef.value) return;
    chartInstance = echarts.init(chartRef.value);
    updateChart();
};
const harborChange = () => {
    if (chartInstance) {
        chartInstance.clear();
        initChart();
    }
}
const updateChart = () => {
    if (harbor.value) {
        let base = +new Date(2019, 9, 3);
        let oneDay = 24 * 3600 * 1000;
        let data = [];
        for (let i = 1; i < 200; i++) {
            let now = new Date((base += oneDay));
            data.push([+now, (Math.random() * 100).toFixed(1)]);
        }
        series.value = [{
            name: harbor.value,
            type: 'line',
            data: data
        }]
    }
    else {
        for (let j = 0; j < harborList.value.length; j++) {
            let obj = {
                name: harborList.value[j],
                type: 'line',
                data: []
            }
            let base = +new Date(2019, 9, 3);
            let oneDay = 24 * 3600 * 1000;
            for (let i = 1; i < 200; i++) {
                let now = new Date((base += oneDay));
                obj.data.push([+now, (Math.random() * 100).toFixed(1)]);
            }
            series.value.push(obj);
        }
    }
    const option = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: props.title
        },
        // toolbox: {
        //     feature: {
        //         dataZoom: {
        //             yAxisIndex: 'none'
        //         },
        //         restore: {},
        //         saveAsImage: {}
        //     }
        // },
        xAxis: {
            type: 'time',
            interval: 7 * 24 * 3600 * 1000,
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 10
            },
            {
                start: 0,
                end: 50
            }
        ],
        series: series.value
    };
    if (chartInstance) {
        chartInstance.setOption(option);
    }
}

// 响应窗口变化
const handleResize = () => {
    chartInstance?.resize();
};
// 生命周期
onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
});

</script>

<style scoped>
.chart-container {
    width: 100%;

    margin: 40px auto;
    background-color: #fff;
}

.controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.chart {
    width: 100%;
    height: 400px;
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 10px;
}

input[type="range"] {
    flex-grow: 1;
}

button {
    padding: 5px 10px;
    background: #5470C6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.flex-box {
    display: flex;
    align-items: center;
}

.flex-box span {
    width: 80px;
}

.w220 {
    width: 300px;
}

.el-select,
.el-date-picker,
.el-input {
    flex: 1 !important;
}

/deep/ .flex-box .el-input {
    flex: 1 !important;
}
</style>