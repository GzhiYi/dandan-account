/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
// 账单图表service类 2019-11-12
const AccountChartService = function (mode, date) {
  const o = {};
  o.mode = mode;
  o.date = date;

  const wxContext = cloud.getWXContext();

  /**
   * 获取数据库连接对象
   */
  function getDBConnection() {
    // 数据库对象
    const db = cloud.database({
      env: wxContext.ENV === 'local' ? 'release-wifo3' : wxContext.ENV,
    });
    return {
      _: db.command,
      db,
      $: db.command.aggregate,
    }
  }

  o.getAccountChart = function () {
    if (o.mode === 'getAccountChartByMonth') {
      return o.getAccountChartByMonth();
    }
    if (o.mode === 'getAccountChartByYear') {
      return o.getAccountChartByYear();
    }
    return {
      code: -1,
      data: [],
      message: '未找到对应方法',
    }
  }

  o.getAccountChartByMonth = async function () {
    const {
      db,
      $,
    } = await getDBConnection();
    const res = await db.collection('DANDAN_NOTE')
      .aggregate()
      .addFields({
        formatDate: $.dateToString({
          date: '$noteDate',
          format: '%Y-%m',
        }),
        noteDay: $.dateToString({
          date: '$noteDate',
          format: '%d',
        }),
        income: $.switch({
          branches: [{
            case: $.eq(['$flow', 1]),
            then: '$money',
          }],
          default: 0,
        }),
        expenses: $.switch({
          branches: [{
            case: $.eq(['$flow', 0]),
            then: $.multiply(['$money', -1]),
          }],
          default: 0,
        }),
      })
      .match({
        openId: wxContext.OPENID,
        formatDate: o.date,
        isDel: false,
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
        netIncome: $.add(['$income', '$expenses']),
      })
      .sort({
        noteDate: 1,
      })
      .limit(32)
      .end()
      // eslint-disable-next-line no-shadow
      .then((res) => {
        const resList = res.list;

        const lastDay = new Date(new Date(o.date).getFullYear(), new Date(o.date).getMonth() + 1, 0).getDate();
        const resListSize = resList.length;
        const xAxisData = []; // x轴数据
        const incomeData = []; // 收入数据
        const expensesData = []; // 支出数据
        const netIncomeData = []; // 净收入数据
        // eslint-disable-next-line no-plusplus
        for (let i = 0, y = 0; i < lastDay; i++) {
          const day = i + 1;
          xAxisData.push(`${day}日`);
          // 该日期存有账单数据
          // eslint-disable-next-line radix
          if (y < resListSize && parseInt(resList[y].noteDate) === day) {
            incomeData.push(strip(resList[y].income));
            expensesData.push(strip(resList[y].expenses));
            netIncomeData.push(strip(resList[y].netIncome));
            y++;
          } else {
            incomeData.push(0);
            expensesData.push(0);
            netIncomeData.push(0);
          }
        }
        return _getChartData(xAxisData, incomeData, expensesData, netIncomeData);
      })
      .catch((err) => ({
        data: err,
        flag: 0,
      }));
    return {
      code: 1,
      data: res,
      message: '查询账单图表数据成功',
    };
  }

  o.getAccountChartByYear = async function () {
    const {
      db,
      $,
    } = await getDBConnection();
    const res = await db.collection('DANDAN_NOTE')
      .aggregate()
      .addFields({
        formatDate: $.dateToString({
          date: '$noteDate',
          format: '%Y',
        }),
        noteMonth: $.dateToString({
          date: '$noteDate',
          format: '%m',
        }),
        income: $.switch({
          branches: [{
            case: $.eq(['$flow', 1]),
            then: '$money',
          }],
          default: 0,
        }),
        expenses: $.switch({
          branches: [{
            case: $.eq(['$flow', 0]),
            then: $.multiply(['$money', -1]),
          }],
          default: 0,
        }),
      })
      .match({
        openId: wxContext.OPENID,
        formatDate: o.date,
        isDel: false,
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
        netIncome: $.add(['$income', '$expenses']),
      })
      .sort({
        noteMonth: 1,
      })
      .limit(13)
      .end()
      // eslint-disable-next-line no-shadow
      .then((res) => {
        const resList = res.list;

        const monthCount = 12;
        const resListSize = resList.length;
        const xAxisData = []; // x轴数据
        const incomeData = []; // 收入数据
        const expensesData = []; // 支出数据
        const netIncomeData = []; // 净收入数据
        for (let i = 0, y = 0; i < monthCount; i++) {
          const month = i + 1;
          xAxisData.push(`${month}月`);
          // 该日期存有账单数据
          // eslint-disable-next-line radix
          if (y < resListSize && parseInt(resList[y].noteMonth) === month) {
            incomeData.push(strip(resList[y].income));
            expensesData.push(strip(resList[y].expenses));
            netIncomeData.push(strip(resList[y].netIncome));
            y++;
          } else {
            incomeData.push(0);
            expensesData.push(0);
            netIncomeData.push(0);
          }
        }

        return _getChartData(xAxisData, incomeData, expensesData, netIncomeData);
      })
      .catch((err) => ({
        data: err,
        flag: 0,
      }));
    return {
      code: 1,
      data: res,
      message: '查询账单图表数据成功',
    };
  }

  // 获取图表数据
  async function _getChartData(xAxisArray, incomeArray, expenditureArray, netIncomeArray) {
    return {
      categories: xAxisArray,
      series: [{
        name: '收入',
        data: incomeArray,
      }, {
        name: '支出',
        data: expenditureArray,
      }, {
        name: '净收入',
        data: netIncomeArray,
      }],
      operId: wxContext.OPENID,
    }
  }

  function strip(num, precision = 12) {
    return +parseFloat(num.toPrecision(precision));
  }

  return o;
}

// 云函数入口函数
exports.main = async (event) => {
  const { mode, date } = event;
  // eslint-disable-next-line no-use-before-define
  const service = AccountChartService(mode, date);
  try {
    return await service.getAccountChart();
  } catch (e) {
    return {
      code: -1,
      data: [],
      message: '获取失败',
    }
  }
}
