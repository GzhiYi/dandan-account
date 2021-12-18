import createStore from './store/omix/create'
import store from './store/index'

const Flow = {
  pay: 0,
  income: 1
}
App({
  importStore: {
    create: createStore,
    store
  },
  onLaunch() {
    if (!wx.cloud) {
      // eslint-disable-next-line no-console
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'release-wifo3' // 测试环境
        // env: 'dandan-zdm86' // 正式环境
      })
    }
    // 获取手机信息以配置顶栏
    wx.getSystemInfo({
      success: (res) => {
        store.data.sysInfo = res
      }
    })
    // 分类应当全局优先获取
    this.getCategory()

    // 获取用户是否有设置目标
    this.checkHasTarget()
    // 获取用户是否有设置目标
    // this.checkHasGroup()

    // 如果开启过小程序，则跳到onBoarding页面
    const isOnboarding = wx.getStorageSync('isOnboarding')
    if (!isOnboarding) {
      wx.redirectTo({
        url: '/pages/onboarding/onboarding'
      })
    }
  },
  // 在app.js处进行分类的获取，以便所有页面方便使用
  getCategory() {
    // 在获取分类数据之前，优先读取本地缓存的数据
    const storeCategory = wx.getStorageSync('category')
    const storeDefaultCategory = wx.getStorageSync('defaultCategory')
    if (storeCategory) {
      store.data.categoryList = storeCategory
    }
    if (storeDefaultCategory) {
      store.data.defaultCategoryList = storeDefaultCategory
    }
    return new Promise((resolve, reject) => {
      const categoryList = {}
      const defaultCategoryList = []
      const plainCategoryList = []
      const mapCategoryName = {}
      wx.cloud.callFunction({
        name: 'getCategory',
        data: {},
        success(res) {
          if (res.result.code === 1) {
            const list = res.result.data
            console.log('categoryList', list)
            list.forEach((item) => {
              if (item._id) mapCategoryName[item._id] = item.categoryName
              if (item.children && item.children.length) {
                item.children.forEach((inItem) => {
                  if (inItem._id) mapCategoryName[inItem._id] = inItem.categoryName
                })
              }
            })
            store.data.mapCategoryName = mapCategoryName
            // 分离出支出和收入的分类列表
            categoryList.pay = list.filter((item) => item.flow === Flow.pay)
            categoryList.income = list.filter((item) => item.flow === Flow.income)
            // 筛选出默认下的分类为：早餐午餐和晚餐
            const defaultCategoryIds = ['food_and_drink_breakfast', 'food_and_drink_lunch', 'food_and_drink_dinner']

            store.data.categoryList = categoryList
            list.forEach((parent) => {
              parent.children.forEach((child) => {
                if (defaultCategoryIds.includes(child._id)) {
                  defaultCategoryList.push(child)
                }
                plainCategoryList.push(child)
              })
            })
            store.data.plainCategoryList = plainCategoryList
            // 将分类缓存在本地，优先读取，后续更新
            wx.setStorage({
              key: 'category',
              data: categoryList
            })
            wx.setStorage({
              key: 'defaultCategory',
              data: defaultCategoryList
            })
            store.data.defaultCategoryList = defaultCategoryList
            resolve(res)
          }
        },
        fail(error) {
          reject(error)
        }
      })
    })
  },
  // 检查是否已经设置了目标
  checkHasTarget() {
    wx.cloud.callFunction({
      name: 'target',
      data: {
        mode: 'check'
      },
      success(res) {
        if (res.result.code === 1) {
          // eslint-disable-next-line prefer-destructuring
          store.data.myTarget = res.result.data[0]
        }
      }
    })
  },
  // 检查是否已经设置了目标
  checkHasGroup() {
    wx.cloud.callFunction({
      name: 'groupbill',
      data: {
        mode: 'check'
      },
      success(res) {
        if (res.result.code === 1) {
          // eslint-disable-next-line prefer-destructuring
          store.data.myGroup = Array.isArray(res.result.data) && res.result.data.length ? res.result.data[0] : {}
        }
      }
    })
  },
  showError(title = '请求失败，请稍后再试😢') {
    wx.showToast({
      title,
      icon: 'none'
    })
  }
})
