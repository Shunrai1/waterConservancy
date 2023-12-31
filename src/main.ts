import { createApp } from 'vue'
//引入模板的全局样式
import '@/styles/index.scss'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//@ts-expect-error忽略当前文件ts类型的检测否则有红色提示(打包会失败)
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import pinia from './store'
//引入自定义插件对象：注册整个项目全局组件
import globalComponent from '@/components'
const app = createApp(App)

app.use(ElementPlus, {
  locale: zhCn,
})
app.use(globalComponent)
app.use(pinia)

app.mount('#app')
