/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddUserType(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("USER_TYPE_NAME", obj.USER_TYPE_NAME)
      .query(
        "SELECT * FROM [USER_TYPE] where USER_TYPE_NAME = @USER_TYPE_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("USER_TYPE_NAME", obj.USER_TYPE_NAME)
        .query(
          `insert into USER_TYPE(USER_TYPE_NAME,USER_TYPE_ACTIVE) values(@USER_TYPE_NAME, 1)`
        );

      if (result.rowsAffected > 0) {
        let result1 = await pool
          .request()
          .query(
            "SELECT max(USER_TYPE_PKID) as USER_TYPE_PKID FROM [USER_TYPE]"
          );

        if (result1.recordsets[0].length > 0) {
          for (var i = 0; i < obj.RolesData.length; i++) {
            if (obj.RolesData[i].checked === true) {
              if (obj.RolesData[i].familyMembers.length > 0) {
                for (
                  var j = 0;
                  j < obj.RolesData[i].familyMembers.length;
                  j++
                ) {
                  if (obj.RolesData[i].familyMembers[j].checked === true) {
                    var result2 = await pool
                      .request()
                      .input(
                        "USER_ROLE_USER_TYPE_FKID",
                        result1.recordsets[0][0].USER_TYPE_PKID
                      )
                      .input(
                        "USER_ROLE_MODULE_FKID",
                        obj.RolesData[i].familyMembers[j].ParentID
                      )
                      .input(
                        "USER_ROLE_SUB_MODULE_FKID",
                        obj.RolesData[i].familyMembers[j].id
                      )
                      .query(
                        `insert into USER_ROLE(USER_ROLE_USER_TYPE_FKID,USER_ROLE_MODULE_FKID,USER_ROLE_SUB_MODULE_FKID) values(@USER_ROLE_USER_TYPE_FKID,@USER_ROLE_MODULE_FKID,@USER_ROLE_SUB_MODULE_FKID)`
                      );
                  }
                }
              } else {
                var result3 = await pool
                  .request()
                  .input(
                    "USER_ROLE_USER_TYPE_FKID",
                    result1.recordsets[0][0].USER_TYPE_PKID
                  )
                  .input("USER_ROLE_MODULE_FKID", obj.RolesData[i].id)
                  .query(
                    `insert into USER_ROLE(USER_ROLE_USER_TYPE_FKID,USER_ROLE_MODULE_FKID) values(@USER_ROLE_USER_TYPE_FKID,@USER_ROLE_MODULE_FKID)`
                  );
              }
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
    console.log("AddUserType-->", error);
  }
}

async function GetAllUserType() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query("select * from USER_TYPE where USER_TYPE_ACTIVE = 1");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllUserType-->", error);
    //
  }
}

async function UpdateUserType(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("USER_TYPE_NAME", obj.USER_TYPE_NAME)
      .input("USER_TYPE_PKID", id)
      .query(
        `update USER_TYPE set USER_TYPE_NAME = @USER_TYPE_NAME where USER_TYPE_PKID = @USER_TYPE_PKID`
      );

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("USER_ROLE_USER_TYPE_FKID", id)
        .query(
          "delete from USER_ROLE where USER_ROLE_USER_TYPE_FKID = @USER_ROLE_USER_TYPE_FKID"
        );
      for (var i = 0; i < obj.RolesData.length; i++) {
        if (
          obj.RolesData[i].checked === true ||
          obj.RolesData[i].checked === 1
        ) {
          if (obj.RolesData[i].familyMembers.length > 0) {
            for (var j = 0; j < obj.RolesData[i].familyMembers.length; j++) {
              console.log(obj.RolesData[i].familyMembers);
              if (
                obj.RolesData[i].familyMembers[j].checked === true ||
                obj.RolesData[i].familyMembers[j].checked === 1
              ) {
                var result2 = await pool
                  .request()
                  .input("USER_ROLE_USER_TYPE_FKID", id)
                  .input(
                    "USER_ROLE_MODULE_FKID",
                    obj.RolesData[i].familyMembers[j].ParentID
                  )
                  .input(
                    "USER_ROLE_SUB_MODULE_FKID",
                    obj.RolesData[i].familyMembers[j].id
                  )
                  .query(
                    `insert into USER_ROLE(USER_ROLE_USER_TYPE_FKID,USER_ROLE_MODULE_FKID,USER_ROLE_SUB_MODULE_FKID) values(@USER_ROLE_USER_TYPE_FKID,@USER_ROLE_MODULE_FKID,@USER_ROLE_SUB_MODULE_FKID)`
                  );
              }
            }
          } else {
            var result3 = await pool
              .request()
              .input("USER_ROLE_USER_TYPE_FKID", id)
              .input("USER_ROLE_MODULE_FKID", obj.RolesData[i].id)
              .query(
                `insert into USER_ROLE(USER_ROLE_USER_TYPE_FKID,USER_ROLE_MODULE_FKID) values(@USER_ROLE_USER_TYPE_FKID,@USER_ROLE_MODULE_FKID)`
              );
          }
        }
      }
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateUserType-->", error);
  }
}

async function DeleteUserType(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("USER_TYPE_PKID", id)
      .query(`delete from USER_TYPE where USER_TYPE_PKID = @USER_TYPE_PKID`);

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("USER_ROLE_USER_TYPE_FKID", id)
        .query(
          "delete from USER_ROLE where USER_ROLE_USER_TYPE_FKID = @USER_ROLE_USER_TYPE_FKID"
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
    console.log("DeleteUserType-->", error);
  }
}

module.exports = {
  AddUserType: AddUserType,
  GetAllUserType: GetAllUserType,
  UpdateUserType: UpdateUserType,
  DeleteUserType: DeleteUserType,
};
