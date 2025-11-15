<template>
    <div class="data-module infrastructure-module">
        <div class="module-header">
            <div class="module-title">基础设施</div>
        </div>
        <div class="module-content">
            <div class="base-info">
                <!-- 气体类型切换 -->
                <div class="gas-type-tabs">
                    <div class="tab-item" :class="{ active: activeGasType === 'natural' }"
                        @click="activeGasType = 'natural'">
                        <span class="gradient-text">天然气</span>
                    </div>
                    <div class="tab-item" :class="{ active: activeGasType === 'liquefied' }"
                        @click="activeGasType = 'liquefied'">
                        <span class="gradient-text">液化气</span>
                    </div>
                </div>

                <!-- 统计数据卡片 -->
                <div class="statistics-cards">
                    <div class="stat-card" v-for="stat in currentStatistics" :key="stat.key">
                        <div class="stat-label">{{ stat.label }}</div>
                        <div class="stat-value">
                            <span class="number gradient-text">{{ stat.value }}</span>
                            <span class="unit">{{ stat.unit }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table">
                <!-- 企业列表表头 -->
                <div class="enterprise-header">
                    <div class="header-col col-name">企业名称</div>
                    <div class="header-col col-station">供应站(座)</div>
                    <div class="header-col col-cylinder">气瓶(个)</div>
                    <div class="header-col col-vehicle">运送车(个)</div>
                    <div class="header-col col-user">用户(户)</div>
                    <div class="header-col col-monitor">监测点(个)</div>
                </div>

                <!-- 企业列表 -->
                <div class="enterprise-list">
                    <div class="enterprise-row" v-for="enterprise in currentEnterprises" :key="enterprise.id">
                        <div class="row-col col-name">{{ enterprise.name }}</div>
                        <div class="row-col col-station">{{ enterprise.stations }}</div>
                        <div class="row-col col-cylinder">{{ enterprise.cylinders }}</div>
                        <div class="row-col col-vehicle">{{ enterprise.vehicles }}</div>
                        <div class="row-col col-user">{{ enterprise.users }}</div>
                        <div class="row-col col-monitor">{{ enterprise.monitors }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 当前选中的气体类型
const activeGasType = ref('liquefied'); // 默认液化气

// 天然气统计数据
const naturalGasStats = ref([
    { key: 'enterprises', label: '企业', value: 6, unit: '家' },
    { key: 'stations', label: '供应站', value: 15, unit: '座' },
    { key: 'cylinders', label: '气瓶', value: 1120, unit: '个' },
    { key: 'vehicles', label: '运送车', value: 980.5, unit: 'km' },
    { key: 'users', label: '用户', value: 2450, unit: '户' },
    { key: 'monitors', label: '监测点', value: 145, unit: '个' },
]);

// 液化气统计数据
const liquefiedGasStats = ref([
    { key: 'enterprises', label: '企业', value: 4, unit: '家' },
    { key: 'stations', label: '供应站', value: 13, unit: '座' },
    { key: 'cylinders', label: '气瓶', value: 999, unit: '个' },
    { key: 'vehicles', label: '运送车', value: 876.5, unit: 'km' },
    { key: 'users', label: '用户', value: 2199, unit: '户' },
    { key: 'monitors', label: '监测点', value: 123, unit: '个' },
]);

// 天然气企业数据
const naturalGasEnterprises = ref([
    { id: 1, name: '阳新县华川天然气', stations: 34, cylinders: 43, vehicles: 23, users: 23, monitors: 21 },
    { id: 2, name: '阳新县华瑞燃气服务有限公司', stations: 3, cylinders: 7, vehicles: 56, users: 56, monitors: 32 },
    { id: 3, name: '阳新县旺旺燃气服务公司', stations: 5, cylinders: 9, vehicles: 78, users: 34, monitors: 15 },
    { id: 4, name: '阳新陶阳燃气站', stations: 7, cylinders: 32, vehicles: 12, users: 78, monitors: 15 },
]);

// 液化气企业数据
const liquefiedGasEnterprises = ref([
    { id: 4, name: '阳新陶阳燃气站', stations: 7, cylinders: 32, vehicles: 12, users: 78, monitors: 15 },
    { id: 1, name: '阳新县华川天然气', stations: 34, cylinders: 43, vehicles: 23, users: 23, monitors: 21 },
    { id: 5, name: '阳新陶阳燃气站', stations: 7, cylinders: 32, vehicles: 12, users: 78, monitors: 15 },
    { id: 2, name: '阳新县华瑞燃气服务有限公司', stations: 3, cylinders: 7, vehicles: 56, users: 56, monitors: 32 },
    { id: 6, name: '阳新陶阳燃气站', stations: 7, cylinders: 32, vehicles: 12, users: 78, monitors: 15 },
    { id: 3, name: '阳新县旺旺燃气服务公司', stations: 5, cylinders: 9, vehicles: 78, users: 34, monitors: 15 },
    { id: 7, name: '阳新陶阳燃气站', stations: 7, cylinders: 32, vehicles: 12, users: 78, monitors: 15 },
]);

// 当前显示的统计数据
const currentStatistics = computed(() => {
    return activeGasType.value === 'natural' ? naturalGasStats.value : liquefiedGasStats.value;
});

// 当前显示的企业列表
const currentEnterprises = computed(() => {
    return activeGasType.value === 'natural' ? naturalGasEnterprises.value : liquefiedGasEnterprises.value;
});
</script>

<style lang="scss" scoped>
.infrastructure-module {
    .module-content {
        padding: 20px 30px;
    }

    .base-info {
        display: flex;
    }

    // 气体类型切换标签
    .gas-type-tabs {
        display: flex;
        flex-direction: column;
        gap: 15px;

        .tab-item {
            width: 160px;
            height: 60px;
            background-image: url('@/assets/img/gasModule/tab.webp');
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
            color: #9ec3e8;
            cursor: pointer;
            transition: all 0.3s ease;

            .gradient-text {
                font-family: YouSheBiaoTiHei;
                font-size: 36px;
                line-height: 47px;
                background: linear-gradient(90deg, #FFFFFF 18%, #10ADC0 100%);
            }

            &.active {
                background-image: url('@/assets/img/gasModule/tab_active.webp');

                .gradient-text {
                    background: linear-gradient(0deg, #3FFEFD 0%, #FFF407 100%);
                }
            }
        }
    }

    // 统计数据卡片
    .statistics-cards {
        display: flex;
        justify-content: space-between;
        margin-bottom: 25px;
        flex-direction: row;

        .stat-card {
            flex: 1;
            background: linear-gradient(135deg, rgba(0, 150, 255, 0.08) 0%, rgba(0, 100, 200, 0.05) 100%);
            border: 1px solid rgba(22, 119, 255, 0.25);
            border-radius: 6px;
            // padding: 15px 12px;
            text-align: center;
            width: 95px;
            display: flex;
            flex-direction: column;
            align-items: center;

            .stat-label {
                text-align: center;
                line-height: 60px;
                width: 100%;
                height: 60px;
                font-family: SourceHanSansSC, SourceHanSansSC;
                font-weight: bold;
                font-size: 20px;
                color: #E4F3FF;
                font-style: normal;
                background: linear-gradient(90deg, rgba(30, 94, 88, 0.5) 0%, rgba(10, 14, 15, 0.5) 100%);
            }

            .stat-value {
                display: flex;
                align-items: baseline;
                justify-content: center;
                flex-direction: column;
                gap: 4px;

                .number {
                    font-family: YouSheBiaoTiHei;
                    font-size: 24px;
                    color: #FFFFFF;
                    line-height: 31px;
                    text-align: center;
                    font-style: normal;
                    background: linear-gradient(90deg, #FFFFFF 0%, #10ADC0 100%);
                }

                .unit {
                    font-family: SourceHanSansSC, SourceHanSansSC;
                    font-size: 20px;
                    color: #9ec3e8;
                }
            }
        }
    }

    .table {
        width: 100%;
    }

    // 企业列表表头
    .enterprise-header {
        display: flex;
        align-items: center;
        height: 60px;
        background: linear-gradient(90deg, rgba(22, 119, 255, 0.2) 0%, rgba(22, 119, 255, 0.1) 100%);
        border: 1px solid rgba(22, 119, 255, 0.3);
        border-radius: 6px;
        margin-bottom: 12px;

        .header-col {
            font-family: SourceHanSansSC, SourceHanSansSC;
            font-weight: bold;
            font-size: 20px;
            color: #E4F3FF;
            line-height: 29px;
            text-align: left;
            font-style: normal;

            &.col-name {
                flex: 2;
                text-align: left;
                padding-left: 10px;
                width: 200px;
            }

            &.col-station,
            &.col-cylinder,
            &.col-vehicle,
            &.col-user,
            &.col-monitor {
                flex: 1;
            }
        }
    }

    // 企业列表
    .enterprise-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        height: 232px;
        overflow-y: auto;
        .enterprise-row {
            display: flex;
            align-items: center;
            height: 56px;
            background: linear-gradient(90deg, rgba(0, 150, 255, 0.06) 0%, rgba(0, 100, 200, 0.03) 100%);
            border: 1px solid rgba(22, 119, 255, 0.15);
            border-radius: 4px;
            transition: all 0.3s ease;

            &:hover {
                background: linear-gradient(90deg, rgba(0, 150, 255, 0.12) 0%, rgba(0, 100, 200, 0.08) 100%);
                border-color: rgba(22, 119, 255, 0.3);
            }

            .row-col {
                font-family: SourceHanSansSC, SourceHanSansSC;
                font-weight: 400;
                color: #e4f3ff;
                text-align: center;
                width: 200px;
                font-weight: 400;
                font-size: 20px;
                line-height: 58px;
                text-align: left;
                font-style: normal;
                padding-left: 10px;

                &.col-name {
                    flex: 2;
                    text-align: left;
                    color: #ffffff;
                    width: 200px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                &.col-station,
                &.col-cylinder,
                &.col-vehicle,
                &.col-user,
                &.col-monitor {
                    flex: 1;
                }
            }
        }
    }
}
</style>
