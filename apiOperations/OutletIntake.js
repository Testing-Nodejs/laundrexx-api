/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetDCFromFactory(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select FACTORY_STAFF_NAME,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
          [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS]
          from [dbo].[FACTORY_TO_OUTLET_DC]
          join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
          join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID] 
          join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
          join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
          where [FACTORY_TO_OUTLET_DC_OUTLET_FKID] = '${OutletID}' and FACTORY_TO_OUTLET_DC_STATUS = 0 order by FACTORY_TO_OUTLET_DC_PKID desc`
    );

    for (var i = 0; i < result1.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS, FACTORY_TO_OUTLET_DC_ITEMS_BAGS, 0 As ReceivedStatus
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
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_STAFF_NAME,[FACTORY_TO_OUTLET_DC_PKID],[FACTORY_TO_OUTLET_DC_NUMBER], [FACTORY_TO_OUTLET_DC_DATE],[FACTORY_TO_OUTLET_DC_TIME], [FACTORY_NAME], [FACTORY_CODE],
      [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], [STORE_STAFF_NAME], [FACTORY_TO_OUTLET_DC_ORDER_COUNT], [FACTORY_TO_OUTLET_DC_ITEMS_COUNT], [FACTORY_TO_OUTLET_DC_TOTAL_BAGS], [FACTORY_TO_OUTLET_DC_STATUS]
      from [dbo].[FACTORY_TO_OUTLET_DC]
      join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_TO_OUTLET_DC_FACTORY_FKID] 
      join [dbo].[FACTORY_STAFF] on [FACTORY_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID] 
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_TO_OUTLET_DC_OUTLET_FKID]
      join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_TO_OUTLET_DC_STAFF_FKID]
      where [FACTORY_TO_OUTLET_DC_OUTLET_FKID] = '${obj.OutletID}' and FACTORY_TO_OUTLET_DC_STATUS = 0`;

    if (
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by FACTORY_TO_OUTLET_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
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
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetDCFromFactoryWithFilter-->", error);
  }
}

async function OutletConfirmIntake(DCID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `update [dbo].[FACTORY_TO_OUTLET_DC] set FACTORY_TO_OUTLET_DC_STATUS = 1 where FACTORY_TO_OUTLET_DC_PKID = '${DCID}'`
      );

    var result1 = await pool
      .request()
      .query(
        `select * from [dbo].[FACTORY_TO_OUTLET_DC] where FACTORY_TO_OUTLET_DC_PKID = '${DCID}'`
      );

    let UpdateOrderStatus = await pool
      .request()
      .input("DCID", DCID)
      .input(
        "OutletID",
        result1.recordsets[0][0].FACTORY_TO_OUTLET_DC_OUTLET_FKID
      )
      .execute("OutletIntake");

    if (result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("FactoryConfirmInTake-->", error);
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
        where [STORE_INVENTORY_STORE_FKID] = '${OutletID}' and [STORE_INVENTORY_DATE] = cast(getdate() as date) order by STORE_INVENTORY_PKID desc`
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
    join [dbo].[FACTORY] on [FACTORY_PKID] = [STORE_INVENTORY_FACTORY_FKID]
    join [dbo].[FACTORY_TO_OUTLET_DC] on [FACTORY_TO_OUTLET_DC_PKID] = [STORE_INVENTORY_DC_FKID]
    where [STORE_INVENTORY_STORE_FKID] = '${obj.Outlet}' 
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
            COUPONS.*, cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 3 then 0 else 1 end) as bit) as IsEditable,
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
            left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] where STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID = '${result.recordsets[0][i].STORE_SELF_AUDIT_PKID}'`
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
              COUPONS.*, cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 3 then 0 else 1 end) as bit) as IsEditable,
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
              left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] where STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID = '${result3.recordsets[0][i].STORE_SELF_AUDIT_PKID}'`
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
              COUPONS.*, cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 3 then 0 else 1 end) as bit) as IsEditable
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
              left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] where STORE_SELF_AUDIT_ORDERS_PRIMARY_FKID = '${result4.recordsets[0][i].STORE_SELF_AUDIT_PKID}'`
          );
          var obj = {
            STORE_SELF_AUDIT_DATE:
              result4.recordsets[0][i].STORE_SELF_AUDIT_DATE,
            STORE_SELF_AUDIT_TIME:
              result4.recordsets[0][i].STORE_SELF_AUDIT_TIME,
            OrderList: result4.recordsets[0],
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
        COUPONS.*, cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 3 then 0 else 1 end) as bit) as IsEditable,
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
        left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] where AUDIT_REPORT_ORDERS_PRIMARY_FKID = '${AuditPkID}'`
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
      (select sum(ORDER_ITEMS) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity
      from [dbo].[FACTORY_DC]
      join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_DC_FACCTORY_FKID] 
      join [dbo].[STORES] on [STORE_PKID] = [FACTORY_DC_OUTLET_FKID]
      join [dbo].[ROUTES] on [ROUTE_PKID] = [STORE_ROUTE_FKID]
      where [FACTORY_DC_OUTLET_FKID] = '${OutletID}' order by FACTORY_DC_PKID desc`
    );

    for (var i = 0; i < result1.recordsets[0].length; i++) {
      var DCInnerItems = await pool.request()
        .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS
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
        DCInnerItems: DCInnerItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("ViewOutletDCForIntake-->", error);
  }
}

async function ViewOutletDCForIntakeFilter(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var MyQuery = `select FACTORY_DC_PKID,FACTORY_DC_NUMBER, FACTORY_DC_DATE, [FACTORY_NAME], [FACTORY_CODE],
    [STORE_CODE], [STORE_NAME],[STORE_ADDRESS],[STORE_CITY],[ROUTE_NAME], [ROUTE_CODE], FACTORY_DC_ORDER_COUNT, FACTORY_DC_TOTAL_BAGS, FACTORY_DC_STATUS,
    (select sum(ORDER_ITEMS) from [dbo].[FACTORY_DC_ITEMS] join [dbo].[ORDERS] on [ORDER_PKID] = [FACTORY_DC_ITEMS_ORDER_FKID] where [FACTORY_DC_ITEMS_DC_FKID] = FACTORY_DC_PKID) as TotalQuantity
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
          .query(`select [ORDER_PKID], [ORDER_DATE],[ORDER_ORDER_NUMBER], [ORDER_INVOICE_NUMBER],[ORDER_DUE_DATE],[ORDER_GRAND_TOTAL_AMOUNT],[ORDER_QR],ORDER_ITEMS
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

module.exports = {
  GetDCFromFactory: GetDCFromFactory,
  GetDCFromFactoryWithFilter: GetDCFromFactoryWithFilter,
  OutletConfirmIntake: OutletConfirmIntake,
  OutletConfirmIntakeWithoutFactoryDC: OutletConfirmIntakeWithoutFactoryDC,
  OutletAllInventory: OutletAllInventory,
  OutletAllInventoryForAdmin: OutletAllInventoryForAdmin,
  OutletAllInventoryFromOrderNumber: OutletAllInventoryFromOrderNumber,
  OutletCurrentInventory: OutletCurrentInventory,
  OutletCurrentInventoryFilter: OutletCurrentInventoryFilter,
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
};
