/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddServiceCategory(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("SERVICE_CATEGORY_NAME", obj.SERVICE_CATEGORY_NAME)
      .query(
        "SELECT * FROM [SERVICE_CATEGORY] where SERVICE_CATEGORY_NAME = @SERVICE_CATEGORY_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("SERVICE_CATEGORY_NAME", obj.SERVICE_CATEGORY_NAME)
        .input("SERVICE_CATEGORY_CODE", obj.SERVICE_CATEGORY_CODE)
        .input("SERVICE_CATEGORY_HSN", obj.SERVICE_CATEGORY_HSN)
        .input("SERVICE_CATEGORY_CGST", obj.SERVICE_CATEGORY_CGST)
        .input("SERVICE_CATEGORY_SGST", obj.SERVICE_CATEGORY_SGST)
        .input("SERVICE_CATEGORY_ORDER_COUNT", obj.SERVICE_CATEGORY_ORDER_COUNT)
        .input(
          "SERVICE_CATEGORY_PAYMENT_WITH_ZERO",
          "0"
        )
        .query(
          `INSERT INTO SERVICE_CATEGORY(SERVICE_CATEGORY_NAME,SERVICE_CATEGORY_CODE,SERVICE_CATEGORY_HSN,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,SERVICE_CATEGORY_ORDER_COUNT,SERVICE_CATEGORY_PAYMENT_WITH_ZERO) VALUES (@SERVICE_CATEGORY_NAME,@SERVICE_CATEGORY_CODE,@SERVICE_CATEGORY_HSN,@SERVICE_CATEGORY_CGST,@SERVICE_CATEGORY_SGST,@SERVICE_CATEGORY_ORDER_COUNT,@SERVICE_CATEGORY_PAYMENT_WITH_ZERO)`
        );
      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddServiceCategory-->", error);
  }
}

async function getAllServiceCategory() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from SERVICE_CATEGORY");

    return result.recordsets[0];
  } catch (error) {
    console.log("getAllServiceCategory-->", error);
    //
  }
}

async function getAllServiceCategoryByID(CategoryID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select * from SERVICE_CATEGORY where SERVICE_CATEGORY_PKID = '" +
          CategoryID +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("getAllServiceCategoryByID-->", error);
    //
  }
}

async function UpdateServiceCategory(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("SERVICE_CATEGORY_NAME", obj.SERVICE_CATEGORY_NAME)
      .input("SERVICE_CATEGORY_CODE", obj.SERVICE_CATEGORY_CODE)
      .input("SERVICE_CATEGORY_HSN", obj.SERVICE_CATEGORY_HSN)
      .input("SERVICE_CATEGORY_CGST", obj.SERVICE_CATEGORY_CGST)
      .input("SERVICE_CATEGORY_SGST", obj.SERVICE_CATEGORY_SGST)
      .input("SERVICE_CATEGORY_ORDER_COUNT", obj.SERVICE_CATEGORY_ORDER_COUNT)
      .input(
        "SERVICE_CATEGORY_PAYMENT_WITH_ZERO",
        "0"
      )
      .input("SERVICE_CATEGORY_PKID", id)
      .query(
        `update SERVICE_CATEGORY set SERVICE_CATEGORY_PAYMENT_WITH_ZERO = @SERVICE_CATEGORY_PAYMENT_WITH_ZERO, SERVICE_CATEGORY_ORDER_COUNT = @SERVICE_CATEGORY_ORDER_COUNT, SERVICE_CATEGORY_NAME = @SERVICE_CATEGORY_NAME,SERVICE_CATEGORY_CODE = @SERVICE_CATEGORY_CODE,SERVICE_CATEGORY_HSN = @SERVICE_CATEGORY_HSN,SERVICE_CATEGORY_CGST = @SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST = @SERVICE_CATEGORY_SGST where SERVICE_CATEGORY_PKID = @SERVICE_CATEGORY_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateServiceCategory-->", error);
  }
}

async function DeleteServiceCategory(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("SERVICE_CATEGORY_PKID", id)
      .query(
        `delete from SERVICE_CATEGORY where SERVICE_CATEGORY_PKID = @SERVICE_CATEGORY_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteServiceCategory-->", error);
  }
}

async function getAllServiceCategoryForDropDown() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from SERVICE_CATEGORY");

    if (result.recordsets[0].length > 0) {
      for (var i = 0; i < result.recordsets[0].length; i++) {
        var obj = {
          label: result.recordsets[0][i].SERVICE_CATEGORY_NAME,
          value: result.recordsets[0][i].SERVICE_CATEGORY_PKID.toString(),
        };
        arr.push(obj);
      }
    }

    return arr;
  } catch (error) {
    console.log("getAllServiceCategoryForDropDown-->", error);
    //
  }
}

async function AddServiceType(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("SERVICE_TYPE_NAME", obj.SERVICE_TYPE_NAME)
      .query(
        "SELECT * FROM [SERVICE_TYPE] where SERVICE_TYPE_NAME = @SERVICE_TYPE_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("SERVICE_TYPE_NAME", obj.SERVICE_TYPE_NAME)
        .input("SERVICE_TYPE_CODE", obj.SERVICE_TYPE_CODE)
        .input("SERVICE_TYPE_SURCHARGE", obj.SERVICE_TYPE_SURCHARGE)
        .input("SERVICE_TYPE_NEW_CUST_COUPON", obj.SERVICE_TYPE_NEW_CUST_COUPON)
        .query(
          `INSERT INTO SERVICE_TYPE(SERVICE_TYPE_NAME,SERVICE_TYPE_CODE,SERVICE_TYPE_SURCHARGE,SERVICE_TYPE_NEW_CUST_COUPON) VALUES (@SERVICE_TYPE_NAME,@SERVICE_TYPE_CODE,@SERVICE_TYPE_SURCHARGE,@SERVICE_TYPE_NEW_CUST_COUPON)`
        );
      if (result.rowsAffected > 0) {
        var result1 = await pool
          .request()
          .query(
            `select max(SERVICE_TYPE_PKID) as SERVICE_TYPE_PKID from SERVICE_TYPE`
          );

        if (result1.recordsets[0].length > 0) {
          var spltCat = obj.ServiceTypeCategory.split(",");
          for (var i = 0; i < spltCat.length; i++) {
            var result2 = await pool
              .request()
              .input(
                "TYPE_CATEGORIES_TYPE_FKID",
                result1.recordsets[0][0].SERVICE_TYPE_PKID
              )
              .input("TYPE_CATEGORIES_CATEGORY_FKID", spltCat[i])
              .query(
                `insert into SERVICE_TYPE_CATEGORIES(TYPE_CATEGORIES_TYPE_FKID, TYPE_CATEGORIES_CATEGORY_FKID) values(@TYPE_CATEGORIES_TYPE_FKID, @TYPE_CATEGORIES_CATEGORY_FKID)`
              );
          }
          res = true;
        } else {
          res = false;
        }
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddServiceType-->", error);
  }
}

async function getAllServiceType() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select *, STUFF((SELECT ',' + CAST(SERVICE_CATEGORY_PKID AS VARCHAR(MAX)) FROM SERVICE_CATEGORY join SERVICE_TYPE_CATEGORIES on TYPE_CATEGORIES_CATEGORY_FKID = SERVICE_CATEGORY_PKID and TYPE_CATEGORIES_TYPE_FKID = SERVICE_TYPE_PKID FOR XML PATH('')),1,1,'') CATEGORY_LIST from SERVICE_TYPE"
      );

    if (result.recordsets[0].length > 0) {
      for (var i = 0; i < result.recordsets[0].length; i++) {
        let result1 = await pool
          .request()
          .input(
            "TYPE_CATEGORIES_TYPE_FKID",
            result.recordsets[0][i].SERVICE_TYPE_PKID
          )
          .query(
            "select SERVICE_CATEGORY_NAME, SERVICE_CATEGORY_PKID from SERVICE_TYPE_CATEGORIES join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = TYPE_CATEGORIES_CATEGORY_FKID where TYPE_CATEGORIES_TYPE_FKID = @TYPE_CATEGORIES_TYPE_FKID"
          );

        var obj = {
          SERVICE_TYPE_PKID: result.recordsets[0][i].SERVICE_TYPE_PKID,
          SERVICE_TYPE_NAME: result.recordsets[0][i].SERVICE_TYPE_NAME,
          SERVICE_TYPE_CODE: result.recordsets[0][i].SERVICE_TYPE_CODE,
          CATEGORY_LIST: result.recordsets[0][i].CATEGORY_LIST,
          SERVICE_TYPE_SURCHARGE:
            result.recordsets[0][i].SERVICE_TYPE_SURCHARGE,
          SERVICE_TYPE_CATEGORY: result1.recordsets[0],
        };

        arr.push(obj);
      }
    }

    return arr;
  } catch (error) {
    console.log("getAllServiceType-->", error);
    //
  }
}

async function UpdateServiceType(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("SERVICE_TYPE_NAME", obj.SERVICE_TYPE_NAME)
      .input("SERVICE_TYPE_CODE", obj.SERVICE_TYPE_CODE)
      .input("SERVICE_TYPE_SURCHARGE", obj.SERVICE_TYPE_SURCHARGE)
      .input("SERVICE_TYPE_NEW_CUST_COUPON", obj.SERVICE_TYPE_NEW_CUST_COUPON)
      .input("SERVICE_TYPE_PKID", id)
      .query(
        `update SERVICE_TYPE set SERVICE_TYPE_NEW_CUST_COUPON = @SERVICE_TYPE_NEW_CUST_COUPON, SERVICE_TYPE_NAME = @SERVICE_TYPE_NAME,SERVICE_TYPE_CODE = @SERVICE_TYPE_CODE,SERVICE_TYPE_SURCHARGE=@SERVICE_TYPE_SURCHARGE where SERVICE_TYPE_PKID=@SERVICE_TYPE_PKID`
      );
    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .input("TYPE_CATEGORIES_TYPE_FKID", id)
        .query(
          `delete from SERVICE_TYPE_CATEGORIES where TYPE_CATEGORIES_TYPE_FKID = @TYPE_CATEGORIES_TYPE_FKID`
        );
      var spltCat = obj.ServiceTypeCategory.split(",");
      for (var i = 0; i < spltCat.length; i++) {
        var result2 = await pool
          .request()
          .input("TYPE_CATEGORIES_TYPE_FKID", id)
          .input("TYPE_CATEGORIES_CATEGORY_FKID", spltCat[i])
          .query(
            `insert into SERVICE_TYPE_CATEGORIES(TYPE_CATEGORIES_TYPE_FKID, TYPE_CATEGORIES_CATEGORY_FKID) values(@TYPE_CATEGORIES_TYPE_FKID, @TYPE_CATEGORIES_CATEGORY_FKID)`
          );
      }
      res = true;
    } else {
      res = false;
    }

    return res;
  } catch (error) {
    console.log("UpdateServiceType-->", error);
  }
}

async function DeleteServiceType(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("SERVICE_TYPE_PKID", id)
      .query(
        `delete from SERVICE_TYPE where SERVICE_TYPE_PKID = @SERVICE_TYPE_PKID`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .input("TYPE_CATEGORIES_TYPE_FKID", id)
        .query(
          `delete from SERVICE_TYPE_CATEGORIES where TYPE_CATEGORIES_TYPE_FKID = @TYPE_CATEGORIES_TYPE_FKID`
        );

      if (result1.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteServiceType-->", error);
  }
}

async function getAllServiceTypeByCategory(CategoryID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select distinct [SERVICE_TYPE_PKID], [SERVICE_TYPE_NAME], [SERVICE_TYPE_CODE] from [dbo].[SERVICE_TYPE] join [dbo].[SERVICE_TYPE_CATEGORIES] on [TYPE_CATEGORIES_TYPE_FKID] = [SERVICE_TYPE_PKID] where [TYPE_CATEGORIES_CATEGORY_FKID] = " +
          CategoryID +
          ""
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("getAllServiceTypeByCategory-->", error);
    //
  }
}

async function getAllServiceTypeByID(pkid) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("SERVICE_TYPE_PKID", pkid)
      .query(
        "select * from SERVICE_TYPE where SERVICE_TYPE_PKID = @SERVICE_TYPE_PKID"
      );

    return result1.recordsets[0];
  } catch (error) {
    console.log("getAllServiceTypeByID-->", error);
    //
  }
}

module.exports = {
  getAllServiceCategory: getAllServiceCategory,
  getAllServiceCategoryByID: getAllServiceCategoryByID,
  AddServiceCategory: AddServiceCategory,
  UpdateServiceCategory: UpdateServiceCategory,
  DeleteServiceCategory: DeleteServiceCategory,
  getAllServiceCategoryForDropDown: getAllServiceCategoryForDropDown,
  getAllServiceType: getAllServiceType,
  getAllServiceTypeByCategory: getAllServiceTypeByCategory,
  AddServiceType: AddServiceType,
  UpdateServiceType: UpdateServiceType,
  DeleteServiceType: DeleteServiceType,
  getAllServiceTypeByID: getAllServiceTypeByID,
};
