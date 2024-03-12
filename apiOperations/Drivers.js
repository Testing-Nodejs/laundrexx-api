/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddDrivers(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("DRIVER_PHONE", obj.DRIVER_PHONE)
      .query("SELECT * FROM [DRIVERS] where DRIVER_PHONE = @DRIVER_PHONE");

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("DRIVER_NAME", obj.DRIVER_NAME)
        .input("DRIVER_USERNAME", obj.DRIVER_USERNAME)
        .input("DRIVER_PHONE", obj.DRIVER_PHONE)
        .input("DRIVER_EMAIL", obj.DRIVER_EMAIL)
        .input("DRIVER_PASSWORD", obj.DRIVER_PASSWORD)
        .query(
          `insert into DRIVERS(DRIVER_NAME,DRIVER_USERNAME,DRIVER_PHONE,DRIVER_EMAIL,DRIVER_PASSWORD) values(@DRIVER_NAME,@DRIVER_USERNAME,@DRIVER_PHONE,@DRIVER_EMAIL,@DRIVER_PASSWORD)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddDrivers-->", error);
  }
}

async function GetAllDrivers() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from DRIVERS");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllDrivers-->", error);
    //
  }
}

async function UpdateDrivers(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("DRIVER_NAME", obj.DRIVER_NAME)
      .input("DRIVER_USERNAME", obj.DRIVER_USERNAME)
      .input("DRIVER_PHONE", obj.DRIVER_PHONE)
      .input("DRIVER_EMAIL", obj.DRIVER_EMAIL)
      .input("DRIVER_PASSWORD", obj.DRIVER_PASSWORD)
      .input("DRIVER_PKID", id)
      .query(
        `update DRIVERS set DRIVER_NAME = @DRIVER_NAME,DRIVER_USERNAME=@DRIVER_USERNAME,DRIVER_PHONE= @DRIVER_PHONE,DRIVER_EMAIL = @DRIVER_EMAIL, DRIVER_PASSWORD = @DRIVER_PASSWORD where DRIVER_PKID = @DRIVER_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateDrivers-->", error);
  }
}

async function DeleteDrivers(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("DRIVER_PKID", id)
      .query(`delete from DRIVERS where DRIVER_PKID = @DRIVER_PKID`);

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteDrivers-->", error);
  }
}

module.exports = {
  AddDrivers: AddDrivers,
  GetAllDrivers: GetAllDrivers,
  UpdateDrivers: UpdateDrivers,
  DeleteDrivers: DeleteDrivers,
};
