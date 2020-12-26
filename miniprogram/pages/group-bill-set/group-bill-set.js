import { parseTime } from '../../util'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate: '',
    endDate: '',
    name: '',
    minEndDate: parseTime(new Date().getTime() + (86400000 * 2), '{y}-{m}-{d}'),
  },
  bindDateChange(event) {
    const { key } = event.currentTarget.dataset
    this.setData({
      [`${key}`]: event.detail.value,
    })
  },
  onInput(event) {
    this.setData({
      [`${event.target.dataset.target}`]: event.detail.value,
    })
  },
  checkParams() {
    const { name, startDate } = this.data
    let errMsg = ''
    if (!name) {
      errMsg = '输入组名'
    } else if (!startDate) {
      errMsg = '选择组账单开始时间'
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
    const {
      name,
      startDate,
      endDate,
    } = this.data
    if (this.checkParams()) {
      // 通过
      wx.cloud.callFunction({
        name: 'groupbill',
        data: {
          mode: 'add',
          name,
          startDate,
          endDate,
        },
        success(res) {
          if (res.result.code === 1) {
            wx.showToast({
              title: '账单组创建成功',
              icon: 'none',
            })
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/group/group',
              })
            }, 1500)
          }
        },
        fail() {
          wx.showToast({
            title: '账单组创建失败，再试试？',
            icon: 'none',
          })
        },
        complete() {
        },
      })
    }
  },
})
