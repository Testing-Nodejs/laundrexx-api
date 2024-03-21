/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetAllAdminPickups() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME,PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE from PICKUPS where PICKUP_CREATED_BY = 'Admin' and year([PICKUP_DATE]) = year(getdate())"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
            result.recordsets[0][i].PICKUP_DRIVER_FKID +
            "'"
        );

      var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
      var PickupID = result.recordsets[0][i].PICKUP_PKID;
      var CustomerArr = [];

      if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0") {
        let result = await pool
          .request()
          .query(
            "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
              PickupID +
              "'"
          );
        CustomerArr.push(result.recordsets[0][0]);
      } else {
        let result = await pool
          .request()
          .input("Outlet", CustomerID)
          .input("Month", "")
          .input("Year", "")
          .input("FromDate", "")
          .input("ToDate", "")
          .input("Type", "GetCustomerByID")
          .execute("ViewAllCustomers");

        CustomerArr.push(result.recordsets[0][0]);
      }

      var obj = {
        PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
        PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
        PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
        PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
        PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
        PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
        PICKUP_CUSTOMER_PHONE: result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
        PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
        PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
        PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
        PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
        PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
        PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
        PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
        PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
        DRIVER_DETAILS: result1.recordsets[0],
        CUSTOMER_DETAILS: CustomerArr,
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllAdminPickups-->", error);
    //
  }
}

async function GetAllManagerAddedPickups(ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME,PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE from PICKUPS where year([PICKUP_DATE]) = year(getdate()) and PICKUP_CREATED_BY = 'Manager' and PICKUP_CREATED_BY_FKID = '" +
          ManagerID +
          "'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
            result.recordsets[0][i].PICKUP_DRIVER_FKID +
            "'"
        );

      var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
      var PickupID = result.recordsets[0][i].PICKUP_PKID;
      var CustomerArr = [];

      if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0") {
        let result = await pool
          .request()
          .query(
            "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
              PickupID +
              "'"
          );
        CustomerArr.push(result.recordsets[0][0]);
      } else {
        let result = await pool
          .request()
          .input("Outlet", CustomerID)
          .input("Month", "")
          .input("Year", "")
          .input("FromDate", "")
          .input("ToDate", "")
          .input("Type", "GetCustomerByID")
          .execute("ViewAllCustomers");

        CustomerArr.push(result.recordsets[0][0]);
      }

      var obj = {
        PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
        PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
        PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
        PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
        PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
        PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
        PICKUP_CUSTOMER_PHONE: result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
        PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
        PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
        PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
        PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
        PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
        PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
        PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
        PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
        DRIVER_DETAILS: result1.recordsets[0],
        CUSTOMER_DETAILS: CustomerArr,
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllManagerAddedPickups-->", error);
    //
  }
}

async function GetAllAdminPickupsFilter(FromDate, ToDate) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME, PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE from PICKUPS where PICKUP_CREATED_BY = 'Admin' and [PICKUP_DATE] between '" +
          FromDate +
          "' and '" +
          ToDate +
          "'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
            result.recordsets[0][i].PICKUP_DRIVER_FKID +
            "'"
        );

      var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
      var PickupID = result.recordsets[0][i].PICKUP_PKID;
      var CustomerArr = [];

      if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0") {
        let result = await pool
          .request()
          .query(
            "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
              PickupID +
              "'"
          );
        CustomerArr.push(result.recordsets[0][0]);
      } else {
        let result = await pool
          .request()
          .input("Outlet", CustomerID)
          .input("Month", "")
          .input("Year", "")
          .input("FromDate", "")
          .input("ToDate", "")
          .input("Type", "GetCustomerByID")
          .execute("ViewAllCustomers");

        CustomerArr.push(result.recordsets[0][0]);
      }

      var obj = {
        PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
        PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
        PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
        PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
        PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
        PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
        PICKUP_CUSTOMER_PHONE: result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
        PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
        PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
        PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
        PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
        PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
        PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
        PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
        PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
        DRIVER_DETAILS: result1.recordsets[0],
        CUSTOMER_DETAILS: CustomerArr,
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllAdminPickupsFilter-->", error);
    //
  }
}

async function GetAllManagerPickupsFilter(FromDate, ToDate, ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME, PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE from PICKUPS where PICKUP_CREATED_BY = 'Admin' and [PICKUP_DATE] between '" +
          FromDate +
          "' and '" +
          ToDate +
          "' and PICKUP_CREATED_BY = 'Manager' and PICKUP_CREATED_BY_FKID = '" +
          ManagerID +
          "'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
            result.recordsets[0][i].PICKUP_DRIVER_FKID +
            "'"
        );

      var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
      var PickupID = result.recordsets[0][i].PICKUP_PKID;
      var CustomerArr = [];

      if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0") {
        let result = await pool
          .request()
          .query(
            "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
              PickupID +
              "'"
          );
        CustomerArr.push(result.recordsets[0][0]);
      } else {
        let result = await pool
          .request()
          .input("Outlet", CustomerID)
          .input("Month", "")
          .input("Year", "")
          .input("FromDate", "")
          .input("ToDate", "")
          .input("Type", "GetCustomerByID")
          .execute("ViewAllCustomers");

        CustomerArr.push(result.recordsets[0][0]);
      }

      var obj = {
        PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
        PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
        PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
        PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
        PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
        PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
        PICKUP_CUSTOMER_PHONE: result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
        PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
        PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
        PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
        PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
        PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
        PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
        PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
        PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
        DRIVER_DETAILS: result1.recordsets[0],
        CUSTOMER_DETAILS: CustomerArr,
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllManagerPickupsFilter-->", error);
    //
  }
}

async function AddPickup(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let PickupCode = "";
    let FYear = "";

    var result2 = await pool
      .request()
      .query(
        `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) + '/'+ cast(( YEAR( GETDATE() ) % 100 + 1 ) as nvarchar(100)) as fyear`
      );

    FYear = result2.recordsets[0][0].fyear;

    var result1 = await pool
      .request()
      .query(
        `select PICKUP_CODE from PICKUPS where PICKUP_PKID = (select max(PICKUP_PKID) from PICKUPS)`
      );
    if (result1.rowsAffected[0] > 0) {
      var pickupno =
        parseInt(result1.recordsets[0][0].PICKUP_CODE.split("-")[1]) + 1;
      if (pickupno.toString().length === 4) {
        PickupCode = "PICKUP-" + pickupno + "-" + FYear + "";
      } else if (pickupno.toString().length === 3) {
        PickupCode = "PICKUP-0" + pickupno + "-" + FYear + "";
      } else if (pickupno.toString().length === 2) {
        PickupCode = "PICKUP-00" + pickupno + "-" + FYear + "";
      } else if (pickupno.toString().length === 1) {
        PickupCode = "PICKUP-000" + pickupno + "-" + FYear + "";
      }
    } else {
      PickupCode = "PICKUP-0001-" + FYear + "";
    }

    var result = await pool
      .request()
      .input("PICKUP_CODE", PickupCode)
      .input("PICKUP_CUSTOMER_FKID", obj.PICKUP_CUSTOMER_FKID)
      .input("PICKUP_CUSTOMER_NAME", obj.PICKUP_CUSTOMER_NAME)
      .input("PICKUP_CUSTOMER_PHONE", obj.PICKUP_CUSTOMER_PHONE)
      .input("PICKUP_ADDRESS", obj.PICKUP_ADDRESS)
      .input("PICKUP_TIME", obj.PICKUP_TIME)
      .input("PICKUP_TIME_1", obj.PICKUP_TIME_1)
      .input("PICKUP_QUANTITY", obj.PICKUP_QUANTITY)
      .input("PICKUP_BULK_ITEMS", obj.PICKUP_BULK_ITEMS)
      .input("PICKUP_DOOR_DELIVERY", obj.PICKUP_DOOR_DELIVERY)
      .input("PICKUP_CREATED_BY", "Admin")
      .query(
        `insert into PICKUPS(PICKUP_CODE, PICKUP_CUSTOMER_FKID, PICKUP_CUSTOMER_NAME, PICKUP_CUSTOMER_PHONE, PICKUP_ADDRESS, PICKUP_TIME, PICKUP_QUANTITY, PICKUP_BULK_ITEMS, PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY,PICKUP_DATE,PICKUP_TIME_1) values(@PICKUP_CODE, @PICKUP_CUSTOMER_FKID, @PICKUP_CUSTOMER_NAME, @PICKUP_CUSTOMER_PHONE, @PICKUP_ADDRESS, @PICKUP_TIME, @PICKUP_QUANTITY, @PICKUP_BULK_ITEMS, @PICKUP_DOOR_DELIVERY, @PICKUP_CREATED_BY,getdate(),@PICKUP_TIME_1)`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }

    return res;
  } catch (error) {
    console.log("AddPickup-->", error);
  }
}

async function ManagerAddPickup(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let PickupCode = "";
    let FYear = "";

    var result2 = await pool
      .request()
      .query(
        `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) + '/'+ cast(( YEAR( GETDATE() ) % 100 + 1 ) as nvarchar(100)) as fyear`
      );

    FYear = result2.recordsets[0][0].fyear;

    var result1 = await pool
      .request()
      .query(
        `select PICKUP_CODE from PICKUPS where PICKUP_PKID = (select max(PICKUP_PKID) from PICKUPS)`
      );
    if (result1.rowsAffected[0] > 0) {
      var pickupno =
        parseInt(result1.recordsets[0][0].PICKUP_CODE.split("-")[1]) + 1;
      if (pickupno.toString().length === 4) {
        PickupCode = "PICKUP-" + pickupno + "-" + FYear + "";
      } else if (pickupno.toString().length === 3) {
        PickupCode = "PICKUP-0" + pickupno + "-" + FYear + "";
      } else if (pickupno.toString().length === 2) {
        PickupCode = "PICKUP-00" + pickupno + "-" + FYear + "";
      } else if (pickupno.toString().length === 1) {
        PickupCode = "PICKUP-000" + pickupno + "-" + FYear + "";
      }
    } else {
      PickupCode = "PICKUP-0001-" + FYear + "";
    }

    var result = await pool
      .request()
      .input("PICKUP_CODE", PickupCode)
      .input("PICKUP_CUSTOMER_FKID", obj.PICKUP_CUSTOMER_FKID)
      .input("PICKUP_CUSTOMER_NAME", obj.PICKUP_CUSTOMER_NAME)
      .input("PICKUP_CUSTOMER_PHONE", obj.PICKUP_CUSTOMER_PHONE)
      .input("PICKUP_ADDRESS", obj.PICKUP_ADDRESS)
      .input("PICKUP_TIME", obj.PICKUP_TIME)
      .input("PICKUP_TIME_1", obj.PICKUP_TIME_1)
      .input("PICKUP_QUANTITY", obj.PICKUP_QUANTITY)
      .input("PICKUP_BULK_ITEMS", obj.PICKUP_BULK_ITEMS)
      .input("PICKUP_DOOR_DELIVERY", obj.PICKUP_DOOR_DELIVERY)
      .input("PICKUP_CREATED_BY", "Manager")
      .input("PICKUP_CREATED_BY_FKID", obj.ManagerID)
      .query(
        `insert into PICKUPS(PICKUP_CODE, PICKUP_CUSTOMER_FKID, PICKUP_CUSTOMER_NAME, PICKUP_CUSTOMER_PHONE, PICKUP_ADDRESS, PICKUP_TIME, PICKUP_QUANTITY, PICKUP_BULK_ITEMS, PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY,PICKUP_DATE,PICKUP_TIME_1,PICKUP_CREATED_BY_FKID) values(@PICKUP_CODE, @PICKUP_CUSTOMER_FKID, @PICKUP_CUSTOMER_NAME, @PICKUP_CUSTOMER_PHONE, @PICKUP_ADDRESS, @PICKUP_TIME, @PICKUP_QUANTITY, @PICKUP_BULK_ITEMS, @PICKUP_DOOR_DELIVERY, @PICKUP_CREATED_BY,getdate(),@PICKUP_TIME_1,@PICKUP_CREATED_BY_FKID)`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }

    return res;
  } catch (error) {
    console.log("ManagerAddPickup-->", error);
  }
}

async function UpdatePickup(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("PICKUP_CUSTOMER_FKID", obj.PICKUP_CUSTOMER_FKID)
      .input("PICKUP_CUSTOMER_NAME", obj.PICKUP_CUSTOMER_NAME)
      .input("PICKUP_CUSTOMER_PHONE", obj.PICKUP_CUSTOMER_PHONE)
      .input("PICKUP_ADDRESS", obj.PICKUP_ADDRESS)
      .input("PICKUP_TIME", obj.PICKUP_TIME)
      .input("PICKUP_TIME_1", obj.PICKUP_TIME_1)
      .input("PICKUP_QUANTITY", obj.PICKUP_QUANTITY)
      .input("PICKUP_BULK_ITEMS", obj.PICKUP_BULK_ITEMS)
      .input("PICKUP_DOOR_DELIVERY", obj.PICKUP_DOOR_DELIVERY)
      .input("PICKUP_PKID", id)
      .query(
        `update PICKUPS set PICKUP_CUSTOMER_FKID = @PICKUP_CUSTOMER_FKID,PICKUP_CUSTOMER_NAME=@PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE=@PICKUP_CUSTOMER_PHONE,@PICKUP_ADDRESS = @PICKUP_ADDRESS, PICKUP_TIME = @PICKUP_TIME, PICKUP_TIME_1 = @PICKUP_TIME_1, PICKUP_QUANTITY = @PICKUP_QUANTITY, PICKUP_BULK_ITEMS = @PICKUP_BULK_ITEMS, PICKUP_DOOR_DELIVERY = @PICKUP_DOOR_DELIVERY where PICKUP_PKID = @PICKUP_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdatePickup-->", error);
  }
}

async function DeletePickup(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("PICKUP_PKID", id)
      .query(`delete from PICKUPS where PICKUP_PKID = @PICKUP_PKID`);

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeletePickup-->", error);
  }
}

async function GetAllPickups() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME, PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE from PICKUPS where year([PICKUP_DATE]) = year(getdate())"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
            result.recordsets[0][i].PICKUP_DRIVER_FKID +
            "'"
        );

      var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
      var PickupID = result.recordsets[0][i].PICKUP_PKID;
      var CustomerArr = [];

      if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0") {
        let result = await pool
          .request()
          .query(
            "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
              PickupID +
              "'"
          );
        CustomerArr.push(result.recordsets[0][0]);
      } else {
        let result = await pool
          .request()
          .input("Outlet", CustomerID)
          .input("Month", "")
          .input("Year", "")
          .input("FromDate", "")
          .input("ToDate", "")
          .input("Type", "GetCustomerByID")
          .execute("ViewAllCustomers");

        CustomerArr.push(result.recordsets[0][0]);
      }

      var obj = {
        PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
        PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
        PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
        PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
        PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
        PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
        PICKUP_CUSTOMER_PHONE: result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
        PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
        PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
        PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
        PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
        PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
        PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
        PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
        PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
        DRIVER_DETAILS: result1.recordsets[0],
        CUSTOMER_DETAILS: CustomerArr,
      };

      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllPickups-->", error);
    //
  }
}

async function GetAllPickupsByID(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME, PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE, DRIVER_NAME, DRIVER_PHONE, CUSTOMER_NAME, CUSTOMER_CONTACT_NUMBER from PICKUPS join DRIVERS on DRIVER_PKID = PICKUP_DRIVER_FKID left join CUSTOMERS on CUSTOMER_PKID = PICKUP_CUSTOMER_FKID where PICKUP_CODE = '" +
          obj.PickupCode +
          "' and year([PICKUP_DATE]) = year(getdate())"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllPickupsByID-->", error);
    //
  }
}

async function GetAllPickupsFilter(Type, Fdate, Tdate) {
  try {

    console.log(Type);
    console.log(Fdate);
    console.log(Tdate);
    let pool = await sql.connect(config);

    if (Fdate === "-") {
      var arr = [];
      let result = await pool
        .request()
        .query(
          "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME, PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY, PICKUP_DATE from PICKUPS where PICKUP_CREATED_BY = '" +
            Type +
            "'"
        );
      for (var i = 0; i < result.recordsets[0].length; i++) {
        let result1 = await pool
          .request()
          .query(
            "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
              result.recordsets[0][i].PICKUP_DRIVER_FKID +
              "'"
          );

        var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
        var PickupID = result.recordsets[0][i].PICKUP_PKID;
        var CustomerArr = [];

        if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0"|| CustomerID === null) {
          let result = await pool
            .request()
            .query(
              "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
                PickupID +
                "'"
            );
          CustomerArr.push(result.recordsets[0][0]);
        } else {
          let result = await pool
            .request()
            .input("Outlet", CustomerID)
            .input("Month", "")
            .input("Year", "")
            .input("FromDate", "")
            .input("ToDate", "")
            .input("Type", "GetCustomerByID")
            .execute("ViewAllCustomers");

          CustomerArr.push(result.recordsets[0][0]);
        }

        var obj = {
          PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
          PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
          PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
          PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
          PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
          PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
          PICKUP_CUSTOMER_PHONE: result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
          PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
          PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
          PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
          PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
          PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
          PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
          PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
          PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
          DRIVER_DETAILS: result1.recordsets[0],
          CUSTOMER_DETAILS: CustomerArr,
        };

        arr.push(obj);
      }
      console.log(arr);
      return arr;
    } else {
      if (Type === "-") {
        var arr = [];
        let result = await pool
          .request()
          .query(
            "select PICKUP_STATUS,PICKUP_PKID,PICKUP_CODE,isnull(PICKUP_CUSTOMER_FKID,'-') as PICKUP_CUSTOMER_FKID, isnull(PICKUP_DRIVER_FKID,'-') as PICKUP_DRIVER_FKID ,PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE,PICKUP_ADDRESS,PICKUP_TIME, PICKUP_TIME_1,PICKUP_QUANTITY,PICKUP_BULK_ITEMS,PICKUP_DOOR_DELIVERY, PICKUP_CREATED_BY,isnull(PICKUP_CREATED_BY_FKID, 0) as PICKUP_CREATED_BY_FKID, PICKUP_DATE from PICKUPS where PICKUP_DATE between '" +
              Fdate +
              "' and '" +
              Tdate +
              "'"
          );
        for (var i = 0; i < result.recordsets[0].length; i++) {
          let result1 = await pool
            .request()
            .query(
              "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
                result.recordsets[0][i].PICKUP_DRIVER_FKID +
                "'"
            );

          var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
          var PickupID = result.recordsets[0][i].PICKUP_PKID;
          var CustomerArr = [];

          if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0" || CustomerID === null) {
            let result = await pool
              .request()
              .query(
                "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
                  PickupID +
                  "'"
              );
            CustomerArr.push(result.recordsets[0]);
          } else {
            let result = await pool
              .request()
              .input("Outlet", CustomerID)
              .input("Month", "")
              .input("Year", "")
              .input("FromDate", "")
              .input("ToDate", "")
              .input("Type", "GetCustomerByID")
              .execute("ViewAllCustomers");

            CustomerArr.push(result.recordsets[0]);
          }

          var obj = {
            PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
            PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
            PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
            PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
            PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
            PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
            PICKUP_CUSTOMER_PHONE:
              result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
            PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
            PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
            PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
            PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
            PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
            PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
            PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
            PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
            DRIVER_DETAILS: result1.recordsets[0],
            CUSTOMER_DETAILS: CustomerArr,
          };

          arr.push(obj);
        }
      } else {
        var arr = [];
        let result = await pool
          .request()
          .query(
            "select * from PICKUPS where PICKUP_CREATED_BY = '" +
              Type +
              "' and PICKUP_DATE between '" +
              Fdate +
              "' and '" +
              Tdate +
              "'"
          );
        for (var i = 0; i < result.recordsets[0].length; i++) {
          let result1 = await pool
            .request()
            .query(
              "select DRIVER_NAME, DRIVER_USERNAME, DRIVER_PHONE, DRIVER_EMAIL from DRIVERS where DRIVER_PKID = '" +
                result.recordsets[0][i].PICKUP_DRIVER_FKID +
                "'"
            );

          var CustomerID = result.recordsets[0][i].PICKUP_CUSTOMER_FKID;
          var PickupID = result.recordsets[0][i].PICKUP_PKID;
          var CustomerArr = [];

          if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0"|| CustomerID === null) {
            let result = await pool
              .request()
              .query(
                "select PICKUP_CUSTOMER_NAME as CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE as CUSTOMER_CONTACT_NUMBER  from PICKUPS where PICKUP_PKID = '" +
                  PickupID +
                  "'"
              );
            CustomerArr.push(result.recordsets[0]);
          } else {
            let result = await pool
              .request()
              .input("Outlet", CustomerID)
              .input("Month", "")
              .input("Year", "")
              .input("FromDate", "")
              .input("ToDate", "")
              .input("Type", "GetCustomerByID")
              .execute("ViewAllCustomers");

            CustomerArr.push(result.recordsets[0]);
          }

          var obj = {
            PICKUP_STATUS: result.recordsets[0][i].PICKUP_STATUS,
            PICKUP_PKID: result.recordsets[0][i].PICKUP_PKID,
            PICKUP_CODE: result.recordsets[0][i].PICKUP_CODE,
            PICKUP_CUSTOMER_FKID: result.recordsets[0][i].PICKUP_CUSTOMER_FKID,
            PICKUP_DRIVER_FKID: result.recordsets[0][i].PICKUP_DRIVER_FKID,
            PICKUP_CUSTOMER_NAME: result.recordsets[0][i].PICKUP_CUSTOMER_NAME,
            PICKUP_CUSTOMER_PHONE:
              result.recordsets[0][i].PICKUP_CUSTOMER_PHONE,
            PICKUP_ADDRESS: result.recordsets[0][i].PICKUP_ADDRESS,
            PICKUP_TIME: result.recordsets[0][i].PICKUP_TIME,
            PICKUP_TIME_1: result.recordsets[0][i].PICKUP_TIME_1,
            PICKUP_QUANTITY: result.recordsets[0][i].PICKUP_QUANTITY,
            PICKUP_BULK_ITEMS: result.recordsets[0][i].PICKUP_BULK_ITEMS,
            PICKUP_DOOR_DELIVERY: result.recordsets[0][i].PICKUP_DOOR_DELIVERY,
            PICKUP_CREATED_BY: result.recordsets[0][i].PICKUP_CREATED_BY,
            PICKUP_DATE: result.recordsets[0][i].PICKUP_DATE,
            DRIVER_DETAILS: result1.recordsets[0],
            CUSTOMER_DETAILS: CustomerArr,
          };

          arr.push(obj);
        }
      }
      console.log(arr);
      return arr;
    }
  } catch (error) {
    console.log("GetAllPickupsFilter-->", error);
    //
  }
}

async function GetPickupCustomerDetails(PickupID, CustomerID) {
  try {
    let pool = await sql.connect(config);

    if (CustomerID === "-" || CustomerID === 0 || CustomerID === "0") {
      let result = await pool
        .request()
        .query(
          "select PICKUP_CUSTOMER_NAME,PICKUP_CUSTOMER_PHONE  from PICKUPS where PICKUP_PKID = '" +
            PickupID +
            "'"
        );
      return result.recordsets[0];
    } else {
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
    }
  } catch (error) {
    console.log("GetPickupCustomerDetails-->", error);
    //
  }
}

async function AssignDriver(PickupID, DriverID) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("PICKUP_PKID", PickupID)
      .input("PICKUP_DRIVER_FKID", DriverID)
      .query(
        `update PICKUPS set PICKUP_DRIVER_FKID = @PICKUP_DRIVER_FKID, PICKUP_STATUS = 1 where PICKUP_PKID = @PICKUP_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("AssignDriver-->", error);
  }
}

module.exports = {
  GetAllAdminPickups: GetAllAdminPickups,
  GetAllManagerAddedPickups: GetAllManagerAddedPickups,
  GetAllAdminPickupsFilter: GetAllAdminPickupsFilter,
  GetAllManagerPickupsFilter: GetAllManagerPickupsFilter,
  AddPickup: AddPickup,
  ManagerAddPickup: ManagerAddPickup,
  UpdatePickup: UpdatePickup,
  DeletePickup: DeletePickup,
  GetAllPickups: GetAllPickups,
  GetAllPickupsByID: GetAllPickupsByID,
  GetAllPickupsFilter: GetAllPickupsFilter,
  GetPickupCustomerDetails: GetPickupCustomerDetails,
  AssignDriver: AssignDriver,
};
