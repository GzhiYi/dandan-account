import uCharts from '../u-charts'
let canvasPie = null
Page({
  data: {
    cWidth: 0,
    cHeight: 0
  },
  onLoad: function (options) {
    // TODO, It is fake chart in testing.
    this.fillChart()
  },
  fillChart() {
    const self = this
    const {  
      cWidth,
      cHeight
    } = this.data
    canvasPie = new uCharts({
      $this: self,
      canvasId: 'linechart-month',
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
      width: 300,
      height: 200,
      extra: {
        line: {
          type: 'straight'
        }
      },
    })
  },
  touchPie(event) {
    console.log('event', event)
  }
})