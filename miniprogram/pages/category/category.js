// pages/category/category.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    billType: 0,
    categoryList: [],
    category: '',
    showAddDialog: false,
    addCategory: {}, // 要增加的父级分类
    addCategoryName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const self = this
    self.setData({
      billType: options.type
    })
    self.getCategoryList(options.type)
  },
  getCategoryList(flow) {
    this.setData({
      categoryList: getApp().globalData.categoryList[`${flow === '0' ? 'pay' : 'income'}`]
    })
  },
  selectCategory(event) {
    console.log(event)
    const { category } = event.currentTarget.dataset
    this.setData({
      category
    })
    console.log(this.data.category)
    getApp().globalData.selectedCategory = category
    wx.navigateBack()
  },
  showDialog(event) {
    console.log(event)
    const { target } = event.currentTarget.dataset
    this.setData({
      addCategory: target,
      showAddDialog: true
    })
  },
  closeDialog() {
    this.setData({
      showAddDialog: false
    })
  },
  confirmAddCategory() {
    const self = this
    const { addCategoryName } = self.data
    if (!addCategoryName) {
      wx.showToast({
        title: '未填写子分类名呀！',
        icon: 'none'
      })
      return falsee
    }
    wx.showToast({
      title: '提交创建' + addCategoryName,
      icon: 'none'
    })

  },
  bindInput(event) {
    const { value } = event.detail
    this.setData({
      [`${event.currentTarget.dataset.name}`]: value
    })
  }
})