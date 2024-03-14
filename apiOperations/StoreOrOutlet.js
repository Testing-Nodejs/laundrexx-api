/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddRoute(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("ROUTE_NAME", obj.ROUTE_NAME)
      .query("SELECT * FROM [ROUTES] where ROUTE_NAME = @ROUTE_NAME");

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("ROUTE_NAME", obj.ROUTE_NAME)
        .input("ROUTE_CODE", obj.ROUTE_CODE)
        .query(
          `insert into ROUTES(ROUTE_CODE,ROUTE_NAME) values(@ROUTE_CODE,@ROUTE_NAME)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddRoute-->", error);
  }
}

async function GetAllRoutes() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from ROUTES");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllRoutes-->", error);
    //
  }
}

async function UpdateRoute(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("ROUTE_NAME", obj.ROUTE_NAME)
      .input("ROUTE_CODE", obj.ROUTE_CODE)
      .input("ROUTE_PKID", id)
      .query(
        `update ROUTES set ROUTE_CODE = @ROUTE_CODE,ROUTE_NAME = @ROUTE_NAME where ROUTE_PKID = @ROUTE_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateRoute-->", error);
  }
}

async function DeleteRoute(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("ROUTE_PKID", id)
      .query(`delete from ROUTES where ROUTE_PKID = @ROUTE_PKID`);

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteRoute-->", error);
  }
}

async function AddOutlets(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("STORE_CODE", obj.STORE_CODE)
      .input("STORE_NAME", obj.STORE_NAME)
      .query(
        "SELECT * FROM [STORES] where STORE_CODE = @STORE_CODE and STORE_NAME = @STORE_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("STORE_ID", obj.STORE_ID)
        .input("STORE_CODE", obj.STORE_CODE)
        .input("STORE_SHORT_CODE", obj.STORE_SHORT_CODE)
        .input("STORE_NAME", obj.STORE_NAME)
        .input("STORE_ADDRESS", obj.STORE_ADDRESS)
        .input("STORE_CITY", obj.STORE_CITY)
        .input("STORE_ROUTE_FKID", obj.STORE_ROUTE_FKID)
        .input("STORE_PHONE", obj.STORE_PHONE)
        .input("STORE_PRICE_TIER", obj.STORE_PRICE_TIER)
        .input("STORE_DEFAULT_FACTORY", obj.STORE_DEFAULT_FACTORY)
        .input("STORE_DUE_DATES", obj.STORE_DUE_DATES)
        .input("STORE_SERVICE_CATEGORY_FKID", obj.STORE_SERVICE_CATEGORY_FKID)
        .input("STORE_SERVICE_TYPE_FKID", obj.STORE_SERVICE_TYPE_FKID)
        .input("STORE_GOOGLE_REVIEW_LINK", obj.STORE_GOOGLE_REVIEW_LINK)
        .input("STORE_LATITUDE", obj.STORE_LATITUDE)
        .input("STORE_LONGITUDE", obj.STORE_LONGITUDE)
        .query(
          `insert into STORES(STORE_SERVICE_CATEGORY_FKID, STORE_SERVICE_TYPE_FKID, STORE_ID,STORE_CODE,STORE_SHORT_CODE,STORE_NAME,STORE_ADDRESS,STORE_CITY,STORE_ROUTE_FKID,STORE_PHONE,STORE_PRICE_TIER,STORE_DEFAULT_FACTORY,STORE_DUE_DATES,STORE_GOOGLE_REVIEW_LINK, STORE_LATITUDE, STORE_LONGITUDE) values(@STORE_SERVICE_CATEGORY_FKID, @STORE_SERVICE_TYPE_FKID,@STORE_ID,@STORE_CODE,@STORE_SHORT_CODE,@STORE_NAME,@STORE_ADDRESS,@STORE_CITY, @STORE_ROUTE_FKID,@STORE_PHONE,@STORE_PRICE_TIER,@STORE_DEFAULT_FACTORY,@STORE_DUE_DATES,@STORE_GOOGLE_REVIEW_LINK, @STORE_LATITUDE, @STORE_LONGITUDE)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddOutlets-->", error);
  }
}

async function AddOutletsByManager(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("STORE_CODE", obj.STORE_CODE)
      .input("STORE_NAME", obj.STORE_NAME)
      .query(
        "SELECT * FROM [STORES] where STORE_CODE = @STORE_CODE and STORE_NAME = @STORE_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("STORE_ID", obj.STORE_ID)
        .input("STORE_CODE", obj.STORE_CODE)
        .input("STORE_SHORT_CODE", obj.STORE_SHORT_CODE)
        .input("STORE_NAME", obj.STORE_NAME)
        .input("STORE_ADDRESS", obj.STORE_ADDRESS)
        .input("STORE_CITY", obj.STORE_CITY)
        .input("STORE_ROUTE_FKID", obj.STORE_ROUTE_FKID)
        .input("STORE_PHONE", obj.STORE_PHONE)
        .input("STORE_PRICE_TIER", obj.STORE_PRICE_TIER)
        .input("STORE_DEFAULT_FACTORY", obj.STORE_DEFAULT_FACTORY)
        .input("STORE_DUE_DATES", obj.STORE_DUE_DATES)
        .input("STORE_SERVICE_CATEGORY_FKID", obj.STORE_SERVICE_CATEGORY_FKID)
        .input("STORE_SERVICE_TYPE_FKID", obj.STORE_SERVICE_TYPE_FKID)
        .input("STORE_GOOGLE_REVIEW_LINK", obj.STORE_GOOGLE_REVIEW_LINK)
        .input("STORE_LATITUDE", obj.STORE_LATITUDE)
        .input("STORE_LONGITUDE", obj.STORE_LONGITUDE)
        .query(
          `insert into STORES(STORE_SERVICE_CATEGORY_FKID, STORE_SERVICE_TYPE_FKID, STORE_ID,STORE_CODE,STORE_SHORT_CODE,STORE_NAME,STORE_ADDRESS,STORE_CITY,STORE_ROUTE_FKID,STORE_PHONE,STORE_PRICE_TIER,STORE_DEFAULT_FACTORY,STORE_DUE_DATES,STORE_GOOGLE_REVIEW_LINK, STORE_LATITUDE, STORE_LONGITUDE) values(@STORE_SERVICE_CATEGORY_FKID, @STORE_SERVICE_TYPE_FKID,@STORE_ID,@STORE_CODE,@STORE_SHORT_CODE,@STORE_NAME,@STORE_ADDRESS,@STORE_CITY, @STORE_ROUTE_FKID,@STORE_PHONE,@STORE_PRICE_TIER,@STORE_DEFAULT_FACTORY,@STORE_DUE_DATES,@STORE_GOOGLE_REVIEW_LINK, @STORE_LATITUDE, @STORE_LONGITUDE)`
        );

      if (result.rowsAffected > 0) {
        let resultt = await pool
          .request()
          .query(
            "SELECT * FROM [STORES] where STORE_PKID = (select max(STORE_PKID) from STORES)"
          );

        let resulttt = await pool
          .request()
          .input("USER_OUTLETS_USER_FKID", obj.ManagerID)
          .input(
            "USER_OUTLETS_OUTLET_FKID",
            resultt.recordsets[0][0].STORE_PKID
          )
          .query(
            "insert into USER_OUTLETS(USER_OUTLETS_USER_FKID,USER_OUTLETS_OUTLET_FKID) values(@USER_OUTLETS_USER_FKID,@USER_OUTLETS_OUTLET_FKID)"
          );
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddOutletsByManager-->", error);
  }
}

async function GetAllOutlets() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_NAME,SERVICE_TYPE_CODE,SERVICE_CATEGORY_NAME,SERVICE_CATEGORY_CODE from STORES join ROUTES on ROUTE_PKID = STORE_ROUTE_FKID join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = STORE_SERVICE_CATEGORY_FKID join SERVICE_TYPE on SERVICE_TYPE_PKID = STORE_SERVICE_TYPE_FKID ORDER BY STORE_NAME"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOutlets-->", error);
    //
  }
}

async function GetAllOutletsByManager(ManagerID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request()
      .query(`select STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_NAME,SERVICE_TYPE_CODE,SERVICE_CATEGORY_NAME,SERVICE_CATEGORY_CODE 
      from [dbo].[USER_OUTLETS]
      join STORES on [STORE_PKID] = [USER_OUTLETS_OUTLET_FKID]
      join ROUTES on ROUTE_PKID = STORE_ROUTE_FKID 
      join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
      join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = STORE_SERVICE_CATEGORY_FKID 
      join SERVICE_TYPE on SERVICE_TYPE_PKID = STORE_SERVICE_TYPE_FKID 
      where [USER_OUTLETS_USER_FKID] = '${ManagerID}'
      ORDER BY STORE_NAME`);

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOutletsByManager-->", error);
    //
  }
}

async function GetOutletByID(OutletID, StaffID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select [dbo].[STORE_STAFF].*,[dbo].[STORES].*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_NAME,SERVICE_TYPE_CODE,SERVICE_CATEGORY_NAME,SERVICE_CATEGORY_CODE from [dbo].[STORE_STAFF] join [dbo].[STORE_STAFF_OUTLET] on [STORE_STAFF_OUTLET_STAFF_FKID] = [STORE_STAFF_PKID] join [dbo].[STORES] on [STORE_PKID] = [STORE_STAFF_OUTLET_OUTLET_FKID] join ROUTES on ROUTE_PKID = STORE_ROUTE_FKID join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = STORE_SERVICE_CATEGORY_FKID join SERVICE_TYPE on SERVICE_TYPE_PKID = STORE_SERVICE_TYPE_FKID where [STORE_STAFF_OUTLET_STAFF_FKID] = '" +
          StaffID +
          "' and [STORE_STAFF_OUTLET_OUTLET_FKID] = '" +
          OutletID +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetOutletByID-->", error);
    //
  }
}

async function UpdateOutlets(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("STORE_ID", obj.STORE_ID)
      .input("STORE_CODE", obj.STORE_CODE)
      .input("STORE_SHORT_CODE", obj.STORE_SHORT_CODE)
      .input("STORE_NAME", obj.STORE_NAME)
      .input("STORE_ADDRESS", obj.STORE_ADDRESS)
      .input("STORE_CITY", obj.STORE_CITY)
      .input("STORE_ROUTE_FKID", obj.STORE_ROUTE_FKID)
      .input("STORE_PHONE", obj.STORE_PHONE)
      .input("STORE_PRICE_TIER", obj.STORE_PRICE_TIER)
      .input("STORE_DEFAULT_FACTORY", obj.STORE_DEFAULT_FACTORY)
      .input("STORE_DUE_DATES", obj.STORE_DUE_DATES)
      .input("STORE_SERVICE_CATEGORY_FKID", obj.STORE_SERVICE_CATEGORY_FKID)
      .input("STORE_SERVICE_TYPE_FKID", obj.STORE_SERVICE_TYPE_FKID)
      .input("STORE_GOOGLE_REVIEW_LINK", obj.STORE_GOOGLE_REVIEW_LINK)
      .input("STORE_LATITUDE", obj.STORE_LATITUDE)
      .input("STORE_LONGITUDE", obj.STORE_LONGITUDE)
      .input("STORE_PKID", id)
      .query(
        `update STORES set STORE_LONGITUDE = @STORE_LONGITUDE,STORE_GOOGLE_REVIEW_LINK = @STORE_GOOGLE_REVIEW_LINK, STORE_LATITUDE = @STORE_LATITUDE,STORE_SERVICE_CATEGORY_FKID = @STORE_SERVICE_CATEGORY_FKID, STORE_SERVICE_TYPE_FKID = @STORE_SERVICE_TYPE_FKID, STORE_ID = @STORE_ID,STORE_CODE = @STORE_CODE,STORE_SHORT_CODE = @STORE_SHORT_CODE,STORE_NAME = @STORE_NAME,STORE_ADDRESS = @STORE_ADDRESS,STORE_CITY = @STORE_CITY, STORE_ROUTE_FKID=@STORE_ROUTE_FKID,STORE_PHONE = @STORE_PHONE, STORE_PRICE_TIER = @STORE_PRICE_TIER, STORE_DEFAULT_FACTORY = @STORE_DEFAULT_FACTORY, STORE_DUE_DATES = @STORE_DUE_DATES where STORE_PKID = @STORE_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateOutlets-->", error);
  }
}

async function DeleteOutlet(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("STORE_PKID", id)
      .query(`delete from STORES where STORE_PKID = @STORE_PKID`);

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteOutlet-->", error);
  }
}

async function AddOutletStaff(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("STORE_STAFF_NAME", obj.STORE_STAFF_NAME)
      .query(
        "SELECT * FROM [STORE_STAFF] where STORE_STAFF_NAME = @STORE_STAFF_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("STORE_STAFF_NAME", obj.STORE_STAFF_NAME)
        .input("STORE_STAFF_USERNAME", obj.STORE_STAFF_USERNAME)
        .input("STORE_STAFF_EMAIL", obj.STORE_STAFF_EMAIL)
        .input("STORE_STAFF_PASSWORD", obj.STORE_STAFF_PASSWORD)
        .input("STORE_STAFF_PHONE", obj.STORE_STAFF_PHONE)
        .input("STORE_STAFF_ADDED_BY", obj.STORE_STAFF_ADDED_BY)
        .input("STORE_STAFF_ADDED_BY_FKID", obj.STORE_STAFF_ADDED_BY_FKID)
        .query(
          `insert into STORE_STAFF(STORE_STAFF_NAME,STORE_STAFF_USERNAME,STORE_STAFF_EMAIL,STORE_STAFF_PASSWORD,STORE_STAFF_PHONE,STORE_STAFF_ADDED_BY,STORE_STAFF_ADDED_BY_FKID) values(@STORE_STAFF_NAME,@STORE_STAFF_USERNAME,@STORE_STAFF_EMAIL,@STORE_STAFF_PASSWORD,@STORE_STAFF_PHONE,@STORE_STAFF_ADDED_BY,@STORE_STAFF_ADDED_BY_FKID)`
        );

      if (result.rowsAffected > 0) {
        let result1 = await pool
          .request()
          .query(
            "SELECT max(STORE_STAFF_PKID) as STORE_STAFF_PKID FROM [STORE_STAFF]"
          );

        if (result1.recordsets[0].length > 0) {
          for (var i = 0; i < obj.Outlets.length; i++) {
            if (obj.Outlets[i].checked === true) {
              var result3 = await pool
                .request()
                .input(
                  "STORE_STAFF_OUTLET_STAFF_FKID",
                  result1.recordsets[0][0].STORE_STAFF_PKID
                )
                .input(
                  "STORE_STAFF_OUTLET_OUTLET_FKID",
                  obj.Outlets[i].STORE_PKID
                )
                .query(
                  `insert into STORE_STAFF_OUTLET(STORE_STAFF_OUTLET_STAFF_FKID,STORE_STAFF_OUTLET_OUTLET_FKID) values(@STORE_STAFF_OUTLET_STAFF_FKID,@STORE_STAFF_OUTLET_OUTLET_FKID)`
                );
            }
          }
        }
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddOutletStaff-->", error);
  }
}

async function GetAllOutletStaff() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query("select STORE_STAFF.* from STORE_STAFF");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME from STORE_STAFF_OUTLET join STORES on STORE_PKID = STORE_STAFF_OUTLET_OUTLET_FKID where STORE_STAFF_OUTLET_STAFF_FKID = '" +
            result.recordsets[0][i].STORE_STAFF_PKID +
            "'"
        );

      let result2 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME,case when isnull(STORE_STAFF_OUTLET_PKID, 0) = 0 then 0 else 1 end as checked from STORES left join STORE_STAFF_OUTLET on STORE_PKID = STORE_STAFF_OUTLET_OUTLET_FKID and STORE_STAFF_OUTLET_STAFF_FKID = '" +
            result.recordsets[0][i].STORE_STAFF_PKID +
            "' order by STORE_NAME ASC"
        );

      var obj = {
        STORE_STAFF_PKID: result.recordsets[0][i].STORE_STAFF_PKID,
        STORE_STAFF_USERNAME: result.recordsets[0][i].STORE_STAFF_USERNAME,
        USER_LOGIN_NAME: result.recordsets[0][i].USER_LOGIN_NAME,
        STORE_STAFF_NAME: result.recordsets[0][i].STORE_STAFF_NAME,
        STORE_STAFF_EMAIL: result.recordsets[0][i].STORE_STAFF_EMAIL,
        STORE_STAFF_PASSWORD: result.recordsets[0][i].STORE_STAFF_PASSWORD,
        STORE_STAFF_PHONE: result.recordsets[0][i].STORE_STAFF_PHONE,
        Outlets: result1.recordsets[0],
        OutletsForEdit: result2.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllOutletStaff-->", error);
    //
  }
}

async function GetAllOutletStaffForManager(ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select STORE_STAFF.* from STORE_STAFF where STORE_STAFF_ADDED_BY = 'Manager' and STORE_STAFF_ADDED_BY_FKID = '" +
          ManagerID +
          "'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME from STORE_STAFF_OUTLET join STORES on STORE_PKID = STORE_STAFF_OUTLET_OUTLET_FKID where STORE_STAFF_OUTLET_STAFF_FKID = '" +
            result.recordsets[0][i].STORE_STAFF_PKID +
            "'"
        );

      let result2 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME,case when isnull(regular.STORE_STAFF_OUTLET_PKID, 0) = 0 then 0 else 1 end as checked from STORES join [dbo].[USER_OUTLETS] as manageroutlets on manageroutlets.USER_OUTLETS_OUTLET_FKID = STORE_PKID and manageroutlets.USER_OUTLETS_USER_FKID = '2' left join STORE_STAFF_OUTLET as regular on STORE_PKID = regular.STORE_STAFF_OUTLET_OUTLET_FKID and regular.STORE_STAFF_OUTLET_STAFF_FKID = '" +
            result.recordsets[0][i].STORE_STAFF_PKID +
            "' order by STORE_NAME ASC"
        );

      var obj = {
        STORE_STAFF_PKID: result.recordsets[0][i].STORE_STAFF_PKID,
        STORE_STAFF_USERNAME: result.recordsets[0][i].STORE_STAFF_USERNAME,
        USER_LOGIN_NAME: result.recordsets[0][i].USER_LOGIN_NAME,
        STORE_STAFF_NAME: result.recordsets[0][i].STORE_STAFF_NAME,
        STORE_STAFF_EMAIL: result.recordsets[0][i].STORE_STAFF_EMAIL,
        STORE_STAFF_PASSWORD: result.recordsets[0][i].STORE_STAFF_PASSWORD,
        STORE_STAFF_PHONE: result.recordsets[0][i].STORE_STAFF_PHONE,
        Outlets: result1.recordsets[0],
        OutletsForEdit: result2.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllOutletStaffForManager-->", error);
    //
  }
}

async function UpdateOutletStaff(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("STORE_STAFF_USERNAME", obj.STORE_STAFF_USERNAME)
      .input("STORE_STAFF_NAME", obj.STORE_STAFF_NAME)
      .input("STORE_STAFF_EMAIL", obj.STORE_STAFF_EMAIL)
      .input("STORE_STAFF_PASSWORD", obj.STORE_STAFF_PASSWORD)
      .input("STORE_STAFF_PHONE", obj.STORE_STAFF_PHONE)
      .input("STORE_STAFF_PKID", id)
      .query(
        `update STORE_STAFF set STORE_STAFF_USERNAME = @STORE_STAFF_USERNAME,STORE_STAFF_NAME = @STORE_STAFF_NAME,STORE_STAFF_EMAIL = @STORE_STAFF_EMAIL,STORE_STAFF_PASSWORD = @STORE_STAFF_PASSWORD,STORE_STAFF_PHONE=@STORE_STAFF_PHONE where STORE_STAFF_PKID = @STORE_STAFF_PKID`
      );

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("STORE_STAFF_OUTLET_STAFF_FKID", id)
        .query(
          "delete from STORE_STAFF_OUTLET where STORE_STAFF_OUTLET_STAFF_FKID = @STORE_STAFF_OUTLET_STAFF_FKID"
        );

      for (var i = 0; i < obj.Outlets.length; i++) {
        if (obj.Outlets[i].checked === true || obj.Outlets[i].checked === 1) {
          var result3 = await pool
            .request()
            .input("STORE_STAFF_OUTLET_STAFF_FKID", id)
            .input("STORE_STAFF_OUTLET_OUTLET_FKID", obj.Outlets[i].STORE_PKID)
            .query(
              `insert into STORE_STAFF_OUTLET(STORE_STAFF_OUTLET_STAFF_FKID,STORE_STAFF_OUTLET_OUTLET_FKID) values(@STORE_STAFF_OUTLET_STAFF_FKID,@STORE_STAFF_OUTLET_OUTLET_FKID)`
            );
        }
      }
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateOutletStaff-->", error);
  }
}

async function DeleteOutletStaff(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("STORE_STAFF_PKID", id)
      .query(
        `delete from STORE_STAFF where STORE_STAFF_PKID = @STORE_STAFF_PKID`
      );

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("STORE_STAFF_OUTLET_STAFF_FKID", id)
        .query(
          "delete from STORE_STAFF_OUTLET where STORE_STAFF_OUTLET_STAFF_FKID = @STORE_STAFF_OUTLET_STAFF_FKID"
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
    console.log("DeleteOutletStaff-->", error);
  }
}

module.exports = {
  GetAllRoutes: GetAllRoutes,
  AddRoute: AddRoute,
  UpdateRoute: UpdateRoute,
  DeleteRoute: DeleteRoute,
  GetAllOutlets: GetAllOutlets,
  GetAllOutletsByManager: GetAllOutletsByManager,
  GetOutletByID: GetOutletByID,
  AddOutlets: AddOutlets,
  AddOutletsByManager: AddOutletsByManager,
  UpdateOutlets: UpdateOutlets,
  DeleteOutlet: DeleteOutlet,
  GetAllOutletStaff: GetAllOutletStaff,
  AddOutletStaff: AddOutletStaff,
  GetAllOutletStaffForManager: GetAllOutletStaffForManager,
  UpdateOutletStaff: UpdateOutletStaff,
  DeleteOutletStaff: DeleteOutletStaff,
};
