// pages/category/category.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    billType: 0,
    categoryList: []
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
})