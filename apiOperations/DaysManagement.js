/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetAllHoliday() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from HOLIDAYS");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllHoliday-->", error);
    //
  }
}

async function AddHoliday(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("HOLIDAYS_NAME", obj.HOLIDAYS_NAME)
      .query("SELECT * FROM [HOLIDAYS] where HOLIDAYS_NAME = @HOLIDAYS_NAME");

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("HOLIDAYS_NAME", obj.HOLIDAYS_NAME)
        .input("HOLIDAYS_DATE", obj.HOLIDAYS_DATE)
        .query(
          `insert into HOLIDAYS(HOLIDAYS_NAME,HOLIDAYS_DATE) values(@HOLIDAYS_NAME,@HOLIDAYS_DATE)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddHoliday-->", error);
  }
}

async function UpdateHoliday(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("HOLIDAYS_NAME", obj.HOLIDAYS_NAME)
      .input("HOLIDAYS_DATE", obj.HOLIDAYS_DATE)
      .input("HOLIDAYS_PKID", id)
      .query(
        `update HOLIDAYS set HOLIDAYS_NAME = @HOLIDAYS_NAME, HOLIDAYS_DATE = @HOLIDAYS_DATE where HOLIDAYS_PKID = @HOLIDAYS_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateHoliday-->", error);
  }
}

async function DeleteHoliday(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("HOLIDAYS_PKID", id)
      .query("delete from HOLIDAYS where HOLIDAYS_PKID = @HOLIDAYS_PKID");
    if (result1.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteHoliday-->", error);
  }
}

async function GetAllDueDates() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select DUE_DATES.*,SERVICE_CATEGORY_NAME,SERVICE_CATEGORY_CODE,SERVICE_TYPE_NAME,SERVICE_TYPE_CODE from DUE_DATES join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = DUE_DATE_SERVICE_CATEGORY_FKID join  SERVICE_TYPE on SERVICE_TYPE_PKID = DUE_DATE_SERVICE_TYPE_FKID"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllDueDates-->", error);
    //
  }
}

async function AddDueDates(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input(
        "DUE_DATE_SERVICE_CATEGORY_FKID",
        obj.DUE_DATE_SERVICE_CATEGORY_FKID
      )
      .input("DUE_DATE_SERVICE_TYPE_FKID", obj.DUE_DATE_SERVICE_TYPE_FKID)
      .query(
        "SELECT * FROM [DUE_DATES] where DUE_DATE_SERVICE_CATEGORY_FKID = @DUE_DATE_SERVICE_CATEGORY_FKID and DUE_DATE_SERVICE_TYPE_FKID = @DUE_DATE_SERVICE_TYPE_FKID"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input(
          "DUE_DATE_SERVICE_CATEGORY_FKID",
          obj.DUE_DATE_SERVICE_CATEGORY_FKID
        )
        .input("DUE_DATE_SERVICE_TYPE_FKID", obj.DUE_DATE_SERVICE_TYPE_FKID)
        .input("DUE_DATE_NO_OF_DAYS", obj.DUE_DATE_NO_OF_DAYS)
        .query(
          `insert into DUE_DATES(DUE_DATE_SERVICE_CATEGORY_FKID,DUE_DATE_SERVICE_TYPE_FKID,DUE_DATE_NO_OF_DAYS) values(@DUE_DATE_SERVICE_CATEGORY_FKID,@DUE_DATE_SERVICE_TYPE_FKID,@DUE_DATE_NO_OF_DAYS)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddDueDates-->", error);
  }
}

async function UpdateDueDates(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input(
        "DUE_DATE_SERVICE_CATEGORY_FKID",
        obj.DUE_DATE_SERVICE_CATEGORY_FKID
      )
      .input("DUE_DATE_SERVICE_TYPE_FKID", obj.DUE_DATE_SERVICE_TYPE_FKID)
      .input("DUE_DATE_NO_OF_DAYS", obj.DUE_DATE_NO_OF_DAYS)
      .input("DUE_DATE_PKID", id)
      .query(
        `update DUE_DATES set DUE_DATE_SERVICE_CATEGORY_FKID = @DUE_DATE_SERVICE_CATEGORY_FKID, DUE_DATE_SERVICE_TYPE_FKID = @DUE_DATE_SERVICE_TYPE_FKID, DUE_DATE_NO_OF_DAYS = @DUE_DATE_NO_OF_DAYS where DUE_DATE_PKID = @DUE_DATE_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateDueDates-->", error);
  }
}

async function DeleteDueDates(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("DUE_DATE_PKID", id)
      .query("delete from DUE_DATES where DUE_DATE_PKID = @DUE_DATE_PKID");
    if (result1.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteDueDates-->", error);
  }
}

module.exports = {
  GetAllHoliday: GetAllHoliday,
  AddHoliday: AddHoliday,
  UpdateHoliday: UpdateHoliday,
  DeleteHoliday: DeleteHoliday,
  GetAllDueDates: GetAllDueDates,
  AddDueDates: AddDueDates,
  UpdateDueDates: UpdateDueDates,
  DeleteDueDates: DeleteDueDates,
};
