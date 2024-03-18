/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function getB2BGstReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct ORDER_DATE as 'Date', STORE_CODE as OutletCode, STORE_NAME as OutletName, ORDER_ORDER_NUMBER as InvoiceNo, ORDER_DATE as InvoiceDate, CUSTOMER_NAME as CustomerName, CUSTOMER_GST_NUMBER as GSTNo, 
      ROUND([ORDER_TOTAL_ORDER_AMOUNT], 2) as TOTAL_TAXABLE_VALUE,
      ROUND([ORDER_CGST], 2) as CGST,
      ROUND([ORDER_SGST], 2) as SGST,
      ROUND(ORDER_TOTAL_INVOICE_VALUE, 2) as TOTAL_INVOICE_VALUE
      from [dbo].[CUSTOMERS]
      join ORDERS outerOrders on outerOrders.ORDER_CUSTOMER_FKID = CUSTOMER_PKID
      join STORES on STORE_PKID = outerOrders.ORDER_OUTLET_FKID
      where [CUSTOMER_GST_TYPE] = 'B2B'
      order by ORDER_DATE desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("getB2BGstReport-->", error);
  }
}

async function getB2BGstReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select distinct ORDER_DATE as 'Date', STORE_CODE as OutletCode, STORE_NAME as OutletName, ORDER_ORDER_NUMBER as InvoiceNo, ORDER_DATE as InvoiceDate, CUSTOMER_NAME as CustomerName, CUSTOMER_GST_NUMBER as GSTNo, 
    ROUND([ORDER_TOTAL_ORDER_AMOUNT], 2) as TOTAL_TAXABLE_VALUE,
    ROUND([ORDER_CGST], 2) as CGST,
    ROUND([ORDER_SGST], 2) as SGST,
    ROUND(ORDER_TOTAL_INVOICE_VALUE, 2) as TOTAL_INVOICE_VALUE
    from [dbo].[CUSTOMERS]
    join ORDERS outerOrders on outerOrders.ORDER_CUSTOMER_FKID = CUSTOMER_PKID
    join STORES on STORE_PKID = outerOrders.ORDER_OUTLET_FKID
    where [CUSTOMER_GST_TYPE] = 'B2B'  `;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      MyQuery += `order by ORDER_DATE desc`;
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_DATE desc`;
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("getB2BGstReportFilter-->", error);
  }
}

async function GetB2CGSTReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct [ORDER_DATE] as DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, 
    ROUND((select sum(cast([ORDER_TOTAL_ORDER_AMOUNT] as float)) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as TOTAL_TAXABLE_VALUE,
    ROUND((select sum(cast([ORDER_CGST] as float)) from ORDERS as InnerOrder1 where InnerOrder1.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder1.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as CGST,
    ROUND((select sum(cast([ORDER_SGST] as float)) from ORDERS as InnerOrder2 where InnerOrder2.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder2.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as SGST,
    ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as TOTAL_INVOICE_VALUE
    from [dbo].[ORDERS] as outerOrders
    join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
    where ORDER_DATE = cast(getdate() as date)
    order by outerOrders.ORDER_DATE desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("GetB2CGSTReport-->", error);
  }
}

async function GetB2CGSTReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select distinct [ORDER_DATE] as DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, 
    ROUND((select sum(cast([ORDER_TOTAL_ORDER_AMOUNT] as float)) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as TOTAL_TAXABLE_VALUE,
    ROUND((select sum(cast([ORDER_CGST] as float)) from ORDERS as InnerOrder1 where InnerOrder1.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder1.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as CGST,
    ROUND((select sum(cast([ORDER_SGST] as float)) from ORDERS as InnerOrder2 where InnerOrder2.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder2.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as SGST,
    ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as TOTAL_INVOICE_VALUE
    from [dbo].[ORDERS] as outerOrders
    join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID] where ORDER_DATE is not null `;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      MyQuery += `order by outerOrders.ORDER_DATE desc`;
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by outerOrders.ORDER_DATE desc`;
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("GetB2CGSTReportFilter-->", error);
  }
}

async function getHSNWiseGSTReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct [ORDER_DATE] as DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, [SERVICE_CATEGORY_HSN] as HSN,SERVICE_CATEGORY_DESCRIPTION as DESCRIPTION,'Pieces' as UOM,
        ROUND((select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS join ORDERS as InnerOrder on InnerOrder.ORDER_PKID = ORDER_ITEM_ORDER_FKID where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as TOTAL_QUANTITY,
        ROUND((select sum(cast([ORDER_TOTAL_ORDER_AMOUNT] as float)) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as TOTAL_TAXABLE_VALUE,
        ROUND((select sum(cast([ORDER_CGST] as float)) from ORDERS as InnerOrder1 where InnerOrder1.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder1.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder1.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as CGST,
        ROUND((select sum(cast([ORDER_SGST] as float)) from ORDERS as InnerOrder2 where InnerOrder2.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder2.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder2.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as SGST,
        ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder3.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as TOTAL_INVOICE_VALUE
        from [dbo].[ORDERS] as outerOrders
        join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
        join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID]
        where ORDER_DATE = cast(getdate() as date)
        order by outerOrders.ORDER_DATE desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("getHSNWiseGSTReport-->", error);
  }
}

async function getHSNWiseGSTReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select distinct [ORDER_DATE] as DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, [SERVICE_CATEGORY_HSN] as HSN,SERVICE_CATEGORY_DESCRIPTION as DESCRIPTION,'Pieces' as UOM,
      ROUND((select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS join ORDERS as InnerOrder on InnerOrder.ORDER_PKID = ORDER_ITEM_ORDER_FKID where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as TOTAL_QUANTITY,
      ROUND((select sum(cast([ORDER_TOTAL_ORDER_AMOUNT] as float)) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as TOTAL_TAXABLE_VALUE,
      ROUND((select sum(cast([ORDER_CGST] as float)) from ORDERS as InnerOrder1 where InnerOrder1.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder1.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder1.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as CGST,
      ROUND((select sum(cast([ORDER_SGST] as float)) from ORDERS as InnerOrder2 where InnerOrder2.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder2.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder2.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as SGST,
      ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder3.ORDER_SERVICE_CATEGORY_FKID = outerOrders.ORDER_SERVICE_CATEGORY_FKID), 2) as TOTAL_INVOICE_VALUE
      from [dbo].[ORDERS] as outerOrders
      join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
      join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID] where ORDER_DATE is not null `;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      MyQuery += `order by outerOrders.ORDER_DATE desc`;
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by outerOrders.ORDER_DATE desc`;
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("getHSNWiseGSTReportFilter-->", error);
  }
}

async function getDocumentIssuesReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct [ORDER_DATE] as DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, 
        (select min(ORDER_INVOICE_NUMBER) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID) as IFROM,
        (select max(ORDER_INVOICE_NUMBER) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID) as ITO,
        (select count(*) from ORDERS_LOG as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and ORDER_LOG_TYPE = 'Deleted Order') as CANCELLED_INVOICES,'-' as REJECTED_INVOICES,
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS join ORDERS as InnerOrder on InnerOrder.ORDER_PKID = ORDER_ITEM_ORDER_FKID where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID) as TOTAL_QUANTITY,
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS_LOG join ORDERS_LOG as InnerOrder on InnerOrder.ORDER_PKID = ORDER_ITEM_ORDER_FKID where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and ORDER_LOG_TYPE = 'Deleted Order') as CANCELED_QUANTITY,'-' as REJECTED_QUANTITY,
        ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as NET_ISSUED
        from [dbo].[ORDERS] as outerOrders
        join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
        where ORDER_DATE = cast(getdate() as date)
        order by outerOrders.ORDER_DATE desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("getDocumentIssuesReport-->", error);
  }
}

async function getDocumentIssuesReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select distinct [ORDER_DATE] as DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, 
    (select min(ORDER_INVOICE_NUMBER) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID) as IFROM,
    (select max(ORDER_INVOICE_NUMBER) from ORDERS as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID) as ITO,
    (select count(*) from ORDERS_LOG as InnerOrder where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and ORDER_LOG_TYPE = 'Deleted Order') as CANCELLED_INVOICES,'-' as REJECTED_INVOICES,
    (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS join ORDERS as InnerOrder on InnerOrder.ORDER_PKID = ORDER_ITEM_ORDER_FKID where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID) as TOTAL_QUANTITY,
        (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS_LOG join ORDERS_LOG as InnerOrder on InnerOrder.ORDER_PKID = ORDER_ITEM_ORDER_FKID where InnerOrder.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and ORDER_LOG_TYPE = 'Deleted Order') as CANCELED_QUANTITY,'-' as REJECTED_QUANTITY,
    ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_DATE = outerOrders.[ORDER_DATE] and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID), 2) as NET_ISSUED
    from [dbo].[ORDERS] as outerOrders
    join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
    where ORDER_DATE is not null `;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      MyQuery += `order by outerOrders.ORDER_DATE desc`;
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by outerOrders.ORDER_DATE desc`;
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("getDocumentIssuesReportFilter-->", error);
  }
}

async function StockReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct STORE_INVENTORY_DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, ORDER_ORDER_NUMBER as ORDER_NO,[CUSTOMER_NAME] as CUSTOMER_NAME,CUSTOMER_CONTACT_NUMBER as PHONE_NUMBER,ORDER_DUE_DATE as DUE_DATE,'-' as NOT_DELIVERED,
        (select sum(cast(ORDER_ITEM_COUNT as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = outerOrders.ORDER_PKID) as TOTAL_QUANTITY,
        ROUND((select sum(cast([ORDER_TOTAL_ORDER_AMOUNT] as float)) from ORDERS as InnerOrder where InnerOrder.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as TAXABLE_VALUE,
            ROUND((select sum(cast([ORDER_CGST] as float)) from ORDERS as InnerOrder1 where InnerOrder1.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder1.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder1.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as CGST,
            ROUND((select sum(cast([ORDER_SGST] as float)) from ORDERS as InnerOrder2 where InnerOrder2.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder2.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder2.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as SGST,
            ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder3.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as INVOICE_VALUE
        from [dbo].[ORDERS] as outerOrders
        join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
        join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
        join [dbo].[STORE_INVENTORY] on [STORE_INVENTORY_ORDER_FKID] = outerOrders.ORDER_PKID
        where [STORE_INVENTORY_STATUS] = 1 and STORE_INVENTORY_DATE = cast(getdate() as date)`);

    return result.recordsets[0];
  } catch (error) {
    console.log("StockReport-->", error);
  }
}

async function StockReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select distinct STORE_INVENTORY_DATE, [STORE_CODE] as BRANCH_CODE, [STORE_NAME] as BRANCH_NAME, ORDER_ORDER_NUMBER as ORDER_NO,[CUSTOMER_NAME] as CUSTOMER_NAME,CUSTOMER_CONTACT_NUMBER as PHONE_NUMBER,ORDER_DUE_DATE as DUE_DATE,'-' as NOT_DELIVERED,
      (select sum(cast(ORDER_ITEM_COUNT as int)) from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = outerOrders.ORDER_PKID) as TOTAL_QUANTITY,
      ROUND((select sum(cast([ORDER_TOTAL_ORDER_AMOUNT] as float)) from ORDERS as InnerOrder where InnerOrder.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as TAXABLE_VALUE,
          ROUND((select sum(cast([ORDER_CGST] as float)) from ORDERS as InnerOrder1 where InnerOrder1.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder1.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder1.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as CGST,
          ROUND((select sum(cast([ORDER_SGST] as float)) from ORDERS as InnerOrder2 where InnerOrder2.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder2.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder2.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as SGST,
          ROUND((select sum(cast(ORDER_TOTAL_INVOICE_VALUE as float)) from ORDERS as InnerOrder3 where InnerOrder3.ORDER_PKID = outerOrders.ORDER_PKID and InnerOrder3.ORDER_OUTLET_FKID = outerOrders.ORDER_OUTLET_FKID and InnerOrder3.ORDER_CUSTOMER_FKID = outerOrders.ORDER_CUSTOMER_FKID), 2) as INVOICE_VALUE
      from [dbo].[ORDERS] as outerOrders
      join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
      join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
      join [dbo].[STORE_INVENTORY] on [STORE_INVENTORY_ORDER_FKID] = outerOrders.ORDER_PKID
      where [STORE_INVENTORY_STATUS] = 1 `;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("StockReportFilter-->", error);
  }
}

async function CollectionReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select distinct [ORDER_PAYMENT_DATE], [STORE_NAME], [STORE_CODE], 
      isnull((select sum(cast(ORDER_PAYMENT_TOTAL_ORDER_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID),0) as OrderAmount,
      isnull((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID and innertbl.ORDER_PAYMENT_MODE = 'Cash'),0) as Cash,
      isnuLL((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID and innertbl.ORDER_PAYMENT_MODE = 'UPI'), 0) as GPay,
      isnuLL((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID and innertbl.ORDER_PAYMENT_MODE = 'Credit/Debit Card'), 0) as CCard,
      isnuLL((select sum(cast(ORDER_PAYMENT_BALANCE_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as Balance,
      isnuLL((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as TotalCollection,
      isnuLL((select sum(cast(ORDER_PAYMENT_BAD_DEBITS as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as BadDebts,
      isnuLL((select sum(cast(ORDER_PAYMENT_FINAL_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as GrandTotal
      from [dbo].[ORDER_PAYMENT] outertbl
      join [dbo].[STORES] on [STORE_PKID] = [ORDER_PAYMENT_OUTLET_FKID]
      where [ORDER_PAYMENT_DATE] = cast(getdate() as date)`);

    return result.recordsets[0];
  } catch (error) {
    console.log("CollectionReport-->", error);
  }
}

async function CollectionReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select distinct [ORDER_PAYMENT_DATE], [STORE_NAME], [STORE_CODE], 
    isnull((select sum(cast(ORDER_PAYMENT_TOTAL_ORDER_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID),0) as OrderAmount,
    isnull((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID and innertbl.ORDER_PAYMENT_MODE = 'Cash'),0) as Cash,
    isnuLL((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID and innertbl.ORDER_PAYMENT_MODE = 'UPI'), 0) as GPay,
    isnuLL((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID and innertbl.ORDER_PAYMENT_MODE = 'Credit/Debit Card'), 0) as CCard,
    isnuLL((select sum(cast(ORDER_PAYMENT_BALANCE_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as Balance,
    isnuLL((select sum(cast(ORDER_PAYMENT_COLLECTED_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as TotalCollection,
    isnuLL((select sum(cast(ORDER_PAYMENT_BAD_DEBITS as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as BadDebts,
    isnuLL((select sum(cast(ORDER_PAYMENT_FINAL_AMOUNT as float)) from [dbo].[ORDER_PAYMENT] innertbl where innertbl.ORDER_PAYMENT_DATE = outertbl.ORDER_PAYMENT_DATE and innertbl.ORDER_PAYMENT_OUTLET_FKID = outertbl.ORDER_PAYMENT_OUTLET_FKID), 0) as GrandTotal
    from [dbo].[ORDER_PAYMENT] outertbl
    join [dbo].[STORES] on [STORE_PKID] = [ORDER_PAYMENT_OUTLET_FKID]
    where [ORDER_PAYMENT_DATE] is not null `;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += `and ORDER_PAYMENT_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_PAYMENT_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("CollectionReportFilter-->", error);
  }
}

async function BillingReport() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select [ORDER_DATE], [STORE_NAME], [STORE_CODE], 
      (select min([ORDER_INVOICE_NUMBER]) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as StartInvoiceNo,
      (select max([ORDER_INVOICE_NUMBER]) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as EndInvoiceNo,
      (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS join [dbo].[ORDERS] innertbl on innertbl.ORDER_PKID = ORDER_ITEM_ORDER_FKID where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as TotalCount,
      (select sum(cast(ORDER_TOTAL_ORDER_AMOUNT as float)) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as TaxableValue,
      (select sum(cast(ORDER_GRAND_TOTAL_AMOUNT as float)) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as InvoiceValue
      from [dbo].[ORDERS] outtertbl
      join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
      where [ORDER_DATE] = cast(getdate() as date) order by ORDER_DATE desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("BillingReport-->", error);
  }
}

async function BillingReportFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select [ORDER_DATE], [STORE_NAME], [STORE_CODE], 
    (select min([ORDER_INVOICE_NUMBER]) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as StartInvoiceNo,
    (select max([ORDER_INVOICE_NUMBER]) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as EndInvoiceNo,
    (select sum(ORDER_ITEM_COUNT) from ORDER_ITEMS join [dbo].[ORDERS] innertbl on innertbl.ORDER_PKID = ORDER_ITEM_ORDER_FKID where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as TotalCount,
    (select sum(cast(ORDER_TOTAL_ORDER_AMOUNT as float)) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as TaxableValue,
    (select sum(cast(ORDER_GRAND_TOTAL_AMOUNT as float)) from [dbo].[ORDERS] innertbl where innertbl.[ORDER_DATE] = outtertbl.[ORDER_DATE] and innertbl.ORDER_OUTLET_FKID = outtertbl.ORDER_OUTLET_FKID) as InvoiceValue
    from [dbo].[ORDERS] outtertbl
    join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
    where [ORDER_DATE] is not null`;

    if (obj.FromDate == "-" && obj.ToDate == "-" && obj.OutletID == "-") {
      MyQuery += ` order by ORDER_DATE desc `;
      var result = await pool.request().query(MyQuery);
      return result.recordsets[0];
    } else {
      if (obj.OutletID == "-") {
      } else {
        MyQuery += ` and ORDER_OUTLET_FKID = '${obj.OutletID}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result1 = await pool.request().query(MyQuery);
      return result1.recordsets[0];
    }
  } catch (error) {
    console.log("BillingReportFilter-->", error);
  }
}

async function LiveDashboard() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select (select count(*) from [dbo].[ORDERS] where [ORDER_DATE] = cast(getdate() as date)) as CurrentDayOrder,
        (select count(*) from [dbo].[ORDERS]) as AllOrders,
        (select count(*) from [dbo].[ORDERS] where ORDER_STATUS = 5) as DeliveredOrders,
        (select count(*) from [dbo].[ORDERS] where ORDER_STATUS = 1 or ORDER_STATUS = 2 or ORDER_STATUS = 3 or ORDER_STATUS = 4 or ORDER_STATUS = 6) as InProcessOrders,
        (select count(*) from [dbo].[ORDERS] where ORDER_STATUS = 0) as NewOrders,
        (select count(*) from [dbo].[ORDERS_LOG] where ORDER_LOG_TYPE = 'Deleted Order') as DeletedOrders,
        (select count(*) from [dbo].[CUSTOMERS]) as TotalCustomer,
        (select count(*) from [dbo].[USERS]) as TotalManagers,
        (select count(*) from [dbo].[STORES]) as TotalOutlets`);

    return result.recordsets[0];
  } catch (error) {
    console.log("LiveDashboard-->", error);
  }
}

async function LiveDashboardOrders() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request()
      .query(`select top 5 [ORDER_ORDER_NUMBER], [STORE_NAME], [CUSTOMER_NAME], ORDER_FINAL_ORDER_AMOUNT
      from [dbo].[ORDERS]
      join [dbo].[STORES] on [STORE_PKID] = [ORDER_OUTLET_FKID]
      join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
      order by [ORDER_PKID] desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("LiveDashboardOrders-->", error);
  }
}

async function LiveDashboardCustomer() {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(`select top 5 *
        from [dbo].[CUSTOMERS]
        join CUSTOMER_TYPE on CUSTOMER_TYPE_PKID = CUSTOMER_TYPE_FKID
        join STORES on STORE_PKID = CUSTOMER_OUTLET_FKID
        order by [CUSTOMER_PKID] desc`);

    return result.recordsets[0];
  } catch (error) {
    console.log("LiveDashboardCustomer-->", error);
  }
}

async function LiveDashboardOrderStatistic() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool.request().query(`SELECT 
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 4 THEN 1 ELSE 0 END) AS 'April',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 5 THEN 1 ELSE 0 END) AS 'May',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 6 THEN 1 ELSE 0 END) AS 'June',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 7 THEN 1 ELSE 0 END) AS 'July',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 8 THEN 1 ELSE 0 END) AS 'August',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 9 THEN 1 ELSE 0 END) AS 'September',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 10 THEN 1 ELSE 0 END) AS 'October',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 11 THEN 1 ELSE 0 END) AS 'November',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 12 THEN 1 ELSE 0 END) AS 'December',
		SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 1 THEN 1 ELSE 0 END) AS 'January',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 2 THEN 1 ELSE 0 END) AS 'February',
        SUM(CASE datepart(month,ord.ORDER_DATE) WHEN 3 THEN 1 ELSE 0 END) AS 'March'
      FROM
      [ORDERS] as ord
      WHERE
      ORDER_DATE BETWEEN (DATEADD(MONTH, 3, DATEADD(YEAR, DATEDIFF(YEAR, 0, DATEADD(YEAR, year(getdate()) + 0 - 1900, 0)) - 1, 0))) AND (DATEADD(DAY, -1, DATEADD(MONTH, 3, DATEADD(YEAR, DATEDIFF(YEAR, 0, DATEADD(YEAR, year(getdate()) + 0 - 1900, 0)), 0)))) AND ORDER_STATUS=5`);

    arr.push(result.recordsets[0][0].April);
    arr.push(result.recordsets[0][0].May);
    arr.push(result.recordsets[0][0].June);
    arr.push(result.recordsets[0][0].July);
    arr.push(result.recordsets[0][0].August);
    arr.push(result.recordsets[0][0].September);
    arr.push(result.recordsets[0][0].October);
    arr.push(result.recordsets[0][0].November);
    arr.push(result.recordsets[0][0].December);
    arr.push(result.recordsets[0][0].January);
    arr.push(result.recordsets[0][0].February);
    arr.push(result.recordsets[0][0].March);

    return arr;
  } catch (error) {
    console.log("LiveDashboardOrderStatistic-->", error);
  }
}

module.exports = {
  getB2BGstReport: getB2BGstReport,
  getB2BGstReportFilter: getB2BGstReportFilter,
  GetB2CGSTReport: GetB2CGSTReport,
  GetB2CGSTReportFilter: GetB2CGSTReportFilter,
  getHSNWiseGSTReport: getHSNWiseGSTReport,
  getHSNWiseGSTReportFilter: getHSNWiseGSTReportFilter,
  getDocumentIssuesReport: getDocumentIssuesReport,
  getDocumentIssuesReportFilter: getDocumentIssuesReportFilter,
  StockReport: StockReport,
  StockReportFilter: StockReportFilter,
  CollectionReport: CollectionReport,
  CollectionReportFilter: CollectionReportFilter,
  BillingReport: BillingReport,
  BillingReportFilter: BillingReportFilter,
  LiveDashboard: LiveDashboard,
  LiveDashboardOrders: LiveDashboardOrders,
  LiveDashboardCustomer: LiveDashboardCustomer,
  LiveDashboardOrderStatistic: LiveDashboardOrderStatistic,
};
