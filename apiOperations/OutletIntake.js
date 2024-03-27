/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");
var request = require("request");

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

var transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "order-update@laundrexx.com",
      pass: "gxdlqqpafkvszhly",
    },
  })
);

async function GetDCFromFactory(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_STAFF_NAME,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
          [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS],
          (select sum([ORDER_ITEM_QUANTITY]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalQuantity,
		  (select sum([ORDER_ITEM_COUNT]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalCount
          from [dbo].[FACTORY_TO_OUTLET_DC]
          join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
          join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID] 
          join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
          join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
          where [FACTORY_TO_OUTLET_DC_OUTLET_FKID] = '${OutletID}' and FACTORY_TO_OUTLET_DC_STATUS = 0 and FACTORY_TO_OUTLET_DC_DATE = cast(getdate() as date) order by FACTORY_TO_OUTLET_DC_PKID desc`
    );

    for (var i = 0; i < result1.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 
                case when (select count(*) from STORE_INVENTORY where STORE_INVENTORY_ORDER_FKID = [ORDER_PKID] and STORE_INVENTORY_STORE_FKID = '${OutletID}') > 0 then 1 else 0 end As ReceivedStatus,
                (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
                (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
                from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS]
                join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
                where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID}'`);

      var obj = {
        FACTORY_TO_OUTLET_DC_PKID:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID,
        FACTORY_TO_OUTLET_DC_NUMBER:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_NUMBER,
        FACTORY_STAFF_NAME: result1.recordsets[0][i].FACTORY_STAFF_NAME,
        FACTORY_TO_OUTLET_DC_DATE:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_DATE,
        FACTORY_NAME: result1.recordsets[0][i].FACTORY_NAME,
        FACTORY_CODE: result1.recordsets[0][i].FACTORY_CODE,
        FACTORY_TO_OUTLET_DC_TIME:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_TIME,
        STORE_CODE: result1.recordsets[0][i].STORE_CODE,
        STORE_NAME: result1.recordsets[0][i].STORE_NAME,
        STORE_ADDRESS: result1.recordsets[0][i].STORE_ADDRESS,
        STORE_CITY: result1.recordsets[0][i].STORE_CITY,
        ROUTE_NAME: result1.recordsets[0][i].ROUTE_NAME,
        FACTORY_TO_OUTLET_DC_ORDER_COUNT:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_ORDER_COUNT,
        FACTORY_TO_OUTLET_DC_ITEMS_COUNT:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_ITEMS_COUNT,
        FACTORY_TO_OUTLET_DC_TOTAL_BAGS:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_TOTAL_BAGS,
        FACTORY_TO_OUTLET_DC_STATUS:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_STATUS,
        TotalQuantity: result1.recordsets[0][i].TotalQuantity,
        TotalCount: result1.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetDCFromFactory-->", error);
  }
}

async function GetDCFromFactoryWithFilter(obj) {
  try {
    var arr = [];
    console.log(obj);

    const OutletID = obj.OutletID;

    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_STAFF_NAME,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
    [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS],
    (select sum([ORDER_ITEM_QUANTITY]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalQuantity,
(select sum([ORDER_ITEM_COUNT]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalCount
    from [dbo].[FACTORY_TO_OUTLET_DC]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
    join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID] 
    join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
    join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
    where [FACTORY_TO_OUTLET_DC_OUTLET_FKID] = '${OutletID}' and FACTORY_TO_OUTLET_DC_STATUS = 0 `;

    if (
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);

      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 
                  case when (select count(*) from STORE_INVENTORY where STORE_INVENTORY_ORDER_FKID = [ORDER_PKID] and STORE_INVENTORY_STORE_FKID = '${OutletID}') > 0 then 1 else 0 end As ReceivedStatus,
                  (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
                  (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
                  from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS]
                  join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
                  where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID}'`);

        var obj = {
          FACTORY_TO_OUTLET_DC_PKID:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID,
          FACTORY_TO_OUTLET_DC_NUMBER:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_NUMBER,
          FACTORY_STAFF_NAME: result3.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_OUTLET_DC_DATE:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_DATE,
          FACTORY_NAME: result3.recordsets[0][i].FACTORY_NAME,
          FACTORY_CODE: result3.recordsets[0][i].FACTORY_CODE,
          FACTORY_TO_OUTLET_DC_TIME:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_TIME,
          STORE_CODE: result3.recordsets[0][i].STORE_CODE,
          STORE_NAME: result3.recordsets[0][i].STORE_NAME,
          STORE_ADDRESS: result3.recordsets[0][i].STORE_ADDRESS,
          STORE_CITY: result3.recordsets[0][i].STORE_CITY,
          ROUTE_NAME: result3.recordsets[0][i].ROUTE_NAME,
          FACTORY_TO_OUTLET_DC_ORDER_COUNT:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_ORDER_COUNT,
          FACTORY_TO_OUTLET_DC_ITEMS_COUNT:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_ITEMS_COUNT,
          FACTORY_TO_OUTLET_DC_TOTAL_BAGS:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_TOTAL_BAGS,
          FACTORY_TO_OUTLET_DC_STATUS:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_STATUS,
          TotalQuantity: result3.recordsets[0][i].TotalQuantity,
          TotalCount: result3.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }

      return arr;
    } else {
      if (obj.Factory == "-") {
      } else {
        MyQuery += ` and FACTORY_TO_OUTLET_DC_FACTORY_FKID = '${obj.Factory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(FACTORY_TO_OUTLET_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(FACTORY_TO_OUTLET_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (FACTORY_TO_OUTLET_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      console.log(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 
                  case when (select count(*) from STORE_INVENTORY where STORE_INVENTORY_ORDER_FKID = [ORDER_PKID] and STORE_INVENTORY_STORE_FKID = '${OutletID}') > 0 then 1 else 0 end As ReceivedStatus,
                  (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
                  (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
                  from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS]
                  join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
                  where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID}'`);

        var obj = {
          FACTORY_TO_OUTLET_DC_PKID:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID,
          FACTORY_TO_OUTLET_DC_NUMBER:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_NUMBER,
          FACTORY_STAFF_NAME: result4.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_OUTLET_DC_DATE:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_DATE,
          FACTORY_NAME: result4.recordsets[0][i].FACTORY_NAME,
          FACTORY_CODE: result4.recordsets[0][i].FACTORY_CODE,
          FACTORY_TO_OUTLET_DC_TIME:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_TIME,
          STORE_CODE: result4.recordsets[0][i].STORE_CODE,
          STORE_NAME: result4.recordsets[0][i].STORE_NAME,
          STORE_ADDRESS: result4.recordsets[0][i].STORE_ADDRESS,
          STORE_CITY: result4.recordsets[0][i].STORE_CITY,
          ROUTE_NAME: result4.recordsets[0][i].ROUTE_NAME,
          FACTORY_TO_OUTLET_DC_ORDER_COUNT:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_ORDER_COUNT,
          FACTORY_TO_OUTLET_DC_ITEMS_COUNT:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_ITEMS_COUNT,
          FACTORY_TO_OUTLET_DC_TOTAL_BAGS:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_TOTAL_BAGS,
          FACTORY_TO_OUTLET_DC_STATUS:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_STATUS,
          TotalQuantity: result4.recordsets[0][i].TotalQuantity,
          TotalCount: result4.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }

      return arr;
    }
  } catch (error) {
    console.log("GetDCFromFactoryWithFilter-->", error);
  }
}

async function GetConfirmedDCFromFactory(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_STAFF_NAME,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
          [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS],
          (select sum([ORDER_ITEM_QUANTITY]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalQuantity,
		  (select sum([ORDER_ITEM_COUNT]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalCount
          from [dbo].[FACTORY_TO_OUTLET_DC]
          join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
          join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID] 
          join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
          join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
          where [FACTORY_TO_OUTLET_DC_OUTLET_FKID] = '${OutletID}' and FACTORY_TO_OUTLET_DC_STATUS = 1 and FACTORY_TO_OUTLET_DC_DATE = cast(getdate() as date) order by FACTORY_TO_OUTLET_DC_PKID desc`
    );

    for (var i = 0; i < result1.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 
                case when (select count(*) from STORE_INVENTORY where STORE_INVENTORY_ORDER_FKID = [ORDER_PKID] and STORE_INVENTORY_STORE_FKID = '${OutletID}') > 0 then 1 else 0 end As ReceivedStatus,
                (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
                (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
                from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS]
                join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
                where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID}'`);

      var obj = {
        FACTORY_TO_OUTLET_DC_PKID:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID,
        FACTORY_TO_OUTLET_DC_NUMBER:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_NUMBER,
        FACTORY_STAFF_NAME: result1.recordsets[0][i].FACTORY_STAFF_NAME,
        FACTORY_TO_OUTLET_DC_DATE:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_DATE,
        FACTORY_NAME: result1.recordsets[0][i].FACTORY_NAME,
        FACTORY_CODE: result1.recordsets[0][i].FACTORY_CODE,
        FACTORY_TO_OUTLET_DC_TIME:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_TIME,
        STORE_CODE: result1.recordsets[0][i].STORE_CODE,
        STORE_NAME: result1.recordsets[0][i].STORE_NAME,
        STORE_ADDRESS: result1.recordsets[0][i].STORE_ADDRESS,
        STORE_CITY: result1.recordsets[0][i].STORE_CITY,
        ROUTE_NAME: result1.recordsets[0][i].ROUTE_NAME,
        FACTORY_TO_OUTLET_DC_ORDER_COUNT:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_ORDER_COUNT,
        FACTORY_TO_OUTLET_DC_ITEMS_COUNT:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_ITEMS_COUNT,
        FACTORY_TO_OUTLET_DC_TOTAL_BAGS:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_TOTAL_BAGS,
        FACTORY_TO_OUTLET_DC_STATUS:
          result1.recordsets[0][i].FACTORY_TO_OUTLET_DC_STATUS,
        TotalQuantity: result1.recordsets[0][i].TotalQuantity,
        TotalCount: result1.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetConfirmedDCFromFactory-->", error);
  }
}

async function GetConfirmedDCFromFactoryWithFilter(obj) {
  try {
    var arr = [];
    console.log(obj);

    const OutletID = obj.OutletID;

    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_STAFF_NAME,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
    [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS],
    (select sum([ORDER_ITEM_QUANTITY]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalQuantity,
(select sum([ORDER_ITEM_COUNT]) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join FACTORY_TO_OUTLET_DC_ITEMS on FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID = [ORDER_PKID] where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = FACTORY_TO_OUTLET_DC_PKID ) as TotalCount
    from [dbo].[FACTORY_TO_OUTLET_DC]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
    join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID] 
    join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
    join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
    where [FACTORY_TO_OUTLET_DC_OUTLET_FKID] = '${OutletID}' and FACTORY_TO_OUTLET_DC_STATUS = 1 `;

    if (
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);

      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 
                  case when (select count(*) from STORE_INVENTORY where STORE_INVENTORY_ORDER_FKID = [ORDER_PKID] and STORE_INVENTORY_STORE_FKID = '${OutletID}') > 0 then 1 else 0 end As ReceivedStatus,
                  (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
                  (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
                  from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS]
                  join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
                  where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID}'`);

        var obj = {
          FACTORY_TO_OUTLET_DC_PKID:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID,
          FACTORY_TO_OUTLET_DC_NUMBER:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_NUMBER,
          FACTORY_STAFF_NAME: result3.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_OUTLET_DC_DATE:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_DATE,
          FACTORY_NAME: result3.recordsets[0][i].FACTORY_NAME,
          FACTORY_CODE: result3.recordsets[0][i].FACTORY_CODE,
          FACTORY_TO_OUTLET_DC_TIME:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_TIME,
          STORE_CODE: result3.recordsets[0][i].STORE_CODE,
          STORE_NAME: result3.recordsets[0][i].STORE_NAME,
          STORE_ADDRESS: result3.recordsets[0][i].STORE_ADDRESS,
          STORE_CITY: result3.recordsets[0][i].STORE_CITY,
          ROUTE_NAME: result3.recordsets[0][i].ROUTE_NAME,
          FACTORY_TO_OUTLET_DC_ORDER_COUNT:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_ORDER_COUNT,
          FACTORY_TO_OUTLET_DC_ITEMS_COUNT:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_ITEMS_COUNT,
          FACTORY_TO_OUTLET_DC_TOTAL_BAGS:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_TOTAL_BAGS,
          FACTORY_TO_OUTLET_DC_STATUS:
            result3.recordsets[0][i].FACTORY_TO_OUTLET_DC_STATUS,
          TotalQuantity: result3.recordsets[0][i].TotalQuantity,
          TotalCount: result3.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }

      return arr;
    } else {
      if (obj.Factory == "-") {
      } else {
        MyQuery += ` and FACTORY_TO_OUTLET_DC_FACTORY_FKID = '${obj.Factory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(FACTORY_TO_OUTLET_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(FACTORY_TO_OUTLET_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (FACTORY_TO_OUTLET_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      console.log(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 
                  case when (select count(*) from STORE_INVENTORY where STORE_INVENTORY_ORDER_FKID = [ORDER_PKID] and STORE_INVENTORY_STORE_FKID = '${OutletID}') > 0 then 1 else 0 end As ReceivedStatus,
                  (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
                  (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
                  from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS]
                  join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
                  where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID}'`);

        var obj = {
          FACTORY_TO_OUTLET_DC_PKID:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_PKID,
          FACTORY_TO_OUTLET_DC_NUMBER:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_NUMBER,
          FACTORY_STAFF_NAME: result4.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_OUTLET_DC_DATE:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_DATE,
          FACTORY_NAME: result4.recordsets[0][i].FACTORY_NAME,
          FACTORY_CODE: result4.recordsets[0][i].FACTORY_CODE,
          FACTORY_TO_OUTLET_DC_TIME:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_TIME,
          STORE_CODE: result4.recordsets[0][i].STORE_CODE,
          STORE_NAME: result4.recordsets[0][i].STORE_NAME,
          STORE_ADDRESS: result4.recordsets[0][i].STORE_ADDRESS,
          STORE_CITY: result4.recordsets[0][i].STORE_CITY,
          ROUTE_NAME: result4.recordsets[0][i].ROUTE_NAME,
          FACTORY_TO_OUTLET_DC_ORDER_COUNT:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_ORDER_COUNT,
          FACTORY_TO_OUTLET_DC_ITEMS_COUNT:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_ITEMS_COUNT,
          FACTORY_TO_OUTLET_DC_TOTAL_BAGS:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_TOTAL_BAGS,
          FACTORY_TO_OUTLET_DC_STATUS:
            result4.recordsets[0][i].FACTORY_TO_OUTLET_DC_STATUS,
          TotalQuantity: result4.recordsets[0][i].TotalQuantity,
          TotalCount: result4.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }

      return arr;
    }
  } catch (error) {
    console.log("GetConfirmedDCFromFactoryWithFilter-->", error);
  }
}

async function OutletConfirmIntake(obj) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `update [dbo].[FACTORY_TO_OUTLET_DC] set FACTORY_TO_OUTLET_DC_STATUS = 1 where FACTORY_TO_OUTLET_DC_PKID = '${obj.DCID}'`
      );

    var result1 = await pool
      .request()
      .query(
        `select * from [dbo].[FACTORY_TO_OUTLET_DC] where FACTORY_TO_OUTLET_DC_PKID = '${obj.DCID}'`
      );

    for (var i = 0; i < obj.OrderDetails.length; i++) {
      if (obj.OrderDetails[i].ReceivedStatus === 1) {
        let UpdateOrderStatus = await pool
          .request()
          .input("DCID", obj.DCID)
          .input("OrderIID", obj.OrderDetails[i].ORDER_PKID)
          .input(
            "OutletID",
            result1.recordsets[0][0].FACTORY_TO_OUTLET_DC_OUTLET_FKID
          )
          .execute("OutletIntake");
      }
    }

    if (result.rowsAffected > 0) {
      var CustomerDetails = await pool.request().query(
        `select [ORDER_ORDER_NUMBER], [ORDER_FINAL_ORDER_AMOUNT], [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_ALT_NUMBER], [CUSTOMER_EMAIL]
         from [dbo].[FACTORY_TO_OUTLET_DC_ITEMS] 
         join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] 
         join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID]
         join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
         where [FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID] = '${result1.recordsets[0][0].FACTORY_TO_OUTLET_DC_OUTLET_FKID}'`
      );

      if (CustomerDetails.recordsets[0].length > 0) {
        for (var z = 0; z < CustomerDetails.recordsets.length; z++) {
          var DeliveryCode = await pool
            .request()
            .query(
              `SELECT LEFT(CAST(RAND()*1000000000+999999 AS INT),6) as DeliveryCode`
            );

          var UpdateCustomerDetails = await pool
            .request()
            .query(
              `update CUSTOMERS set CUSTOMER_DELIVERY_CODE = '${DeliveryCode.recordsets[0][0].DeliveryCode}' where CUSTOMER_PKID  = '${CustomerDetails.recordsets[0][z].CUSTOMER_PKID}'`
            );

          var options = {
            method: "POST",
            url: "https://restapi.smscountry.com/v0.1/Accounts/AjRDjfKkvWUCxoP4wV5P/SMSes/",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic QWpSRGpmS2t2V1VDeG9QNHdWNVA6bzdQWU4yMWEzRjhZT3RmTHdDZlRWVXBYMUlPSUxKM0o2a0p1aGdzbQ==",
            },
            body: JSON.stringify({
              Text: `Your order ${CustomerDetails.recordsets[0][z].ORDER_ORDER_NUMBER} is ready for pickup.Your order amount is Rs.${CustomerDetails.recordsets[0][z].ORDER_FINAL_ORDER_AMOUNT}. Please present your pickup code - ${DeliveryCode.recordsets[0][0].DeliveryCode} during collection. Thank you -Laundrexx`,
              Number:
                "91" +
                CustomerDetails.recordsets[0][0].CUSTOMER_CONTACT_NUMBER +
                "",
              SenderId: "LNDREX",
              DRNotifyUrl: "https://www.domainname.com/notifyurl",
              DRNotifyHttpMethod: "POST",
              Tool: "API",
            }),
          };
          request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
          });

          var mailOptions = {
            from: "order-update@laundrexx.com",
            to: CustomerDetails.recordsets[0][z].CUSTOMER_EMAIL,
            subject: "Your Order Is Ready For Pickup!",
            html: `<html><head>
                  <style>
           
            </style></head>
            <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
                            <div style="border-bottom:1px solid #eee">
                              <a href="https://laundrexx.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Laundrexx Fabric Care India Pvt Ltd</a>
                            </div>
                            <p style="font-size: 16px;color: black;font-weight: 600;">Dear ${CustomerDetails.recordsets[0][z].CUSTOMER_NAME},</p>
                            <p style="font-size: 14px;color: black;">Your order <b>( ${CustomerDetails.recordsets[0][z].ORDER_ORDER_NUMBER} )</b> is ready for pickup.</p>
                            <p style="font-size: 14px;color: black;">Your order amount is <b>Rs.${CustomerDetails.recordsets[0][z].ORDER_FINAL_ORDER_AMOUNT}</b>.</p>
                            <p style="font-size: 14px;color: black;">Please present your pickup code <b>${DeliveryCode.recordsets[0][0].DeliveryCode}</b> during collection. Thank you -Laundrexx</p>
                          </div>
                          </html>`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent: " + info.response);
            }
          });
        }
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("OutletConfirmIntake-->", error);
  }
}

async function OutletConfirmIntakeWithoutDC(obj) {
  try {
    let pool = await sql.connect(config);

    for (var i = 0; i < obj.OrderList.length; i++) {
      var result = await pool
        .request()
        .query(
          `insert into [dbo].[STORE_INVENTORY] values('${obj.OutletID}',cast(getdate() as date),(SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0)),${obj.OrderList[i].ORDER_PKID},0,0,1,'Without Factory DC')`
        );

      if (result.rowsAffected) {
        var result1 = await pool
          .request()
          .query(
            `update [dbo].[ORDERS] set [ORDER_STATUS] = 4 where [ORDER_PKID] = '${obj.OrderList[i].ORDER_PKID}'`
          );

        var CustomerDetails = await pool
          .request()
          .query(
            `select * from CUSTOMERS join ORDERS on ORDER_CUSTOMER_FKID = CUSTOMER_PKID where ORDER_PKID = '${obj.OrderList[i].ORDER_PKID}'`
          );

        var DeliveryCode = await pool
          .request()
          .query(
            `SELECT LEFT(CAST(RAND()*1000000000+999999 AS INT),6) as DeliveryCode`
          );

        var UpdateCustomerDetails = await pool
          .request()
          .query(
            `update CUSTOMERS set CUSTOMER_DELIVERY_CODE = '${DeliveryCode.recordsets[0][0].DeliveryCode}' where CUSTOMER_PKID = '${CustomerDetails.recordsets[0][0].CUSTOMER_PKID}'`
          );

        var options = {
          method: "POST",
          url: "https://restapi.smscountry.com/v0.1/Accounts/AjRDjfKkvWUCxoP4wV5P/SMSes/",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Basic QWpSRGpmS2t2V1VDeG9QNHdWNVA6bzdQWU4yMWEzRjhZT3RmTHdDZlRWVXBYMUlPSUxKM0o2a0p1aGdzbQ==",
          },
          body: JSON.stringify({
            Text: `Your order ${CustomerDetails.recordsets[0][0].ORDER_ORDER_NUMBER} is ready for pickup.Your order amount is Rs.${CustomerDetails.recordsets[0][0].ORDER_FINAL_ORDER_AMOUNT}. Please present your pickup code - ${DeliveryCode.recordsets[0][0].DeliveryCode} during collection. Thank you -Laundrexx`,
            Number:
              "91" +
              CustomerDetails.recordsets[0][0].CUSTOMER_CONTACT_NUMBER +
              "",
            SenderId: "LNDREX",
            DRNotifyUrl: "https://www.domainname.com/notifyurl",
            DRNotifyHttpMethod: "POST",
            Tool: "API",
          }),
        };
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });

        var mailOptions = {
          from: "order-update@laundrexx.com",
          to: CustomerDetails.recordsets[0][0].CUSTOMER_EMAIL,
          subject: "Your Order Is Ready For Pickup!",
          html: `<html><head>
                <style>
         
          </style></head>
          <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
                          <div style="border-bottom:1px solid #eee">
                            <a href="https://laundrexx.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Laundrexx Fabric Care India Pvt Ltd</a>
                          </div>
                          <p style="font-size: 16px;color: black;font-weight: 600;">Dear ${CustomerDetails.recordsets[0][0].CUSTOMER_NAME},</p>
                          <p style="font-size: 14px;color: black;">Your order <b>( ${CustomerDetails.recordsets[0][0].ORDER_ORDER_NUMBER} )</b> is ready for pickup.</p>
                          <p style="font-size: 14px;color: black;">Your order amount is <b>Rs.${CustomerDetails.recordsets[0][0].ORDER_FINAL_ORDER_AMOUNT}</b>.</p>
                          <p style="font-size: 14px;color: black;">Please present your pickup code <b>${DeliveryCode.recordsets[0][0].DeliveryCode}</b> during collection. Thank you -Laundrexx</p>
                        </div>
                        </html>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    }
    return true;
  } catch (error) {
    console.log("OutletConfirmIntakeWithoutDC-->", error);
  }
}

async function OutletAllInventory(OutletID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select [STORE_NAME],[STORE_CODE],[STORE_INVENTORY_PKID], [STORE_INVENTORY_DATE], [STORE_INVENTORY_TIME],[STORE_INVENTORY_STATUS],
        [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
        [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],[FACTORY_NAME],[FACTORY_TO_OUTLET_DC_NUMBER],
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = STORE_INVENTORY_ORDER_FKID) as TotalQuantity, 0 as 'checked',
        (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
        from [dbo].[STORE_INVENTORY]
        join [dbo].[ORDERS] on [ORDER_PKID] = [STORE_INVENTORY_ORDER_FKID]
        join STORES on STORE_PKID = STORE_INVENTORY_STORE_FKID
        join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
        join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
        join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
        where [STORE_INVENTORY_STORE_FKID] = '${OutletID}' and STORE_INVENTORY_STATUS = 1 order by STORE_INVENTORY_PKID desc`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("OutletAllInventory-->", error);
  }
}

async function OutletAllInventoryForAdmin(OutletID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select [STORE_NAME],[STORE_CODE],[STORE_INVENTORY_PKID], [STORE_INVENTORY_DATE], [STORE_INVENTORY_TIME],[STORE_INVENTORY_STATUS],
        [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
        [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],[FACTORY_NAME],[FACTORY_TO_OUTLET_DC_NUMBER],
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = STORE_INVENTORY_ORDER_FKID) as TotalQuantity, 0 as 'checked',
        'Inventory not exist' as remark,
        (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
        from [dbo].[STORE_INVENTORY]
        join [dbo].[ORDERS] on [ORDER_PKID] = [STORE_INVENTORY_ORDER_FKID]
        join STORES on STORE_PKID = STORE_INVENTORY_STORE_FKID
        join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
        join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
        join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
        where [STORE_INVENTORY_STORE_FKID] = '${OutletID}' and STORE_INVENTORY_STATUS = 1 order by STORE_INVENTORY_PKID desc`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("OutletAllInventoryForAdmin-->", error);
  }
}

async function OutletAllInventoryFromOrderNumber(obj) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select [STORE_NAME],[STORE_CODE],'' as STORE_INVENTORY_PKID, '' as [STORE_INVENTORY_DATE], '' as [STORE_INVENTORY_TIME],2 as [STORE_INVENTORY_STATUS],
        [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
        [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],'' as [FACTORY_NAME],'' as [FACTORY_TO_OUTLET_DC_NUMBER],
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalQuantity, 0 as 'checked',
        'Inventory exist, but from different outlet' as remark,
        (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
        from [dbo].[ORDERS]
        join STORES on STORE_PKID = ORDER_OUTLET_FKID
        join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
        join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        where [ORDER_ORDER_NUMBER] = '${obj.OrderNumber}'`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("OutletAllInventoryFromOrderNumber-->", error);
  }
}

async function OutletCurrentInventory(OutletID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select ORDER_DELIVERY_CHARGE,[STORE_NAME],[STORE_CODE],[STORE_INVENTORY_PKID], [STORE_INVENTORY_DATE], [STORE_INVENTORY_TIME],[STORE_INVENTORY_STATUS],
        [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
        [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],[FACTORY_NAME],[FACTORY_TO_OUTLET_DC_NUMBER],
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = STORE_INVENTORY_ORDER_FKID) as TotalQuantity, 0 as 'checked',
        (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
        from [dbo].[STORE_INVENTORY]
        join [dbo].[ORDERS] on [ORDER_PKID] = [STORE_INVENTORY_ORDER_FKID]
        join STORES on STORE_PKID = STORE_INVENTORY_STORE_FKID
        join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
        join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        left join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
        left join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
        where [STORE_INVENTORY_STORE_FKID] = '${OutletID}' and STORE_INVENTORY_STATUS = 1 and [STORE_INVENTORY_DATE] = cast(getdate() as date) order by STORE_INVENTORY_PKID desc`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("OutletCurrentInventory-->", error);
  }
}

async function OutletCurrentInventoryFilter(obj) {
  try {
    console.log(obj);
    var typeee = obj.Factory_Outlet_Type;
    var arr = [];
    let pool = await sql.connect(config);

    var MyQuery = `select [STORE_NAME],[STORE_CODE],[STORE_INVENTORY_PKID], [STORE_INVENTORY_DATE], [STORE_INVENTORY_TIME],[STORE_INVENTORY_STATUS],
    [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
    [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],[FACTORY_NAME],[FACTORY_TO_OUTLET_DC_NUMBER],
    (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = STORE_INVENTORY_ORDER_FKID) as TotalQuantity, 0 as 'checked',
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
    from [dbo].[STORE_INVENTORY]
    join [dbo].[ORDERS] on [ORDER_PKID] = [STORE_INVENTORY_ORDER_FKID]
    join STORES on STORE_PKID = STORE_INVENTORY_STORE_FKID
    join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
    join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    left join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
    left join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
    where [STORE_INVENTORY_STORE_FKID] = '${obj.Outlet}' and STORE_INVENTORY_STATUS = 1 
    `;
    if (
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by [STORE_INVENTORY_PKID] desc `;
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    } else {
      if (obj.Factory == "-") {
      } else {
        MyQuery += ` and STORE_INVENTORY_FACTORY_FKID = '${obj.Factory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(STORE_INVENTORY_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(STORE_INVENTORY_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (STORE_INVENTORY_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by STORE_INVENTORY_PKID desc`;
      console.log(MyQuery);
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("OutletCurrentInventoryFilter-->", error);
  }
}

async function OutletCurrentInventoryReport(OutletID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select ORDER_DELIVERY_CHARGE,[STORE_NAME],[STORE_CODE],[STORE_INVENTORY_PKID], [STORE_INVENTORY_DATE], [STORE_INVENTORY_TIME],[STORE_INVENTORY_STATUS],
        [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
        [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],[FACTORY_NAME],[FACTORY_TO_OUTLET_DC_NUMBER],
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = STORE_INVENTORY_ORDER_FKID) as TotalQuantity, 0 as 'checked',
        (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
        from [dbo].[STORE_INVENTORY]
        join [dbo].[ORDERS] on [ORDER_PKID] = [STORE_INVENTORY_ORDER_FKID]
        join STORES on STORE_PKID = STORE_INVENTORY_STORE_FKID
        join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
        join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
        left join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
        where [STORE_INVENTORY_STORE_FKID] = '${OutletID}' and [STORE_INVENTORY_DATE] = cast(getdate() as date) order by STORE_INVENTORY_PKID desc`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("OutletCurrentInventoryReport-->", error);
  }
}

async function OutletCurrentInventoryReportFilter(obj) {
  try {
    console.log(obj);
    var typeee = obj.Factory_Outlet_Type;
    var arr = [];
    let pool = await sql.connect(config);

    var MyQuery = `select [STORE_NAME],[STORE_CODE],[STORE_INVENTORY_PKID], [STORE_INVENTORY_DATE], [STORE_INVENTORY_TIME],[STORE_INVENTORY_STATUS],
    [ORDER_PKID],[ORDER_DATE],[ORDER_INVOICE_NUMBER],[ORDER_ORDER_NUMBER],[ORDER_DOOR_DELIVERY],[SERVICE_CATEGORY_NAME],[SERVICE_TYPE_NAME],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],
    [CUSTOMER_NAME],[CUSTOMER_CONTACT_NUMBER],[FACTORY_NAME],[FACTORY_TO_OUTLET_DC_NUMBER],
    (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = STORE_INVENTORY_ORDER_FKID) as TotalQuantity, 0 as 'checked',
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
    from [dbo].[STORE_INVENTORY]
    join [dbo].[ORDERS] on [ORDER_PKID] = [STORE_INVENTORY_ORDER_FKID]
    join STORES on STORE_PKID = STORE_INVENTORY_STORE_FKID
    join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
    join [dbo].[SERVICE_TYPE] on [SERVICE_TYPE_PKID] = [ORDER_SERVICE_TYPE_FKID]
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
    left join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
    where [STORE_INVENTORY_STORE_FKID] = '${obj.Outlet} ' 
    `;
    if (
      obj.Status == "-" &&
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by [STORE_INVENTORY_PKID] desc `;
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    } else {
      if (obj.Status == "-") {
      } else {
        MyQuery += `  and STORE_INVENTORY_STATUS = '${obj.Status}' `;
      }
      if (obj.Factory == "-") {
      } else {
        MyQuery += ` and STORE_INVENTORY_FACTORY_FKID = '${obj.Factory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(STORE_INVENTORY_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(STORE_INVENTORY_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (STORE_INVENTORY_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by STORE_INVENTORY_PKID desc`;
      console.log(MyQuery);
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("OutletCurrentInventoryFilter-->", error);
  }
}

async function ConfirmSelfAuditReport(obj) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("STORE_SELF_AUDIT_OUTLET_FKID", obj.STORE_SELF_AUDIT_OUTLET_FKID)
      .query(
        `insert into STORE_SELF_AUDIT(STORE_SELF_AUDIT_DATE,STORE_SELF_AUDIT_TIME,STORE_SELF_AUDIT_OUTLET_FKID) values(getdate(),(SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0)),@STORE_SELF_AUDIT_OUTLET_FKID)`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select max(STORE_SELF_AUDIT_PKID) as STORE_SELF_AUDIT_PKID from STORE_SELF_AUDIT`
        );
      for (var i = 0; i < obj.OrderList.length; i++) {
        var result2 = await pool
          .request()
          .input(
            "STORE_SELF_AUDIT_ORDERS_ORDER_FKID",
            obj.OrderList[i].ORDER_PKID
          )
          .input("STORE_SELF_AUDIT_ORDERS_STATUS", obj.OrderList[i].checked)
          .input(
            "STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID",
            result1.recordsets[0][0].STORE_SELF_AUDIT_PKID
          )
          .query(
            `insert into STORE_SELF_AUDIT_ORDERS(STORE_SELF_AUDIT_ORDERS_ORDER_FKID,STORE_SELF_AUDIT_ORDERS_STATUS,STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID) values(@STORE_SELF_AUDIT_ORDERS_ORDER_FKID,@STORE_SELF_AUDIT_ORDERS_STATUS,@STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID)`
          );
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("ConfirmSelfAuditReport-->", error);
  }
}

async function ViewSelfAuditReport(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `select * from STORE_SELF_AUDIT where STORE_SELF_AUDIT_OUTLET_FKID = '${OutletID}'`
      );

    if (result.rowsAffected > 0) {
      for (var i = 0; i < result.recordsets[0].length; i++) {
        var result1 = await pool.request().query(
          `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
            (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
            (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
            (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
            ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
            STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
            [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
            case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable,
            STORE_SELF_AUDIT_ORDERS_STATUS
            from STORE_SELF_AUDIT_ORDERS
            join ORDERS on ORDER_PKID = STORE_SELF_AUDIT_ORDERS_ORDER_FKID
            join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
            join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
            join STORES on STORE_PKID = ORDER_OUTLET_FKID
            join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
            join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
            join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
            join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
            join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
            left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
            left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID] where STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID = '${result.recordsets[0][i].STORE_SELF_AUDIT_PKID}'`
        );
        var obj = {
          STORE_SELF_AUDIT_DATE: result.recordsets[0][i].STORE_SELF_AUDIT_DATE,
          STORE_SELF_AUDIT_TIME: result.recordsets[0][i].STORE_SELF_AUDIT_TIME,
          OrderList: result1.recordsets[0],
        };
        arr.push(obj);
      }
    }
    return arr;
  } catch (error) {
    console.log("ViewSelfAuditReport-->", error);
  }
}

async function ViewSelfAuditReportFilter(obj) {
  try {
    var arr = [];
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select * from STORE_SELF_AUDIT where STORE_SELF_AUDIT_OUTLET_FKID = '${obj.OutletID}' and year(STORE_SELF_AUDIT_DATE) = '${obj.Year}'`;

    if (
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      var result3 = await pool.request().query(MyQuery);
      if (result3.rowsAffected > 0) {
        for (var i = 0; i < result3.recordsets[0].length; i++) {
          var result1 = await pool.request().query(
            `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
              (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
              (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
              (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
              ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
              STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
              [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
              case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable,
              STORE_SELF_AUDIT_ORDERS_STATUS
              from STORE_SELF_AUDIT_ORDERS
              join ORDERS on ORDER_PKID = STORE_SELF_AUDIT_ORDERS_ORDER_FKID
              join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
              join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
              join STORES on STORE_PKID = ORDER_OUTLET_FKID
              join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
              join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
              join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
              join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
              join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
              left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
              left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID] where STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID = '${result3.recordsets[0][i].STORE_SELF_AUDIT_PKID}'`
          );
          var obj = {
            STORE_SELF_AUDIT_DATE:
              result3.recordsets[0][i].STORE_SELF_AUDIT_DATE,
            STORE_SELF_AUDIT_TIME:
              result3.recordsets[0][i].STORE_SELF_AUDIT_TIME,
            OrderList: result1.recordsets[0],
          };
          arr.push(obj);
        }
      }
      return arr;
    } else {
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(STORE_SELF_AUDIT_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(STORE_SELF_AUDIT_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (STORE_SELF_AUDIT_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result4 = await pool.request().query(MyQuery);
      if (result4.rowsAffected > 0) {
        for (var i = 0; i < result4.recordsets[0].length; i++) {
          var result1 = await pool.request().query(
            `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
              (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
              (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
              (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
              ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
              STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
              [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
              case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
              from STORE_SELF_AUDIT_ORDERS
              join ORDERS on ORDER_PKID = STORE_SELF_AUDIT_ORDERS_ORDER_FKID
              join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
              join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
              join STORES on STORE_PKID = ORDER_OUTLET_FKID
              join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
              join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
              join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
              join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
              join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
              left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
              left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
              where STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID = '${result4.recordsets[0][i].STORE_SELF_AUDIT_PKID}'`
          );
          var obj = {
            STORE_SELF_AUDIT_DATE:
              result4.recordsets[0][i].STORE_SELF_AUDIT_DATE,
            STORE_SELF_AUDIT_TIME:
              result4.recordsets[0][i].STORE_SELF_AUDIT_TIME,
            OrderList: result1.recordsets[0],
          };
          arr.push(obj);
        }
      }
      return arr;
    }
  } catch (error) {
    console.log("ViewSelfAuditReportFilter-->", error);
  }
}

async function ConfirmMainAudit(obj) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("AUDIT_REPORT_OUTLET_FKID", obj.AUDIT_REPORT_OUTLET_FKID)
      .input("AUDIT_REPORT_BY", obj.AUDIT_REPORT_BY)
      .input("AUDIT_REPORT_BY_FKID", obj.AUDIT_REPORT_BY_FKID)
      .query(
        `insert into AUDIT_REPORT(AUDIT_REPORT_OUTLET_FKID,AUDIT_REPORT_BY,AUDIT_REPORT_BY_FKID, AUDIT_REPORT_DATE, AUDIT_REPORT_TIME) values(@AUDIT_REPORT_OUTLET_FKID,@AUDIT_REPORT_BY,@AUDIT_REPORT_BY_FKID,getdate(),(SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0)))`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select max(AUDIT_REPORT_PKID) as AUDIT_REPORT_PKID from AUDIT_REPORT`
        );
      for (var i = 0; i < obj.OrderList.length; i++) {
        var result2 = await pool
          .request()
          .input("AUDIT_REPORT_ORDERS_ORDER_FKID", obj.OrderList[i].ORDER_PKID)
          .input("AUDIT_REPORT_ORDERS_STATUS", obj.OrderList[i].checked)
          .input(
            "AUDIT_REPORT_ORDERS_PRIMARY_FKID",
            result1.recordsets[0][0].AUDIT_REPORT_PKID
          )
          .input("AUDIT_REPORT_ORDERS_REMARK", obj.OrderList[i].remark)
          .query(
            `insert into AUDIT_REPORT_ORDERS(AUDIT_REPORT_ORDERS_ORDER_FKID,AUDIT_REPORT_ORDERS_STATUS,AUDIT_REPORT_ORDERS_PRIMARY_FKID,AUDIT_REPORT_ORDERS_REMARK) values(@AUDIT_REPORT_ORDERS_ORDER_FKID,@AUDIT_REPORT_ORDERS_STATUS,@AUDIT_REPORT_ORDERS_PRIMARY_FKID,@AUDIT_REPORT_ORDERS_REMARK)`
          );
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("ConfirmMainAudit-->", error);
  }
}

async function GetPreviousAuditReport(UserBy, UserFkid) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select [AUDIT_REPORT_PKID], [AUDIT_REPORT_OUTLET_FKID],[STORE_CODE], [STORE_NAME], [STORE_CITY],[AUDIT_REPORT_DATE],[AUDIT_REPORT_TIME],
        (case when [AUDIT_REPORT_BY] = 'Admin' then 'Admin' else (select [USER_NAME] from [dbo].[USERS] where [USER_PKID] = [AUDIT_REPORT_BY_FKID]) end) as AuditBy
        from [dbo].[AUDIT_REPORT]
        join [dbo].[STORES] on [STORE_PKID] = [AUDIT_REPORT_OUTLET_FKID]
        where [AUDIT_REPORT_BY] = '${UserBy}' and [AUDIT_REPORT_BY_FKID] = '${UserFkid}' and AUDIT_REPORT_DATE = cast(getdate() as date)`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("GetPreviousAuditReport-->", error);
  }
}

async function GetPreviousAuditReportFilter(obj) {
  try {
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select [AUDIT_REPORT_PKID], [AUDIT_REPORT_OUTLET_FKID],[STORE_CODE], [STORE_NAME], [STORE_CITY],[AUDIT_REPORT_DATE],[AUDIT_REPORT_TIME],
    (case when [AUDIT_REPORT_BY] = 'Admin' then 'Admin' else (select [USER_NAME] from [dbo].[USERS] where [USER_PKID] = [AUDIT_REPORT_BY_FKID]) end) as AuditBy
    from [dbo].[AUDIT_REPORT]
    join [dbo].[STORES] on [STORE_PKID] = [AUDIT_REPORT_OUTLET_FKID]
    where [AUDIT_REPORT_BY] = '${obj.UserBy}' and [AUDIT_REPORT_BY_FKID] = '${obj.UserFkid}' `;

    if (
      obj.OutletID == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += ` and AUDIT_REPORT_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(AUDIT_REPORT_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(AUDIT_REPORT_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (AUDIT_REPORT_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetPreviousAuditReportFilter-->", error);
  }
}

async function ViewAuditReportForUser(AuditPkID) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select AUDIT_REPORT_ORDERS_REMARK,ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
        (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
        (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
        (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
        ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
        STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
        [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
        case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable,
        AUDIT_REPORT_ORDERS_STATUS
        from AUDIT_REPORT_ORDERS
        join ORDERS on ORDER_PKID = AUDIT_REPORT_ORDERS_ORDER_FKID
        join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
        join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
        join STORES on STORE_PKID = ORDER_OUTLET_FKID
        join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
        join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
        join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
        left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
        left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
        where AUDIT_REPORT_ORDERS_PRIMARY_FKID = '${AuditPkID}'`
    );

    return result1.recordsets[0];
  } catch (error) {
    console.log("ViewAuditReportForUser-->", error);
  }
}

async function ViewOutletDCForIntake(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_DC_PKID,FACTORY_DC_NUMBER, FACTORY_DC_DATE, [FACTORY_NAME], [FACTORY_CODE],
      [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], FACTORY_DC_ORDER_COUNT, FACTORY_DC_TOTAL_BAGS, FACTORY_DC_STATUS,
      (select sum(ORDER_ITEM_QUANTITY) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join [dbo].[ORDER_ITEMS] on  ORDER_ITEM_ORDER_FKID = [ORDER_PKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity,
      (select sum(ORDER_ITEM_COUNT) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join [dbo].[ORDER_ITEMS] on  ORDER_ITEM_ORDER_FKID = [ORDER_PKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalCount
      from [dbo].[FACTORY_DC]
      join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_DC_FACCTORY_FKID] 
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
      join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
      where [FACTORY_DC_OUTLET_FKID] = '${OutletID}' order by FACTORY_DC_PKID desc`
    );

    for (var i = 0; i < result1.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS,
        (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
(select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
        from [dbo].[FACTORY_DC_ITEMS]
        join [dbo].[ORDERS] on [ORDER_PKID] = FACTORY_DC_ITEMS_ORDER_FKID
        where FACTORY_DC_ITEMS_DC_FKID  = '${result1.recordsets[0][i].FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_DC_PKID: result1.recordsets[0][i].FACTORY_DC_PKID,
        FACTORY_DC_NUMBER: result1.recordsets[0][i].FACTORY_DC_NUMBER,
        FACTORY_DC_DATE: result1.recordsets[0][i].FACTORY_DC_DATE,
        FACTORY_NAME: result1.recordsets[0][i].FACTORY_NAME,
        FACTORY_CODE: result1.recordsets[0][i].FACTORY_CODE,
        STORE_CODE: result1.recordsets[0][i].STORE_CODE,
        STORE_NAME: result1.recordsets[0][i].STORE_NAME,
        STORE_ADDRESS: result1.recordsets[0][i].STORE_ADDRESS,
        STORE_CITY: result1.recordsets[0][i].STORE_CITY,
        ROUTE_NAME: result1.recordsets[0][i].ROUTE_NAME,
        ROUTE_CODE: result1.recordsets[0][i].ROUTE_CODE,
        FACTORY_DC_ORDER_COUNT: result1.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
        FACTORY_DC_TOTAL_BAGS: result1.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
        FACTORY_DC_STATUS: result1.recordsets[0][i].FACTORY_DC_STATUS,
        TotalQuantity: result1.recordsets[0][i].TotalQuantity,
        TotalCount: result1.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ViewOutletDCForIntake-->", error);
  }
}

async function GetOrderDetailsByOrderNumberForIntake(obj) {
  try {
    let pool = await sql.connect(config);

    var InventoryCheck = await pool.request()
      .query(`select * from [dbo].[STORE_INVENTORY] join ORDERS on ORDER_PKID = STORE_INVENTORY_ORDER_FKID 
        where ORDER_ORDER_NUMBER  = '${obj.OrderNumber}'`);

    if (InventoryCheck.recordsets[0].length > 0) {
      return false;
    } else {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS,
        (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
        from [dbo].[ORDERS] 
        where ORDER_ORDER_NUMBER  = '${obj.OrderNumber}'`);
      return DCInnerItems.recordsets[0];
    }
  } catch (error) {
    console.log("GetOrderDetailsByOrderNumberForIntake-->", error);
  }
}

async function ViewOutletDCForIntakeFilter(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_DC_PKID,FACTORY_DC_NUMBER, FACTORY_DC_DATE, [FACTORY_NAME], [FACTORY_CODE],
    [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], FACTORY_DC_ORDER_COUNT, FACTORY_DC_TOTAL_BAGS, FACTORY_DC_STATUS,
    (select sum(ORDER_ITEM_QUANTITY) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join [dbo].[ORDER_ITEMS] on  ORDER_ITEM_ORDER_FKID = [ORDER_PKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity,
      (select sum(ORDER_ITEM_COUNT) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join [dbo].[ORDER_ITEMS] on  ORDER_ITEM_ORDER_FKID = [ORDER_PKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalCount
    from [dbo].[FACTORY_DC]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_DC_FACCTORY_FKID] 
    join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
    join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
    where [FACTORY_DC_OUTLET_FKID] = '${obj.OutletID}' `;

    if (
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS,
          (select sum(ORDER_ITEM_QUANTITY) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalQuantity,
(select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = [ORDER_PKID]) as TotalCount
          from [dbo].[FACTORY_DC_ITEMS]
          join [dbo].[ORDERS] on [ORDER_PKID] = FACTORY_DC_ITEMS_ORDER_FKID
          where FACTORY_DC_ITEMS_DC_FKID  = '${result3.recordsets[0][i].FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_DC_PKID: result3.recordsets[0][i].FACTORY_DC_PKID,
          FACTORY_DC_NUMBER: result3.recordsets[0][i].FACTORY_DC_NUMBER,
          FACTORY_DC_DATE: result3.recordsets[0][i].FACTORY_DC_DATE,
          FACTORY_NAME: result3.recordsets[0][i].FACTORY_NAME,
          FACTORY_CODE: result3.recordsets[0][i].FACTORY_CODE,
          STORE_CODE: result3.recordsets[0][i].STORE_CODE,
          STORE_NAME: result3.recordsets[0][i].STORE_NAME,
          STORE_ADDRESS: result3.recordsets[0][i].STORE_ADDRESS,
          STORE_CITY: result3.recordsets[0][i].STORE_CITY,
          ROUTE_NAME: result3.recordsets[0][i].ROUTE_NAME,
          ROUTE_CODE: result3.recordsets[0][i].ROUTE_CODE,
          FACTORY_DC_ORDER_COUNT:
            result3.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
          FACTORY_DC_TOTAL_BAGS: result3.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
          FACTORY_DC_STATUS: result3.recordsets[0][i].FACTORY_DC_STATUS,
          TotalQuantity: result3.recordsets[0][i].TotalQuantity,
          TotalCount: result3.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }
      return arr;
    } else {
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(FACTORY_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(FACTORY_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (FACTORY_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by FACTORY_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS
          from [dbo].[FACTORY_DC_ITEMS]
          join [dbo].[ORDERS] on [ORDER_PKID] = FACTORY_DC_ITEMS_ORDER_FKID
          where FACTORY_DC_ITEMS_DC_FKID  = '${result4.recordsets[0][i].FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_DC_PKID: result4.recordsets[0][i].FACTORY_DC_PKID,
          FACTORY_DC_NUMBER: result4.recordsets[0][i].FACTORY_DC_NUMBER,
          FACTORY_DC_DATE: result4.recordsets[0][i].FACTORY_DC_DATE,
          FACTORY_NAME: result4.recordsets[0][i].FACTORY_NAME,
          FACTORY_CODE: result4.recordsets[0][i].FACTORY_CODE,
          STORE_CODE: result4.recordsets[0][i].STORE_CODE,
          STORE_NAME: result4.recordsets[0][i].STORE_NAME,
          STORE_ADDRESS: result4.recordsets[0][i].STORE_ADDRESS,
          STORE_CITY: result4.recordsets[0][i].STORE_CITY,
          ROUTE_NAME: result4.recordsets[0][i].ROUTE_NAME,
          ROUTE_CODE: result4.recordsets[0][i].ROUTE_CODE,
          FACTORY_DC_ORDER_COUNT:
            result4.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
          FACTORY_DC_TOTAL_BAGS: result4.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
          FACTORY_DC_STATUS: result4.recordsets[0][i].FACTORY_DC_STATUS,
          TotalQuantity: result4.recordsets[0][i].TotalQuantity,
          TotalCount: result3.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }
      return arr;
    }
  } catch (error) {
    console.log("ViewOutletDCForIntakeFilter-->", error);
  }
}

async function OutletConfirmIntakeWithoutFactoryDC(DCID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `update [dbo].[FACTORY_DC] set FACTORY_DC_STATUS = 2 where FACTORY_DC_PKID = '${DCID}'`
      );

    var result1 = await pool
      .request()
      .query(
        `select * from [dbo].[FACTORY_DC] where FACTORY_DC_PKID = '${DCID}'`
      );

    let UpdateOrderStatus = await pool
      .request()
      .input("DCID", DCID)
      .input("OutletID", result1.recordsets[0][0].FACTORY_DC_OUTLET_FKID)
      .execute("OutletIntakeWithoutFactoryDC");

    if (result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("OutletConfirmIntakeWithoutFactoryDC-->", error);
  }
}

async function GetErrorReportForUsers(UserBy, UserFkid) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select distinct [AUDIT_REPORT_PKID], [AUDIT_REPORT_OUTLET_FKID],[STORE_CODE], [STORE_NAME], [STORE_CITY],[AUDIT_REPORT_DATE],[AUDIT_REPORT_TIME],
        (case when [AUDIT_REPORT_BY] = 'Admin' then 'Admin' else (select [USER_NAME] from [dbo].[USERS] where [USER_PKID] = [AUDIT_REPORT_BY_FKID]) end) as AuditBy
        from [dbo].[AUDIT_REPORT]
        join [dbo].[STORES] on [STORE_PKID] = [AUDIT_REPORT_OUTLET_FKID]
        join [dbo].[AUDIT_REPORT_ORDERS] on [AUDIT_REPORT_ORDERS_PRIMARY_FKID] = [AUDIT_REPORT_PKID] and [AUDIT_REPORT_ORDERS_STATUS] = 0
        where [AUDIT_REPORT_BY] = '${UserBy}' and [AUDIT_REPORT_BY_FKID] = '${UserFkid}' and AUDIT_REPORT_DATE = cast(getdate() as date)`
    );
    return result.recordsets[0];
  } catch (error) {
    console.log("GetErrorReportForUsers-->", error);
  }
}

async function GetErrorReportForUsersFilter(obj) {
  try {
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select distinct [AUDIT_REPORT_PKID], [AUDIT_REPORT_OUTLET_FKID],[STORE_CODE], [STORE_NAME], [STORE_CITY],[AUDIT_REPORT_DATE],[AUDIT_REPORT_TIME],
    (case when [AUDIT_REPORT_BY] = 'Admin' then 'Admin' else (select [USER_NAME] from [dbo].[USERS] where [USER_PKID] = [AUDIT_REPORT_BY_FKID]) end) as AuditBy
    from [dbo].[AUDIT_REPORT]
    join [dbo].[STORES] on [STORE_PKID] = [AUDIT_REPORT_OUTLET_FKID]
    join [dbo].[AUDIT_REPORT_ORDERS] on [AUDIT_REPORT_ORDERS_PRIMARY_FKID] = [AUDIT_REPORT_PKID] and [AUDIT_REPORT_ORDERS_STATUS] = 0
    where [AUDIT_REPORT_BY] = '${obj.UserBy}' and [AUDIT_REPORT_BY_FKID] = '${obj.UserFkid}' `;

    if (
      obj.OutletID == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += ` and AUDIT_REPORT_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(AUDIT_REPORT_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(AUDIT_REPORT_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (AUDIT_REPORT_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetErrorReportForUsersFilter-->", error);
  }
}

function findValueInArray(value, arr) {
  let result = "NoExist";

  for (let i = 0; i < arr.length; i++) {
    let name = arr[i];
    if (name == value) {
      result = "Exist";
      break;
    }
  }
  return result;
}

module.exports = {
  GetDCFromFactory: GetDCFromFactory,
  GetDCFromFactoryWithFilter: GetDCFromFactoryWithFilter,
  GetConfirmedDCFromFactory: GetConfirmedDCFromFactory,
  GetConfirmedDCFromFactoryWithFilter: GetConfirmedDCFromFactoryWithFilter,
  OutletConfirmIntake: OutletConfirmIntake,
  OutletConfirmIntakeWithoutDC: OutletConfirmIntakeWithoutDC,
  OutletConfirmIntakeWithoutFactoryDC: OutletConfirmIntakeWithoutFactoryDC,
  OutletAllInventory: OutletAllInventory,
  OutletAllInventoryForAdmin: OutletAllInventoryForAdmin,
  OutletAllInventoryFromOrderNumber: OutletAllInventoryFromOrderNumber,
  OutletCurrentInventory: OutletCurrentInventory,
  OutletCurrentInventoryFilter: OutletCurrentInventoryFilter,
  OutletCurrentInventoryReport: OutletCurrentInventoryReport,
  OutletCurrentInventoryReportFilter: OutletCurrentInventoryReportFilter,
  ConfirmSelfAuditReport: ConfirmSelfAuditReport,
  ConfirmMainAudit: ConfirmMainAudit,
  GetPreviousAuditReport: GetPreviousAuditReport,
  GetPreviousAuditReportFilter: GetPreviousAuditReportFilter,
  GetErrorReportForUsers: GetErrorReportForUsers,
  GetErrorReportForUsersFilter: GetErrorReportForUsersFilter,
  ViewAuditReportForUser: ViewAuditReportForUser,
  ViewSelfAuditReport: ViewSelfAuditReport,
  ViewSelfAuditReportFilter: ViewSelfAuditReportFilter,
  ViewOutletDCForIntake: ViewOutletDCForIntake,
  ViewOutletDCForIntakeFilter: ViewOutletDCForIntakeFilter,
  GetOrderDetailsByOrderNumberForIntake: GetOrderDetailsByOrderNumberForIntake,
};
