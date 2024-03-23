/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetAllCustomerType() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from CUSTOMER_TYPE");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllCustomerType-->", error);
  }
}

async function AddCustomer(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var Exist = await pool
      .request()
      .query(
        `select * from CUSTOMERS where CUSTOMER_OUTLET_FKID = '${obj.CUSTOMER_OUTLET_FKID}' and CUSTOMER_CONTACT_NUMBER = '${obj.CUSTOMER_CONTACT_NUMBER}'`
      );
    if (Exist.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("CUSTOMER_OUTLET_FKID", obj.CUSTOMER_OUTLET_FKID)
        .input("CUSTOMER_NAME", obj.CUSTOMER_NAME)
        .input("CUSTOMER_CONTACT_NUMBER", obj.CUSTOMER_CONTACT_NUMBER)
        .input("CUSTOMER_ALT_NUMBER", obj.CUSTOMER_ALT_NUMBER)
        .input("CUSTOMER_GST_TYPE", obj.CUSTOMER_GST_TYPE)
        .input("CUSTOMER_EMAIL", obj.CUSTOMER_EMAIL)
        .input("CUSTOMER_ADDRESS", obj.CUSTOMER_ADDRESS)
        .input("CUSTOMER_GST_NUMBER", obj.CUSTOMER_GST_NUMBER)
        .input("CUSTOMER_TYPE_FKID", obj.CUSTOMER_TYPE_FKID)
        .input("CUSTOMER_HOW_HEAR_US", obj.CUSTOMER_HOW_HEAR_US)
        .query(
          `insert into CUSTOMERS(CUSTOMER_OUTLET_FKID, CUSTOMER_NAME,CUSTOMER_CONTACT_NUMBER,CUSTOMER_ALT_NUMBER,CUSTOMER_GST_TYPE,CUSTOMER_EMAIL,CUSTOMER_ADDRESS,CUSTOMER_GST_NUMBER,CUSTOMER_TYPE_FKID,CUSTOMER_HOW_HEAR_US,CUSTOMER_CREATED_DATE) values(@CUSTOMER_OUTLET_FKID, @CUSTOMER_NAME,@CUSTOMER_CONTACT_NUMBER,@CUSTOMER_ALT_NUMBER,@CUSTOMER_GST_TYPE,@CUSTOMER_EMAIL,@CUSTOMER_ADDRESS,@CUSTOMER_GST_NUMBER,@CUSTOMER_TYPE_FKID,@CUSTOMER_HOW_HEAR_US,getdate())`
        );
      if (result.rowsAffected) {
        var MaxCust = await pool
          .request()
          .query(`select max(CUSTOMER_PKID) as CUSTOMER_PKID from CUSTOMERS`);

        var MainCoupon = await pool
          .request()
          .input("CUSTOMER_COUPON_NAME", "New Customer")
          .input("CUSTOMER_COUPON_CODE", GenerateCouponCode(7))
          .input("CUSTOMER_COUPON_PERCENT_OR_PRICE", "Percentage")
          .input("CUSTOMER_COUPON_DISCOUNT", "50")
          .input("CUSTOMER_COUPON_TYPE", "OneTimeUse")
          .input("CUSTOMER_COUPON_ACTIVE", "1")
          .query(
            `insert into CUSTOMER_COUPON(CUSTOMER_COUPON_NAME, CUSTOMER_COUPON_CODE,CUSTOMER_COUPON_PERCENT_OR_PRICE,CUSTOMER_COUPON_DISCOUNT,CUSTOMER_COUPON_TYPE,CUSTOMER_COUPON_ACTIVE) values(@CUSTOMER_COUPON_NAME, @CUSTOMER_COUPON_CODE,@CUSTOMER_COUPON_PERCENT_OR_PRICE,@CUSTOMER_COUPON_DISCOUNT,@CUSTOMER_COUPON_TYPE,@CUSTOMER_COUPON_ACTIVE)`
          );
        if (MainCoupon.rowsAffected > 0) {
          var MaxCoupon = await pool
            .request()
            .query(
              `select max(CUSTOMER_COUPON_PKID) as CUSTOMER_COUPON_PKID from CUSTOMER_COUPON`
            );

          var CustomerList = await pool
            .request()
            .input(
              "CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID",
              MaxCoupon.recordsets[0][0].CUSTOMER_COUPON_PKID
            )
            .input(
              "CUSTOMER_COUPON_CUST_LIST_FKID",
              MaxCust.recordsets[0][0].CUSTOMER_PKID
            )
            .query(
              `insert into CUSTOMER_COUPON_CUST_LIST(CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID, CUSTOMER_COUPON_CUST_LIST_FKID) values(@CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID, @CUSTOMER_COUPON_CUST_LIST_FKID)`
            );
        }

        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddCustomer-->", error);
  }
}

async function UpdateCustomer(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("CUSTOMER_NAME", obj.CUSTOMER_NAME)
      .input("CUSTOMER_CONTACT_NUMBER", obj.CUSTOMER_CONTACT_NUMBER)
      .input("CUSTOMER_ALT_NUMBER", obj.CUSTOMER_ALT_NUMBER)
      .input("CUSTOMER_GST_TYPE", obj.CUSTOMER_GST_TYPE)
      .input("CUSTOMER_EMAIL", obj.CUSTOMER_EMAIL)
      .input("CUSTOMER_ADDRESS", obj.CUSTOMER_ADDRESS)
      .input("CUSTOMER_GST_NUMBER", obj.CUSTOMER_GST_NUMBER)
      .input("CUSTOMER_TYPE_FKID", obj.CUSTOMER_TYPE_FKID)
      .input("CUSTOMER_PKID", id)
      .query(
        `update CUSTOMERS set CUSTOMER_NAME = @CUSTOMER_NAME,CUSTOMER_CONTACT_NUMBER = @CUSTOMER_CONTACT_NUMBER,CUSTOMER_ALT_NUMBER = @CUSTOMER_ALT_NUMBER,CUSTOMER_GST_TYPE = @CUSTOMER_GST_TYPE,CUSTOMER_EMAIL = @CUSTOMER_EMAIL,CUSTOMER_ADDRESS = @CUSTOMER_ADDRESS,CUSTOMER_GST_NUMBER = @CUSTOMER_GST_NUMBER,CUSTOMER_TYPE_FKID = @CUSTOMER_TYPE_FKID where CUSTOMER_PKID = @CUSTOMER_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateCustomer-->", error);
  }
}

async function GetAllCustomers() {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "All")
      .execute("ViewAllCustomers");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllCustomers-->", error);
  }
}

async function GetNewCustomerCoupon(CustomerID) {
  try {
    let pool = await sql.connect(config);
    var result = await pool.request().query(`select [dbo].[CUSTOMER_COUPON].*
      from [dbo].[CUSTOMER_COUPON_CUST_LIST]
      join [dbo].[CUSTOMER_COUPON] on [CUSTOMER_COUPON_PKID] = [CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID]
      where [CUSTOMER_COUPON_CUST_LIST_FKID] = '${CustomerID}' and [CUSTOMER_COUPON_NAME] = 'New Customer'`);

    return result.recordsets[0];
  } catch (error) {
    console.log("GetNewCustomerCoupon-->", error);
  }
}

async function GetAllCustomersForManager(ManagerID) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ForManager")
      .execute("ViewAllCustomers");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllCustomersForManager-->", error);
  }
}

async function GetAllCustomersForCoupons() {
  try {
    var arr = [];
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ForCoupon")
      .execute("ViewAllCustomers");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var obj = {
        label:
          result.recordsets[0][i].CUSTOMER_NAME +
          " / " +
          result.recordsets[0][i].CUSTOMER_CONTACT_NUMBER +
          " / " +
          result.recordsets[0][i].STORE_SHORT_CODE,
        value: result.recordsets[0][i].CUSTOMER_PKID,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCustomersForCoupons-->", error);
  }
}

async function GetAllCustomersForCouponsForManager(ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ForManager")
      .execute("ViewAllCustomers");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var obj = {
        label:
          result.recordsets[0][i].CUSTOMER_NAME +
          " / " +
          result.recordsets[0][i].CUSTOMER_CONTACT_NUMBER +
          " / " +
          result.recordsets[0][i].STORE_SHORT_CODE,
        id: result.recordsets[0][i].CUSTOMER_PKID,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCustomersForCouponsForManager-->", error);
  }
}

async function GetAllCustomersForPickup() {
  try {
    var arr = [];
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "All")
      .execute("ViewAllCustomers");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var obj = {
        label: `${result.recordsets[0][i].CUSTOMER_NAME} / ${result.recordsets[0][i].CUSTOMER_CONTACT_NUMBER} / ${result.recordsets[0][i].STORE_SHORT_CODE}`,
        id: result.recordsets[0][i].CUSTOMER_PKID,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCustomersForPickup-->", error);
  }
}

async function GetCutomerDetailsByID(CustomerID) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", CustomerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "GetCustomerByID")
      .execute("ViewAllCustomers");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetCutomerDetailsByID-->", error);
  }
}

async function GetAllCustomersForPlaceOrder(OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("Outlet", OutletID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ViewAllCustomersByOutlet")
      .execute("ViewAllCustomers");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var obj = {
        label: `${result.recordsets[0][i].CUSTOMER_NAME} / ${result.recordsets[0][i].CUSTOMER_CONTACT_NUMBER}`,
        id: result.recordsets[0][i].CUSTOMER_PKID,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCustomers-->", error);
  }
}

async function GetAllCustomersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select distinct CUSTOMERS.*,[CUSTOMER_TYPE_NAME],[STORE_NAME],[STORE_CODE] from [dbo].[CUSTOMERS]
    join [dbo].[STORES] on [STORE_PKID] = [CUSTOMER_OUTLET_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    join [dbo].[CUSTOMER_COUPON_CUST_LIST] on [CUSTOMER_COUPON_CUST_LIST_FKID] = [CUSTOMER_PKID]
	  join [dbo].[CUSTOMER_COUPON] on [CUSTOMER_COUPON_PKID] = [CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID] and CUSTOMER_COUPON_NAME = 'New Customer'
    where CUSTOMER_PKID is not null `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.Year == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and CUSTOMER_OUTLET_FKID = '${obj.Outlet}'`;
      }
      if (obj.Year == "-") {
      } else {
        MyQuery += `and year(CUSTOMER_CREATED_DATE) = '${obj.Year}'`;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(CUSTOMER_CREATED_DATE) = '${obj.Month}'`;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (CUSTOMER_CREATED_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllCustomersWithFilter-->", error);
  }
}

async function GetAllCustomersWithFilterByManager(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select  distinct CUSTOMERS.*,[CUSTOMER_TYPE_NAME],[STORE_NAME],[STORE_CODE],STORE_SHORT_CODE,CUSTOMER_COUPON.* from [dbo].[CUSTOMERS]
    join [dbo].[STORES] on [STORE_PKID] = [CUSTOMER_OUTLET_FKID]
    join [dbo].[USER_OUTLETS] on [USER_OUTLETS_OUTLET_FKID] = [STORE_PKID] and [USER_OUTLETS_USER_FKID] = '${obj.ManagerID}'
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    join [dbo].[CUSTOMER_COUPON_CUST_LIST] on [CUSTOMER_COUPON_CUST_LIST_FKID] = [CUSTOMER_PKID]
    join [dbo].[CUSTOMER_COUPON] on [CUSTOMER_COUPON_PKID] = [CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID] and CUSTOMER_COUPON_NAME = 'New Customer' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      let result = await pool
        .request()
        .input("Outlet", obj.ManagerID)
        .input("Month", "")
        .input("Year", "")
        .input("FromDate", "")
        .input("ToDate", "")
        .input("Type", "ForManager")
        .execute("ViewAllCustomers");

      return result.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += ` and CUSTOMER_OUTLET_FKID = '${obj.Outlet}'`;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += ` and month(CUSTOMER_CREATED_DATE) = '${obj.Month}'`;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += ` and (CUSTOMER_CREATED_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllCustomersWithFilterByManager-->", error);
  }
}

function GenerateCouponCode(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

async function DeleteCustomer(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("CUSTOMER_PKID", id)
      .query(`delete from CUSTOMERS where CUSTOMER_PKID = @CUSTOMER_PKID`);

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteCustomer-->", error);
  }
}

async function Activate_DeactivateCustomer(id, Active) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("CUSTOMER_PKID", id)
      .input("CUSTOMER_ACTIVE", Active)
      .query(
        `update CUSTOMERS set CUSTOMER_ACTIVE = @CUSTOMER_ACTIVE where CUSTOMER_PKID = @CUSTOMER_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("Activate_DeactivateCustomer-->", error);
  }
}

async function GetAllCustomerCoupons() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from CUSTOMER_COUPON");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select * from CUSTOMER_COUPON_CUST_LIST join CUSTOMERS on CUSTOMER_PKID = CUSTOMER_COUPON_CUST_LIST_FKID join STORES on STORE_PKID = CUSTOMER_OUTLET_FKID where CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID = '" +
            result.recordsets[0][i].CUSTOMER_COUPON_PKID +
            "'"
        );
      var CustomerForEdit = [];
      for (var j = 0; j < result1.recordsets[0].length; j++) {
        var obj = {
          label:
            result1.recordsets[0][j].CUSTOMER_NAME +
            " / " +
            result1.recordsets[0][j].CUSTOMER_CONTACT_NUMBER +
            " / " +
            result1.recordsets[0][j].STORE_SHORT_CODE,
          value: result1.recordsets[0][j].CUSTOMER_PKID,
        };
        CustomerForEdit.push(obj);
      }

      var obj = {
        CUSTOMER_COUPON_PKID: result.recordsets[0][i].CUSTOMER_COUPON_PKID,
        CUSTOMER_COUPON_NAME: result.recordsets[0][i].CUSTOMER_COUPON_NAME,
        CUSTOMER_COUPON_CODE: result.recordsets[0][i].CUSTOMER_COUPON_CODE,
        CUSTOMER_COUPON_PERCENT_OR_PRICE:
          result.recordsets[0][i].CUSTOMER_COUPON_PERCENT_OR_PRICE,
        CUSTOMER_COUPON_DISCOUNT:
          result.recordsets[0][i].CUSTOMER_COUPON_DISCOUNT,
        CUSTOMER_COUPON_TYPE: result.recordsets[0][i].CUSTOMER_COUPON_TYPE,
        CUSTOMER_COUPON_ACTIVE: result.recordsets[0][i].CUSTOMER_COUPON_ACTIVE,
        CustomerDetails: result1.recordsets[0],
        CustomerDetailsEdit: CustomerForEdit,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCustomerCoupons-->", error);
    //
  }
}

async function GetAllCustomerCouponsForManager(ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from CUSTOMER_COUPON");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select * from CUSTOMER_COUPON_CUST_LIST join CUSTOMERS on CUSTOMER_PKID = CUSTOMER_COUPON_CUST_LIST_FKID join STORES on STORE_PKID = CUSTOMER_OUTLET_FKID join USER_OUTLETS on USER_OUTLETS_OUTLET_FKID = STORE_PKID where CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID = '" +
            result.recordsets[0][i].CUSTOMER_COUPON_PKID +
            "' and USER_OUTLETS_USER_FKID = '" +
            ManagerID +
            "'"
        );
      var CustomerForEdit = [];
      for (var j = 0; j < result1.recordsets[0].length; j++) {
        var obj = {
          label:
            result1.recordsets[0][j].CUSTOMER_NAME +
            " / " +
            result1.recordsets[0][j].CUSTOMER_CONTACT_NUMBER +
            " / " +
            result1.recordsets[0][j].STORE_SHORT_CODE,
          value: result1.recordsets[0][j].CUSTOMER_PKID,
        };
        CustomerForEdit.push(obj);
      }

      var obj = {
        CUSTOMER_COUPON_PKID: result.recordsets[0][i].CUSTOMER_COUPON_PKID,
        CUSTOMER_COUPON_NAME: result.recordsets[0][i].CUSTOMER_COUPON_NAME,
        CUSTOMER_COUPON_CODE: result.recordsets[0][i].CUSTOMER_COUPON_CODE,
        CUSTOMER_COUPON_PERCENT_OR_PRICE:
          result.recordsets[0][i].CUSTOMER_COUPON_PERCENT_OR_PRICE,
        CUSTOMER_COUPON_DISCOUNT:
          result.recordsets[0][i].CUSTOMER_COUPON_DISCOUNT,
        CUSTOMER_COUPON_TYPE: result.recordsets[0][i].CUSTOMER_COUPON_TYPE,
        CUSTOMER_COUPON_ACTIVE: result.recordsets[0][i].CUSTOMER_COUPON_ACTIVE,
        CustomerDetails: result1.recordsets[0],
        CustomerDetailsEdit: CustomerForEdit,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCustomerCouponsForManager-->", error);
    //
  }
}

async function AddCustomerCoupon(obj) {
  try {
    console.log(obj);
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("CUSTOMER_COUPON_NAME", obj.CUSTOMER_COUPON_NAME)
      .input("CUSTOMER_COUPON_CODE", obj.CUSTOMER_COUPON_CODE)
      .input(
        "CUSTOMER_COUPON_PERCENT_OR_PRICE",
        obj.CUSTOMER_COUPON_PERCENT_OR_PRICE
      )
      .input("CUSTOMER_COUPON_DISCOUNT", obj.CUSTOMER_COUPON_DISCOUNT)
      .input("CUSTOMER_COUPON_TYPE", obj.CUSTOMER_COUPON_TYPE)
      .input("CUSTOMER_COUPON_ACTIVE", "1")
      .query(
        `insert into CUSTOMER_COUPON(CUSTOMER_COUPON_NAME, CUSTOMER_COUPON_CODE, CUSTOMER_COUPON_PERCENT_OR_PRICE, CUSTOMER_COUPON_DISCOUNT, CUSTOMER_COUPON_TYPE, CUSTOMER_COUPON_ACTIVE) values(@CUSTOMER_COUPON_NAME, @CUSTOMER_COUPON_CODE, @CUSTOMER_COUPON_PERCENT_OR_PRICE, @CUSTOMER_COUPON_DISCOUNT, @CUSTOMER_COUPON_TYPE, @CUSTOMER_COUPON_ACTIVE)`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `select max(CUSTOMER_COUPON_PKID) as CUSTOMER_COUPON_PKID from CUSTOMER_COUPON`
        );

      if (result1.recordsets[0].length > 0) {
        for (var i = 0; i < obj.CustomerData.length; i++) {
          var result2 = await pool
            .request()
            .input("CUSTOMER_COUPON_CUST_LIST_FKID", obj.CustomerData[i].value)
            .input(
              "CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID",
              result1.recordsets[0][0].CUSTOMER_COUPON_PKID
            )
            .query(
              `insert into CUSTOMER_COUPON_CUST_LIST(CUSTOMER_COUPON_CUST_LIST_FKID,CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID) values(@CUSTOMER_COUPON_CUST_LIST_FKID, @CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID)`
            );
        }
        res = true;
      }
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("AddCustomerCoupon-->", error);
  }
}

async function UpdateCustomerCoupon(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("CUSTOMER_COUPON_NAME", obj.CUSTOMER_COUPON_NAME)
      .input("CUSTOMER_COUPON_CODE", obj.CUSTOMER_COUPON_CODE)
      .input(
        "CUSTOMER_COUPON_PERCENT_OR_PRICE",
        obj.CUSTOMER_COUPON_PERCENT_OR_PRICE
      )
      .input("CUSTOMER_COUPON_DISCOUNT", obj.CUSTOMER_COUPON_DISCOUNT)
      .input("CUSTOMER_COUPON_TYPE", obj.CUSTOMER_COUPON_TYPE)
      .input("CUSTOMER_COUPON_PKID", id)
      .query(
        `update CUSTOMER_COUPON set CUSTOMER_COUPON_NAME = @CUSTOMER_COUPON_NAME, CUSTOMER_COUPON_CODE = @CUSTOMER_COUPON_CODE, CUSTOMER_COUPON_PERCENT_OR_PRICE = @CUSTOMER_COUPON_PERCENT_OR_PRICE, CUSTOMER_COUPON_DISCOUNT = @CUSTOMER_COUPON_DISCOUNT, CUSTOMER_COUPON_TYPE = @CUSTOMER_COUPON_TYPE where CUSTOMER_COUPON_PKID = @CUSTOMER_COUPON_PKID`
      );

    if (result.rowsAffected > 0) {
      let result = await pool
        .request()
        .input("CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID", id)
        .query(
          "delete from CUSTOMER_COUPON_CUST_LIST where CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID = @CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID"
        );
      for (var i = 0; i < obj.CustomerData.length; i++) {
        var result2 = await pool
          .request()
          .input("CUSTOMER_COUPON_CUST_LIST_FKID", obj.CustomerData[i].value)
          .input("CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID", id)
          .query(
            `insert into CUSTOMER_COUPON_CUST_LIST(CUSTOMER_COUPON_CUST_LIST_FKID,CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID) values(@CUSTOMER_COUPON_CUST_LIST_FKID, @CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID)`
          );
      }
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateCustomerCoupon-->", error);
  }
}

async function DeleteCustomerCoupon(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("CUSTOMER_COUPON_PKID", id)
      .query(
        "delete from CUSTOMER_COUPON where CUSTOMER_COUPON_PKID = @CUSTOMER_COUPON_PKID"
      );
    if (result1.rowsAffected > 0) {
      let result = await pool
        .request()
        .input("CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID", id)
        .query(
          "delete from CUSTOMER_COUPON_CUST_LIST where CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID = @CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID"
        );
      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteCustomerCoupon-->", error);
  }
}

module.exports = {
  GetAllCustomerType: GetAllCustomerType,
  AddCustomer: AddCustomer,
  UpdateCustomer: UpdateCustomer,
  GetNewCustomerCoupon: GetNewCustomerCoupon,
  GetAllCustomersForCoupons: GetAllCustomersForCoupons,
  GetAllCustomersForCouponsForManager: GetAllCustomersForCouponsForManager,
  GetAllCustomers: GetAllCustomers,
  GetAllCustomersForManager: GetAllCustomersForManager,
  DeleteCustomer: DeleteCustomer,
  Activate_DeactivateCustomer: Activate_DeactivateCustomer,
  GetAllCustomersWithFilter: GetAllCustomersWithFilter,
  GetAllCustomersWithFilterByManager: GetAllCustomersWithFilterByManager,
  GetAllCustomersForPlaceOrder: GetAllCustomersForPlaceOrder,
  GetAllCustomersForPickup: GetAllCustomersForPickup,
  GetCutomerDetailsByID: GetCutomerDetailsByID,
  GetAllCustomerCoupons: GetAllCustomerCoupons,
  GetAllCustomerCouponsForManager: GetAllCustomerCouponsForManager,
  AddCustomerCoupon: AddCustomerCoupon,
  UpdateCustomerCoupon: UpdateCustomerCoupon,
  DeleteCustomerCoupon: DeleteCustomerCoupon,
};
