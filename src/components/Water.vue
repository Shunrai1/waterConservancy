<template>
  <div class="top">
    <el-radio-group v-model="radio">
      <el-radio :label="3">水库</el-radio>
      <el-radio :label="6">河流</el-radio>
    </el-radio-group>
    <el-input
      class="input1"
      v-model="waterSearch"
      placeholder="搜索"
      :prefix-icon="Search"
      @keyup.enter.self="handleSearch($event)"
    />
  </div>
  <!-- 水库表 -->
  <el-table :data="tableData" border style="width: 100%; margin: 10px 0">
    <el-table-column type="index" label="序列" width="60"></el-table-column>
    <el-table-column prop="stname" label="站名" width="150" />
    <el-table-column prop="city" label="所属地市" width="150" />
    <el-table-column prop="substation" label="所属分局" width="180" />
    <el-table-column prop="address" label="具体位置" width="180" />
    <el-table-column prop="rsvrrTM[0].tm" label="时间" width="180" />
    <el-table-column prop="rsvrrTM[0].rz" label="水位/m" width="180" />
    <el-table-column prop="rsvrrTM[0].inq" label="流量(m3/s)" width="180" />
    <el-table-column prop="rsvrrTM[0].otq" label="正常水位/m" width="180" />
    <el-table-column prop="rsvrrTM[0].w" label="警戒水位/m" width="180" />
  </el-table>
  <el-pagination
    background
    v-model:page-size="pageSize"
    v-model:current-page="currentPage"
    :pager-count="5"
    layout="total,->,prev, pager, next"
    :total="total"
    @current-change="currentChange"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { getReservoirDataAPI, searchAPI } from '@/api/Water/index'
import { SitInfo } from '@/api/Water/type'

const radio = ref(3)
const waterSearch = ref('')
const pageSize = ref(7)
const currentPage = ref(1)
const total = ref(10)
//书库数据
const tableData = ref<SitInfo[]>([])

//当前页数改变
const currentChange = (val: any) => {
  if (radio.value == 3) {
    if (waterSearch.value != '') {
      handleSearch(undefined, val)
    } else {
      initData(val)
    }
  }
}
//搜索
const handleSearch = async (_event: any, pager = 1) => {
  if (radio.value == 3) {
    const res = await searchAPI(waterSearch.value, pageSize.value, pager)
    if (res.code == 200) {
      total.value = res.data.total
      tableData.value = res.data.data
    }
  }
}
const initData = async (pager = 1) => {
  currentPage.value = pager
  //初始化水库数据
  if (radio.value == 3) {
    const res = await getReservoirDataAPI(pageSize.value, currentPage.value)
    if (res.code == 200) {
      total.value = res.data.total
      tableData.value = res.data.data
    }
  }
}

onMounted(() => {
  initData()
})
</script>

<style scoped lang="scss">
.top {
  display: flex;
  justify-content: space-between;
  .input1 {
    width: 200px;
  }
}
</style>
