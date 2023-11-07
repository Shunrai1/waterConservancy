<template>
  <div class="opration">
    <el-checkbox-group v-model="checkList" @change="checkChange">
      <el-checkbox label="实时水情" />
      <el-checkbox label="实时雨情" />
      <el-checkbox label="台风路径" />
      <el-checkbox label="卫星云层" />
      <el-button
        @click="handle"
        :class="['btn', flag ? 'active' : '']"
        :icon="List"
        ref="resetBtn"
        size="small"
        circle
      />
    </el-checkbox-group>
    <el-card class="box-card" v-if="flag || editList.length > 0">
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        class="demo-tabs"
        closable
        @tab-remove="removeTab"
      >
        <el-tab-pane
          v-for="item in editList"
          :key="item.name"
          :label="item.title"
          :name="item.name"
        >
          <template v-slot>
            <Water :dataRes="dataRes" />
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import useWaterStore from '@/store/modules/water'
import { List } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { CheckboxValueType, TabPaneName } from 'element-plus'
import Water from './Water.vue'
import { SitInfo } from '@/api/Water/type'
import { getAllAPI } from '@/api/Water'

const props = defineProps(['map'])
const waterStore = useWaterStore()
const editList = ref<any>([]) //card的值
const checkList = ref<any>([]) //多选框的值
const flag = ref(false) //card展示
const resetBtn = ref()

let dataRes: SitInfo[] = []
getAllAPI().then((res) => {
  if (res.code == 200) {
    dataRes = res.data.data
  }
})
//复选框变化
const checkChange = (valList: CheckboxValueType[]) => {
  if (valList.includes('实时水情')) {
    props.map.addLayer(waterStore.reservoir)
  } else {
    props.map.removeLayer(waterStore.reservoir)
  }
}
//点击事件
const handle = () => {
  //点击失去焦点
  resetBtn.value.ref.blur()
  flag.value = !flag.value
  if (flag.value == false) {
    editList.value = []
    return
  }
  if (editList.value.length == 0 && checkList.value.length == 0) {
    editList.value.push({
      title: '实时水情',
      name: '1',
      content: 'Tab 1 content',
    })
    checkList.value.push('实时水情')
  } else {
    editList.value = []
    checkList.value.forEach((v: any) => {
      if (v == '实时水情') {
        editList.value.push({
          title: '实时水情',
          name: '1',
          content: 'Tab 1 content',
        })
      } else if (v == '实时雨情') {
        editList.value.push({
          title: '实时雨情',
          name: '2',
          content: 'Tab 2 content',
        })
      } else if (v == '台风路径') {
        editList.value.push({
          title: '台风路径',
          name: '3',
          content: 'Tab 2 content',
        })
      } else {
        editList.value.push({
          title: '卫星云层',
          name: '4',
          content: 'Tab 2 content',
        })
      }
    })
  }
}
watch(
  () => checkList.value,
  () => {
    editList.value = []
    checkList.value.forEach((v: any) => {
      if (v == '实时水情') {
        editList.value.push({
          title: '实时水情',
          name: '1',
          content: 'Tab 1 content',
        })
      } else if (v == '实时雨情') {
        editList.value.push({
          title: '实时雨情',
          name: '2',
          content: 'Tab 2 content',
        })
      } else if (v == '台风路径') {
        editList.value.push({
          title: '台风路径',
          name: '3',
          content: 'Tab 2 content',
        })
      } else {
        editList.value.push({
          title: '卫星云层',
          name: '4',
          content: 'Tab 2 content',
        })
      }
    })
  },
)
watch(
  () => editList.value,
  () => {
    if (editList.value.length == 0) {
      flag.value = false
    } else {
      flag.value = true
    }
  },
)

const editableTabsValue = ref('1') //默认选中的tab

const removeTab = (targetName: TabPaneName) => {
  const tabs = editList.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab: any, index: any) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab.name
        }
      }
    })
  }

  editableTabsValue.value = activeName
  editList.value = tabs.filter((tab: any) => tab.name !== targetName)
}
</script>

<style scoped lang="scss">
.opration {
  position: absolute;
  top: 2%;
  right: 2%;
  z-index: 4;
  width: 480px;
  :deep(.el-checkbox-group) {
    background-color: rgba(135, 207, 235, 0.21);
    display: flex;
    justify-content: center;
  }
  :deep(.el-checkbox__label) {
    font-weight: bold;
  }
  .box-card {
    margin-top: 15px;
    width: 480px;
  }
  .btn {
    margin-top: 5px;
    margin-left: 15px;
  }
  .active {
    color: red;
  }
}
</style>
