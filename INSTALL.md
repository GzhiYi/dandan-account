# 单单记账
#### 项目介绍
最近发觉自己有记账的需求，想知道自己的钱花在哪了。试用了很多的记账app还有小程序，发现很多都偏离了记账的初衷，而且都会把个人数据存在服务器上，我觉得不放心。 那怎么办？小程序不是支持IOS和安卓端吗？还有不是有云开发服务支持吗？等等，小程序类目也很支持记账这个类目。所以，赶紧动手！
#### 页面结构
1. 主页（中间页面）：记账功能，可以很快速的记下一笔账。
2. 历史账单页（左边页面）：查看当天或者任意一天/日期范围内的账单。
3. 图表分析页（右边页面）：查看当月消费图表，便于查看当月或者某个月的收支情况。
#### 安装教程
1. 环境准备

   	* [node](https://nodejs.org/en/download/)、
	*  [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)、
	* 本项目使用了云开发，所以需要申请AppID, ([注册](https://mp.weixin.qq.com/wxopen/waregister?action=step1))

2. 下载源码

  ```
  git clone https://github.com/GzhiYi/dandan-account.git
  cd dandan-account
  npm install   # 需要在超级用户控制台下面执行
  npm install wx-server-sdk@latest
  cd cloudfunctions
  npm install
  ```
3. 将dandan-account导入到微信开发者工具中，填写刚注册的AppID,导入即可。如果不使用AppID，直接使用测试号导入，会导致无法使用云开发
4. 申请云开发权限
	设置环境名称和环境ID，注意环境ID的唯一性，如：dev-1234567890
5. 修改工程的云开发配置
```
  onLaunch() {
    if (!wx.cloud) {
      // eslint-disable-next-line no-console
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'dev-1234567890', // 填写刚申请的云开发环境ID
      })
    }
```
6. 增加初始化脚本

  * 初始化分类数据(记录名：DANDAN_NOTE_CATEGORY)
    云开发->数据库->集合->记录
    这里直接使用导入JSON数据，复制下面数据另存为文件，进行导入
    
       <details>
          <summary>分类数据</summary>
       ```json
           {
               "_id": "food_and_drink_breakfast",
               "categoryName": "早餐",
               "categoryIcon": "icon",
               "description": "早餐",
               "flow": 0,
               "type": 0,
               "parentId": "food_and_drink_total",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } 
           {
               "_id": "food_and_drink_dinner",
               "categoryName": "晚餐",
               "categoryIcon": "icon",
               "description": "晚餐",
               "flow": 0,
               "type": 0,
               "parentId": "food_and_drink_total",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } 
           {
               "_id": "food_and_drink_lunch",
               "categoryName": "午餐",
               "categoryIcon": "icon",
               "description": "午餐",
               "flow": 0,
               "type": 0,
               "parentId": "food_and_drink_total",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "food_and_drink_night_snack",
               "categoryName": "宵夜",
               "categoryIcon": "icon",
               "description": "宵夜",
               "flow": 0,
               "type": 0,
               "parentId": "food_and_drink_total",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "food_and_drink_snack",
               "categoryName": "零食",
               "categoryIcon": "icon",
               "description": "零食",
               "flow": 0,
               "type": 0,
               "parentId": "food_and_drink_total",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "food_and_drink_total",
               "categoryName": "餐饮",
               "categoryIcon": "icon",
               "description": "餐饮",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income",
               "categoryName": "收入",
               "categoryIcon": "icon",
               "description": "收入",
               "flow": 1,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_ETFs",
               "categoryName": "基金",
               "categoryIcon": "icon",
               "description": "基金",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_bonus",
               "categoryName": "奖金",
               "categoryIcon": "icon",
               "description": "奖金",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_debt_collect",
               "categoryName": "收债",
               "categoryIcon": "icon",
               "description": "收债",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_gifts",
               "categoryName": "礼金",
               "categoryIcon": "icon",
               "description": "礼金",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_living",
               "categoryName": "生活费",
               "categoryIcon": "icon",
               "description": "生活费",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_red_packet",
               "categoryName": "红包",
               "categoryIcon": "icon",
               "description": "红包",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_refund",
               "categoryName": "退款",
               "categoryIcon": "icon",
               "description": "退款",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_salary",
               "categoryName": "工资",
               "categoryIcon": "icon",
               "description": "工资",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "income_stocks",
               "categoryName": "股票",
               "categoryIcon": "icon",
               "description": "股票",
               "flow": 1,
               "type": 0,
               "parentId": "income",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "medicine",
               "categoryName": "医疗",
               "categoryIcon": "icon",
               "description": "医疗",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "medicine_doctor",
               "categoryName": "看病",
               "categoryIcon": "icon",
               "description": "看病",
               "flow": 0,
               "type": 0,
               "parentId": "medicine",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "medicine_medicine",
               "categoryName": "药物",
               "categoryIcon": "icon",
               "description": "药物",
               "flow": 0,
               "type": 0,
               "parentId": "medicine",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "money_management",
               "categoryName": "理财",
               "categoryIcon": "icon",
               "description": "理财",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "money_management_ETFs",
               "categoryName": "基金",
               "categoryIcon": "icon",
               "description": "基金",
               "flow": 0,
               "type": 0,
               "parentId": "money_management",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "money_management_stocks",
               "categoryName": "股票",
               "categoryIcon": "icon",
               "description": "股票",
               "flow": 0,
               "type": 0,
               "parentId": "money_management",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "others",
               "categoryName": "杂项",
               "categoryIcon": "icon",
               "description": "杂项",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "others_sub",
               "categoryName": "杂项",
               "categoryIcon": "icon",
               "description": "杂项",
               "flow": 0,
               "type": 0,
               "parentId": "others",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "skin_care",
               "categoryName": "护理",
               "categoryIcon": "icon",
               "description": "护理",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "skin_care_makeup",
               "categoryName": "化妆品",
               "categoryIcon": "icon",
               "description": "化妆品",
               "flow": 0,
               "type": 0,
               "parentId": "skin_care",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "stored_value",
               "categoryName": "储值",
               "categoryIcon": "icon",
               "description": "储值",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "stored_value_bus_card",
               "categoryName": "公交卡",
               "categoryIcon": "icon",
               "description": "公交卡",
               "flow": 0,
               "type": 0,
               "parentId": "stored_value",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "stored_value_call_credit",
               "categoryName": "话费",
               "categoryIcon": "icon",
               "description": "话费",
               "flow": 0,
               "type": 0,
               "parentId": "stored_value",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "stored_value_membership_card",
               "categoryName": "会员卡",
               "categoryIcon": "icon",
               "description": "会员卡",
               "flow": 0,
               "type": 0,
               "parentId": "stored_value",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "stored_value_virtual",
               "categoryName": "虚拟物品",
               "categoryIcon": "icon",
               "description": "虚拟物品",
               "flow": 0,
               "type": 0,
               "parentId": "stored_value",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "transportation",
               "categoryName": "出行",
               "categoryIcon": "icon",
               "description": "出行",
               "flow": 0,
               "type": 0,
               "parentId": "",
               "isSelectable": false,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "transportation_airplane",
               "categoryName": "飞机",
               "categoryIcon": "icon",
               "description": "飞机",
               "flow": 0,
               "type": 0,
               "parentId": "transportation",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "transportation_high_speed_rail",
               "categoryName": "高铁",
               "categoryIcon": "icon",
               "description": "高铁",
               "flow": 0,
               "type": 0,
               "parentId": "transportation",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           } {
               "_id": "transportation_online_car",
               "categoryName": "网约车",
               "categoryIcon": "icon",
               "description": "网约车",
               "flow": 0,
               "type": 0,
               "parentId": "transportation",
               "isSelectable": true,
               "createTime": {
                   "$date": "2019-08-21T08:02:30.448Z"
               },
               "openId": "SYSTEM",
               "isDel": false
           }
       ```
    
* 同步云函数
  将cloudfunctions目录下所有文件夹都同步到云开发中的函数中去，点文件夹右键，上传并部署:云端安装依赖(不上传node_modules)


#### 使用说明 
1. XXXX
2. XXXX
3. XXXX
4. XXXX

#### 参与贡献
1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request