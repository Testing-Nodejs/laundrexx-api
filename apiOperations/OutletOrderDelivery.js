/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function SendOTP(OutletID, PhoneNumber) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `select * from CUSTOMERS where CUSTOMER_OUTLET_FKID = '${OutletID}' and CUSTOMER_CONTACT_NUMBER = '${PhoneNumber}'`
      );

    if (result.rowsAffected > 0) {
      var result2 = await pool
        .request()
        .query(
          `select * from CUSTOMER_OTP where CUSTOMER_OTP_OUTLET_FKID = '${OutletID}' and CUSTOMER_OTP_PHONE = '${PhoneNumber}' and CUSTOMER_OTP_ACTIVE = 1`
        );

      if (result2.rowsAffected > 0) {
        var result1 = await pool
          .request()
          .input("CUSTOMER_OTP_OUTLET_FKID", OutletID)
          .input("CUSTOMER_OTP_PHONE", PhoneNumber)
          .input("CUSTOMER_OTP", Math.floor(1000 + Math.random() * 9000))
          .query(
            `update CUSTOMER_OTP set CUSTOMER_OTP = @CUSTOMER_OTP where CUSTOMER_OTP_OUTLET_FKID = @CUSTOMER_OTP_OUTLET_FKID and CUSTOMER_OTP_PHONE = @CUSTOMER_OTP_PHONE`
          );

        return true;
      } else {
        var result1 = await pool
          .request()
          .input("CUSTOMER_OTP_OUTLET_FKID", OutletID)
          .input("CUSTOMER_OTP_PHONE", PhoneNumber)
          .input("CUSTOMER_OTP", Math.floor(1000 + Math.random() * 9000))
          .input("CUSTOMER_OTP_ACTIVE", "1")
          .query(
            `insert into CUSTOMER_OTP(CUSTOMER_OTP_OUTLET_FKID,CUSTOMER_OTP_PHONE,CUSTOMER_OTP,CUSTOMER_OTP_ACTIVE) values(@CUSTOMER_OTP_OUTLET_FKID,@CUSTOMER_OTP_PHONE,@CUSTOMER_OTP,@CUSTOMER_OTP_ACTIVE)`
          );

        return true;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log("SendOTP-->", error);
  }
}

async function VerifyDeliveryOTP(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `select * from CUSTOMER_OTP where CUSTOMER_OTP_OUTLET_FKID = '${obj.OutletID}' and CUSTOMER_OTP_PHONE = '${obj.PhoneNumber}'`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select * from CUSTOMER_OTP where CUSTOMER_OTP_OUTLET_FKID = '${obj.OutletID}' and CUSTOMER_OTP_PHONE = '${obj.PhoneNumber}' and CUSTOMER_OTP = '${obj.otp}'`
        );
      if (result1.rowsAffected > 0) {
        if (
          result1.recordsets[0][0].CUSTOMER_OTP_ACTIVE === 1 ||
          result1.recordsets[0][0].CUSTOMER_OTP_ACTIVE === true
        ) {
          var result1 = await pool
            .request()
            .input(
              "CUSTOMER_OTP_PKID",
              result1.recordsets[0][0].CUSTOMER_OTP_PKID
            )
            .query(
              `update CUSTOMER_OTP set CUSTOMER_OTP_ACTIVE = 0 where CUSTOMER_OTP_PKID = @CUSTOMER_OTP_PKID`
            );
          return "3";
        } else {
          return "2";
        }
      } else {
        return "1";
      }
    } else {
      return "0";
    }
  } catch (error) {
    console.log("VerifyDeliveryOTP-->", error);
  }
}

async function VerifyDeliveryCode(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        `select * from CUSTOMERS where CUSTOMER_OUTLET_FKID = '${obj.OutletID}' and CUSTOMER_CONTACT_NUMBER = '${obj.PhoneNumber}'`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select * from CUSTOMERS where CUSTOMER_OUTLET_FKID = '${obj.OutletID}' and CUSTOMER_CONTACT_NUMBER = '${obj.PhoneNumber}' and CUSTOMER_DELIVERY_CODE = '${obj.otp}'`
        );
      if (result1.rowsAffected > 0) {
        return "3";
      } else {
        return "1";
      }
    } else {
      return "0";
    }
  } catch (error) {
    console.log("VerifyDeliveryCode-->", error);
  }
}

async function GetOrdersListByPhoneNumber(PhoneNumber) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select [ORDER_PKID],[ORDER_ORDER_NUMBER],[ORDER_BAD_DEBITS], [ORDER_INVOICE_NUMBER], [ORDER_DATE], [ORDER_DUE_DATE], [CUSTOMER_NAME], [ORDER_GRAND_TOTAL_AMOUNT], 0 as checked
from [dbo].[ORDERS] 
join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
join [dbo].[STORE_INVENTORY] on [STORE_INVENTORY_ORDER_FKID] = [ORDER_PKID]
where [STORE_INVENTORY_STATUS] = 1 and [CUSTOMER_CONTACT_NUMBER] = '${PhoneNumber}'`
    );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetOrdersListByPhoneNumber-->", error);
  }
}

async function ConfirmDelivery(obj) {
  try {
    console.log(obj);

    let CustomerID = "";

    let pool = await sql.connect(config);
    var result = await pool
      .request()
      .query(
        `select CUSTOMER_PKID from CUSTOMERS where CUSTOMER_OUTLET_FKID = '${obj.OutletID}' and CUSTOMER_CONTACT_NUMBER = '${obj.CustomerPhoneNumber}'`
      );

    CustomerID = result.recordsets[0][0].CUSTOMER_PKID;

    var result1 = await pool.request().query(
      `insert into ORDER_PAYMENT(ORDER_PAYMENT_DATE,ORDER_PAYMENT_TIME,ORDER_PAYMENT_OUTLET_FKID,ORDER_PAYMENT_CUSTOMER_FKID,ORDER_PAYMENT_NO_OF_ORDERS,ORDER_PAYMENT_TOTAL_ORDER_AMOUNT,ORDER_PAYMENT_COLLECTED_AMOUNT,ORDER_PAYMENT_BALANCE_AMOUNT,ORDER_PAYMENT_MODE,ORDER_PAYMENT_BAD_DEBITS,ORDER_PAYMENT_FINAL_AMOUNT) 
        values(getdate(),(SELECT CONVERT(VARCHAR(10), CAST(getdate() AS TIME), 0)),'${obj.OutletID}','${CustomerID}','${obj.selectedOrdersCnt}','${obj.TotalOrderAmount}','${obj.CollectedAmount}','${obj.BalanceAmount}','${obj.PaymentMode}','${obj.BadDebits}','${obj.FinalAmount}')`
    );

    if (result1.rowsAffected) {
      var result2 = await pool
        .request()
        .query(
          `select max(ORDER_PAYMENT_PKID) as ORDER_PAYMENT_PKID from ORDER_PAYMENT`
        );
      for (var i = 0; i < obj.OrderList.length; i++) {
        if (
          obj.OrderList[i].checked === 1 ||
          obj.OrderList[i].checked === "1" ||
          obj.OrderList[i].checked == true
        ) {
          var result3 = await pool.request().query(
            `insert into ORDER_PAYMENT_ORDER_LIST(ORDER_PAYMENT_ORDER_LIST_ORDER_FKID,ORDER_PAYMENT_ORDER_LIST_PAYMENT_FKID) 
                  values('${obj.OrderList[i].ORDER_PKID}','${result2.recordsets[0][0].ORDER_PAYMENT_PKID}')`
          );

          var result4 = await pool
            .request()
            .query(
              `update ORDERS set ORDER_STATUS = '5' where ORDER_PKID = '${obj.OrderList[i].ORDER_PKID}'`
            );

          var result5 = await pool
            .request()
            .query(
              `update STORE_INVENTORY set STORE_INVENTORY_STATUS = '2' where STORE_INVENTORY_ORDER_FKID = '${obj.OrderList[i].ORDER_PKID}'`
            );
        }
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("ConfirmDelivery-->", error);
  }
}

async function GetOutletCollectionReport(OutletID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool.request().query(
      `select [ORDER_PAYMENT_CREDIT],[ORDER_PAYMENT_BAD_DEBITS],[ORDER_PAYMENT_FINAL_AMOUNT],[CUSTOMER_CONTACT_NUMBER],[ORDER_PKID], [ORDER_ORDER_NUMBER], [ORDER_DATE], [ORDER_DUE_DATE], [ORDER_GRAND_TOTAL_AMOUNT],[CUSTOMER_NAME], [ORDER_PAYMENT_DATE], [ORDER_PAYMENT_COLLECTED_AMOUNT], [ORDER_PAYMENT_MODE], [ORDER_PAYMENT_BALANCE_AMOUNT]
      from [dbo].[ORDER_PAYMENT]
      join [dbo].[ORDER_PAYMENT_ORDER_LIST] on [ORDER_PAYMENT_ORDER_LIST_PAYMENT_FKID] = [ORDER_PAYMENT_PKID]
      join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_PAYMENT_ORDER_LIST_ORDER_FKID]
      join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_PAYMENT_CUSTOMER_FKID]
      where [ORDER_PAYMENT_OUTLET_FKID] = '${OutletID}' and [ORDER_PAYMENT_DATE] = cast(getdate() as date) order by ORDER_PAYMENT_PKID desc`
    );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetOutletCollectionReport-->", error);
  }
}

async function GetOutletCollectionReportFilter(obj) {
  try {
    console.log(obj);

    let pool = await sql.connect(config);

    var MyQuery = `select [ORDER_PAYMENT_CREDIT],[ORDER_PAYMENT_BAD_DEBITS],[ORDER_PAYMENT_FINAL_AMOUNT],[CUSTOMER_CONTACT_NUMBER],[ORDER_PKID], [ORDER_ORDER_NUMBER], [ORDER_DATE], [ORDER_DUE_DATE], [ORDER_GRAND_TOTAL_AMOUNT],[CUSTOMER_NAME], [ORDER_PAYMENT_DATE], [ORDER_PAYMENT_COLLECTED_AMOUNT], [ORDER_PAYMENT_MODE], [ORDER_PAYMENT_BALANCE_AMOUNT]
    from [dbo].[ORDER_PAYMENT]
    join [dbo].[ORDER_PAYMENT_ORDER_LIST] on [ORDER_PAYMENT_ORDER_LIST_PAYMENT_FKID] = [ORDER_PAYMENT_PKID]
    join [dbo].[ORDERS] on [ORDER_PKID] = [ORDER_PAYMENT_ORDER_LIST_ORDER_FKID]
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_PAYMENT_CUSTOMER_FKID]
    where [ORDER_PAYMENT_OUTLET_FKID] = '${obj.OutletID}' `;

    if (
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += ` order by ORDER_PAYMENT_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(ORDER_PAYMENT_DATE) = '${obj.Month}' `;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += ` and year(ORDER_PAYMENT_DATE) = '${obj.Year}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (ORDER_PAYMENT_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += ` order by ORDER_PAYMENT_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetOutletCollectionReportFilter-->", error);
  }
}

module.exports = {
  SendOTP: SendOTP,
  VerifyDeliveryOTP: VerifyDeliveryOTP,
  VerifyDeliveryCode: VerifyDeliveryCode,
  GetOrdersListByPhoneNumber: GetOrdersListByPhoneNumber,
  ConfirmDelivery: ConfirmDelivery,
  GetOutletCollectionReport: GetOutletCollectionReport,
  GetOutletCollectionReportFilter: GetOutletCollectionReportFilter,
};