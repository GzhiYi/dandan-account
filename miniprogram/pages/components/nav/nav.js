const { importStore } = getApp()
const { create, store } = importStore
create.Component(store, {
  externalClasses: ['my-class', 'my-icon-class'],
  options: {
    multipleSlots: true,
  },
  properties: {
    bgColor: {
      type: String,
      value: 'rgba(0,0,0,0)',
    },
    showIcons: {
      type: Array,
    },
  },
  data: {
    showBackIcon: false,
    showIssue: false,
    showSearch: false,
    showBannerSetting: false,
    showSetting: false,
  },
  ready() {
    const { showIcons } = this.data
    this.setData({
      statusBarHeight: store.data.sysInfo.statusBarHeight,
      showBackIcon: showIcons.includes('back'),
      showIssue: showIcons.includes('bug'),
      showBannerSetting: showIcons.includes('banner'),
      showSearch: showIcons.includes('search'),
      showSetting: showIcons.includes('setting'),
    })
  },
  attached() {
  },
  methods: {
    back() {
      wx.navigateBack({
        delta: 1,
        fail() {
          wx.redirectTo({
            url: '/pages/tab/tab',
          })
        },
      })
    },
    goTo(event) {
      const { page } = event.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/${page}/${page}`,
      })
    },
    showBanner() {
      this.triggerEvent('showBanner')
    },
    goTotarget() {
      const { myTarget } = store.data
      let path = '/pages/target-set/target-set'
      if (myTarget && myTarget._id) {
        path = '/pages/target/target'
      }
      wx.navigateTo({
        url: path,
      })
    },
  },
})
