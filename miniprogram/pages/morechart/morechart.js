import uCharts from '../u-charts'
import { parseTime } from '../../util'
let lineChartA = null
let lineChartB = null
Page({
  data: {
    cWidth: 0,
    cHeight: 0,
    date: parseTime(new Date(), '{y}-{m}')
  },
  onLoad: function (options) {
    // TODO, It is fake chart in testing.
    this.fillChart()
  },
  fillChart() {
    const self = this
    const {  
      cWidth,
      cHeight,
      date
    } = this.data
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: {
        mode: 'getAccountChartByMonth',
        date
      },
      success(res) {
        console.log('月账单请求参数：', {
          mode: 'getAccountChartByMonth',
          date
        })
        console.log('月账单数据返回', res)
        const { code } = res.result
        const { categories, series } = res.result.data
        if (res.result.code === 1) {
          lineChartA = new uCharts({
            $this: self,
            canvasId: 'linechart-month',
            type: 'line',
            fontSize: 11,
            legend: true,
            dataLabel: true,
            dataPointShape: true,
            background: '#FFFFFF',
            pixelRatio: 1,
            categories,
            series,
            animation: true,
            enableScroll: true, //开启图表拖拽功能
            xAxis: {
              disableGrid: false,
              type: 'grid',
              gridType: 'dash',
              itemCount: 4,
              scrollShow: true,
              scrollAlign: 'left',
              //scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
              //scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
            },
            yAxis: {
              //disabled:true
              gridType: 'dash',
              splitNumber: 8,
              min: 10,
              max: 180,
              format: (val) => {
                return val.toFixed(0) + '元'
              } //如不写此方法，Y轴刻度默认保留两位小数
            },
            width: 385,
            height: 200,
            extra: {
              line: {
                type: 'curve'
              }
            },
          })
        }
        
      }
    })
        wx.cloud.callFunction({
      name: 'getAccountChart',
      data: {
        mode: 'getAccountChartByYear',
        date: date.split('-')[0]
      },
      success(res) {
        console.log('年账单请求参数：', {
          mode: 'getAccountChartByYear',
          date: date.split('-')[0]
        })
        console.log('年账单数据返回：', res)
        const { code } = res.result
        const { categories, series } = res.result.data
        if (res.result.code === 1) {
          lineChartA = new uCharts({
            $this: self,
            canvasId: 'linechart-year',
            type: 'line',
            fontSize: 11,
            legend: true,
            dataLabel: true,
            dataPointShape: true,
            background: '#FFFFFF',
            pixelRatio: 1,
            categories,
            series,
            animation: true,
            enableScroll: true, //开启图表拖拽功能
            xAxis: {
              disableGrid: false,
              type: 'grid',
              gridType: 'dash',
              itemCount: 4,
              scrollShow: true,
              scrollAlign: 'left',
              //scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
              //scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
            },
            yAxis: {
              //disabled:true
              gridType: 'dash',
              splitNumber: 8,
              min: 10,
              max: 180,
              format: (val) => {
                return val.toFixed(0) + '元'
              } //如不写此方法，Y轴刻度默认保留两位小数
            },
            width: 385,
            height: 200,
            extra: {
              line: {
                type: 'curve'
              }
            },
          })
        }
        
      }
    })
    
    lineChartB = new uCharts({
      $this: self,
      canvasId: 'linechart-year',
      type: 'line',
      fontSize: 11,
      legend: true,
      dataLabel: true,
      dataPointShape: true,
      background: '#FFFFFF',
      pixelRatio: 1,
      categories: [
        "2012",
        "2013",
        "2014",
        "2015",
        "2016",
        "2017"
      ],
      series: [
        {
          "name": "成交量A",
          "data": [
            35,
            8,
            25,
            37,
            4,
            20
          ]
        },
        {
          "name": "成交量B",
          "data": [
            70,
            40,
            65,
            100,
            44,
            68
          ]
        },
        {
          "name": "成交量C",
          "data": [
            100,
            80,
            95,
            150,
            112,
            132
          ]
        }
      ],
      animation: true,
      enableScroll: true,//开启图表拖拽功能
      xAxis: {
        disableGrid: false,
        type: 'grid',
        gridType: 'dash',
        itemCount: 4,
        scrollShow: true,
        scrollAlign: 'left',
        //scrollBackgroundColor:'#F7F7FF',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条背景颜色,默认为 #EFEBEF
        //scrollColor:'#DEE7F7',//可不填写，配合enableScroll图表拖拽功能使用，X轴滚动条颜色,默认为 #A6A6A6
      },
      yAxis: {
        //disabled:true
        gridType: 'dash',
        splitNumber: 8,
        min: 10,
        max: 180,
        format: (val) => { return val.toFixed(0) + '元' }//如不写此方法，Y轴刻度默认保留两位小数
      },
      width: 385,
      height: 200,
      extra: {
        line: {
          type: 'curve'
        }
      },
    })
  },
  touchLineA(e) {
    lineChartA.scrollStart(e);
  },
  moveLineA(e) {
    lineChartA.scroll(e);
  },
  touchEndLineA(e) {
    lineChartA.scrollEnd(e);
    //下面是toolTip事件，如果滚动后不需要显示，可不填写
    lineChartA.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  touchLineB(e) {
    lineChartB.scrollStart(e);
  },
  moveLineB(e) {
    lineChartB.scroll(e);
  },
  touchEndLineB(e) {
    lineChartB.scrollEnd(e);
    //下面是toolTip事件，如果滚动后不需要显示，可不填写
    lineChartB.showToolTip(e, {
      format: function (item, category) {
        return category + ' ' + item.name + ':' + item.data
      }
    });
  },
  bindDateChange(event) {
    console.log('event', event)
    this.setData({
      date: event.detail.value
    })
  }
})