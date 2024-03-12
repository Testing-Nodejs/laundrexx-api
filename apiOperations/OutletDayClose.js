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

async function GetTodayDC(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `select ORDERS.*,CUSTOMERS.CUSTOMER_NAME,CUSTOMERS.CUSTOMER_CONTACT_NUMBER,SERVICE_TYPE_NAME,SERVICE_CATEGORY_NAME,
        (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
        (select sum(cast([ORDER_ITEM_COUNT] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount
        from ORDERS 
       join CUSTOMERS on CUSTOMER_PKID = ORDER_CUSTOMER_FKID
       join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID
       join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID where ORDER_OUTLET_FKID = ${OutletID} and ORDER_DATE = (select cast(getdate() as date))`
      );

    var FooterTotal = await pool
      .request()
      .query(
        "select sum(cast(ORDER_ITEMS as int)) As TotalQuantity, sum(cast(ORDER_GRAND_TOTAL_AMOUNT as int)) as TotalAmount from ORDERS join CUSTOMERS on CUSTOMER_PKID = ORDER_CUSTOMER_FKID where ORDER_OUTLET_FKID = '" +
        OutletID +
        "' and ORDER_DATE = (select cast(getdate() as date))"
      );

    var obj = {
      OrderDetails: result.recordsets[0],
      FooterTotal: FooterTotal.recordsets[0],
    };

    arr.push(obj);

    return arr;
  } catch (error) {
    console.log("GetTodayDC-->", error);
  }
}

async function GetDCNo(OutletID) {
  try {
    let pool = await sql.connect(config);

    let FinalOrderNumber = "";
    let FYear = "";
    let OutletCode = "";

    var result3 = await pool
      .request()
      .query(
        "select [STORE_CODE] from [dbo].[STORES] where [STORE_PKID] = '" +
        OutletID +
        "'"
      );

    OutletCode = result3.recordsets[0][0].STORE_CODE;

    var result2 = await pool
      .request()
      .query(
        `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) as fyear`
        // `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) + '/'+ cast(( YEAR( GETDATE() ) % 100 + 1 ) as nvarchar(100)) as fyear`
      );

    FYear = result2.recordsets[0][0].fyear;

    var result1 = await pool
      .request()
      .query(
        "select FACTORY_DC_NUMBER from FACTORY_DC where FACTORY_DC_PKID = (select max(FACTORY_DC_PKID) from FACTORY_DC where FACTORY_DC_OUTLET_FKID = '" +
        OutletID +
        "')"
      );
    if (result1.rowsAffected[0] > 0) {
      var DcNumber =
        parseInt(result1.recordsets[0][0].FACTORY_DC_NUMBER.split("-")[2]) + 1;
      if (DcNumber.toString().length === 4) {
        FinalOrderNumber = OutletCode + "-DC-" + DcNumber + "-" + FYear + "";
      } else if (DcNumber.toString().length === 3) {
        FinalOrderNumber = OutletCode + "-DC-0" + DcNumber + "-" + FYear + "";
      } else if (DcNumber.toString().length === 2) {
        FinalOrderNumber = OutletCode + "-DC-00" + DcNumber + "-" + FYear + "";
      } else if (DcNumber.toString().length === 1) {
        FinalOrderNumber = OutletCode + "-DC-000" + DcNumber + "-" + FYear + "";
      }
    } else {
      FinalOrderNumber = OutletCode + "-DC-0001-" + FYear + "";
    }

    return FinalOrderNumber;
  } catch (error) {
    console.log("GetDCNo-->", error);
  }
}

async function DayClose(obj) {
  try {
    let pool = await sql.connect(config);

    var TodaysOrders = await pool
      .request()
      .query(
        "select ORDER_PKID, ORDER_ORDER_NUMBER, CUSTOMER_NAME, ORDER_GRAND_TOTAL_AMOUNT, ORDER_DUE_DATE, ORDER_ITEMS from ORDERS join CUSTOMERS on CUSTOMER_PKID = ORDER_CUSTOMER_FKID where ORDER_OUTLET_FKID = '" +
        obj.OutletID +
        "' and ORDER_DATE = (select cast(getdate() as date))"
      );

    QRCode.toFile(
      path.join(
        __dirname,
        "../resources/static/assets/uploads",
        "OutletToFactoryDC_" + obj.FACTORY_DC_NUMBER.split("-")[2] + ".png"
      ),
      `${obj.FACTORY_DC_NUMBER}`,
      (err) => {
        if (err) throw err;
      }
    );

    var result = await pool
      .request()
      .input("FACTORY_DC_OUTLET_FKID", obj.OutletID)
      .input("FACTORY_DC_STAFF_FKID", obj.StaffID)
      .input("FACTORY_DC_NUMBER", obj.FACTORY_DC_NUMBER)
      .input("FACTORY_DC_FACCTORY_FKID", obj.FACTORY_DC_FACCTORY_FKID)
      .input("FACTORY_DC_ORDER_COUNT", TodaysOrders.recordsets[0].length)
      .input("FACTORY_DC_STATUS", "0")
      .input(
        "FACTORY_DC_QR",
        "OutletToFactoryDC_" + obj.FACTORY_DC_NUMBER.split("-")[2] + ".png"
      )
      .query(
        "insert into FACTORY_DC(FACTORY_DC_DATE,FACTORY_DC_OUTLET_FKID,FACTORY_DC_NUMBER,FACTORY_DC_FACCTORY_FKID,FACTORY_DC_ORDER_COUNT,FACTORY_DC_STATUS,FACTORY_DC_QR,FACTORY_DC_STAFF_FKID) values(getdate(),@FACTORY_DC_OUTLET_FKID,@FACTORY_DC_NUMBER,@FACTORY_DC_FACCTORY_FKID,@FACTORY_DC_ORDER_COUNT,@FACTORY_DC_STATUS,@FACTORY_DC_QR,@FACTORY_DC_STAFF_FKID)"
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select * from FACTORY_DC where FACTORY_DC_PKID = (select max(FACTORY_DC_PKID) as FACTORY_DC_PKID from FACTORY_DC)`
        );

      if (result1.recordsets[0].length > 0) {
        for (var i = 0; i < TodaysOrders.recordsets[0].length; i++) {
          var result2 = await pool
            .request()
            .input(
              "FACTORY_DC_ITEMS_DC_FKID",
              result1.recordsets[0][0].FACTORY_DC_PKID
            )
            .input(
              "FACTORY_DC_ITEMS_ORDER_FKID",
              TodaysOrders.recordsets[0][i].ORDER_PKID
            )
            .query(
              `insert into FACTORY_DC_ITEMS(FACTORY_DC_ITEMS_DC_FKID,FACTORY_DC_ITEMS_ORDER_FKID) values(@FACTORY_DC_ITEMS_DC_FKID,@FACTORY_DC_ITEMS_ORDER_FKID)`
            );

          var result3 = await pool
            .request()
            .query(
              `update ORDERS set ORDER_STATUS = '1' where ORDER_PKID = '${TodaysOrders.recordsets[0][i].ORDER_PKID}'`
            );
        }
      }

      var CurrentTime = await pool
        .request()
        .query(
          `SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0) as ctime`
        );

      var OutletPaySlip = await pool
        .request()
        .input("OUTLET_PAY_SLIP_TIME", CurrentTime.recordsets[0][0].ctime)
        .input("OUTLET_PAY_SLIP_OUTLET_FKID", obj.OutletID)
        .input("OUTLET_PAY_SLIP_STAFF_FKID", obj.StaffID)
        .input(
          "OUTLET_PAY_SLIP_FIVE_HUNDRED_CNT",
          obj.OUTLET_PAY_SLIP_FIVE_HUNDRED_CNT
        )
        .input(
          "OUTLET_PAY_SLIP_FIVE_HUNDRED_AMT",
          obj.OUTLET_PAY_SLIP_FIVE_HUNDRED_AMT
        )
        .input(
          "OUTLET_PAY_SLIP_TWO_HUNDRED_CNT",
          obj.OUTLET_PAY_SLIP_TWO_HUNDRED_CNT
        )
        .input(
          "OUTLET_PAY_SLIP_TWO_HUNDRED_AMT",
          obj.OUTLET_PAY_SLIP_TWO_HUNDRED_AMT
        )
        .input(
          "OUTLET_PAY_SLIP_ONE_HUNDRED_CNT",
          obj.OUTLET_PAY_SLIP_ONE_HUNDRED_CNT
        )
        .input(
          "OUTLET_PAY_SLIP_ONE_HUNDRED_AMT",
          obj.OUTLET_PAY_SLIP_ONE_HUNDRED_AMT
        )
        .input("OUTLET_PAY_SLIP_FIFTY_RS_CNT", obj.OUTLET_PAY_SLIP_FIFTY_RS_CNT)
        .input("OUTLET_PAY_SLIP_FIFTY_RS_AMT", obj.OUTLET_PAY_SLIP_FIFTY_RS_AMT)
        .input(
          "OUTLET_PAY_SLIP_TWENTY_RS_CNT",
          obj.OUTLET_PAY_SLIP_TWENTY_RS_CNT
        )
        .input(
          "OUTLET_PAY_SLIP_TWENTY_RS_AMT",
          obj.OUTLET_PAY_SLIP_TWENTY_RS_AMT
        )
        .input("OUTLET_PAY_SLIP_TEN_RS_CNT", obj.OUTLET_PAY_SLIP_TEN_RS_CNT)
        .input("OUTLET_PAY_SLIP_TEN_RS_AMT", obj.OUTLET_PAY_SLIP_TEN_RS_AMT)
        .input("OUTLET_PAY_SLIP_FIVE_RS_CNT", obj.OUTLET_PAY_SLIP_FIVE_RS_CNT)
        .input("OUTLET_PAY_SLIP_FIVE_RS_AMT", obj.OUTLET_PAY_SLIP_FIVE_RS_AMT)
        .input("OUTLET_PAY_SLIP_COINS_CNT", obj.OUTLET_PAY_SLIP_COINS_CNT)
        .input("OUTLET_PAY_SLIP_COINS_AMT", obj.OUTLET_PAY_SLIP_COINS_AMT)
        .input("OUTLET_PAY_SLIP_TOTAL_CASH", obj.OUTLET_PAY_SLIP_TOTAL_CASH)
        .input("OUTLET_PAY_SLIP_CREDIT_CARD", obj.OUTLET_PAY_SLIP_CREDIT_CARD)
        .input("OUTLET_PAY_SLIP_UPI", obj.OUTLET_PAY_SLIP_UPI)
        .input("OUTLET_PAY_SLIP_CHEQUE", obj.OUTLET_PAY_SLIP_CHEQUE)
        .input("OUTLET_PAY_SLIP_NEFT", obj.OUTLET_PAY_SLIP_NEFT)
        .input("OUTLET_PAY_SLIP_TOTAL_ORDERS", obj.OUTLET_PAY_SLIP_TOTAL_ORDERS)
        .input(
          "OUTLET_PAY_SLIP_TOTAL_COLLECTIONS",
          obj.OUTLET_PAY_SLIP_TOTAL_COLLECTIONS
        )
        .input("OUTLET_PAY_SLIP_BALANCE", obj.OUTLET_PAY_SLIP_BALANCE)
        .input("OUTLET_PAY_SLIP_REMARKS", obj.OUTLET_PAY_SLIP_REMARKS)
        .query(
          "insert into OUTLET_PAY_SLIP(OUTLET_PAY_SLIP_DATE,OUTLET_PAY_SLIP_TIME,OUTLET_PAY_SLIP_OUTLET_FKID,OUTLET_PAY_SLIP_STAFF_FKID,OUTLET_PAY_SLIP_FIVE_HUNDRED_CNT,OUTLET_PAY_SLIP_FIVE_HUNDRED_AMT,OUTLET_PAY_SLIP_TWO_HUNDRED_CNT,OUTLET_PAY_SLIP_TWO_HUNDRED_AMT,OUTLET_PAY_SLIP_ONE_HUNDRED_CNT,OUTLET_PAY_SLIP_ONE_HUNDRED_AMT,OUTLET_PAY_SLIP_FIFTY_RS_CNT,OUTLET_PAY_SLIP_FIFTY_RS_AMT,OUTLET_PAY_SLIP_TWENTY_RS_CNT,OUTLET_PAY_SLIP_TWENTY_RS_AMT,OUTLET_PAY_SLIP_TEN_RS_CNT,OUTLET_PAY_SLIP_TEN_RS_AMT,OUTLET_PAY_SLIP_FIVE_RS_CNT,OUTLET_PAY_SLIP_FIVE_RS_AMT,OUTLET_PAY_SLIP_COINS_CNT,OUTLET_PAY_SLIP_COINS_AMT,OUTLET_PAY_SLIP_TOTAL_CASH,OUTLET_PAY_SLIP_CREDIT_CARD,OUTLET_PAY_SLIP_UPI,OUTLET_PAY_SLIP_CHEQUE,OUTLET_PAY_SLIP_NEFT,OUTLET_PAY_SLIP_TOTAL_ORDERS, OUTLET_PAY_SLIP_TOTAL_COLLECTIONS, OUTLET_PAY_SLIP_BALANCE, OUTLET_PAY_SLIP_REMARKS) values(getdate(),@OUTLET_PAY_SLIP_TIME,@OUTLET_PAY_SLIP_OUTLET_FKID,@OUTLET_PAY_SLIP_STAFF_FKID,@OUTLET_PAY_SLIP_FIVE_HUNDRED_CNT,@OUTLET_PAY_SLIP_FIVE_HUNDRED_AMT,@OUTLET_PAY_SLIP_TWO_HUNDRED_CNT,@OUTLET_PAY_SLIP_TWO_HUNDRED_AMT,@OUTLET_PAY_SLIP_ONE_HUNDRED_CNT,@OUTLET_PAY_SLIP_ONE_HUNDRED_AMT,@OUTLET_PAY_SLIP_FIFTY_RS_CNT,@OUTLET_PAY_SLIP_FIFTY_RS_AMT,@OUTLET_PAY_SLIP_TWENTY_RS_CNT,@OUTLET_PAY_SLIP_TWENTY_RS_AMT,@OUTLET_PAY_SLIP_TEN_RS_CNT,@OUTLET_PAY_SLIP_TEN_RS_AMT,@OUTLET_PAY_SLIP_FIVE_RS_CNT,@OUTLET_PAY_SLIP_FIVE_RS_AMT,@OUTLET_PAY_SLIP_COINS_CNT,@OUTLET_PAY_SLIP_COINS_AMT,@OUTLET_PAY_SLIP_TOTAL_CASH,@OUTLET_PAY_SLIP_CREDIT_CARD,@OUTLET_PAY_SLIP_UPI,@OUTLET_PAY_SLIP_CHEQUE,@OUTLET_PAY_SLIP_NEFT,@OUTLET_PAY_SLIP_TOTAL_ORDERS, @OUTLET_PAY_SLIP_TOTAL_COLLECTIONS, @OUTLET_PAY_SLIP_BALANCE, @OUTLET_PAY_SLIP_REMARKS)"
        );
      if (OutletPaySlip.rowsAffected > 0) {
        return (
          "OutletToFactoryDC_" + obj.FACTORY_DC_NUMBER.split("-")[2] + ".png"
        );
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log("DayClose-->", error);
  }
}

async function GetOutletToFactoryDC(OutletID) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select [FACTORY_DC_QR],[FACTORY_DC_PKID], [FACTORY_DC_DATE], [FACTORY_DC_OUTLET_FKID], [FACTORY_DC_STAFF_FKID], [STORE_STAFF_NAME], [FACTORY_DC_NUMBER], [FACTORY_DC_FACCTORY_FKID], [FACTORY_ID], [FACTORY_CODE], [FACTORY_NAME], [FACTORY_DC_ORDER_COUNT], [FACTORY_DC_TOTAL_BAGS], [FACTORY_DC_STATUS], (select sum(cast(ORDER_ITEMS as int)) from FACTORY_DC_ITEMS join ORDERS on ORDER_PKID = FACTORY_DC_ITEMS_ORDER_FKID where FACTORY_DC_ITEMS_DC_FKID = FACTORY_DC_PKID) as TotalQuantity, (select sum(cast(ORDER_ITEM_COUNT as int)) from FACTORY_DC_ITEMS join ORDERS on ORDER_PKID = FACTORY_DC_ITEMS_ORDER_FKID join ORDER_ITEMS on ORDER_ITEM_ORDER_FKID = ORDER_PKID where FACTORY_DC_ITEMS_DC_FKID = FACTORY_DC_PKID) as TotalCount
      from [dbo].[FACTORY_DC]
      join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_DC_FACCTORY_FKID]
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
      where FACTORY_DC_OUTLET_FKID = '${OutletID}'`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("GetOutletToFactoryDC-->", error);
  }
}

async function GetOutletToFactoryDCByDCNumber(obj) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select [FACTORY_DC_QR],[FACTORY_DC_PKID], [FACTORY_DC_DATE], [FACTORY_DC_OUTLET_FKID], [FACTORY_DC_STAFF_FKID], [STORE_STAFF_NAME], [FACTORY_DC_NUMBER], [FACTORY_DC_FACCTORY_FKID], [FACTORY_ID], [FACTORY_CODE], [FACTORY_NAME], [FACTORY_DC_ORDER_COUNT], [FACTORY_DC_TOTAL_BAGS], [FACTORY_DC_STATUS], (select sum(cast(ORDER_ITEMS as int)) from FACTORY_DC_ITEMS join ORDERS on ORDER_PKID = FACTORY_DC_ITEMS_ORDER_FKID where FACTORY_DC_ITEMS_DC_FKID = FACTORY_DC_PKID) as TotalQuantity
      from [dbo].[FACTORY_DC]
      join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_DC_FACCTORY_FKID]
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
      where FACTORY_DC_NUMBER = '${obj.DCNumber}'`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("GetOutletToFactoryDCByDCNumber-->", error);
  }
}

async function GetOutletToFactoryDCFilter(obj) {
  try {
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select [FACTORY_DC_QR],[FACTORY_DC_PKID], [FACTORY_DC_DATE], [FACTORY_DC_OUTLET_FKID], [FACTORY_DC_STAFF_FKID], [STORE_STAFF_NAME], [FACTORY_DC_NUMBER], [FACTORY_DC_FACCTORY_FKID], [FACTORY_ID], [FACTORY_CODE], [FACTORY_NAME], [FACTORY_DC_ORDER_COUNT], [FACTORY_DC_TOTAL_BAGS], [FACTORY_DC_STATUS], (select sum(cast(ORDER_ITEMS as int)) from FACTORY_DC_ITEMS join ORDERS on ORDER_PKID = FACTORY_DC_ITEMS_ORDER_FKID where FACTORY_DC_ITEMS_DC_FKID = FACTORY_DC_PKID) as TotalQuantity
    from [dbo].[FACTORY_DC]
    join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_DC_FACCTORY_FKID]
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [FACTORY_DC_STAFF_FKID]
    where FACTORY_DC_OUTLET_FKID = '${obj.OutletID}'`;

    if (
      obj.Factory == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by FACTORY_DC_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Factory == "-") {
      } else {
        MyQuery += `and FACTORY_DC_FACCTORY_FKID = '${obj.Factory}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(FACTORY_DC_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += `and year(FACTORY_DC_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (FACTORY_DC_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by FACTORY_DC_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("ReturnToOutletViewFilter-->", error);
  }
}

async function GetOutletToFactryDCItems(Pkid) {
  try {
    let pool = await sql.connect(config);

    var result1 = await pool.request().query(
      `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
      (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
      (select sum(cast([ORDER_ITEM_COUNT] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
      STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,
      [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
      COUPONS.*, cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 3 then 0 else 1 end) as bit) as IsEditable
      from FACTORY_DC_ITEMS
      join ORDERS on ORDER_PKID = FACTORY_DC_ITEMS_ORDER_FKID
      join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
      join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
      join STORES on STORE_PKID = ORDER_OUTLET_FKID
      join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
      join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
      join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
      join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
      join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
      left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
      where FACTORY_DC_ITEMS_DC_FKID = '${Pkid}'
      order by FACTORY_DC_ITEMS_PKID desc`
    );
    return result1.recordsets[0];
  } catch (error) {
    console.log("GetOutletToFactryDCItems-->", error);
  }
}

module.exports = {
  GetTodayDC: GetTodayDC,
  DayClose: DayClose,
  GetDCNo: GetDCNo,
  GetOutletToFactoryDC: GetOutletToFactoryDC,
  GetOutletToFactoryDCByDCNumber: GetOutletToFactoryDCByDCNumber,
  GetOutletToFactoryDCFilter: GetOutletToFactoryDCFilter,
  GetOutletToFactryDCItems: GetOutletToFactryDCItems,
};
