/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetAllCoupons() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool.request().query("select *,(case when COUPONS_VALIDITY_DATE >= cast(getdate() as date) then 1 else 0 end) as expired from COUPONS");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME from STORE_COUPONS join STORES on STORE_PKID = STORE_COUPONS_STORE_FKID where STORE_COUPONS_COUNPON_FKID = '" +
            result.recordsets[0][i].COUPONS_PKID +
            "'"
        );

      let result2 = await pool
        .request()
        .query(
          "select distinct ITEMS_PKID,ITEMS_NAME,ITEM_CATEGORY_NAME,SUB_CATEGORY_NAME from ITEM_COUPONS join ITEMS on ITEMS_PKID = ITEM_COUPONS_ITEM_FKID join ITEM_CATEGORY on ITEM_CATEGORY_PKID = ITEMS_CATEGORY_FKID join SUB_CATEGORY on SUB_CATEGORY_PKID = ITEMS_SUB_CATEGORY_FKID where ITEM_COUPONS_COUNPON_FKID = '" +
            result.recordsets[0][i].COUPONS_PKID +
            "'"
        );

      var obj = {
        COUPONS_PKID: result.recordsets[0][i].COUPONS_PKID,
        expired: result.recordsets[0][i].expired,
        COUPONS_NAME: result.recordsets[0][i].COUPONS_NAME,
        COUPONS_CODE: result.recordsets[0][i].COUPONS_CODE,
        COUPONS_PRICE_OR_PERCENTAGE:
          result.recordsets[0][i].COUPONS_PRICE_OR_PERCENTAGE,
        COUPONS_DISCOUNT: result.recordsets[0][i].COUPONS_DISCOUNT,
        COUPONS_VALIDITY: result.recordsets[0][i].COUPONS_VALIDITY,
        COUPONS_VALIDITY_DATE: result.recordsets[0][i].COUPONS_VALIDITY_DATE,
        COUPONS_ACTIVE: result.recordsets[0][i].COUPONS_ACTIVE,
        COUPONS_TYPE_NAME: result.recordsets[0][i].COUPONS_TYPE_NAME,
        COUPONS_ITEM_BASED: result.recordsets[0][i].COUPONS_ITEM_BASED,
        Outlets: result1.recordsets[0],
        Items: result2.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCoupons-->", error);
    //
  }
}

async function GetAllCouponsForManager(ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select *,(case when COUPONS_VALIDITY_DATE >= cast(getdate() as date) then 1 else 0 end) as expired from COUPONS where COUPONS_ADDED_BY = 'manager' and COUPONS_ADDED_BY_FKID = '" +
          ManagerID +
          "'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME from STORE_COUPONS join STORES on STORE_PKID = STORE_COUPONS_STORE_FKID where STORE_COUPONS_COUNPON_FKID = '" +
            result.recordsets[0][i].COUPONS_PKID +
            "'"
        );

      let result2 = await pool
        .request()
        .query(
          "select distinct ITEMS_PKID,ITEMS_NAME,ITEM_CATEGORY_NAME,SUB_CATEGORY_NAME from ITEM_COUPONS join ITEMS on ITEMS_PKID = ITEM_COUPONS_ITEM_FKID join ITEM_CATEGORY on ITEM_CATEGORY_PKID = ITEMS_CATEGORY_FKID join SUB_CATEGORY on SUB_CATEGORY_PKID = ITEMS_SUB_CATEGORY_FKID where ITEM_COUPONS_COUNPON_FKID = '" +
            result.recordsets[0][i].COUPONS_PKID +
            "'"
        );

      var obj = {
        COUPONS_PKID: result.recordsets[0][i].COUPONS_PKID,
        expired: result.recordsets[0][i].expired,
        COUPONS_NAME: result.recordsets[0][i].COUPONS_NAME,
        COUPONS_CODE: result.recordsets[0][i].COUPONS_CODE,
        COUPONS_PRICE_OR_PERCENTAGE:
          result.recordsets[0][i].COUPONS_PRICE_OR_PERCENTAGE,
        COUPONS_DISCOUNT: result.recordsets[0][i].COUPONS_DISCOUNT,
        COUPONS_VALIDITY: result.recordsets[0][i].COUPONS_VALIDITY,
        COUPONS_VALIDITY_DATE: result.recordsets[0][i].COUPONS_VALIDITY_DATE,
        COUPONS_ACTIVE: result.recordsets[0][i].COUPONS_ACTIVE,
        COUPONS_TYPE_NAME: result.recordsets[0][i].COUPONS_TYPE_NAME,
        COUPONS_ITEM_BASED: result.recordsets[0][i].COUPONS_ITEM_BASED,
        Outlets: result1.recordsets[0],
        Items: result2.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllCouponsForManager-->", error);
    //
  }
}

async function AddCoupon(obj) {
  try {
    console.log(obj);
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("COUPONS_TYPE_NAME", obj.COUPONS_TYPE_NAME)
      .input("COUPONS_NAME", obj.COUPONS_NAME)
      .query(
        "SELECT * FROM [COUPONS] where COUPONS_TYPE_NAME = @COUPONS_TYPE_NAME and COUPONS_NAME = @COUPONS_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      let coupon_validity = "";
      if (obj.COUPONS_VALIDITY.split(" ")[1] === "Year") {
        let CouponValididty = await pool
          .request()
          .query(
            `SELECT cast(DATEADD(year, ${
              obj.COUPONS_VALIDITY.split(" ")[0]
            }, getdate()) as date) AS Validity`
          );
        coupon_validity = CouponValididty.recordsets[0][0].Validity;
      } else if (obj.COUPONS_VALIDITY.split(" ")[1] === "Month") {
        let CouponValididty = await pool
          .request()
          .query(
            `SELECT cast(DATEADD(month, ${
              obj.COUPONS_VALIDITY.split(" ")[0]
            }, getdate()) as date) AS Validity`
          );
        coupon_validity = CouponValididty.recordsets[0][0].Validity;
      }
      var result = await pool
        .request()
        .input("COUPONS_TYPE_NAME", obj.COUPONS_TYPE_NAME)
        .input("COUPONS_NAME", obj.COUPONS_NAME)
        .input("COUPONS_CODE", obj.COUPONS_CODE)
        .input("COUPONS_PRICE_OR_PERCENTAGE", obj.COUPONS_PRICE_OR_PERCENTAGE)
        .input("COUPONS_DISCOUNT", obj.COUPONS_DISCOUNT)
        .input("COUPONS_VALIDITY", obj.COUPONS_VALIDITY)
        .input("COUPONS_VALIDITY_DATE", coupon_validity)
        .input("COUPONS_ITEM_BASED", obj.isItemBased)
        .input("COUPONS_ADDED_BY", obj.COUPONS_ADDED_BY)
        .input("COUPONS_ADDED_BY_FKID", obj.COUPONS_ADDED_BY_FKID)
        .query(
          `insert into COUPONS(COUPONS_TYPE_NAME, COUPONS_NAME, COUPONS_CODE, COUPONS_PRICE_OR_PERCENTAGE, COUPONS_DISCOUNT, COUPONS_VALIDITY, COUPONS_VALIDITY_DATE, COUPONS_ACTIVE, COUPONS_ITEM_BASED,COUPONS_ADDED_BY,COUPONS_ADDED_BY_FKID) values(@COUPONS_TYPE_NAME, @COUPONS_NAME, @COUPONS_CODE, @COUPONS_PRICE_OR_PERCENTAGE, @COUPONS_DISCOUNT, @COUPONS_VALIDITY, @COUPONS_VALIDITY_DATE, 1, @COUPONS_ITEM_BASED,@COUPONS_ADDED_BY,@COUPONS_ADDED_BY_FKID)`
        );

      if (result.rowsAffected > 0) {
        var result1 = await pool
          .request()
          .query(`select max(COUPONS_PKID) as COUPONS_PKID from COUPONS`);

        if (result1.recordsets[0].length > 0) {
          for (var i = 0; i < obj.OutletData.length; i++) {
            var result2 = await pool
              .request()
              .input(
                "STORE_COUPONS_COUNPON_FKID",
                result1.recordsets[0][0].COUPONS_PKID
              )
              .input("STORE_COUPONS_STORE_FKID", obj.OutletData[i].STORE_PKID)
              .query(
                `insert into STORE_COUPONS(STORE_COUPONS_STORE_FKID,STORE_COUPONS_COUNPON_FKID) values(@STORE_COUPONS_STORE_FKID, @STORE_COUPONS_COUNPON_FKID)`
              );
          }
          if (obj.isItemBased == true || obj.isItemBased == "true") {
            for (var j = 0; j < obj.ItemsData.length; j++) {
              var result2 = await pool
                .request()
                .input(
                  "ITEM_COUPONS_COUNPON_FKID",
                  result1.recordsets[0][0].COUPONS_PKID
                )
                .input("ITEM_COUPONS_ITEM_FKID", obj.ItemsData[j].ITEMS_PKID)
                .query(
                  `insert into ITEM_COUPONS(ITEM_COUPONS_ITEM_FKID,ITEM_COUPONS_COUNPON_FKID) values(@ITEM_COUPONS_ITEM_FKID, @ITEM_COUPONS_COUNPON_FKID)`
                );
            }
          }
          res = true;
        }
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddCoupon-->", error);
  }
}

async function UpdateCoupon(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let coupon_validity = "";
      if (obj.COUPONS_VALIDITY.split(" ")[1] === "Year") {
        let CouponValididty = await pool
          .request()
          .query(
            `SELECT cast(DATEADD(year, ${
              obj.COUPONS_VALIDITY.split(" ")[0]
            }, getdate()) as date) AS Validity`
          );
        coupon_validity = CouponValididty.recordsets[0][0].Validity;
      } else if (obj.COUPONS_VALIDITY.split(" ")[1] === "Month") {
        let CouponValididty = await pool
          .request()
          .query(
            `SELECT cast(DATEADD(month, ${
              obj.COUPONS_VALIDITY.split(" ")[0]
            }, getdate()) as date) AS Validity`
          );
        coupon_validity = CouponValididty.recordsets[0][0].Validity;
      }

    var result = await pool
      .request()
      .input("COUPONS_TYPE_NAME", obj.COUPONS_TYPE_NAME)
      .input("COUPONS_NAME", obj.COUPONS_NAME)
      .input("COUPONS_CODE", obj.COUPONS_CODE)
      .input("COUPONS_PRICE_OR_PERCENTAGE", obj.COUPONS_PRICE_OR_PERCENTAGE)
      .input("COUPONS_DISCOUNT", obj.COUPONS_DISCOUNT)
      .input("COUPONS_VALIDITY", obj.COUPONS_VALIDITY)
      .input("COUPONS_VALIDITY_DATE", coupon_validity)
      .input("COUPONS_ITEM_BASED", obj.isItemBased)
      .input("COUPONS_PKID", id)
      .query(
        `update COUPONS set COUPONS_TYPE_NAME = @COUPONS_TYPE_NAME, COUPONS_NAME = @COUPONS_NAME, COUPONS_CODE = @COUPONS_CODE, COUPONS_PRICE_OR_PERCENTAGE = @COUPONS_PRICE_OR_PERCENTAGE, COUPONS_DISCOUNT = @COUPONS_DISCOUNT, COUPONS_VALIDITY = @COUPONS_VALIDITY, COUPONS_VALIDITY_DATE = @COUPONS_VALIDITY_DATE, COUPONS_ITEM_BASED = @COUPONS_ITEM_BASED where COUPONS_PKID = @COUPONS_PKID`
      );

    if (result.rowsAffected > 0) {
      let result = await pool
        .request()
        .input("STORE_COUPONS_COUNPON_FKID", id)
        .query(
          "delete from STORE_COUPONS where STORE_COUPONS_COUNPON_FKID = @STORE_COUPONS_COUNPON_FKID"
        );
      let result1 = await pool
        .request()
        .input("ITEM_COUPONS_COUNPON_FKID", id)
        .query(
          "delete from ITEM_COUPONS where ITEM_COUPONS_COUNPON_FKID = @ITEM_COUPONS_COUNPON_FKID"
        );
      for (var i = 0; i < obj.OutletData.length; i++) {
        var result2 = await pool
          .request()
          .input("STORE_COUPONS_COUNPON_FKID", id)
          .input("STORE_COUPONS_STORE_FKID", obj.OutletData[i].STORE_PKID)
          .query(
            `insert into STORE_COUPONS(STORE_COUPONS_STORE_FKID,STORE_COUPONS_COUNPON_FKID) values(@STORE_COUPONS_STORE_FKID, @STORE_COUPONS_COUNPON_FKID)`
          );
      }
      if (obj.isItemBased == true || obj.isItemBased == "true") {
        for (var j = 0; j < obj.ItemsData.length; j++) {
          var result2 = await pool
            .request()
            .input("ITEM_COUPONS_COUNPON_FKID", id)
            .input("ITEM_COUPONS_ITEM_FKID", obj.ItemsData[j].ITEMS_PKID)
            .query(
              `insert into ITEM_COUPONS(ITEM_COUPONS_ITEM_FKID,ITEM_COUPONS_COUNPON_FKID) values(@ITEM_COUPONS_ITEM_FKID, @ITEM_COUPONS_COUNPON_FKID)`
            );
        }
      }
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateCoupon-->", error);
  }
}

async function DeleteCoupons(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("COUPONS_PKID", id)
      .query("delete from COUPONS where COUPONS_PKID = @COUPONS_PKID");
    if (result1.rowsAffected > 0) {
      let result = await pool
        .request()
        .input("STORE_COUPONS_COUNPON_FKID", id)
        .query(
          "delete from STORE_COUPONS where STORE_COUPONS_COUNPON_FKID = @STORE_COUPONS_COUNPON_FKID"
        );
      let result1 = await pool
        .request()
        .input("ITEM_COUPONS_COUNPON_FKID", id)
        .query(
          "delete from ITEM_COUPONS where ITEM_COUPONS_COUNPON_FKID = @ITEM_COUPONS_COUNPON_FKID"
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
    console.log("DeleteCoupons-->", error);
  }
}

async function GetAllOutletCoupons(OutletID, CustomerID, ServiceTypeID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request()
      .query(`select distinct [COUPONS_PKID], [COUPONS_NAME], [COUPONS_CODE], [COUPONS_PRICE_OR_PERCENTAGE], [COUPONS_DISCOUNT], [COUPONS_ITEM_BASED], (case when [COUPONS_ITEM_BASED] = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) as COUPON_TYPE, (case when [COUPONS_ITEM_BASED] = 0 then 'Order Based Coupon' else  'Item Based Coupon' end) as COUPON_TYPE_DISPLAY
      from COUPONS 
      join [dbo].[STORE_COUPONS] on [STORE_COUPONS_COUNPON_FKID] = [COUPONS_PKID] and [STORE_COUPONS_STORE_FKID] = '${OutletID}' and COUPONS_VALIDITY_DATE >= cast(getdate() as date)
      union all
      select distinct CUSTOMER_COUPON_PKID as [COUPONS_PKID], CUSTOMER_COUPON_NAME as [COUPONS_NAME], CUSTOMER_COUPON_CODE as [COUPONS_CODE], CUSTOMER_COUPON_PERCENT_OR_PRICE as [COUPONS_PRICE_OR_PERCENTAGE], CUSTOMER_COUPON_DISCOUNT as [COUPONS_DISCOUNT], '0' as [COUPONS_ITEM_BASED], 'CustomerBasedCoupon' as COUPON_TYPE, 'Customer Based Coupon' as COUPON_TYPE_DISPLAY
      from [dbo].[CUSTOMER_COUPON] 
      join CUSTOMER_COUPON_CUST_LIST on CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID = CUSTOMER_COUPON_PKID
      where CUSTOMER_COUPON_CUST_LIST_FKID = '${CustomerID}' and CUSTOMER_COUPON_NAME != 'New Customer' and CUSTOMER_COUPON_ACTIVE = 1
	    union all
      select distinct CUSTOMER_COUPON_PKID as [COUPONS_PKID], CUSTOMER_COUPON_NAME as [COUPONS_NAME], CUSTOMER_COUPON_CODE as [COUPONS_CODE], CUSTOMER_COUPON_PERCENT_OR_PRICE as [COUPONS_PRICE_OR_PERCENTAGE], CUSTOMER_COUPON_DISCOUNT as [COUPONS_DISCOUNT], '0' as [COUPONS_ITEM_BASED], 'CustomerBasedCoupon' as COUPON_TYPE, 'Customer Based Coupon' as COUPON_TYPE_DISPLAY
      from [dbo].[CUSTOMER_COUPON] 
      join CUSTOMER_COUPON_CUST_LIST on CUSTOMER_COUPON_CUST_LIST_PRIMARY_FKID = CUSTOMER_COUPON_PKID
      where CUSTOMER_COUPON_CUST_LIST_FKID = '${CustomerID}' and CUSTOMER_COUPON_NAME = 'New Customer' and CUSTOMER_COUPON_ACTIVE = 1 and (select SERVICE_TYPE_NEW_CUST_COUPON from SERVICE_TYPE where SERVICE_TYPE_PKID = '${ServiceTypeID}') = 1`);

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOutletCoupons-->", error);
    //
  }
}

async function GetCouponItemListByCouponID(CouponPkid) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        `select * from [dbo].[ITEM_COUPONS] where [ITEM_COUPONS_COUNPON_FKID] = '${CouponPkid}'`
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetCouponItemListByCouponID-->", error);
    //
  }
}

module.exports = {
  GetAllCoupons: GetAllCoupons,
  GetAllCouponsForManager: GetAllCouponsForManager,
  AddCoupon: AddCoupon,
  UpdateCoupon: UpdateCoupon,
  DeleteCoupons: DeleteCoupons,
  GetAllOutletCoupons: GetAllOutletCoupons,
  GetCouponItemListByCouponID: GetCouponItemListByCouponID,
};
