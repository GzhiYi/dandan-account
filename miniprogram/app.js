import createStore from './store/omix/create'
import store from './store/index'

const Flow = {
  pay: 0,
  income: 1,
}
App({
  importStore: {
    create: createStore,
    store,
  },
  onLaunch() {
    if (!wx.cloud) {
      // eslint-disable-next-line no-console
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'release-wifo3', // 测试环境
        // env: 'dandan-zdm86', // 正式环境
      })
    }
    // 获取手机信息以配置顶栏
    wx.getSystemInfo({
      success: (res) => {
        store.data.sysInfo = res
        this.globalData.statusBarHeight = res.statusBarHeight
        this.globalData.navBarHeight = 44 + res.statusBarHeight
        this.globalData.screenWidth = res.screenWidth
        this.globalData.screenHeight = res.screenHeight
      },
    })
    // 分类应当全局优先获取
    this.getCategory()

    // 获取用户是否有设置目标
    this.checkHasTarget()

    const isOnboarding = wx.getStorageSync('isOnboarding')
    if (!isOnboarding) {
      wx.redirectTo({
        url: '/pages/onboarding/onboarding',
      })
    }
  },
  globalData: {
    statusBarHeight: 0,
    navBarHeight: 0,
    screenWidth: 0,
    screenHeight: 0,
    categoryList: {},
    selectedCategory: '',
    defaultCategoryList: [],
    myTarget: [],
  },
  // 在app.js处进行分类的获取，以便所有页面方便使用
  getCategory() {
    const self = this
    const categoryList = {}
    const defaultCategoryList = []
    wx.cloud.callFunction({
      name: 'getCategory',
      data: {},
      success(res) {
        if (res.result.code === 1) {
          const list = res.result.data
          // 分离出支出和收入的分类列表
          categoryList.pay = list.filter((item) => item.flow === Flow.pay)
          categoryList.income = list.filter((item) => item.flow === Flow.income)
          // 筛选出默认下的分类为：早餐午餐和晚餐
          const defaultCategoryIds = ['food_and_drink_breakfast', 'food_and_drink_lunch', 'food_and_drink_dinner']
          self.globalData.categoryList = categoryList
          store.data.categoryList = categoryList
          list.forEach((parent) => {
            parent.children.forEach((child) => {
              if (defaultCategoryIds.includes(child._id)) {
                defaultCategoryList.push(child)
              }
            })
          })
          store.data.categoryList = defaultCategoryList
          self.globalData.defaultCategoryList = defaultCategoryList
          if (self.loadDefaultCategoryCallBack) {
            self.loadDefaultCategoryCallBack(defaultCategoryList)
          }
          if (self.loadCategoryCallBack) {
            self.loadCategoryCallBack(list)
          }
        }
      },
    })
  },
  // 检查是否已经设置了目标
  checkHasTarget() {
    const self = this
    wx.cloud.callFunction({
      name: 'target',
      data: {
        mode: 'check',
      },
      success(res) {
        if (res.result.code === 1) {
          store.data.myTarget = res.result.data
          self.globalData.myTarget = res.result.data
        }
      },
    })
  },
  showError(title = '请求失败，请稍后再试😢') {
    wx.showToast({
      title,
      icon: 'none',
    })
  },
})
