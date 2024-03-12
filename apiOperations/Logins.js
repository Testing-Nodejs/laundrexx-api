/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function getAdminLogin(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("SUPER_ADMIN_NAME", obj.AdminEmail)
      .input("SUPER_ADMIN_PASS", obj.AdminPass)
      .query(
        "SELECT * FROM [SUPER_ADMIN] WHERE SUPER_ADMIN_NAME=@SUPER_ADMIN_NAME AND SUPER_ADMIN_PASS=@SUPER_ADMIN_PASS"
      );

    if (result.recordsets[0].length > 0) {
      return result.recordsets[0];
    } else {
      return false;
    }
  } catch (error) {
    console.log("getAdminLogin-->", error);
    //
  }
}

async function getManagerLogin(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("USER_LOGIN_NAME", obj.UserName)
      .input("USER_PASSWORD", obj.Password)
      .query(
        "SELECT * FROM [USERS] WHERE USER_LOGIN_NAME=@USER_LOGIN_NAME AND USER_PASSWORD=@USER_PASSWORD and USER_ISACTIVE = 1"
      );

    if (result.recordsets[0].length > 0) {
      return result.recordsets[0];
    } else {
      return false;
    }
  } catch (error) {
    console.log("getManagerLogin-->", error);
    //
  }
}

async function OutletLogin(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("UserName", obj.UserName)
      .input("Password", obj.Password)
      .input("OutletID", obj.OutletID)
      .execute("OutletLogin");

    if (result.recordsets[0].length > 0) {
      return result.recordsets[0];
    } else {
      return false;
    }
  } catch (error) {
    console.log("OutletLogin-->", error);
    //
  }
}

async function GetFactoryLogin(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("FACTORY_STAFF_USER_NAME", obj.UserName)
      .input("FACTORY_STAFF_PASSWORD", obj.Password)
      .input("FACTORY_STAFF_FACTORY_FACTORY_FKID", obj.FactoryID)
      .query(
        "select * from [dbo].[FACTORY_STAFF]  join [dbo].[FACTORY_STAFF_FACTORY] on [FACTORY_STAFF_FACTORY_STAFF_FKID] = [FACTORY_STAFF_PKID]  join [dbo].[FACTORY] on [FACTORY_PKID] = [FACTORY_STAFF_FACTORY_FACTORY_FKID]  where [FACTORY_STAFF_USER_NAME] = @FACTORY_STAFF_USER_NAME and [FACTORY_STAFF_PASSWORD] = @FACTORY_STAFF_PASSWORD and [FACTORY_STAFF_FACTORY_FACTORY_FKID] = @FACTORY_STAFF_FACTORY_FACTORY_FKID"
      );

    if (result.recordsets[0].length > 0) {
      return result.recordsets[0];
    } else {
      return false;
    }
  } catch (error) {
    console.log("GetFactoryLogin-->", error);
    //
  }
}

async function UpdateAdminPassword(AdminEmail, AdminPassword) {
  try {
    var pool = await sql.connect(config);
    var result = await pool
      .request()
      .input("ADMIN_EMAIL", AdminEmail)
      .input("ADMIN_PASSWORD", AdminPassword)
      .query(
        `UPDATE ADMIN SET ADMIN_PASSWORD = @ADMIN_PASSWORD WHERE ADMIN_EMAIL =@ADMIN_EMAIL`
      );

    var message = false;

    if (result.rowsAffected) {
      message = true;
    }
    return message;
  } catch (error) {
    console.log("UpdateAdminPassword-->", error);
  }
}

async function ChangePassword(obj) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("SUPER_ADMIN_NAME", obj.Password)
      .input("SUPER_ADMIN_PASS", obj.id)
      .query(
        obj.id === "All"
          ? "update SUPER_ADMIN set SUPER_ADMIN_PASS = '" + obj.Password + "'"
          : "update USERS set USER_PASSWORD = '" +
              obj.Password +
              "' where USER_PKID = '" +
              obj.id +
              "'"
      );

    if (result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("ChangePassword-->", error);
    //
  }
}

async function GetManagerProfile(Pkid) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("USER_PKID", Pkid)
      .query(
        "SELECT USERS.*,USER_TYPE_NAME FROM [USERS] join USER_TYPE on USER_TYPE_PKID = USER_TYPE_FKID WHERE USER_PKID=@USER_PKID"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetManagerProfile-->", error);
    //
  }
}

async function getYearLists() {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().execute("GetYearList");
    return result.recordsets[0];
  } catch (error) {
    console.log("getYearLists-->", error);
    //
  }
}

module.exports = {
  getAdminLogin: getAdminLogin,
  UpdateAdminPassword: UpdateAdminPassword,
  getManagerLogin: getManagerLogin,
  ChangePassword: ChangePassword,
  OutletLogin: OutletLogin,
  GetFactoryLogin: GetFactoryLogin,
  GetManagerProfile: GetManagerProfile,
  getYearLists: getYearLists,
};
