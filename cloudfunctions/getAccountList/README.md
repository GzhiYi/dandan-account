<summary>获取记账记录列表(分页)</summary>

### 普通获取记账记录列表（函数名：getAccountList, mode: normal）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| page|当前页数, 大于等于1|是|
| limit|一次显示多少条, 大于0, 小于50|是|


### 普通获取记账记录列表（函数名：getAccountList, mode: getAccountListByTime）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| page|当前页数, 大于等于1|是|
| limit|一次显示多少条, 大于0, 小于50|是|
| startDate|开始时间|是|
| endDate|结束时间|是|


### 根据父分类ID与时间范围获取记账记录列表（函数名：getAccountList, mode: getAccountListByParentCID）

| key| 说明    | 是否必填  |
| --------   | -----   | ---- |
| page|当前页数, 大于等于1|是|
| limit|一次显示多少条, 大于0, 小于50|是|
| categoryId|父分类ID|是|
| startDate|开始时间|是|
| endDate|结束时间|是|



