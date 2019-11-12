// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const wxContext = cloud.getWXContext();
cloud.updateConfig({
  env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
})

let { OPENID, APPID, UNIONID } = cloud.getWXContext()
//全局变量
const MAX_LIMIT = 100;//最大限制数

// 云函数入口函数
exports.main = async (event, context) => {

  const { mode,date } = event;
  const service = AccountChartService(mode, date);
  try {
      return service.getAccountChart();
  } catch (e) {
    console.error(e);
    return {
      code: -1,
      data: [],
      message: '获取失败'
    }
  }

}
 
//账单图表service类 2019-11-12
var AccountChartService = function (mode,date){
  var o = new Object();
  o.mode = mode;
  o.date = date;
  
  /**
   * 获取数据库连接对象
   */
  function getDBConnection() {
    //数据库对象
    const db = cloud.database({
      env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV
    });
    return {
      _: db.command,
      db: db,
      $: db.command.aggregate
    }
  }

  o.getAccountChart = async function () {
    if (o.mode == "getAccountChartByMonth") {
      return await o.getAccountChartByMonth();
    }
    if (o.mode == "getAccountChartByYear") {
      return await o.getAccountChartByYear();
    } 
    return {
      code: -1,
      data: [],
      message: '未找到对应方法'
    }
  }

  o.getAccountChartByMonth =  async function () {
    const { _, db, $ } = await getDBConnection();
    const res = await db.collection('DANDAN_NOTE')
      .aggregate()
      .addFields({
        formatDate: $.dateToString({
          date: '$noteDate',
          format: '%Y-%m'
        }),
        noteDay: $.dateToString({
          date: '$noteDate',
          format: '%d'
        }),
        income: $.switch({
          branches: [
            { case: $.eq(['$flow', 1]), then: '$money' },
          ],
          default: 0
        }),
        expenses: $.switch({
          branches: [
            { case: $.eq(['$flow', 0]), then: $.multiply(['$money', -1]) },
          ],
          default: 0
        }),
      })
      .match({
        openId: OPENID,
        formatDate: o.date
      })
      .group({
        _id: '$noteDay',
        income: $.sum('$income'),
        expenses: $.sum('$expenses'),
      })
      .project({
        _id: 0,
        noteDate: '$_id',
        income: 1,
        expenses: 1,
        netIncome: $.add(['$income', '$expenses'])
      })
      .sort({
        noteDate: 1,
      })
      .limit(32)
      .end()
      .then(res => {
        let resList = res.list;
        
        let lastDay = new Date(new Date(o.date).getFullYear(), new Date(o.date).getMonth(), 0).getDate();
        let resListSize = resList.length;
        let xAxisData = new Array();      //x轴数据
        var incomeData = new Array();     //收入数据
        var expensesData = new Array();   //支出数据
        var netIncomeData = new Array();  //净收入数据
        for (let i = 0, y = 0; i < lastDay; i++) {
          let day = i + 1;
          xAxisData.push(day + "日");
          //该日期存有账单数据
          if (y < resListSize && parseInt(resList[y].noteDate) === day) {
            incomeData.push(resList[y].income);
            expensesData.push(resList[y].expenses);
            netIncomeData.push(resList[y].netIncome);
            y++;
          } else {
            incomeData.push(0);
            expensesData.push(0);
            netIncomeData.push(0);
          }
        }
        return _getChartData(xAxisData, incomeData, expensesData, netIncomeData);
      })
      .catch(err => {
        console.error(err);
        return {
          data: err,
          flag: 0
        };
      });
    return {
      code: 1,
      data: res,
      message: '查询账单图表数据成功',
    };

  }

  o.getAccountChartByYear = async function () {
    const { _, db, $ } = await getDBConnection();
    const res = await db.collection('DANDAN_NOTE')
      .aggregate()
      .addFields({
        formatDate: $.dateToString({
          date: '$noteDate',
          format: '%Y'
        }),
        noteMonth: $.dateToString({
          date: '$noteDate',
          format: '%m'
        }),
        income: $.switch({
          branches: [
            { case: $.eq(['$flow', 1]), then: '$money' },
          ],
          default: 0
        }),
        expenses: $.switch({
          branches: [
            { case: $.eq(['$flow', 0]), then: $.multiply(['$money', -1]) },
          ],
          default: 0
        }),
      })
      .match({
        openId: OPENID,
        formatDate: o.date
      })
      .group({
        _id: '$noteMonth',
        income: $.sum('$income'),
        expenses: $.sum('$expenses'),
      })
      .project({
        _id: 0,
        noteMonth: '$_id',
        income: 1,
        expenses: 1,
        netIncome: $.add(['$income', '$expenses'])
      })
      .sort({
        noteMonth: 1,
      })
      .limit(13)
      .end()
      .then(res => {
        let resList = res.list;

        let monthCount = 12;
        let resListSize = resList.length;
        let xAxisData = new Array();      //x轴数据
        var incomeData = new Array();     //收入数据
        var expensesData = new Array();   //支出数据
        var netIncomeData = new Array();  //净收入数据
        for (let i = 0, y = 0; i < monthCount; i++) {
          let month = i + 1;
          xAxisData.push(month + "月");
          //该日期存有账单数据
          if (y < resListSize && parseInt(resList[y].noteMonth) === month) {
            incomeData.push(resList[y].income);
            expensesData.push(resList[y].expenses);
            netIncomeData.push(resList[y].netIncome);
            y++;
          } else {
            incomeData.push(0);
            expensesData.push(0);
            netIncomeData.push(0);
          }
        }

        return _getChartData(xAxisData, incomeData, expensesData, netIncomeData);
      })
      .catch(err => {
        console.error(err);
        return {
          data: err,
          flag: 0
        };
      });
    return {
      code: 1,
      data: res,
      message: '查询账单图表数据成功',
    };

  }

  //获取图表数据
  async function _getChartData(xAxisArray, incomeArray, expenditureArray, netIncomeArray) {
    return {
      categories: xAxisArray,
      series: [{
        name: '收入',
        data: incomeArray
      }, {
        name: '支出',
        data: expenditureArray
      }, {
        name: '净收入',
        data: netIncomeArray
      }]
    }
  }


  function isNull(str) {
    if (str != "" && str != undefined && str != null) {
      return false;
    }
    return true;
  }

  return o;
}
