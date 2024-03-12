/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function AddDigitalSignature(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("DIGITAL_SIGNATURE_NAME", obj.DIGITAL_SIGNATURE_NAME)
      .input("DIGITAL_SIGNATURE_FILE", obj.DIGITAL_SIGNATURE_FILE)
      .query(
        `insert into DIGITAL_SIGNATURE(DIGITAL_SIGNATURE_NAME,DIGITAL_SIGNATURE_FILE,DIGITAL_SIGNATURE_DATE) values(@DIGITAL_SIGNATURE_NAME,@DIGITAL_SIGNATURE_FILE,GETDATE())`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("AddDigitalSignature-->", error);
  }
}

async function GetDigitalSignature() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from DIGITAL_SIGNATURE");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetDigitalSignature-->", error);
    //
  }
}

async function UpdateDigitalSignature(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("DIGITAL_SIGNATURE_NAME", obj.DIGITAL_SIGNATURE_NAME)
      .input("DIGITAL_SIGNATURE_FILE", obj.DIGITAL_SIGNATURE_FILE)
      .input("DIGITAL_SIGNATURE_PKID", id)
      .query(
        `update DIGITAL_SIGNATURE set DIGITAL_SIGNATURE_NAME = @DIGITAL_SIGNATURE_NAME,DIGITAL_SIGNATURE_FILE = @DIGITAL_SIGNATURE_FILE where DIGITAL_SIGNATURE_PKID = @DIGITAL_SIGNATURE_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateDigitalSignature-->", error);
  }
}

async function DeleteDigitalSignature(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("DIGITAL_SIGNATURE_PKID", id)
      .query(
        `delete from DIGITAL_SIGNATURE where DIGITAL_SIGNATURE_PKID = @DIGITAL_SIGNATURE_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteDigitalSignature-->", error);
  }
}

module.exports = {
  GetDigitalSignature: GetDigitalSignature,
  AddDigitalSignature: AddDigitalSignature,
  UpdateDigitalSignature: UpdateDigitalSignature,
  DeleteDigitalSignature: DeleteDigitalSignature,
};
