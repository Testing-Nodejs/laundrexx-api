/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddFactory(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("FACTORY_CODE", obj.FACTORY_CODE)
      .input("FACTORY_NAME", obj.FACTORY_NAME)
      .query(
        "SELECT * FROM [FACTORY] where FACTORY_CODE = @FACTORY_CODE and FACTORY_NAME = @FACTORY_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("FACTORY_ID", obj.FACTORY_ID)
        .input("FACTORY_CODE", obj.FACTORY_CODE)
        .input("FACTORY_NAME", obj.FACTORY_NAME)
        .input("FACTORY_ADDRESS", obj.FACTORY_ADDRESS)
        .input("FACTORY_CITY", obj.FACTORY_CITY)
        .query(
          `insert into FACTORY(FACTORY_ID,FACTORY_CODE,FACTORY_NAME,FACTORY_ADDRESS,FACTORY_CITY,FACTORY_ACTIVE) values(@FACTORY_ID,@FACTORY_CODE,@FACTORY_NAME,@FACTORY_ADDRESS,@FACTORY_CITY, 1)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddFactory-->", error);
  }
}

async function GetAllFactory() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query("select * from FACTORY where FACTORY_ACTIVE = 1");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllFactory-->", error);
    //
  }
}

async function UpdateFactory(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("FACTORY_ID", obj.FACTORY_ID)
      .input("FACTORY_CODE", obj.FACTORY_CODE)
      .input("FACTORY_NAME", obj.FACTORY_NAME)
      .input("FACTORY_ADDRESS", obj.FACTORY_ADDRESS)
      .input("FACTORY_CITY", obj.FACTORY_CITY)
      .input("FACTORY_PKID", id)
      .query(
        `update FACTORY set FACTORY_ID = @FACTORY_ID,FACTORY_CODE = @FACTORY_CODE,FACTORY_NAME = @FACTORY_NAME,FACTORY_ADDRESS = @FACTORY_ADDRESS,FACTORY_CITY = @FACTORY_CITY where FACTORY_PKID = @FACTORY_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateFactory-->", error);
  }
}

async function DeleteFactory(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("FACTORY_PKID", id)
      .query(`delete from FACTORY where FACTORY_PKID = @FACTORY_PKID`);

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteFactory-->", error);
  }
}

async function AddFactoryStaff(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("FACTORY_STAFF_USER_NAME", obj.FACTORY_STAFF_USER_NAME)
      .query(
        "SELECT * FROM [FACTORY_STAFF] where FACTORY_STAFF_USER_NAME = @FACTORY_STAFF_USER_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("FACTORY_STAFF_NAME", obj.FACTORY_STAFF_NAME)
        .input("FACTORY_STAFF_USER_NAME", obj.FACTORY_STAFF_USER_NAME)
        .input("FACTORY_STAFF_EMAIL", obj.FACTORY_STAFF_EMAIL)
        .input("FACTORY_STAFF_PASSWORD", obj.FACTORY_STAFF_PASSWORD)
        .query(
          `insert into FACTORY_STAFF(FACTORY_STAFF_NAME,FACTORY_STAFF_USER_NAME,FACTORY_STAFF_EMAIL,FACTORY_STAFF_PASSWORD) values(@FACTORY_STAFF_NAME,@FACTORY_STAFF_USER_NAME,@FACTORY_STAFF_EMAIL,@FACTORY_STAFF_PASSWORD)`
        );

      if (result.rowsAffected > 0) {
        let result1 = await pool
          .request()
          .query(
            "SELECT max(FACTORY_STAFF_PKID) as FACTORY_STAFF_PKID FROM [FACTORY_STAFF]"
          );

        if (result1.recordsets[0].length > 0) {
          for (var i = 0; i < obj.Factory.length; i++) {
            var result3 = await pool
              .request()
              .input(
                "FACTORY_STAFF_FACTORY_STAFF_FKID",
                result1.recordsets[0][0].FACTORY_STAFF_PKID
              )
              .input("FACTORY_STAFF_FACTORY_FACTORY_FKID", obj.Factory[i].value)
              .query(
                `insert into FACTORY_STAFF_FACTORY(FACTORY_STAFF_FACTORY_STAFF_FKID,FACTORY_STAFF_FACTORY_FACTORY_FKID) values(@FACTORY_STAFF_FACTORY_STAFF_FKID,@FACTORY_STAFF_FACTORY_FACTORY_FKID)`
              );
          }
        }
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddFactoryStaff-->", error);
  }
}

async function GetAllFactoryStaff() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from FACTORY_STAFF");

    if (result.recordsets[0].length > 0) {
      for (var i = 0; i < result.recordsets[0].length; i++) {
        let result1 = await pool
          .request()
          .input(
            "FACTORY_STAFF_FACTORY_STAFF_FKID",
            result.recordsets[0][i].FACTORY_STAFF_PKID
          )
          .query(
            "select FACTORY_NAME, FACTORY_PKID,FACTORY_ID,FACTORY_CODE,FACTORY_CITY,FACTORY_ADDRESS from FACTORY_STAFF_FACTORY join FACTORY on FACTORY_PKID = FACTORY_STAFF_FACTORY_FACTORY_FKID where FACTORY_STAFF_FACTORY_STAFF_FKID = @FACTORY_STAFF_FACTORY_STAFF_FKID"
          );

        var obj = {
          FACTORY_STAFF_PKID: result.recordsets[0][i].FACTORY_STAFF_PKID,
          FACTORY_STAFF_NAME: result.recordsets[0][i].FACTORY_STAFF_NAME,
          FACTORY_STAFF_USER_NAME:
            result.recordsets[0][i].FACTORY_STAFF_USER_NAME,
          FACTORY_STAFF_EMAIL: result.recordsets[0][i].FACTORY_STAFF_EMAIL,
          FACTORY_STAFF_PASSWORD:
            result.recordsets[0][i].FACTORY_STAFF_PASSWORD,
          FACTORY_LIST: result.recordsets[0][i].FACTORY_LIST,
          FACTORY: result1.recordsets[0],
        };

        arr.push(obj);
      }
    }

    return arr;
  } catch (error) {
    console.log("GetAllFactoryStaff-->", error);
    //
  }
}

async function UpdateFactoryStaff(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("FACTORY_STAFF_NAME", obj.FACTORY_STAFF_NAME)
      .input("FACTORY_STAFF_USER_NAME", obj.FACTORY_STAFF_USER_NAME)
      .input("FACTORY_STAFF_EMAIL", obj.FACTORY_STAFF_EMAIL)
      .input("FACTORY_STAFF_PASSWORD", obj.FACTORY_STAFF_PASSWORD)
      .input("FACTORY_STAFF_PKID", id)
      .query(
        `update FACTORY_STAFF set FACTORY_STAFF_NAME = @FACTORY_STAFF_NAME,FACTORY_STAFF_USER_NAME = @FACTORY_STAFF_USER_NAME,FACTORY_STAFF_EMAIL = @FACTORY_STAFF_EMAIL,FACTORY_STAFF_PASSWORD = @FACTORY_STAFF_PASSWORD where FACTORY_STAFF_PKID = @FACTORY_STAFF_PKID`
      );

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("FACTORY_STAFF_FACTORY_STAFF_FKID", id)
        .query(
          "delete from FACTORY_STAFF_FACTORY where FACTORY_STAFF_FACTORY_STAFF_FKID = @FACTORY_STAFF_FACTORY_STAFF_FKID"
        );
      for (var i = 0; i < obj.Factory.length; i++) {
        var result3 = await pool
          .request()
          .input("FACTORY_STAFF_FACTORY_STAFF_FKID", id)
          .input("FACTORY_STAFF_FACTORY_FACTORY_FKID", obj.Factory[i].value)
          .query(
            `insert into FACTORY_STAFF_FACTORY(FACTORY_STAFF_FACTORY_STAFF_FKID,FACTORY_STAFF_FACTORY_FACTORY_FKID) values(@FACTORY_STAFF_FACTORY_STAFF_FKID,@FACTORY_STAFF_FACTORY_FACTORY_FKID)`
          );
      }
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateFactoryStaff-->", error);
  }
}

async function DeleteFactoryStaff(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("FACTORY_STAFF_PKID", id)
      .query(
        `delete from FACTORY_STAFF where FACTORY_STAFF_PKID = @FACTORY_STAFF_PKID`
      );

    if (result.rowsAffected > 0) {
      let result1 = await pool
        .request()
        .input("FACTORY_STAFF_FACTORY_STAFF_FKID", id)
        .query(
          "delete from FACTORY_STAFF_FACTORY where FACTORY_STAFF_FACTORY_STAFF_FKID = @FACTORY_STAFF_FACTORY_STAFF_FKID"
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
    console.log("DeleteFactoryStaff-->", error);
  }
}

async function GetAllFactoryForDropDown() {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query("select * from FACTORY where FACTORY_ACTIVE = 1");

    if (result.recordsets[0].length > 0) {
      for (var i = 0; i < result.recordsets[0].length; i++) {
        var obj = {
          label: result.recordsets[0][i].FACTORY_NAME,
          value: result.recordsets[0][i].FACTORY_PKID.toString(),
        };
        arr.push(obj);
      }
    }

    return arr;
  } catch (error) {
    console.log("GetAllFactoryForDropDown-->", error);
    //
  }
}

module.exports = {
  GetAllFactory: GetAllFactory,
  AddFactory: AddFactory,
  UpdateFactory: UpdateFactory,
  DeleteFactory: DeleteFactory,
  GetAllFactoryStaff: GetAllFactoryStaff,
  AddFactoryStaff: AddFactoryStaff,
  UpdateFactoryStaff: UpdateFactoryStaff,
  DeleteFactoryStaff: DeleteFactoryStaff,
  GetAllFactoryForDropDown: GetAllFactoryForDropDown,
};
