import { parseTime } from '../../util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    endDate: '',
    money: null,
    startmoney: null,
    name: '',
    minEndDate: parseTime(new Date().getTime() + (86400000 * 2), '{y}-{m}-{d}'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },
  bindDateChange(event) {
    this.setData({
      endDate: event.detail.value,
    })
  },
  onInput(event) {
    this.setData({
      [`${event.target.dataset.target}`]: event.detail.value,
    })
  },
  checkParams() {
    const {
      name, startmoney, money, endDate,
    } = this.data
    let errMsg = ''
    if (!name) {
      errMsg = '输入目标名'
    } else if (!endDate) {
      errMsg = '选择目标的结束日吧'
    } else if (!startmoney) {
      errMsg = '要输入目标金额哦'
    } else if (!money) {
      errMsg = '要输入目标金额哦'
    }
    if (errMsg) {
      wx.showToast({
        title: errMsg,
        icon: 'none',
      })
      return false
    }
    return true
  },
  confirm() {
    // 验证下数据
    const { name, money, endDate } = this.data
    if (this.checkParams()) {
      // 通过
      const params = {
        name,
        endDate,
        money: Number(String(money).replace(/\b(0+)/gi, '')),
      }
      console.log('params', params)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
})
