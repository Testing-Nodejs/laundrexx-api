/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddUser(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("USER_LOGIN_NAME", obj.USER_LOGIN_NAME)
      .input("USER_PHONE", obj.USER_PHONE)
      .query(
        "SELECT * FROM [USERS] where USER_LOGIN_NAME = @USER_LOGIN_NAME and USER_PHONE = @USER_PHONE and USER_ISACTIVE = 1"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("USER_TYPE_FKID", obj.USER_TYPE_FKID)
        .input("USER_NAME", obj.USER_NAME)
        .input("USER_LOGIN_NAME", obj.USER_LOGIN_NAME)
        .input("USER_PHONE", obj.USER_PHONE)
        .input("USER_PASSWORD", obj.USER_PASSWORD)
        .input("USER_EMAIL", obj.USER_EMAIL)
        .input("USER_ADDED_BY", obj.USER_ADDED_BY)
        .input("USER_ADDED_BY_FKID", obj.USER_ADDED_BY_FKID)
        .query(
          `insert into USERS(USER_TYPE_FKID,USER_NAME,USER_LOGIN_NAME,USER_PHONE,USER_PASSWORD,USER_EMAIL,USER_ISACTIVE,USER_ADDED_BY,USER_ADDED_BY_FKID) values(@USER_TYPE_FKID,@USER_NAME,@USER_LOGIN_NAME,@USER_PHONE,@USER_PASSWORD, @USER_EMAIL,1,@USER_ADDED_BY,@USER_ADDED_BY_FKID)`
        );

      if (result.rowsAffected > 0) {
        let result1 = await pool
          .request()
          .query("SELECT max(USER_PKID) as USER_PKID FROM [USERS]");

        if (result1.recordsets[0].length > 0) {
          for (var i = 0; i < obj.Outlets.length; i++) {
            if (obj.Outlets[i].checked === true) {
              var result3 = await pool
                .request()
                .input(
                  "USER_OUTLETS_USER_FKID",
                  result1.recordsets[0][0].USER_PKID
                )
                .input("USER_OUTLETS_OUTLET_FKID", obj.Outlets[i].STORE_PKID)
                .query(
                  `insert into USER_OUTLETS(USER_OUTLETS_USER_FKID,USER_OUTLETS_OUTLET_FKID) values(@USER_OUTLETS_USER_FKID,@USER_OUTLETS_OUTLET_FKID)`
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
    console.log("AddUser-->", error);
  }
}

async function GetAllUsers() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select USERS.*,USER_TYPE_NAME from USERS join USER_TYPE on USER_TYPE_PKID = USER_TYPE_FKID where USER_ISACTIVE = 1"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME from USER_OUTLETS join STORES on STORE_PKID = USER_OUTLETS_OUTLET_FKID where USER_OUTLETS_USER_FKID = '" +
            result.recordsets[0][i].USER_PKID +
            "'"
        );

      let result2 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME,case when isnull(USER_OUTLETS_PKID, 0) = 0 then 0 else 1 end as checked from STORES left join USER_OUTLETS on STORE_PKID = USER_OUTLETS_OUTLET_FKID and USER_OUTLETS_USER_FKID = '" +
            result.recordsets[0][i].USER_PKID +
            "' order by STORE_NAME asc"
        );

      var obj = {
        USER_TYPE_FKID: result.recordsets[0][i].USER_TYPE_FKID,
        USER_PKID: result.recordsets[0][i].USER_PKID,
        USER_NAME: result.recordsets[0][i].USER_NAME,
        USER_LOGIN_NAME: result.recordsets[0][i].USER_LOGIN_NAME,
        USER_PHONE: result.recordsets[0][i].USER_PHONE,
        USER_PASSWORD: result.recordsets[0][i].USER_PASSWORD,
        USER_ISACTIVE: result.recordsets[0][i].USER_ISACTIVE,
        USER_TYPE_NAME: result.recordsets[0][i].USER_TYPE_NAME,
        USER_EMAIL: result.recordsets[0][i].USER_EMAIL,
        Outlets: result1.recordsets[0],
        OutletsForEdit: result2.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllUsers-->", error);
    //
  }
}

async function GetAllUsersForManager(ManagerID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select USERS.*,USER_TYPE_NAME from USERS join USER_TYPE on USER_TYPE_PKID = USER_TYPE_FKID where USER_ISACTIVE = 1 and USER_ADDED_BY_FKID = '" +
          ManagerID +
          "' and USER_ADDED_BY = 'Manager'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      let result1 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME from USER_OUTLETS join STORES on STORE_PKID = USER_OUTLETS_OUTLET_FKID where USER_OUTLETS_USER_FKID = '" +
            result.recordsets[0][i].USER_PKID +
            "'"
        );

      let result2 = await pool
        .request()
        .query(
          "select STORE_PKID, STORE_ID, STORE_CODE, STORE_NAME,case when isnull(regular.USER_OUTLETS_PKID, 0) = 0 then 0 else 1 end as checked from STORES join [dbo].[USER_OUTLETS] as manageroutlets on manageroutlets.USER_OUTLETS_OUTLET_FKID = STORE_PKID and manageroutlets.USER_OUTLETS_USER_FKID = '" +
            ManagerID +
            "' left join USER_OUTLETS as regular on STORE_PKID = regular.USER_OUTLETS_OUTLET_FKID and regular.USER_OUTLETS_USER_FKID = '" +
            result.recordsets[0][i].USER_PKID +
            "' order by STORE_NAME asc"
        );

      var obj = {
        USER_TYPE_FKID: result.recordsets[0][i].USER_TYPE_FKID,
        USER_PKID: result.recordsets[0][i].USER_PKID,
        USER_NAME: result.recordsets[0][i].USER_NAME,
        USER_LOGIN_NAME: result.recordsets[0][i].USER_LOGIN_NAME,
        USER_PHONE: result.recordsets[0][i].USER_PHONE,
        USER_PASSWORD: result.recordsets[0][i].USER_PASSWORD,
        USER_ISACTIVE: result.recordsets[0][i].USER_ISACTIVE,
        USER_TYPE_NAME: result.recordsets[0][i].USER_TYPE_NAME,
        USER_EMAIL: result.recordsets[0][i].USER_EMAIL,
        Outlets: result1.recordsets[0],
        OutletsForEdit: result2.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllUsersForManager-->", error);
    //
  }
}

async function UpdateUser(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("USER_TYPE_FKID", obj.USER_TYPE_FKID)
      .input("USER_NAME", obj.USER_NAME)
      .input("USER_LOGIN_NAME", obj.USER_LOGIN_NAME)
      .input("USER_PHONE", obj.USER_PHONE)
      .input("USER_PASSWORD", obj.USER_PASSWORD)
      .input("USER_EMAIL", obj.USER_EMAIL)
      .input("USER_PKID", id)
      .query(
        `update USERS set USER_TYPE_FKID = @USER_TYPE_FKID,USER_NAME=@USER_NAME,USER_LOGIN_NAME= @USER_LOGIN_NAME,USER_PHONE = @USER_PHONE, USER_PASSWORD = @USER_PASSWORD, USER_EMAIL = @USER_EMAIL where USER_PKID = @USER_PKID`
      );

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("USER_OUTLETS_USER_FKID", id)
        .query(
          "delete from USER_OUTLETS where USER_OUTLETS_USER_FKID = @USER_OUTLETS_USER_FKID"
        );

      for (var i = 0; i < obj.Outlets.length; i++) {
        if (obj.Outlets[i].checked === true || obj.Outlets[i].checked === 1) {
          var result3 = await pool
            .request()
            .input("USER_OUTLETS_USER_FKID", id)
            .input("USER_OUTLETS_OUTLET_FKID", obj.Outlets[i].STORE_PKID)
            .query(
              `insert into USER_OUTLETS(USER_OUTLETS_USER_FKID,USER_OUTLETS_OUTLET_FKID) values(@USER_OUTLETS_USER_FKID,@USER_OUTLETS_OUTLET_FKID)`
            );
        }
      }
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateUser-->", error);
  }
}

async function UsersProfileUpdate(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("USER_NAME", obj.USER_NAME)
      .input("USER_LOGIN_NAME", obj.USER_LOGIN_NAME)
      .input("USER_PHONE", obj.USER_PHONE)
      .input("USER_EMAIL", obj.USER_EMAIL)
      .input("USER_PKID", id)
      .query(
        `update USERS set USER_NAME=@USER_NAME,USER_LOGIN_NAME= @USER_LOGIN_NAME,USER_PHONE = @USER_PHONE, USER_EMAIL = @USER_EMAIL where USER_PKID = @USER_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UsersProfileUpdate-->", error);
  }
}

async function DeleteUser(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("USER_PKID", id)
      .query(`delete from USERS where USER_PKID = @USER_PKID`);

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("USER_OUTLETS_USER_FKID", id)
        .query(
          "delete from USER_OUTLETS where USER_OUTLETS_USER_FKID = @USER_OUTLETS_USER_FKID"
        );
      if (result1.rowsAffected > 0) {
        res = true;
      } else {
        res = true;
      }
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteUser-->", error);
  }
}

module.exports = {
  AddUser: AddUser,
  GetAllUsers: GetAllUsers,
  GetAllUsersForManager: GetAllUsersForManager,
  UpdateUser: UpdateUser,
  UsersProfileUpdate: UsersProfileUpdate,
  DeleteUser: DeleteUser,
};
