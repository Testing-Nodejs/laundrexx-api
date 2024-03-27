/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");
const QRCode = require("qrcode");
const path = require("path");
const e = require("cors");

// View Intake request sent by outlet

async function FactoryViewInTakeOrders(FactoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select [FACTORY_DC_TOTAL_BAGS],[FACTORY_DC_PKID],[STORE_ID], [STORE_CODE], [STORE_NAME], [STORE_CITY], [STORE_PHONE], [STORE_STAFF_NAME], [STORE_STAFF_PHONE], [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_ORDER_COUNT], (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] oi on oi.[ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join [dbo].[FACTORY_DC_ITEMS] on oi.[ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity
      from [dbo].[FACTORY_DC]
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
      where [FACTORY_DC_FACCTORY_FKID] = '${FactoryID}' and [FACTORY_DC_STATUS] = 0 and FACTORY_DC_DATE = cast(getdate() as date) order by FACTORY_DC_PKID desc`);

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],(select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) as ORDER_ITEMS
        from [dbo].[FACTORY_DC_ITEMS]
        join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
        where [FACTORY_DC_ITEMS_DC_FKID] = '${result.recordsets[0][i].FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_DC_PKID: result.recordsets[0][i].FACTORY_DC_PKID,
        STORE_ID: result.recordsets[0][i].STORE_ID,
        STORE_CODE: result.recordsets[0][i].STORE_CODE,
        STORE_NAME: result.recordsets[0][i].STORE_NAME,
        STORE_CITY: result.recordsets[0][i].STORE_CITY,
        STORE_PHONE: result.recordsets[0][i].STORE_PHONE,
        STORE_STAFF_NAME: result.recordsets[0][i].STORE_STAFF_NAME,
        STORE_STAFF_PHONE: result.recordsets[0][i].STORE_STAFF_PHONE,
        FACTORY_DC_DATE: result.recordsets[0][i].FACTORY_DC_DATE,
        FACTORY_DC_NUMBER: result.recordsets[0][i].FACTORY_DC_NUMBER,
        FACTORY_DC_ORDER_COUNT: result.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
        FACTORY_DC_TOTAL_BAGS: result.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
        TotalQuantity: result.recordsets[0][i].TotalQuantity,
        DCInnerItems: DCInnerItems.recordsets[0],
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("FactoryViewInTakeOrders-->", error);
  }
}

async function FactoryViewInTakeOrdersFilter(obj) {
  try {
    console.log(obj);

    var arr = [];

    let pool = await sql.connect(config);

    var MyQuery = `select [FACTORY_DC_TOTAL_BAGS],[FACTORY_DC_PKID],[STORE_ID], [STORE_CODE], [STORE_NAME], [STORE_CITY], [STORE_PHONE], [STORE_STAFF_NAME], [STORE_STAFF_PHONE], [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_ORDER_COUNT], (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] join [dbo].[ORDERS] oi on oi.[ORDER_PKID] = [ORDER_ITEM_ORDER_FKID] join [dbo].[FACTORY_DC_ITEMS] on oi.[ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity
    from [dbo].[FACTORY_DC]
    join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
    where [FACTORY_DC_FACCTORY_FKID] = '${obj.FactoryID}' and [FACTORY_DC_STATUS] = 0 `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],(select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) as ORDER_ITEMS
          from [dbo].[FACTORY_DC_ITEMS]
          join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
          where [FACTORY_DC_ITEMS_DC_FKID] = '${result3.recordsets[0][i].FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_DC_PKID: result3.recordsets[0][i].FACTORY_DC_PKID,
          STORE_ID: result3.recordsets[0][i].STORE_ID,
          STORE_CODE: result3.recordsets[0][i].STORE_CODE,
          STORE_NAME: result3.recordsets[0][i].STORE_NAME,
          STORE_CITY: result3.recordsets[0][i].STORE_CITY,
          STORE_PHONE: result3.recordsets[0][i].STORE_PHONE,
          STORE_STAFF_NAME: result3.recordsets[0][i].STORE_STAFF_NAME,
          STORE_STAFF_PHONE: result3.recordsets[0][i].STORE_STAFF_PHONE,
          FACTORY_DC_DATE: result3.recordsets[0][i].FACTORY_DC_DATE,
          FACTORY_DC_NUMBER: result3.recordsets[0][i].FACTORY_DC_NUMBER,
          FACTORY_DC_ORDER_COUNT:
            result3.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
          FACTORY_DC_TOTAL_BAGS: result3.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
          TotalQuantity: result3.recordsets[0][i].TotalQuantity,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }
      return arr;
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += ` and FACTORY_DC_OUTLET_FKID = '${obj.Outlet}' `;
      }
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
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],(select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) as ORDER_ITEMS
          from [dbo].[FACTORY_DC_ITEMS]
          join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
          where [FACTORY_DC_ITEMS_DC_FKID] = '${result4.recordsets[0][i].FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_DC_PKID: result4.recordsets[0][i].FACTORY_DC_PKID,
          STORE_ID: result4.recordsets[0][i].STORE_ID,
          STORE_CODE: result4.recordsets[0][i].STORE_CODE,
          STORE_NAME: result4.recordsets[0][i].STORE_NAME,
          STORE_CITY: result4.recordsets[0][i].STORE_CITY,
          STORE_PHONE: result4.recordsets[0][i].STORE_PHONE,
          STORE_STAFF_NAME: result4.recordsets[0][i].STORE_STAFF_NAME,
          STORE_STAFF_PHONE: result4.recordsets[0][i].STORE_STAFF_PHONE,
          FACTORY_DC_DATE: result4.recordsets[0][i].FACTORY_DC_DATE,
          FACTORY_DC_NUMBER: result4.recordsets[0][i].FACTORY_DC_NUMBER,
          FACTORY_DC_ORDER_COUNT:
            result4.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
          FACTORY_DC_TOTAL_BAGS: result4.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
          TotalQuantity: result4.recordsets[0][i].TotalQuantity,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }
      return arr;
    }
  } catch (error) {
    console.log("FactoryViewInTakeOrdersFilter-->", error);
  }
}

// Confirm Factory Intake from outlet

async function FactoryConfirmInTakeBulk(obj) {
  try {
    let pool = await sql.connect(config);

    for (var i = 0; i < obj.DCItems.length; i++) {
      var DCID = obj.DCItems[i].FACTORY_DC_PKID;

      var result = await pool
        .request()
        .query(
          `update [dbo].[FACTORY_DC] set FACTORY_DC_STATUS = 1 where FACTORY_DC_PKID = '${DCID}'`
        );

      var result1 = await pool
        .request()
        .query(
          `select * from [dbo].[FACTORY_DC] where FACTORY_DC_PKID = '${DCID}'`
        );

      let UpdateOrderStatus = await pool
        .request()
        .input("DCID", DCID)
        .input("FactoryID", result1.recordsets[0][0].FACTORY_DC_FACCTORY_FKID)
        .execute("FactoryInTakeUpdateOrderDetails");
    }
    return true;
  } catch (error) {
    console.log("FactoryConfirmInTakeBulk-->", error);
  }
}

async function FactoryConfirmInTake(DCID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `update [dbo].[FACTORY_DC] set FACTORY_DC_STATUS = 1 where FACTORY_DC_PKID = '${DCID}'`
      );

    var result1 = await pool
      .request()
      .query(
        `select * from [dbo].[FACTORY_DC] where FACTORY_DC_PKID = '${DCID}'`
      );

    console.log(DCID);
    console.log(result1.recordsets[0][0].FACTORY_DC_FACCTORY_FKID);

    let UpdateOrderStatus = await pool
      .request()
      .input("DCID", DCID)
      .input("FactoryID", result1.recordsets[0][0].FACTORY_DC_FACCTORY_FKID)
      .execute("FactoryInTakeUpdateOrderDetails");

    if (result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("FactoryConfirmInTake-->", error);
  }
}

// View Confirmed Intake from outlet with filter

async function ViewConfirmedOutletIntake(FactoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct FACTORY_DC_QR,FACTORY_INVENTORY_DATE,FACTORY_INVENTORY_TIME,[FACTORY_DC_TOTAL_BAGS],[FACTORY_DC_PKID],[STORE_ID], [STORE_CODE], [STORE_NAME], [STORE_CITY], [STORE_PHONE], [STORE_STAFF_NAME], [STORE_STAFF_PHONE], [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_ORDER_COUNT], (select sum(cast(ORDER_ITEM_QUANTITY as int)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalCount,
      (select sum(cast(ORDER_FINAL_ORDER_AMOUNT as float)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalAmount
      from [dbo].[FACTORY_DC]
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
      join FACTORY_INVENTORY on FACTORY_INVENTORY_RECEIVED_DC_FKID = FACTORY_DC_PKID and FACTORY_INVENTORY_RECEIVED_FROM = 'Outlet'
      where [FACTORY_DC_FACCTORY_FKID] = '${FactoryID}' and [FACTORY_DC_STATUS] = 1 and FACTORY_DC_DATE = cast(getdate() as date) order by FACTORY_DC_PKID desc`);

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],ORDER_FINAL_ORDER_AMOUNT,[ORDER_QR],ORDER_ITEMS,
        (select sum(cast(ORDER_ITEM_QUANTITY as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalCount
                from [dbo].[FACTORY_DC_ITEMS]
                join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
        where [FACTORY_DC_ITEMS_DC_FKID] = '${result.recordsets[0][i].FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_DC_PKID: result.recordsets[0][i].FACTORY_DC_PKID,
        TotalAmount: result.recordsets[0][i].TotalAmount,
        FACTORY_DC_QR: result.recordsets[0][i].FACTORY_DC_QR,
        STORE_ID: result.recordsets[0][i].STORE_ID,
        STORE_CODE: result.recordsets[0][i].STORE_CODE,
        STORE_NAME: result.recordsets[0][i].STORE_NAME,
        STORE_CITY: result.recordsets[0][i].STORE_CITY,
        STORE_PHONE: result.recordsets[0][i].STORE_PHONE,
        STORE_STAFF_NAME: result.recordsets[0][i].STORE_STAFF_NAME,
        STORE_STAFF_PHONE: result.recordsets[0][i].STORE_STAFF_PHONE,
        FACTORY_DC_DATE: result.recordsets[0][i].FACTORY_DC_DATE,
        FACTORY_INVENTORY_DATE: result.recordsets[0][i].FACTORY_INVENTORY_DATE,
        FACTORY_INVENTORY_TIME: result.recordsets[0][i].FACTORY_INVENTORY_TIME,
        FACTORY_DC_NUMBER: result.recordsets[0][i].FACTORY_DC_NUMBER,
        FACTORY_DC_ORDER_COUNT: result.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
        FACTORY_DC_TOTAL_BAGS: result.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
        TotalQuantity: result.recordsets[0][i].TotalQuantity,
        TotalCount: result.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ViewConfirmedOutletIntake-->", error);
  }
}

async function ViewConfirmedOutletIntakeFilter(obj) {
  try {
    console.log(obj);

    var arr = [];

    let pool = await sql.connect(config);

    var MyQuery = `select distinct FACTORY_DC_QR,FACTORY_INVENTORY_DATE,FACTORY_INVENTORY_TIME,[FACTORY_DC_TOTAL_BAGS],[FACTORY_DC_PKID],[STORE_ID], [STORE_CODE], [STORE_NAME], [STORE_CITY], [STORE_PHONE], [STORE_STAFF_NAME], [STORE_STAFF_PHONE], [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_ORDER_COUNT], (select sum(cast(ORDER_ITEM_QUANTITY as int)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalCount,
    (select sum(cast(ORDER_FINAL_ORDER_AMOUNT as float)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalAmount
    from [dbo].[FACTORY_DC]
    join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
    join FACTORY_INVENTORY on FACTORY_INVENTORY_RECEIVED_DC_FKID = FACTORY_DC_PKID and FACTORY_INVENTORY_RECEIVED_FROM = 'Outlet'
    where [FACTORY_DC_FACCTORY_FKID] = '${obj.FactoryID}' and [FACTORY_DC_STATUS] = 1 `;

    if (
      obj.OutletID == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],ORDER_FINAL_ORDER_AMOUNT,[ORDER_QR],ORDER_ITEMS,
          (select sum(cast(ORDER_ITEM_QUANTITY as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalCount
                  from [dbo].[FACTORY_DC_ITEMS]
                  join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
          where [FACTORY_DC_ITEMS_DC_FKID] = '${result3.recordsets[0][i].FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_DC_PKID: result3.recordsets[0][i].FACTORY_DC_PKID,
          FACTORY_DC_QR: result3.recordsets[0][i].FACTORY_DC_QR,
          TotalAmount: result3.recordsets[0][i].TotalAmount,
          STORE_ID: result3.recordsets[0][i].STORE_ID,
          STORE_CODE: result3.recordsets[0][i].STORE_CODE,
          STORE_NAME: result3.recordsets[0][i].STORE_NAME,
          STORE_CITY: result3.recordsets[0][i].STORE_CITY,
          STORE_PHONE: result3.recordsets[0][i].STORE_PHONE,
          STORE_STAFF_NAME: result3.recordsets[0][i].STORE_STAFF_NAME,
          STORE_STAFF_PHONE: result3.recordsets[0][i].STORE_STAFF_PHONE,
          FACTORY_DC_DATE: result3.recordsets[0][i].FACTORY_DC_DATE,
          FACTORY_INVENTORY_DATE:
            result.recordsets[0][i].FACTORY_INVENTORY_DATE,
          FACTORY_INVENTORY_TIME:
            result.recordsets[0][i].FACTORY_INVENTORY_TIME,
          FACTORY_DC_NUMBER: result3.recordsets[0][i].FACTORY_DC_NUMBER,
          FACTORY_DC_ORDER_COUNT:
            result3.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
          FACTORY_DC_TOTAL_BAGS: result3.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
          TotalQuantity: result3.recordsets[0][i].TotalQuantity,
          TotalCount: result3.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }
      return arr;
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += ` and FACTORY_DC_OUTLET_FKID = '${obj.OutletID}' `;
      }
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
      console.log(MyQuery);
      var result4 = await pool.request().query(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],ORDER_FINAL_ORDER_AMOUNT,[ORDER_QR],ORDER_ITEMS,
          (select sum(cast(ORDER_ITEM_QUANTITY as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalCount
                  from [dbo].[FACTORY_DC_ITEMS]
                  join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
          where [FACTORY_DC_ITEMS_DC_FKID] = '${result4.recordsets[0][i].FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_DC_PKID: result4.recordsets[0][i].FACTORY_DC_PKID,
          FACTORY_DC_QR: result4.recordsets[0][i].FACTORY_DC_QR,
          TotalAmount: result4.recordsets[0][i].TotalAmount,
          STORE_ID: result4.recordsets[0][i].STORE_ID,
          STORE_CODE: result4.recordsets[0][i].STORE_CODE,
          STORE_NAME: result4.recordsets[0][i].STORE_NAME,
          STORE_CITY: result4.recordsets[0][i].STORE_CITY,
          STORE_PHONE: result4.recordsets[0][i].STORE_PHONE,
          STORE_STAFF_NAME: result4.recordsets[0][i].STORE_STAFF_NAME,
          STORE_STAFF_PHONE: result4.recordsets[0][i].STORE_STAFF_PHONE,
          FACTORY_DC_DATE: result4.recordsets[0][i].FACTORY_DC_DATE,
          FACTORY_INVENTORY_DATE:
            result4.recordsets[0][i].FACTORY_INVENTORY_DATE,
          FACTORY_INVENTORY_TIME:
            result4.recordsets[0][i].FACTORY_INVENTORY_TIME,
          FACTORY_DC_NUMBER: result4.recordsets[0][i].FACTORY_DC_NUMBER,
          FACTORY_DC_ORDER_COUNT:
            result4.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
          FACTORY_DC_TOTAL_BAGS: result4.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
          TotalQuantity: result4.recordsets[0][i].TotalQuantity,
          TotalCount: result4.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };
        arr.push(obj);
      }
      return arr;
    }
  } catch (error) {
    console.log("ViewConfirmedOutletIntakeFilter-->", error);
  }
}

async function ViewConfirmedOutletIntakeByDCNumber(obj) {
  try {
    console.log(obj);
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct FACTORY_DC_QR,FACTORY_INVENTORY_DATE,FACTORY_INVENTORY_TIME,[FACTORY_DC_TOTAL_BAGS],[FACTORY_DC_PKID],[STORE_ID], [STORE_CODE], [STORE_NAME], [STORE_CITY], [STORE_PHONE], [STORE_STAFF_NAME], [STORE_STAFF_PHONE], [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_ORDER_COUNT], (select sum(cast(ORDER_ITEM_QUANTITY as int)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalCount,
      (select sum(cast(ORDER_FINAL_ORDER_AMOUNT as float)) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalAmount
      from [dbo].[FACTORY_DC]
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
      join FACTORY_INVENTORY on FACTORY_INVENTORY_RECEIVED_DC_FKID = FACTORY_DC_PKID and FACTORY_INVENTORY_RECEIVED_FROM = 'Outlet'
      where [FACTORY_DC_FACCTORY_FKID] = '${obj.FactoryID}' and [FACTORY_DC_NUMBER] = '${obj.DCNumber}' and [FACTORY_DC_STATUS] = 1`);

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],ORDER_FINAL_ORDER_AMOUNT,[ORDER_QR],ORDER_ITEMS,
        (select sum(cast(ORDER_ITEM_QUANTITY as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ORDER_PKID) as TotalCount
                from [dbo].[FACTORY_DC_ITEMS]
                join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID]
        where [FACTORY_DC_ITEMS_DC_FKID] = '${result.recordsets[0][i].FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_DC_PKID: result.recordsets[0][i].FACTORY_DC_PKID,
        FACTORY_DC_QR: result.recordsets[0][i].FACTORY_DC_QR,
        TotalAmount: result.recordsets[0][i].TotalAmount,
        STORE_ID: result.recordsets[0][i].STORE_ID,
        STORE_CODE: result.recordsets[0][i].STORE_CODE,
        STORE_NAME: result.recordsets[0][i].STORE_NAME,
        STORE_CITY: result.recordsets[0][i].STORE_CITY,
        STORE_PHONE: result.recordsets[0][i].STORE_PHONE,
        STORE_STAFF_NAME: result.recordsets[0][i].STORE_STAFF_NAME,
        STORE_STAFF_PHONE: result.recordsets[0][i].STORE_STAFF_PHONE,
        FACTORY_DC_DATE: result.recordsets[0][i].FACTORY_DC_DATE,
        FACTORY_INVENTORY_DATE: result.recordsets[0][i].FACTORY_INVENTORY_DATE,
        FACTORY_INVENTORY_TIME: result.recordsets[0][i].FACTORY_INVENTORY_TIME,
        FACTORY_DC_NUMBER: result.recordsets[0][i].FACTORY_DC_NUMBER,
        FACTORY_DC_ORDER_COUNT: result.recordsets[0][i].FACTORY_DC_ORDER_COUNT,
        FACTORY_DC_TOTAL_BAGS: result.recordsets[0][i].FACTORY_DC_TOTAL_BAGS,
        TotalQuantity: result.recordsets[0][i].TotalQuantity,
        TotalCount: result.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ViewConfirmedOutletIntakeByDCNumber-->", error);
  }
}

// View Intake request sent by another factory

async function FactoryViewInTakeOrdersFromFactory(FactoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select FACTORY_STAFF_NAME,[FACTORY_TO_FACTORY_DC_TOTAL_BAGS],[FACTORY_TO_FACTORY_DC_PKID],[FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID], [FACTORY_CODE], [FACTORY_NAME], [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER], [FACTORY_TO_FACTORY_DC_ITEM_COUNT]
      from [dbo].[FACTORY_TO_FACTORY_DC]
      join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]
      join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_FACTORY_DC_STAFF_FKID]
      where [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID] = '${FactoryID}' and [FACTORY_TO_FACTORY_DC_STATUS] = 0`);

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR]
        from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
        join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
        join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
        join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
        where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_STAFF_NAME: result.recordsets[0][i].FACTORY_STAFF_NAME,
        FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
        FACTORY_TO_FACTORY_DC_PKID:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
        FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
        FACTORY_CODE: result.recordsets[0][i].FACTORY_CODE,
        FACTORY_NAME: result.recordsets[0][i].FACTORY_NAME,
        FACTORY_TO_FACTORY_DC_DATE:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
        FACTORY_TO_FACTORY_DC_NUMBER:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
        FACTORY_TO_FACTORY_DC_ITEM_COUNT:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
        DCInnerItems: DCInnerItems.recordsets[0],
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("FactoryViewInTakeOrdersFromFactory-->", error);
  }
}

async function FactoryViewInTakeOrdersFromFactoryFilter(obj) {
  try {
    console.log(obj);

    var arr = [];

    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_STAFF_NAME,[FACTORY_TO_FACTORY_DC_TOTAL_BAGS],[FACTORY_TO_FACTORY_DC_PKID],[FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID], [FACTORY_CODE], [FACTORY_NAME], [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER], [FACTORY_TO_FACTORY_DC_ITEM_COUNT]
    from [dbo].[FACTORY_TO_FACTORY_DC]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]
    join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_FACTORY_DC_STAFF_FKID]
    where [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]  = '${obj.FromFactoryID}' and [FACTORY_TO_FACTORY_DC_STATUS] = 0 `;

    if (
      obj.ToFactory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_TO_FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR]
          from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
          join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
          join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
          join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
          where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_STAFF_NAME: result3.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
          FACTORY_TO_FACTORY_DC_PKID:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
          FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
          FACTORY_CODE: result3.recordsets[0][i].FACTORY_CODE,
          FACTORY_NAME: result3.recordsets[0][i].FACTORY_NAME,
          FACTORY_TO_FACTORY_DC_DATE:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
          FACTORY_TO_FACTORY_DC_NUMBER:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
          FACTORY_TO_FACTORY_DC_ITEM_COUNT:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
          DCInnerItems: DCInnerItems.recordsets[0],
        };

        arr.push(obj);
      }
      return arr;
    } else {
      if (obj.ToFactory == "-") {
      } else {
        MyQuery += ` and FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID = '${obj.ToFactory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(FACTORY_TO_FACTORY_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(FACTORY_TO_FACTORY_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (FACTORY_TO_FACTORY_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by FACTORY_TO_FACTORY_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR]
          from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
          join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
          join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
          join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
          where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_STAFF_NAME: result4.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
          FACTORY_TO_FACTORY_DC_PKID:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
          FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
          FACTORY_CODE: result4.recordsets[0][i].FACTORY_CODE,
          FACTORY_NAME: result4.recordsets[0][i].FACTORY_NAME,
          FACTORY_TO_FACTORY_DC_DATE:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
          FACTORY_TO_FACTORY_DC_NUMBER:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
          FACTORY_TO_FACTORY_DC_ITEM_COUNT:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
          DCInnerItems: DCInnerItems.recordsets[0],
        };

        arr.push(obj);
      }
      return arr;
    }
  } catch (error) {
    console.log("FactoryViewInTakeOrdersFromFactoryFilter-->", error);
  }
}

// Confirm Factory Intake from Another Factory

async function FactoryConfirmInTakeFromFactory(DCID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `update [dbo].[FACTORY_TO_FACTORY_DC] set FACTORY_TO_FACTORY_DC_STATUS = 1 where FACTORY_TO_FACTORY_DC_PKID = '${DCID}'`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select * from [dbo].[FACTORY_TO_FACTORY_DC] where FACTORY_TO_FACTORY_DC_PKID = '${DCID}'`
        );

      let UpdateOrderStatus = await pool
        .request()
        .input("DCID", DCID)
        .input(
          "FactoryID",
          result1.recordsets[0][0].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID
        )
        .execute("IntakeUpdateFactoryInventoryFromFactory");

      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("FactoryConfirmInTakeFromFactory-->", error);
  }
}

async function FactoryConfirmInTakeFromFactoryBulk(DCID) {
  try {
    let pool = await sql.connect(config);

    for (var i = 0; i < obj.DCItems.length; i++) {
      var DCID = obj.DCItems[i].FACTORY_TO_FACTORY_DC_PKID;
      var result = await pool
        .request()
        .query(
          `update [dbo].[FACTORY_TO_FACTORY_DC] set FACTORY_TO_FACTORY_DC_STATUS = 1 where FACTORY_TO_FACTORY_DC_PKID = '${DCID}'`
        );

      if (result.rowsAffected > 0) {
        var result1 = await pool
          .request()
          .query(
            `select * from [dbo].[FACTORY_TO_FACTORY_DC] where FACTORY_TO_FACTORY_DC_PKID = '${DCID}'`
          );

        let UpdateOrderStatus = await pool
          .request()
          .input("DCID", DCID)
          .input(
            "FactoryID",
            result1.recordsets[0][0].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID
          )
          .execute("IntakeUpdateFactoryInventoryFromFactory");
      }
    }
    return true;
  } catch (error) {
    console.log("FactoryConfirmInTakeFromFactoryBulk-->", error);
  }
}

// View Confirmed Intake from Another Factory with filter

async function ViewConfirmedFactoryIntake(FactoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct FACTORY_INVENTORY_DATE,FACTORY_INVENTORY_TIME,FACTORY_TO_FACTORY_DC_QR, FACTORY_STAFF_NAME,[FACTORY_TO_FACTORY_DC_TOTAL_BAGS],[FACTORY_TO_FACTORY_DC_PKID],[FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID], tf.[FACTORY_CODE] as TO_FACTORY_CODE, tf.[FACTORY_NAME] as TO_FACTORY_NAME, ff.[FACTORY_CODE] as FROM_FACTORY_CODE, ff.[FACTORY_NAME] as FROM_FACTORY_NAME, [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER], [FACTORY_TO_FACTORY_DC_ITEM_COUNT],
      (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] join [dbo].[FACTORY_TO_FACTORY_DC_ITEMS] on FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID and  [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] =  FACTORY_TO_FACTORY_DC_PKID ) as TotalQuantity,
      (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] join [dbo].[FACTORY_TO_FACTORY_DC_ITEMS] on FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID and  [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] =  FACTORY_TO_FACTORY_DC_PKID ) as TotalCount
            from [dbo].[FACTORY_TO_FACTORY_DC]
            join [dbo].[FACTORY] ff on ff.[FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID]
            join [dbo].[FACTORY] tf on tf.[FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]
            join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_FACTORY_DC_STAFF_FKID]
            join FACTORY_INVENTORY on FACTORY_INVENTORY_RECEIVED_DC_FKID = FACTORY_TO_FACTORY_DC_PKID and FACTORY_INVENTORY_RECEIVED_FROM = 'Factory'
      where [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID] = '${FactoryID}' and [FACTORY_TO_FACTORY_DC_STATUS] = 1 and FACTORY_TO_FACTORY_DC_DATE = cast(getdate() as date) order by FACTORY_TO_FACTORY_DC_PKID desc`);

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR],
        (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalQuantity,
      (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalCount
        from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
        join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
        join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
        join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
        where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_STAFF_NAME: result.recordsets[0][i].FACTORY_STAFF_NAME,
        FACTORY_TO_FACTORY_DC_QR:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_QR,
        FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
        FACTORY_TO_FACTORY_DC_PKID:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
        FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
        TO_FACTORY_CODE: result.recordsets[0][i].TO_FACTORY_CODE,
        TO_FACTORY_NAME: result.recordsets[0][i].TO_FACTORY_NAME,
        FROM_FACTORY_CODE: result.recordsets[0][i].FROM_FACTORY_CODE,
        FROM_FACTORY_NAME: result.recordsets[0][i].FROM_FACTORY_NAME,
        FACTORY_INVENTORY_DATE: result.recordsets[0][i].FACTORY_INVENTORY_DATE,
        FACTORY_INVENTORY_TIME: result.recordsets[0][i].FACTORY_INVENTORY_TIME,
        FACTORY_TO_FACTORY_DC_DATE:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
        FACTORY_TO_FACTORY_DC_NUMBER:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
        FACTORY_TO_FACTORY_DC_ITEM_COUNT:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
        TotalQuantity: result.recordsets[0][i].TotalQuantity,
        TotalCount: result.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ViewConfirmedFactoryIntake-->", error);
  }
}

async function ViewConfirmedFactoryIntakeFilter(obj) {
  try {
    console.log(obj);

    var arr = [];

    let pool = await sql.connect(config);

    var MyQuery = `select distinct FACTORY_INVENTORY_DATE,FACTORY_INVENTORY_TIME,FACTORY_TO_FACTORY_DC_QR,FACTORY_STAFF_NAME,[FACTORY_TO_FACTORY_DC_TOTAL_BAGS],[FACTORY_TO_FACTORY_DC_PKID],[FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID], tf.[FACTORY_CODE] as TO_FACTORY_CODE, tf.[FACTORY_NAME] as TO_FACTORY_NAME, ff.[FACTORY_CODE] as FROM_FACTORY_CODE, ff.[FACTORY_NAME] as FROM_FACTORY_NAME, [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER], [FACTORY_TO_FACTORY_DC_ITEM_COUNT],
    (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] join [dbo].[FACTORY_TO_FACTORY_DC_ITEMS] on FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID and  [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] =  FACTORY_TO_FACTORY_DC_PKID ) as TotalQuantity,
      (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] join [dbo].[FACTORY_TO_FACTORY_DC_ITEMS] on FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID and  [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] =  FACTORY_TO_FACTORY_DC_PKID ) as TotalCount
    from [dbo].[FACTORY_TO_FACTORY_DC]
    join [dbo].[FACTORY] ff on ff.[FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID]
	  join [dbo].[FACTORY] tf on tf.[FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]
    join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_FACTORY_DC_STAFF_FKID]
    join FACTORY_INVENTORY on FACTORY_INVENTORY_RECEIVED_DC_FKID = FACTORY_TO_FACTORY_DC_PKID and FACTORY_INVENTORY_RECEIVED_FROM = 'Factory'
    where [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]  = '${obj.FromFactoryID}' and [FACTORY_TO_FACTORY_DC_STATUS] = 1 `;

    if (
      obj.ToFactory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_TO_FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      for (var i = 0; i < result3.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR],
          (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalQuantity,
          (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalCount
          from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
          join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
          join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
          join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
          where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_STAFF_NAME: result3.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_FACTORY_DC_QR:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_QR,
          FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
          FACTORY_TO_FACTORY_DC_PKID:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
          FACTORY_INVENTORY_DATE:
            result3.recordsets[0][i].FACTORY_INVENTORY_DATE,
          FACTORY_INVENTORY_TIME:
            result3.recordsets[0][i].FACTORY_INVENTORY_TIME,
          FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
          TO_FACTORY_CODE: result3.recordsets[0][i].TO_FACTORY_CODE,
          TO_FACTORY_NAME: result3.recordsets[0][i].TO_FACTORY_NAME,
          FROM_FACTORY_CODE: result3.recordsets[0][i].FROM_FACTORY_CODE,
          FROM_FACTORY_NAME: result3.recordsets[0][i].FROM_FACTORY_NAME,
          FACTORY_TO_FACTORY_DC_DATE:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
          FACTORY_TO_FACTORY_DC_NUMBER:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
          FACTORY_TO_FACTORY_DC_ITEM_COUNT:
            result3.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
          TotalQuantity: result3.recordsets[0][i].TotalQuantity,
          TotalCount: result3.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };

        arr.push(obj);
      }
      return arr;
    } else {
      if (obj.ToFactory == "-") {
      } else {
        MyQuery += ` and FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID = '${obj.ToFactory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(FACTORY_TO_FACTORY_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(FACTORY_TO_FACTORY_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (FACTORY_TO_FACTORY_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by FACTORY_TO_FACTORY_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        var DCInnerItems = await pool.request()
          .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR],
          (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalQuantity,
          (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalCount
          from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
          join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
          join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
          join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
          where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

        var obj = {
          FACTORY_STAFF_NAME: result4.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_TO_FACTORY_DC_QR:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_QR,
          FACTORY_INVENTORY_DATE:
            result4.recordsets[0][i].FACTORY_INVENTORY_DATE,
          FACTORY_INVENTORY_TIME:
            result4.recordsets[0][i].FACTORY_INVENTORY_TIME,
          FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
          FACTORY_TO_FACTORY_DC_PKID:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
          FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
          TO_FACTORY_CODE: result4.recordsets[0][i].TO_FACTORY_CODE,
          TO_FACTORY_NAME: result4.recordsets[0][i].TO_FACTORY_NAME,
          FROM_FACTORY_CODE: result4.recordsets[0][i].FROM_FACTORY_CODE,
          FROM_FACTORY_NAME: result4.recordsets[0][i].FROM_FACTORY_NAME,
          FACTORY_TO_FACTORY_DC_DATE:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
          FACTORY_TO_FACTORY_DC_NUMBER:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
          FACTORY_TO_FACTORY_DC_ITEM_COUNT:
            result4.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
          TotalQuantity: result4.recordsets[0][i].TotalQuantity,
          TotalCount: result4.recordsets[0][i].TotalCount,
          DCInnerItems: DCInnerItems.recordsets[0],
        };

        arr.push(obj);
      }
      return arr;
    }
  } catch (error) {
    console.log("ViewConfirmedFactoryIntakeFilter-->", error);
  }
}

async function ViewConfirmedFactoryIntakeDCPrint(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct FACTORY_INVENTORY_DATE,FACTORY_INVENTORY_TIME,FACTORY_TO_FACTORY_DC_QR, FACTORY_STAFF_NAME,[FACTORY_TO_FACTORY_DC_TOTAL_BAGS],[FACTORY_TO_FACTORY_DC_PKID],[FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID], tf.[FACTORY_CODE] as TO_FACTORY_CODE, tf.[FACTORY_NAME] as TO_FACTORY_NAME, ff.[FACTORY_CODE] as FROM_FACTORY_CODE, ff.[FACTORY_NAME] as FROM_FACTORY_NAME, [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER], [FACTORY_TO_FACTORY_DC_ITEM_COUNT],
      (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] join [dbo].[FACTORY_TO_FACTORY_DC_ITEMS] on FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID and  [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] =  FACTORY_TO_FACTORY_DC_PKID ) as TotalQuantity,
      (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] join [dbo].[FACTORY_TO_FACTORY_DC_ITEMS] on FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID and  [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] =  FACTORY_TO_FACTORY_DC_PKID ) as TotalCount
      from [dbo].[FACTORY_TO_FACTORY_DC]
      join [dbo].[FACTORY] ff on ff.[FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID]
	    join [dbo].[FACTORY] tf on tf.[FACTORY_PKID] = [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID]
      join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_FACTORY_DC_STAFF_FKID]
      join FACTORY_INVENTORY on FACTORY_INVENTORY_RECEIVED_DC_FKID = FACTORY_TO_FACTORY_DC_PKID and FACTORY_INVENTORY_RECEIVED_FROM = 'Factory'
      where [FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID] = '${obj.FactoryID}' and [FACTORY_TO_FACTORY_DC_STATUS] = 1 and FACTORY_TO_FACTORY_DC_NUMBER = '${obj.DCNumber}'`);

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select ITEMS_NAME,[ORDER_ITEM_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER],[ORDER_ITEM_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],[ORDER_ITEM_QR],
        (select sum(ORDER_ITEM_QUANTITY) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalQuantity,
        (select sum(ORDER_ITEM_COUNT) from [dbo].[ORDER_ITEMS] where FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID = ORDER_ITEM_PKID) as TotalCount
        from [dbo].[FACTORY_TO_FACTORY_DC_ITEMS]
        join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
        join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID
        join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
        where [FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID] = '${result.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID}'`);

      var obj = {
        FACTORY_STAFF_NAME: result.recordsets[0][i].FACTORY_STAFF_NAME,
        FACTORY_TO_FACTORY_DC_QR:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_QR,
        FACTORY_TO_FACTORY_DC_TOTAL_BAGS:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_TOTAL_BAGS,
        FACTORY_TO_FACTORY_DC_PKID:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_PKID,
        FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,
        TO_FACTORY_CODE: result.recordsets[0][i].TO_FACTORY_CODE,
        TO_FACTORY_NAME: result.recordsets[0][i].TO_FACTORY_NAME,
        FROM_FACTORY_CODE: result.recordsets[0][i].FROM_FACTORY_CODE,
        FROM_FACTORY_NAME: result.recordsets[0][i].FROM_FACTORY_NAME,
        FACTORY_INVENTORY_DATE: result.recordsets[0][i].FACTORY_INVENTORY_DATE,
        FACTORY_INVENTORY_TIME: result.recordsets[0][i].FACTORY_INVENTORY_TIME,
        FACTORY_TO_FACTORY_DC_DATE:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_DATE,
        FACTORY_TO_FACTORY_DC_NUMBER:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_NUMBER,
        FACTORY_TO_FACTORY_DC_ITEM_COUNT:
          result.recordsets[0][i].FACTORY_TO_FACTORY_DC_ITEM_COUNT,
        TotalQuantity: result.recordsets[0][i].TotalQuantity,
        TotalCount: result.recordsets[0][i].TotalCount,
        DCInnerItems: DCInnerItems.recordsets[0],
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ViewConfirmedFactoryIntakeDCPrint-->", error);
  }
}

// View Current Inventory Of The Factory with filters

async function CurrentFactoryInventory(FactoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select fi.*, o.ORDER_ORDER_NUMBER, o.ORDER_DATE, o.ORDER_DUE_DATE, oi.ORDER_ITEM_NUMBER, i.ITEMS_NAME, ias.ADDITIONAL_SERVICE_NAME, s.STORE_NAME, s.STORE_CODE, s.STORE_SHORT_CODE,
      (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_PKID] = oi.ORDER_ITEM_PKID) as TotalQuantity,
      (select sum(cast([ORDER_ITEM_COUNT] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_PKID] = oi.ORDER_ITEM_PKID) as TotalCount
      from FACTORY_INVENTORY fi
      join ORDER_ITEMS oi on oi.ORDER_ITEM_PKID = fi.FACTORY_INVENTORY_ITEM_FKID
      join ORDERS o on o.ORDER_PKID = fi.FACTORY_INVENTORY_ORDER_FKID
      join ITEMS i on i.ITEMS_PKID = oi.ORDER_ITEM_ITEM_FKID
      left join ADDITIONAL_SERVICE ias on ias.ADDITIONAL_SERVICE_PKID = oi.ORDER_ITEM_ADDITIONAL_REQUEST_FKID
      join STORES s on s.STORE_PKID = fi.FACTORY_INVENTORY_OUTLET_FKID
      where [FACTORY_INVENTORY_FACTORY_FKID] = '${FactoryID}' and [FACTORY_INVENTORY_DATE] = cast(getdate() as date) and FACTORY_INVENTORY_STATUS = 1 
      order by [FACTORY_INVENTORY_PKID] desc`
    );
    for (var i = 0; i < result1.recordsets[0].length; i++) {
      console.log(result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM);
      if (
        result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM === "Outlet"
      ) {
        var result2 = await pool.request().query(
          `select [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_QR], [STORE_NAME]
          from [dbo].[FACTORY_DC]
          join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
          where [FACTORY_DC_PKID] = '${result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID}'`
        );
        var obj = {
          TotalQuantity: result1.recordsets[0][i].TotalQuantity,
          TotalCount: result1.recordsets[0][i].TotalCount,
          FACTORY_INVENTORY_PKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_PKID,
          FACTORY_INVENTORY_FACTORY_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_FACTORY_FKID,
          FACTORY_INVENTORY_DATE:
            result1.recordsets[0][i].FACTORY_INVENTORY_DATE,
          FACTORY_INVENTORY_TIME:
            result1.recordsets[0][i].FACTORY_INVENTORY_TIME,
          FACTORY_INVENTORY_ORDER_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_ORDER_FKID,
          FACTORY_INVENTORY_ITEM_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_ITEM_FKID,
          FACTORY_INVENTORY_OUTLET_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_OUTLET_FKID,
          FACTORY_INVENTORY_RECEIVED_FROM:
            result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM,
          FACTORY_INVENTORY_RECEIVED_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FKID,
          FACTORY_INVENTORY_RECEIVED_DC_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID,
          FACTORY_INVENTORY_STATUS:
            result1.recordsets[0][i].FACTORY_INVENTORY_STATUS,
          ORDER_ORDER_NUMBER: result1.recordsets[0][i].ORDER_ORDER_NUMBER,
          ORDER_DATE: result1.recordsets[0][i].ORDER_DATE,
          ORDER_DUE_DATE: result1.recordsets[0][i].ORDER_DUE_DATE,
          ORDER_ITEM_NUMBER: result1.recordsets[0][i].ORDER_ITEM_NUMBER,
          ITEMS_NAME: result1.recordsets[0][i].ITEMS_NAME,
          ADDITIONAL_SERVICE_NAME:
            result1.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
          STORE_NAME: result1.recordsets[0][i].STORE_NAME,
          STORE_CODE: result1.recordsets[0][i].STORE_CODE,
          STORE_SHORT_CODE: result1.recordsets[0][i].STORE_SHORT_CODE,
          DC_Date: result2.recordsets[0][0].FACTORY_DC_DATE,
          DC_Number: result2.recordsets[0][0].FACTORY_DC_NUMBER,
          DC_QR: result2.recordsets[0][0].FACTORY_DC_QR,
          DC_From_Name: result2.recordsets[0][0].STORE_NAME,
        };
        arr.push(obj);
      } else {
        var result3 = await pool.request().query(
          `select [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER],[FACTORY_TO_FACTORY_DC_QR], [FACTORY_NAME]
          from [dbo].[FACTORY_TO_FACTORY_DC]
          join [dbo].[FACTORY] on [FACTORY_PKID] = FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID
          where [FACTORY_TO_FACTORY_DC_PKID] = '${result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID}'`
        );
        var obj = {
          TotalQuantity: result1.recordsets[0][i].TotalQuantity,
          TotalCount: result1.recordsets[0][i].TotalCount,
          FACTORY_INVENTORY_PKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_PKID,
          FACTORY_INVENTORY_FACTORY_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_FACTORY_FKID,
          FACTORY_INVENTORY_DATE:
            result1.recordsets[0][i].FACTORY_INVENTORY_DATE,
          FACTORY_INVENTORY_TIME:
            result1.recordsets[0][i].FACTORY_INVENTORY_TIME,
          FACTORY_INVENTORY_ORDER_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_ORDER_FKID,
          FACTORY_INVENTORY_ITEM_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_ITEM_FKID,
          FACTORY_INVENTORY_OUTLET_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_OUTLET_FKID,
          FACTORY_INVENTORY_RECEIVED_FROM:
            result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM,
          FACTORY_INVENTORY_RECEIVED_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FKID,
          FACTORY_INVENTORY_RECEIVED_DC_FKID:
            result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID,
          FACTORY_INVENTORY_STATUS:
            result1.recordsets[0][i].FACTORY_INVENTORY_STATUS,
          ORDER_ORDER_NUMBER: result1.recordsets[0][i].ORDER_ORDER_NUMBER,
          ORDER_DATE: result1.recordsets[0][i].ORDER_DATE,
          ORDER_DUE_DATE: result1.recordsets[0][i].ORDER_DUE_DATE,
          ORDER_ITEM_NUMBER: result1.recordsets[0][i].ORDER_ITEM_NUMBER,
          ITEMS_NAME: result1.recordsets[0][i].ITEMS_NAME,
          ADDITIONAL_SERVICE_NAME:
            result1.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
          STORE_NAME: result1.recordsets[0][i].STORE_NAME,
          STORE_CODE: result1.recordsets[0][i].STORE_CODE,
          STORE_SHORT_CODE: result1.recordsets[0][i].STORE_SHORT_CODE,
          DC_Date: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_DATE,
          DC_Number: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_NUMBER,
          DC_QR: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_QR,
          DC_From_Name: result3.recordsets[0][0].FACTORY_NAME,
        };
        arr.push(obj);
      }
    }

    return arr;
  } catch (error) {
    console.log("CurrentFactoryInventory-->", error);
  }
}

async function CurrentFactoryInventoryFilter(obj) {
  try {
    console.log(obj);
    var typeee = obj.Factory_Outlet_Type;
    var arr = [];
    var MyQuery = ``;
    let pool = await sql.connect(config);

    if (obj.OutletOrFactoryID === "-") {
      MyQuery = `select fi.*, o.ORDER_ORDER_NUMBER, o.ORDER_DATE, o.ORDER_DUE_DATE, oi.ORDER_ITEM_NUMBER, i.ITEMS_NAME, ias.ADDITIONAL_SERVICE_NAME, s.STORE_NAME, s.STORE_CODE, s.STORE_SHORT_CODE,
      (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_PKID] = oi.ORDER_ITEM_PKID) as TotalQuantity,
      (select sum(cast([ORDER_ITEM_COUNT] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_PKID] = oi.ORDER_ITEM_PKID) as TotalCount
      from FACTORY_INVENTORY fi
      join ORDER_ITEMS oi on oi.ORDER_ITEM_PKID = fi.FACTORY_INVENTORY_ITEM_FKID
      join ORDERS o on o.ORDER_PKID = fi.FACTORY_INVENTORY_ORDER_FKID
      join ITEMS i on i.ITEMS_PKID = oi.ORDER_ITEM_ITEM_FKID
      left join ADDITIONAL_SERVICE ias on ias.ADDITIONAL_SERVICE_PKID = oi.ORDER_ITEM_ADDITIONAL_REQUEST_FKID
      join STORES s on s.STORE_PKID = fi.FACTORY_INVENTORY_OUTLET_FKID
      where [FACTORY_INVENTORY_FACTORY_FKID] = '${obj.FactoryID}' and FACTORY_INVENTORY_RECEIVED_FROM = '${obj.Factory_Outlet_Type}' and FACTORY_INVENTORY_STATUS = 1 `;
    } else {
      MyQuery = `select fi.*, o.ORDER_ORDER_NUMBER, o.ORDER_DATE, o.ORDER_DUE_DATE, oi.ORDER_ITEM_NUMBER, i.ITEMS_NAME, ias.ADDITIONAL_SERVICE_NAME, s.STORE_NAME, s.STORE_CODE, s.STORE_SHORT_CODE,
      (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_PKID] = oi.ORDER_ITEM_PKID) as TotalQuantity,
      (select sum(cast([ORDER_ITEM_COUNT] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_PKID] = oi.ORDER_ITEM_PKID) as TotalCount
      from FACTORY_INVENTORY fi
      join ORDER_ITEMS oi on oi.ORDER_ITEM_PKID = fi.FACTORY_INVENTORY_ITEM_FKID
      join ORDERS o on o.ORDER_PKID = fi.FACTORY_INVENTORY_ORDER_FKID
      join ITEMS i on i.ITEMS_PKID = oi.ORDER_ITEM_ITEM_FKID
      left join ADDITIONAL_SERVICE ias on ias.ADDITIONAL_SERVICE_PKID = oi.ORDER_ITEM_ADDITIONAL_REQUEST_FKID
      join STORES s on s.STORE_PKID = fi.FACTORY_INVENTORY_OUTLET_FKID
      where FACTORY_INVENTORY_RECEIVED_FKID = '${obj.OutletOrFactoryID}' and FACTORY_INVENTORY_RECEIVED_FROM = '${obj.Factory_Outlet_Type}' and  [FACTORY_INVENTORY_FACTORY_FKID] = '${obj.FactoryID}' and FACTORY_INVENTORY_STATUS = 1 `;
    }
    if (
      obj.Factory_Outlet_Type == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by [FACTORY_INVENTORY_PKID] desc `;
      var result1 = await pool.request().query(MyQuery);
      for (var i = 0; i < result1.recordsets[0].length; i++) {
        if (
          result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM === "Outlet"
        ) {
          var result2 = await pool.request().query(
            `select [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_QR], [STORE_NAME]
            from [dbo].[FACTORY_DC]
            join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
            where [FACTORY_DC_PKID] = '${result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID}'`
          );
          var obj = {
            TotalQuantity: result1.recordsets[0][i].TotalQuantity,
            TotalCount: result1.recordsets[0][i].TotalCount,
            FACTORY_INVENTORY_PKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_PKID,
            FACTORY_INVENTORY_FACTORY_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_FACTORY_FKID,
            FACTORY_INVENTORY_DATE:
              result1.recordsets[0][i].FACTORY_INVENTORY_DATE,
            FACTORY_INVENTORY_TIME:
              result1.recordsets[0][i].FACTORY_INVENTORY_TIME,
            FACTORY_INVENTORY_ORDER_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_ORDER_FKID,
            FACTORY_INVENTORY_ITEM_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_ITEM_FKID,
            FACTORY_INVENTORY_OUTLET_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_OUTLET_FKID,
            FACTORY_INVENTORY_RECEIVED_FROM:
              result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM,
            FACTORY_INVENTORY_RECEIVED_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FKID,
            FACTORY_INVENTORY_RECEIVED_DC_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID,
            FACTORY_INVENTORY_STATUS:
              result1.recordsets[0][i].FACTORY_INVENTORY_STATUS,
            ORDER_ORDER_NUMBER: result1.recordsets[0][i].ORDER_ORDER_NUMBER,
            ORDER_DATE: result1.recordsets[0][i].ORDER_DATE,
            ORDER_DUE_DATE: result1.recordsets[0][i].ORDER_DUE_DATE,
            ORDER_ITEM_NUMBER: result1.recordsets[0][i].ORDER_ITEM_NUMBER,
            ITEMS_NAME: result1.recordsets[0][i].ITEMS_NAME,
            ADDITIONAL_SERVICE_NAME:
              result1.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
            STORE_NAME: result1.recordsets[0][i].STORE_NAME,
            STORE_CODE: result1.recordsets[0][i].STORE_CODE,
            STORE_SHORT_CODE: result1.recordsets[0][i].STORE_SHORT_CODE,
            DC_Date: result2.recordsets[0][0].FACTORY_DC_DATE,
            DC_Number: result2.recordsets[0][0].FACTORY_DC_NUMBER,
            DC_QR: result2.recordsets[0][0].FACTORY_DC_QR,
            DC_From_Name: result2.recordsets[0][0].STORE_NAME,
          };
          arr.push(obj);
        } else {
          var result3 = await pool.request().query(
            `select [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER],[FACTORY_TO_FACTORY_DC_QR], [FACTORY_NAME]
            from [dbo].[FACTORY_TO_FACTORY_DC]
            join [dbo].[FACTORY] on [FACTORY_PKID] = FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID
            where [FACTORY_TO_FACTORY_DC_PKID] = '${result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID}'`
          );
          var obj = {
            TotalQuantity: result1.recordsets[0][i].TotalQuantity,
            TotalCount: result1.recordsets[0][i].TotalCount,
            FACTORY_INVENTORY_PKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_PKID,
            FACTORY_INVENTORY_FACTORY_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_FACTORY_FKID,
            FACTORY_INVENTORY_DATE:
              result1.recordsets[0][i].FACTORY_INVENTORY_DATE,
            FACTORY_INVENTORY_TIME:
              result1.recordsets[0][i].FACTORY_INVENTORY_TIME,
            FACTORY_INVENTORY_ORDER_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_ORDER_FKID,
            FACTORY_INVENTORY_ITEM_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_ITEM_FKID,
            FACTORY_INVENTORY_OUTLET_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_OUTLET_FKID,
            FACTORY_INVENTORY_RECEIVED_FROM:
              result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM,
            FACTORY_INVENTORY_RECEIVED_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FKID,
            FACTORY_INVENTORY_RECEIVED_DC_FKID:
              result1.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID,
            FACTORY_INVENTORY_STATUS:
              result1.recordsets[0][i].FACTORY_INVENTORY_STATUS,
            ORDER_ORDER_NUMBER: result1.recordsets[0][i].ORDER_ORDER_NUMBER,
            ORDER_DATE: result1.recordsets[0][i].ORDER_DATE,
            ORDER_DUE_DATE: result1.recordsets[0][i].ORDER_DUE_DATE,
            ORDER_ITEM_NUMBER: result1.recordsets[0][i].ORDER_ITEM_NUMBER,
            ITEMS_NAME: result1.recordsets[0][i].ITEMS_NAME,
            ADDITIONAL_SERVICE_NAME:
              result1.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
            STORE_NAME: result1.recordsets[0][i].STORE_NAME,
            STORE_CODE: result1.recordsets[0][i].STORE_CODE,
            STORE_SHORT_CODE: result1.recordsets[0][i].STORE_SHORT_CODE,
            DC_Date: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_DATE,
            DC_Number: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_NUMBER,
            DC_QR: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_QR,
            DC_From_Name: result3.recordsets[0][0].FACTORY_NAME,
          };
          arr.push(obj);
        }
      }
      return arr;
    } else {
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(FACTORY_INVENTORY_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(FACTORY_INVENTORY_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (FACTORY_INVENTORY_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by FACTORY_INVENTORY_PKID desc`;
      console.log(MyQuery);
      var result4 = await pool.request().query(MyQuery);
      for (var i = 0; i < result4.recordsets[0].length; i++) {
        if (
          typeee === "Outlet" &&
          result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM == "Outlet"
        ) {
          console.log("inside if");
          var result2 = await pool.request().query(
            `select [FACTORY_DC_DATE], [FACTORY_DC_NUMBER], [FACTORY_DC_QR], [STORE_NAME]
            from [dbo].[FACTORY_DC]
            join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
            where [FACTORY_DC_PKID] = '${result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID}'`
          );
          var obj = {
            TotalQuantity: result4.recordsets[0][i].TotalQuantity,
            TotalCount: result4.recordsets[0][i].TotalCount,
            FACTORY_INVENTORY_PKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_PKID,
            FACTORY_INVENTORY_FACTORY_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_FACTORY_FKID,
            FACTORY_INVENTORY_DATE:
              result4.recordsets[0][i].FACTORY_INVENTORY_DATE,
            FACTORY_INVENTORY_TIME:
              result4.recordsets[0][i].FACTORY_INVENTORY_TIME,
            FACTORY_INVENTORY_ORDER_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_ORDER_FKID,
            FACTORY_INVENTORY_ITEM_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_ITEM_FKID,
            FACTORY_INVENTORY_OUTLET_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_OUTLET_FKID,
            FACTORY_INVENTORY_RECEIVED_FROM:
              result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM,
            FACTORY_INVENTORY_RECEIVED_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FKID,
            FACTORY_INVENTORY_RECEIVED_DC_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID,
            FACTORY_INVENTORY_STATUS:
              result4.recordsets[0][i].FACTORY_INVENTORY_STATUS,
            ORDER_ORDER_NUMBER: result4.recordsets[0][i].ORDER_ORDER_NUMBER,
            ORDER_DATE: result4.recordsets[0][i].ORDER_DATE,
            ORDER_DUE_DATE: result4.recordsets[0][i].ORDER_DUE_DATE,
            ORDER_ITEM_NUMBER: result4.recordsets[0][i].ORDER_ITEM_NUMBER,
            ITEMS_NAME: result4.recordsets[0][i].ITEMS_NAME,
            ADDITIONAL_SERVICE_NAME:
              result4.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
            STORE_NAME: result4.recordsets[0][i].STORE_NAME,
            STORE_CODE: result4.recordsets[0][i].STORE_CODE,
            STORE_SHORT_CODE: result4.recordsets[0][i].STORE_SHORT_CODE,
            DC_Date: result2.recordsets[0][0].FACTORY_DC_DATE,
            DC_Number: result2.recordsets[0][0].FACTORY_DC_NUMBER,
            DC_QR: result2.recordsets[0][0].FACTORY_DC_QR,
            DC_From_Name: result2.recordsets[0][0].STORE_NAME,
          };
          arr.push(obj);
        } else {
          console.log("inside else");
          var result3 = await pool.request().query(
            `select [FACTORY_TO_FACTORY_DC_DATE], [FACTORY_TO_FACTORY_DC_NUMBER],[FACTORY_TO_FACTORY_DC_QR], [FACTORY_NAME]
            from [dbo].[FACTORY_TO_FACTORY_DC]
            join [dbo].[FACTORY] on [FACTORY_PKID] = FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID
            where [FACTORY_TO_FACTORY_DC_PKID] = '${result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID}'`
          );
          var obj = {
            TotalQuantity: result4.recordsets[0][i].TotalQuantity,
            TotalCount: result4.recordsets[0][i].TotalCount,
            FACTORY_INVENTORY_PKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_PKID,
            FACTORY_INVENTORY_FACTORY_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_FACTORY_FKID,
            FACTORY_INVENTORY_DATE:
              result4.recordsets[0][i].FACTORY_INVENTORY_DATE,
            FACTORY_INVENTORY_TIME:
              result4.recordsets[0][i].FACTORY_INVENTORY_TIME,
            FACTORY_INVENTORY_ORDER_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_ORDER_FKID,
            FACTORY_INVENTORY_ITEM_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_ITEM_FKID,
            FACTORY_INVENTORY_OUTLET_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_OUTLET_FKID,
            FACTORY_INVENTORY_RECEIVED_FROM:
              result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FROM,
            FACTORY_INVENTORY_RECEIVED_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_FKID,
            FACTORY_INVENTORY_RECEIVED_DC_FKID:
              result4.recordsets[0][i].FACTORY_INVENTORY_RECEIVED_DC_FKID,
            FACTORY_INVENTORY_STATUS:
              result4.recordsets[0][i].FACTORY_INVENTORY_STATUS,
            ORDER_ORDER_NUMBER: result4.recordsets[0][i].ORDER_ORDER_NUMBER,
            ORDER_DATE: result4.recordsets[0][i].ORDER_DATE,
            ORDER_DUE_DATE: result4.recordsets[0][i].ORDER_DUE_DATE,
            ORDER_ITEM_NUMBER: result4.recordsets[0][i].ORDER_ITEM_NUMBER,
            ITEMS_NAME: result4.recordsets[0][i].ITEMS_NAME,
            ADDITIONAL_SERVICE_NAME:
              result4.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
            STORE_NAME: result4.recordsets[0][i].STORE_NAME,
            STORE_CODE: result4.recordsets[0][i].STORE_CODE,
            STORE_SHORT_CODE: result4.recordsets[0][i].STORE_SHORT_CODE,
            DC_Date: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_DATE,
            DC_Number: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_NUMBER,
            DC_QR: result3.recordsets[0][0].FACTORY_TO_FACTORY_DC_QR,
            DC_From_Name: result3.recordsets[0][0].FACTORY_NAME,
          };
          arr.push(obj);
        }
      }
      return arr;
    }
  } catch (error) {
    console.log("CurrentFactoryInventoryFilter-->", error);
  }
}

// Factory Return to outlet

async function ReturnToOutletValidateOrder(obj) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select *
      from [dbo].[FACTORY_INVENTORY]
      join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_INVENTORY_ORDER_FKID]
      where [FACTORY_INVENTORY_FACTORY_FKID] = '${obj.FactoryID}' and [ORDER_ORDER_NUMBER] = '${obj.OrderNumber}'`
    );

    if (result1.recordsets[0].length > 0) {
      var orderres_cnt = 0;
      for (var i = 0; i < result1.recordsets[0].length; i++) {
        if (result1.recordsets[0][i].FACTORY_INVENTORY_STATUS == 1) {
          orderres_cnt = 1;
          break;
        } else {
          orderres_cnt = 0;
        }
      }
      if (orderres_cnt == 1) {
        let result = await pool
          .request()
          .input("Outlet", "")
          .input("Month", obj.OrderNumber)
          .input("Year", "")
          .input("FromDate", "")
          .input("ToDate", "")
          .input("Type", "OrderByNumber")
          .execute("ViewOrders");
        return result.recordsets[0];
      } else {
        return "1";
      }
    } else {
      return "0";
    }
  } catch (error) {
    console.log("ReturnToOutletValidateOrder-->", error);
  }
}

async function ReturnToOutlet(obj) {
  try {
    let pool = await sql.connect(config);

    let FinalDCNumber = "";
    let FYear = "";
    let OutletCode = "";
    let FactoryCode = "";

    var OutletDetails = await pool
      .request()
      .query(
        "select [STORE_CODE] from [dbo].[STORES] where [STORE_PKID] = '" +
          obj.OutletID +
          "'"
      );

    OutletCode = OutletDetails.recordsets[0][0].STORE_CODE;

    var FactoryDetails = await pool
      .request()
      .query(
        "select [FACTORY_CODE] from [dbo].[FACTORY] where [FACTORY_PKID] = '" +
          obj.FactoryID +
          "'"
      );

    FactoryCode = FactoryDetails.recordsets[0][0].FACTORY_CODE;

    var FinalYear = await pool.request().query(
      `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) as fyear`
      // `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) + '/'+ cast(( YEAR( GETDATE() ) % 100 + 1 ) as nvarchar(100)) as fyear`
    );

    FYear = FinalYear.recordsets[0][0].fyear;

    var FinalDC = await pool
      .request()
      .query(
        "select FACTORY_TO_OUTLET_DC_NUMBER from FACTORY_TO_OUTLET_DC where FACTORY_TO_OUTLET_DC_PKID = (select max(FACTORY_TO_OUTLET_DC_PKID) from FACTORY_TO_OUTLET_DC where FACTORY_TO_OUTLET_DC_FACTORY_FKID = '" +
          obj.FactoryID +
          "')"
      );
    if (FinalDC.rowsAffected[0] > 0) {
      var Currentnumber =
        parseInt(
          FinalDC.recordsets[0][0].FACTORY_TO_OUTLET_DC_NUMBER.split("-")[3]
        ) + 1;

      if (Currentnumber.toString().length === 4) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          OutletCode +
          "-" +
          Currentnumber +
          "-" +
          FYear +
          "";
      } else if (Currentnumber.toString().length === 3) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          OutletCode +
          "-0" +
          Currentnumber +
          "-" +
          FYear +
          "";
      } else if (Currentnumber.toString().length === 2) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          OutletCode +
          "-00" +
          Currentnumber +
          "-" +
          FYear +
          "";
      } else if (Currentnumber.toString().length === 1) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          OutletCode +
          "-000" +
          Currentnumber +
          "-" +
          FYear +
          "";
      }
    } else {
      FinalDCNumber = FactoryCode + "-DC-" + OutletCode + "-0001-" + FYear + "";
    }

    var result = await pool
      .request()
      .input("FACTORY_TO_OUTLET_DC_NUMBER", FinalDCNumber)
      .input("FACTORY_TO_OUTLET_DC_FACTORY_FKID", obj.FactoryID)
      .input("FACTORY_TO_OUTLET_DC_OUTLET_FKID", obj.OutletID)
      .input("FACTORY_TO_OUTLET_DC_STAFF_FKID", obj.StaffID)
      .input("FACTORY_TO_OUTLET_DC_ORDER_COUNT", obj.OrdersList.length)
      .input("FACTORY_TO_OUTLET_DC_ITEMS_COUNT", obj.TotalQuantity)
      .input("FACTORY_TO_OUTLET_DC_TOTAL_BAGS", obj.TotalBags)
      .input(
        "FACTORY_TO_OUTLET_DC_QR",
        "Factory_TO_Outlet_DC_" + FinalDCNumber.split("-")[3] + ".png"
      )
      .input("FACTORY_TO_OUTLET_DC_STATUS", "0")
      .query(
        "insert into FACTORY_TO_OUTLET_DC(FACTORY_TO_OUTLET_DC_NUMBER,FACTORY_TO_OUTLET_DC_DATE,FACTORY_TO_OUTLET_DC_TIME,FACTORY_TO_OUTLET_DC_FACTORY_FKID,FACTORY_TO_OUTLET_DC_OUTLET_FKID,FACTORY_TO_OUTLET_DC_STAFF_FKID,FACTORY_TO_OUTLET_DC_ORDER_COUNT,FACTORY_TO_OUTLET_DC_ITEMS_COUNT,FACTORY_TO_OUTLET_DC_TOTAL_BAGS,FACTORY_TO_OUTLET_DC_STATUS,FACTORY_TO_OUTLET_DC_QR) values(@FACTORY_TO_OUTLET_DC_NUMBER,getdate(),(SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0)),@FACTORY_TO_OUTLET_DC_FACTORY_FKID,@FACTORY_TO_OUTLET_DC_OUTLET_FKID,@FACTORY_TO_OUTLET_DC_STAFF_FKID,@FACTORY_TO_OUTLET_DC_ORDER_COUNT,@FACTORY_TO_OUTLET_DC_ITEMS_COUNT,@FACTORY_TO_OUTLET_DC_TOTAL_BAGS,@FACTORY_TO_OUTLET_DC_STATUS,@FACTORY_TO_OUTLET_DC_QR)"
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select * from FACTORY_TO_OUTLET_DC where FACTORY_TO_OUTLET_DC_PKID = (select max(FACTORY_TO_OUTLET_DC_PKID) as FACTORY_TO_OUTLET_DC_PKID from FACTORY_TO_OUTLET_DC)`
        );

      if (result1.recordsets[0].length > 0) {
        for (var i = 0; i < obj.OrdersList.length; i++) {
          var result2 = await pool
            .request()
            .input(
              "FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID",
              result1.recordsets[0][0].FACTORY_TO_OUTLET_DC_PKID
            )
            .input(
              "FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID",
              obj.OrdersList[i].Pkid
            )
            .input(
              "FACTORY_TO_OUTLET_DC_ITEMS_BAGS",
              obj.OrdersList[i].TotalBags
            )
            .query(
              `insert into FACTORY_TO_OUTLET_DC_ITEMS(FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID,FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID,FACTORY_TO_OUTLET_DC_ITEMS_BAGS) values(@FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID,@FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID,@FACTORY_TO_OUTLET_DC_ITEMS_BAGS)`
            );

          var result3 = await pool
            .request()
            .query(
              `update ORDERS set ORDER_STATUS = '3' where ORDER_PKID = '${obj.OrdersList[i].Pkid}'`
            );

          var result4 = await pool
            .request()
            .query(
              `update FACTORY_INVENTORY set FACTORY_INVENTORY_STATUS = '2' where FACTORY_INVENTORY_ORDER_FKID = '${obj.OrdersList[i].Pkid}' and FACTORY_INVENTORY_FACTORY_FKID = '${obj.FactoryID}'`
            );
        }
      }
      QRCode.toFile(
        path.join(
          __dirname,
          "../resources/static/assets/uploads",
          "Factory_TO_Outlet_DC_" + FinalDCNumber.split("-")[3] + ".png"
        ),
        `${FinalDCNumber}`,
        (err) => {
          if (err) throw err;
        }
      );
      const objj = {
        FactoryQR:
          "Factory_TO_Outlet_DC_" + FinalDCNumber.split("-")[3] + ".png",
        FactoryDCNumber: FinalDCNumber,
      };
      return objj;
    } else {
      return false;
    }
  } catch (error) {
    console.log("ReturnToOutlet-->", error);
  }
}

// View Returned To Outlet DC with filter

async function ReturnToOutletView(FactoryID) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_TO_OUTLET_DC_QR,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
        [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [STORE_STAFF_NAME], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS]
        from [dbo].[FACTORY_TO_OUTLET_DC]
        join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
        join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
        join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
        join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID]
        where [FACTORY_TO_OUTLET_DC_FACTORY_FKID] = '${FactoryID}' order by FACTORY_TO_OUTLET_DC_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("ReturnToOutletView-->", error);
  }
}

async function ReturnToOutletViewFilter(obj) {
  try {
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_TO_OUTLET_DC_QR,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
    [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [STORE_STAFF_NAME], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS]
    from [dbo].[FACTORY_TO_OUTLET_DC]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
    join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
    join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID]
    where [FACTORY_TO_OUTLET_DC_FACTORY_FKID] = '${obj.FactoryID}'`;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and FACTORY_TO_OUTLET_DC_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(FACTORY_TO_OUTLET_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += `and year(FACTORY_TO_OUTLET_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (FACTORY_TO_OUTLET_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("ReturnToOutletViewFilter-->", error);
  }
}

async function ReturnToOutletOrderList(Pkid) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_TO_OUTLET_DC_QR,FACTORY_TO_OUTLET_DC_NUMBER,FACTORY_TO_OUTLET_DC_DATE,FACTORY_TO_OUTLET_DC_ITEMS_BAGS,ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
      (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
      (select sum(cast([ORDER_ITEM_COUNT] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
      STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,
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
      from FACTORY_TO_OUTLET_DC_ITEMS
      join FACTORY_TO_OUTLET_DC on FACTORY_TO_OUTLET_DC_PKID = FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID
      join ORDERS on ORDER_PKID = FACTORY_TO_OUTLET_DC_ITEMS_ORDER_FKID
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
      where FACTORY_TO_OUTLET_DC_ITEMS_PRIMARY_FKID = '${Pkid}'
      order by ORDER_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("ReturnToOutletOrderList-->", error);
  }
}

async function ReturnToOutletViewByDCNumber(obj) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_TO_OUTLET_DC_QR,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
        [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [STORE_STAFF_NAME], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS]
        from [dbo].[FACTORY_TO_OUTLET_DC]
        join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
        join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
        join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
        join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID]
        where [FACTORY_TO_OUTLET_DC_FACTORY_FKID] = '${obj.FactoryID}' and [FACTORY_TO_OUTLET_DC_NUMBER] = '${obj.DCNumber}' order by FACTORY_TO_OUTLET_DC_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("ReturnToOutletViewByDCNumber-->", error);
  }
}

// Factory Return to Factory

async function ReturnToFactoryList(Pkid) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select * from FACTORY where FACTORY_ACTIVE = 1 and FACTORY_PKID != '" +
          Pkid +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("ReturnToFactoryList-->", error);
  }
}

async function ReturnFactoryOutletList(FactoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool.request().query(
      `select distinct [STORE_PKID], [STORE_ID], [STORE_CODE], [STORE_SHORT_CODE], [STORE_NAME]
      from [dbo].[FACTORY_INVENTORY]
      join [dbo].[STORES] on [STORE_PKID]= [FACTORY_INVENTORY_OUTLET_FKID]
      where [FACTORY_INVENTORY_FACTORY_FKID] = '${FactoryID}'
      `
    );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var obj = {
        label:
          result.recordsets[0][i].STORE_NAME +
          " / " +
          result.recordsets[0][i].STORE_CODE,
        value: result.recordsets[0][i].STORE_PKID,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ReturnFactoryOutletList-->", error);
  }
}

async function GetInventoryForReturnToFactoryBulk(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    for (var s = 0; s < obj.OutletDetails.length; s++) {
      let result = await pool.request()
        .query(`select distinct ORDER_ITEM_PKID, [ORDER_DUE_DATE],[ITEMS_NAME],[ORDER_ITEM_NUMBER],[STORE_NAME],ORDER_ITEM_QUANTITY,ORDER_ITEM_COUNT
      from [dbo].[FACTORY_INVENTORY] 
      join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_INVENTORY_ORDER_FKID]
      join [dbo].[ORDER_ITEMS] on [ORDER_ITEM_PKID] = [FACTORY_INVENTORY_ITEM_FKID]
      join [dbo].[ITEMS] on [ITEMS_PKID] = ORDER_ITEM_ITEM_FKID
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_INVENTORY_OUTLET_FKID]
      where [FACTORY_INVENTORY_OUTLET_FKID] = '${obj.OutletDetails[s].value}' and [FACTORY_INVENTORY_DATE] = '${obj.Date}' and FACTORY_INVENTORY_FACTORY_FKID = '${obj.FactoryID}' and FACTORY_INVENTORY_STATUS = 1`);
      if (result.recordsets[0].length > 0) {
        for (var j = 0; j < result.recordsets[0].length; j++) {
          var obj1 = {
            ORDER_ITEM_PKID: result.recordsets[0][j].ORDER_ITEM_PKID,
            ORDER_DUE_DATE: result.recordsets[0][j].ORDER_DUE_DATE,
            ITEMS_NAME: result.recordsets[0][j].ITEMS_NAME,
            ORDER_ITEM_NUMBER: result.recordsets[0][j].ORDER_ITEM_NUMBER,
            STORE_NAME: result.recordsets[0][j].STORE_NAME,
            ORDER_ITEM_QUANTITY: result.recordsets[0][j].ORDER_ITEM_QUANTITY,
            ORDER_ITEM_COUNT: result.recordsets[0][j].ORDER_ITEM_COUNT,
          };
          arr.push(obj1);
        }
      }
    }
    return arr;
  } catch (error) {
    console.log("GetInventoryForReturnToFactoryBulk-->", error);
  }
}

async function GetItemDetailsByItemNumber(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request()
      .query(`select distinct ORDER_ITEM_PKID, [ORDER_DUE_DATE],[ITEMS_NAME],[ORDER_ITEM_NUMBER],[STORE_NAME],ORDER_ITEM_QUANTITY,ORDER_ITEM_COUNT
      from [dbo].[FACTORY_INVENTORY]
      join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_INVENTORY_ORDER_FKID]
      join [dbo].[ORDER_ITEMS] on [ORDER_ITEM_PKID] = [FACTORY_INVENTORY_ITEM_FKID]
      join [dbo].[ITEMS] on [ITEMS_PKID] = ORDER_ITEM_ITEM_FKID
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_INVENTORY_OUTLET_FKID]
      where [ORDER_ITEM_NUMBER] = '${obj.ItemNumber}' and FACTORY_INVENTORY_FACTORY_FKID = '${obj.FactoryID}' and FACTORY_INVENTORY_STATUS = 1`);

    return result.recordsets[0];
  } catch (error) {
    console.log("GetItemDetailsByItemNumber-->", error);
  }
}

async function ReturnToFactory(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    let FinalDCNumber = "";
    let FYear = "";
    let FromFactoryCode = "";
    let FactoryCode = "";

    let ToFactoryName = "";

    var ToFactoryDetails = await pool
      .request()
      .query(
        "select [FACTORY_CODE],[FACTORY_NAME] from [dbo].[FACTORY] where [FACTORY_PKID] = '" +
          obj.ToFactory +
          "'"
      );

    FromFactoryCode = ToFactoryDetails.recordsets[0][0].FACTORY_CODE;
    ToFactoryName = ToFactoryDetails.recordsets[0][0].FACTORY_NAME;

    var FactoryDetails = await pool
      .request()
      .query(
        "select [FACTORY_CODE] from [dbo].[FACTORY] where [FACTORY_PKID] = '" +
          obj.FromFactory +
          "'"
      );

    FactoryCode = FactoryDetails.recordsets[0][0].FACTORY_CODE;

    var FinalYear = await pool.request().query(
      `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) as fyear`
      // `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) + '/'+ cast(( YEAR( GETDATE() ) % 100 + 1 ) as nvarchar(100)) as fyear`
    );

    FYear = FinalYear.recordsets[0][0].fyear;

    var FinalDC = await pool
      .request()
      .query(
        "select FACTORY_TO_FACTORY_DC_NUMBER from FACTORY_TO_FACTORY_DC where FACTORY_TO_FACTORY_DC_PKID = (select max(FACTORY_TO_FACTORY_DC_PKID) from FACTORY_TO_FACTORY_DC where FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID = '" +
          obj.FromFactory +
          "')"
      );
    if (FinalDC.rowsAffected[0] > 0) {
      var Currentnumber =
        parseInt(
          FinalDC.recordsets[0][0].FACTORY_TO_FACTORY_DC_NUMBER.split("-")[3]
        ) + 1;

      if (Currentnumber.toString().length === 4) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          FromFactoryCode +
          "-" +
          Currentnumber +
          "-" +
          FYear +
          "";
      } else if (Currentnumber.toString().length === 3) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          FromFactoryCode +
          "-0" +
          Currentnumber +
          "-" +
          FYear +
          "";
      } else if (Currentnumber.toString().length === 2) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          FromFactoryCode +
          "-00" +
          Currentnumber +
          "-" +
          FYear +
          "";
      } else if (Currentnumber.toString().length === 1) {
        FinalDCNumber =
          FactoryCode +
          "-DC-" +
          FromFactoryCode +
          "-000" +
          Currentnumber +
          "-" +
          FYear +
          "";
      }
    } else {
      FinalDCNumber =
        FactoryCode + "-DC-" + FromFactoryCode + "-0001-" + FYear + "";
    }

    console.log(FinalDCNumber);

    var result = await pool
      .request()
      .input("FACTORY_TO_FACTORY_DC_NUMBER", FinalDCNumber)
      .input("FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID", obj.FromFactory)
      .input("FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID", obj.ToFactory)
      .input("FACTORY_TO_FACTORY_DC_STAFF_FKID", obj.StaffID)
      .input("FACTORY_TO_FACTORY_DC_ITEM_COUNT", obj.ItemList.length)
      .input("FACTORY_TO_FACTORY_DC_TOTAL_BAGS", obj.TotalBags)
      .input("FACTORY_TO_FACTORY_DC_STATUS", "0")
      .input(
        "FACTORY_TO_FACTORY_DC_QR",
        "Factory_TO_Factory_DC_" + FinalDCNumber.split("-")[3] + ".png"
      )
      .query(
        "insert into FACTORY_TO_FACTORY_DC(FACTORY_TO_FACTORY_DC_NUMBER,FACTORY_TO_FACTORY_DC_DATE,FACTORY_TO_FACTORY_DC_TIME,FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID,FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,FACTORY_TO_FACTORY_DC_STAFF_FKID,FACTORY_TO_FACTORY_DC_ITEM_COUNT,FACTORY_TO_FACTORY_DC_TOTAL_BAGS,FACTORY_TO_FACTORY_DC_STATUS,FACTORY_TO_FACTORY_DC_QR) values(@FACTORY_TO_FACTORY_DC_NUMBER,getdate(),(SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0)),@FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID,@FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID,@FACTORY_TO_FACTORY_DC_STAFF_FKID,@FACTORY_TO_FACTORY_DC_ITEM_COUNT,@FACTORY_TO_FACTORY_DC_TOTAL_BAGS,@FACTORY_TO_FACTORY_DC_STATUS,@FACTORY_TO_FACTORY_DC_QR)"
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select * from FACTORY_TO_FACTORY_DC where FACTORY_TO_FACTORY_DC_PKID = (select max(FACTORY_TO_FACTORY_DC_PKID) as FACTORY_TO_FACTORY_DC_PKID from FACTORY_TO_FACTORY_DC)`
        );

      if (result1.recordsets[0].length > 0) {
        for (var i = 0; i < obj.ItemList.length; i++) {
          var result4 = await pool
            .request()
            .query(
              `update FACTORY_INVENTORY set FACTORY_INVENTORY_STATUS = '2' where FACTORY_INVENTORY_ITEM_FKID = '${obj.ItemList[i].Pkid}' and FACTORY_INVENTORY_FACTORY_FKID = '${obj.FromFactory}'`
            );

          var result2 = await pool
            .request()
            .input(
              "FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID",
              result1.recordsets[0][0].FACTORY_TO_FACTORY_DC_PKID
            )
            .input(
              "FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID",
              obj.ItemList[i].Pkid
            )
            .query(
              `insert into FACTORY_TO_FACTORY_DC_ITEMS(FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID,FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID) values(@FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID,@FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID)`
            );
        }
      }
      QRCode.toFile(
        path.join(
          __dirname,
          "../resources/static/assets/uploads",
          "Factory_TO_Factory_DC_" + FinalDCNumber.split("-")[3] + ".png"
        ),
        `${FinalDCNumber}`,
        (err) => {
          if (err) throw err;
        }
      );
      return [
        {
          QR: "Factory_TO_Factory_DC_" + FinalDCNumber.split("-")[3] + ".png",
          DCNumber: FinalDCNumber,
          ToFactoryName: ToFactoryName,
        },
      ];
    } else {
      return false;
    }
  } catch (error) {
    console.log("ReturnToFactory-->", error);
  }
}

// View Returned To Factory DC with filter

async function ReturnToFactoryView(FactoryID) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_TO_FACTORY_DC_QR,FACTORY_TO_FACTORY_DC_PKID,FACTORY_TO_FACTORY_DC_NUMBER, FACTORY_TO_FACTORY_DC_DATE,FACTORY_TO_FACTORY_DC_TIME, ff.[FACTORY_NAME] as FromFactory, tf.[FACTORY_NAME] as ToFactory, ff.[FACTORY_CODE] FromFactoryCode, tf.[FACTORY_CODE] ToFactoryCode,
      FACTORY_STAFF_NAME, FACTORY_TO_FACTORY_DC_ITEM_COUNT, FACTORY_TO_FACTORY_DC_TOTAL_BAGS, FACTORY_TO_FACTORY_DC_STATUS
      from [dbo].[FACTORY_TO_FACTORY_DC]
      join [dbo].[FACTORY] ff on ff.[FACTORY_PKID] = FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID 
      join [dbo].[FACTORY] tf on tf.[FACTORY_PKID] = FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID 
      join [dbo].FACTORY_STAFF on FACTORY_STAFF_PKID = FACTORY_TO_FACTORY_DC_STAFF_FKID
      where FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID = '${FactoryID}' order by FACTORY_TO_FACTORY_DC_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("ReturnToFactoryView-->", error);
  }
}

async function ReturnToFactoryViewFilter(obj) {
  try {
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_TO_FACTORY_DC_QR, FACTORY_TO_FACTORY_DC_PKID,FACTORY_TO_FACTORY_DC_NUMBER, FACTORY_TO_FACTORY_DC_DATE,FACTORY_TO_FACTORY_DC_TIME, ff.[FACTORY_NAME] as FromFactory, tf.[FACTORY_NAME] as ToFactory, ff.[FACTORY_CODE] FromFactoryCode, tf.[FACTORY_CODE] ToFactoryCode,
    FACTORY_STAFF_NAME, FACTORY_TO_FACTORY_DC_ITEM_COUNT, FACTORY_TO_FACTORY_DC_TOTAL_BAGS, FACTORY_TO_FACTORY_DC_STATUS
    from [dbo].[FACTORY_TO_FACTORY_DC]
    join [dbo].[FACTORY] ff on ff.[FACTORY_PKID] = FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID 
    join [dbo].[FACTORY] tf on tf.[FACTORY_PKID] = FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID 
    join [dbo].FACTORY_STAFF on FACTORY_STAFF_PKID = FACTORY_TO_FACTORY_DC_STAFF_FKID
    where FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID = '${obj.FactoryID}' `;

    if (
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_TO_FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID = '${obj.Factory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(FACTORY_TO_FACTORY_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += `and year(FACTORY_TO_FACTORY_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (FACTORY_TO_FACTORY_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by FACTORY_TO_FACTORY_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("ReturnToFactoryViewFilter-->", error);
  }
}

async function ReturnedToFactoryItemList(Pkid) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select [FACTORY_TO_FACTORY_DC_TOTAL_BAGS], [ITEMS_NAME], [ORDER_ITEM_QUANTITY], [ORDER_ITEM_COUNT], [ORDER_ITEM_NUMBER], [ORDER_DATE], [ORDER_DUE_DATE], [CUSTOMER_NAME], CUSTOMER_TYPE_NAME
      from FACTORY_TO_FACTORY_DC_ITEMS
      join [dbo].[FACTORY_TO_FACTORY_DC] on [FACTORY_TO_FACTORY_DC_PKID] = '${Pkid}'
      join ORDER_ITEMS on ORDER_ITEM_PKID = FACTORY_TO_FACTORY_DC_ITEMS_ITEMS_FKID
      join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID 
      join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_ITEM_ORDER_FKID]
      join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
      join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
      where FACTORY_TO_FACTORY_DC_ITEMS_PRIMARY_FKID = '${Pkid}'
      order by FACTORY_TO_FACTORY_DC_ITEMS_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("ReturnedToFactoryItemList-->", error);
  }
}

async function ReturnToFactoryViewByDCNumber(obj) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_TO_FACTORY_DC_QR,FACTORY_TO_FACTORY_DC_PKID,FACTORY_TO_FACTORY_DC_NUMBER, FACTORY_TO_FACTORY_DC_DATE,FACTORY_TO_FACTORY_DC_TIME, ff.[FACTORY_NAME] as FromFactory, tf.[FACTORY_NAME] as ToFactory, ff.[FACTORY_CODE] FromFactoryCode, tf.[FACTORY_CODE] ToFactoryCode,
      FACTORY_STAFF_NAME, FACTORY_TO_FACTORY_DC_ITEM_COUNT, FACTORY_TO_FACTORY_DC_TOTAL_BAGS, FACTORY_TO_FACTORY_DC_STATUS
      from [dbo].[FACTORY_TO_FACTORY_DC]
      join [dbo].[FACTORY] ff on ff.[FACTORY_PKID] = FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID 
      join [dbo].[FACTORY] tf on tf.[FACTORY_PKID] = FACTORY_TO_FACTORY_DC_TO_FACTORY_FKID 
      join [dbo].FACTORY_STAFF on FACTORY_STAFF_PKID = FACTORY_TO_FACTORY_DC_STAFF_FKID
      where FACTORY_TO_FACTORY_DC_FROM_FACTORY_FKID = '${obj.FactoryID}' and FACTORY_TO_FACTORY_DC_NUMBER = '${obj.DCNumber}' order by FACTORY_TO_FACTORY_DC_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("ReturnToFactoryViewByDCNumber-->", error);
  }
}

module.exports = {
  FactoryViewInTakeOrders: FactoryViewInTakeOrders,
  FactoryViewInTakeOrdersFilter: FactoryViewInTakeOrdersFilter,
  FactoryViewInTakeOrdersFromFactory: FactoryViewInTakeOrdersFromFactory,
  FactoryViewInTakeOrdersFromFactoryFilter:
    FactoryViewInTakeOrdersFromFactoryFilter,
  FactoryConfirmInTakeFromFactory: FactoryConfirmInTakeFromFactory,
  FactoryConfirmInTakeFromFactoryBulk: FactoryConfirmInTakeFromFactoryBulk,
  ViewConfirmedOutletIntake: ViewConfirmedOutletIntake,
  ViewConfirmedFactoryIntake: ViewConfirmedFactoryIntake,
  ViewConfirmedFactoryIntakeFilter: ViewConfirmedFactoryIntakeFilter,
  ViewConfirmedFactoryIntakeDCPrint: ViewConfirmedFactoryIntakeDCPrint,
  ViewConfirmedOutletIntakeFilter: ViewConfirmedOutletIntakeFilter,
  ViewConfirmedOutletIntakeByDCNumber: ViewConfirmedOutletIntakeByDCNumber,
  FactoryConfirmInTake: FactoryConfirmInTake,
  FactoryConfirmInTakeBulk: FactoryConfirmInTakeBulk,
  ReturnToOutletValidateOrder: ReturnToOutletValidateOrder,
  ReturnToOutlet: ReturnToOutlet,
  ReturnToOutletView: ReturnToOutletView,
  ReturnToOutletViewFilter: ReturnToOutletViewFilter,
  ReturnToOutletOrderList: ReturnToOutletOrderList,
  ReturnToOutletViewByDCNumber: ReturnToOutletViewByDCNumber,
  ReturnToFactoryList: ReturnToFactoryList,
  GetInventoryForReturnToFactoryBulk: GetInventoryForReturnToFactoryBulk,
  ReturnFactoryOutletList: ReturnFactoryOutletList,
  GetItemDetailsByItemNumber: GetItemDetailsByItemNumber,
  ReturnToFactory: ReturnToFactory,
  ReturnToFactoryView: ReturnToFactoryView,
  ReturnToFactoryViewFilter: ReturnToFactoryViewFilter,
  ReturnedToFactoryItemList: ReturnedToFactoryItemList,
  ReturnToFactoryViewByDCNumber: ReturnToFactoryViewByDCNumber,
  CurrentFactoryInventory: CurrentFactoryInventory,
  CurrentFactoryInventoryFilter: CurrentFactoryInventoryFilter,
};
