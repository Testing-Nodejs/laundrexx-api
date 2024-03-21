/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetAllItemCategory() {
  try {
    let pool = await sql.connect(config);

    let result = await pool.request().query("select * from ITEM_CATEGORY");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllItemCategory-->", error);
    //
  }
}

async function AddItemCategory(obj) {
  try {
    console.log(obj)
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("ITEM_CATEGORY_NAME", obj.ITEM_CATEGORY_NAME)
      .query(
        "SELECT * FROM [ITEM_CATEGORY] where ITEM_CATEGORY_NAME = @ITEM_CATEGORY_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("ITEM_CATEGORY_NAME", obj.ITEM_CATEGORY_NAME)
        .query(
          `insert into ITEM_CATEGORY(ITEM_CATEGORY_NAME) values(@ITEM_CATEGORY_NAME)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddItemCategory-->", error);
  }
}

async function UpdateItemCategory(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("ITEM_CATEGORY_NAME", obj.ITEM_CATEGORY_NAME)
      .input("ITEM_CATEGORY_PKID", id)
      .query(
        `update ITEM_CATEGORY set ITEM_CATEGORY_NAME = @ITEM_CATEGORY_NAME where ITEM_CATEGORY_PKID = @ITEM_CATEGORY_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateItemCategory-->", error);
  }
}

async function DeleteItemCategory(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("ITEM_CATEGORY_PKID", id)
      .query(
        "delete from ITEM_CATEGORY where ITEM_CATEGORY_PKID = @ITEM_CATEGORY_PKID"
      );
    if (result1.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteItemCategory-->", error);
  }
}

async function GetAllItemSubCategory() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select * from SUB_CATEGORY join ITEM_CATEGORY on ITEM_CATEGORY_PKID =  SUB_CATEGORY_CATEGORY_FKID"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllItemSubCategory-->", error);
    //
  }
}

async function GetAllItemSubCategoryByCategory(CategoryID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select * from SUB_CATEGORY join ITEM_CATEGORY on ITEM_CATEGORY_PKID =  SUB_CATEGORY_CATEGORY_FKID where SUB_CATEGORY_CATEGORY_FKID = '" +
          CategoryID +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllItemSubCategory-->", error);
    //
  }
}

async function AddItemSubCategory(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("SUB_CATEGORY_NAME", obj.SUB_CATEGORY_NAME)
      .input("SUB_CATEGORY_CATEGORY_FKID", obj.SUB_CATEGORY_CATEGORY_FKID)
      .query(
        "SELECT * FROM [SUB_CATEGORY] where SUB_CATEGORY_NAME = @SUB_CATEGORY_NAME and SUB_CATEGORY_CATEGORY_FKID = @SUB_CATEGORY_CATEGORY_FKID"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("SUB_CATEGORY_NAME", obj.SUB_CATEGORY_NAME)
        .input("SUB_CATEGORY_CATEGORY_FKID", obj.SUB_CATEGORY_CATEGORY_FKID)
        .query(
          `insert into SUB_CATEGORY(SUB_CATEGORY_NAME, SUB_CATEGORY_CATEGORY_FKID) values(@SUB_CATEGORY_NAME, @SUB_CATEGORY_CATEGORY_FKID)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddItemSubCategory-->", error);
  }
}

async function UpdateItemSubCategory(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("SUB_CATEGORY_CATEGORY_FKID", obj.SUB_CATEGORY_CATEGORY_FKID)
      .input("SUB_CATEGORY_NAME", obj.SUB_CATEGORY_NAME)
      .input("SUB_CATEGORY_PKID", id)
      .query(
        `update SUB_CATEGORY set SUB_CATEGORY_CATEGORY_FKID = @SUB_CATEGORY_CATEGORY_FKID, SUB_CATEGORY_NAME = @SUB_CATEGORY_NAME where SUB_CATEGORY_PKID = @SUB_CATEGORY_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateItemSubCategory-->", error);
  }
}

async function DeleteItemSubCategory(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("SUB_CATEGORY_PKID", id)
      .query(
        "delete from SUB_CATEGORY where SUB_CATEGORY_PKID = @SUB_CATEGORY_PKID"
      );
    if (result1.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteItemSubCategory-->", error);
  }
}

async function GetAllItems() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select ITEMS.*,SUB_CATEGORY_NAME,ITEM_CATEGORY_NAME from ITEMS join ITEM_CATEGORY on ITEM_CATEGORY_PKID =  ITEMS_CATEGORY_FKID join SUB_CATEGORY on ITEMS_SUB_CATEGORY_FKID = SUB_CATEGORY_PKID"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllItems-->", error);
    //
  }
}

async function GetAllItemsForPlaceOrder(ServiceCatID, OutletID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select [ITEMS_PKID], [ITEMS_DISPLAY_NAME],(case when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 1' then ITEM_PRICE_TIER_1 when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 2' then ITEM_PRICE_TIER_2 when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 3' then ITEM_PRICE_TIER_3 when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 4' then ITEM_PRICE_TIER_4 else null end) as ItemPrice from [dbo].[ITEMS] join [dbo].[ITEM_PRICE] on [ITEM_PRICE_ITEM_FKID] = [ITEMS_PKID] where [ITEM_PRICE_SERVICE_CATEGORY_FKID] = '" +
          ServiceCatID +
          "'"
      );

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var obj = {
        label: result.recordsets[0][i].ITEMS_DISPLAY_NAME,
        id: result.recordsets[0][i].ITEMS_PKID,
        Price: result.recordsets[0][i].ItemPrice,
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("GetAllItemsForPlaceOrder-->", error);
    //
  }
}

async function GetAllItemsForPrice(CatID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select ITEMS.*,SUB_CATEGORY_NAME,ITEM_CATEGORY_NAME,isnull(ITEM_PRICE_TIER_1, '-') as PriceStatus,isnull(ITEM_PRICE_TIER_1, '') as tier1,isnull(ITEM_PRICE_TIER_2, '') as tier2,isnull(ITEM_PRICE_TIER_3, '') as tier3,isnull(ITEM_PRICE_TIER_4, '') as tier4 from ITEMS join ITEM_CATEGORY on ITEM_CATEGORY_PKID =  ITEMS_CATEGORY_FKID join SUB_CATEGORY on ITEMS_SUB_CATEGORY_FKID = SUB_CATEGORY_PKID left join [dbo].[ITEM_PRICE] on [ITEM_PRICE_ITEM_FKID] = [ITEMS_PKID] and ITEM_PRICE_SERVICE_CATEGORY_FKID = '" +
          CatID +
          "' order by ITEMS_NAME asc"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllItemsForPrice-->", error);
    //
  }
}

async function AddItems(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("ITEMS_DISPLAY_NAME", obj.ITEMS_DISPLAY_NAME)
      .query(
        "SELECT * FROM [ITEMS] where ITEMS_DISPLAY_NAME = @ITEMS_DISPLAY_NAME"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("ITEMS_CATEGORY_FKID", obj.ITEMS_CATEGORY_FKID)
        .input("ITEMS_SUB_CATEGORY_FKID", obj.ITEMS_SUB_CATEGORY_FKID)
        .input("ITEMS_NAME", obj.ITEMS_NAME)
        .input("ITEMS_DISPLAY_NAME", obj.ITEMS_DISPLAY_NAME)
        .query(
          `insert into ITEMS(ITEMS_CATEGORY_FKID, ITEMS_SUB_CATEGORY_FKID,ITEMS_NAME,ITEMS_DISPLAY_NAME,ITEMS_ACTIVE) values(@ITEMS_CATEGORY_FKID, @ITEMS_SUB_CATEGORY_FKID,@ITEMS_NAME,@ITEMS_DISPLAY_NAME,1)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddItemSubCategory-->", error);
  }
}

async function UpdateItems(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("ITEMS_CATEGORY_FKID", obj.ITEMS_CATEGORY_FKID)
      .input("ITEMS_SUB_CATEGORY_FKID", obj.ITEMS_SUB_CATEGORY_FKID)
      .input("ITEMS_NAME", obj.ITEMS_NAME)
      .input("ITEMS_DISPLAY_NAME", obj.ITEMS_DISPLAY_NAME)
      .input("ITEMS_PKID", id)
      .query(
        `update ITEMS set ITEMS_CATEGORY_FKID = @ITEMS_CATEGORY_FKID, ITEMS_SUB_CATEGORY_FKID = @ITEMS_SUB_CATEGORY_FKID , ITEMS_NAME = @ITEMS_NAME, ITEMS_DISPLAY_NAME = @ITEMS_DISPLAY_NAME where ITEMS_PKID = @ITEMS_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateItemSubCategory-->", error);
  }
}

async function DeleteItems(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("ITEMS_PKID", id)
      .query("delete from ITEMS where ITEMS_PKID = @ITEMS_PKID");
    if (result1.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteItems-->", error);
  }
}

async function GetAllAdditionalService() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select ADDITIONAL_SERVICE.*,SERVICE_CATEGORY_NAME from ADDITIONAL_SERVICE join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID =  ADDITIONAL_SERVICE_CATEGORY_FKID"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllAdditionalService-->", error);
    //
  }
}

async function GetAllAdditionalServiceForPrice(CatID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select ADDITIONAL_SERVICE.*,isnull(ADITIONAL_ITEM_PRICE_TIER_1, '') as tier1,isnull(ADITIONAL_ITEM_PRICE_TIER_1, '-') as PriceStatus,isnull(ADITIONAL_ITEM_PRICE_TIER_2, '') as tier2,isnull(ADITIONAL_ITEM_PRICE_TIER_3, '') as tier3,isnull(ADITIONAL_ITEM_PRICE_TIER_4, '') as tier4 from ADDITIONAL_SERVICE left join [dbo].[ADITIONAL_ITEM_PRICE] on ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID = ADDITIONAL_SERVICE_PKID and ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID = '" +
          CatID +
          "' where ADDITIONAL_SERVICE_CATEGORY_FKID = '" +
          CatID +
          "' order by ADDITIONAL_SERVICE_NAME asc"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllAdditionalServiceForPrice-->", error);
    //
  }
}

async function AdditionalServiceByServiceCategory(CatID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select ADDITIONAL_SERVICE.*,SERVICE_CATEGORY_NAME from ADDITIONAL_SERVICE join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID =  ADDITIONAL_SERVICE_CATEGORY_FKID where ADDITIONAL_SERVICE_CATEGORY_FKID = '" +
          CatID +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("AdditionalServiceByServiceCategory-->", error);
    //
  }
}

async function AddAdditionalService(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result4 = await pool
      .request()
      .input("ADDITIONAL_SERVICE_NAME", obj.ADDITIONAL_SERVICE_NAME)
      .input(
        "ADDITIONAL_SERVICE_CATEGORY_FKID",
        obj.ADDITIONAL_SERVICE_CATEGORY_FKID
      )
      .query(
        "SELECT * FROM [ADDITIONAL_SERVICE] where ADDITIONAL_SERVICE_NAME = @ADDITIONAL_SERVICE_NAME and ADDITIONAL_SERVICE_CATEGORY_FKID = @ADDITIONAL_SERVICE_CATEGORY_FKID"
      );

    if (result4.recordsets[0].length > 0) {
      res = "0";
    } else {
      var result = await pool
        .request()
        .input("ADDITIONAL_SERVICE_NAME", obj.ADDITIONAL_SERVICE_NAME)
        .input(
          "ADDITIONAL_SERVICE_CATEGORY_FKID",
          obj.ADDITIONAL_SERVICE_CATEGORY_FKID
        )
        .query(
          `insert into ADDITIONAL_SERVICE(ADDITIONAL_SERVICE_NAME, ADDITIONAL_SERVICE_CATEGORY_FKID) values(@ADDITIONAL_SERVICE_NAME, @ADDITIONAL_SERVICE_CATEGORY_FKID)`
        );

      if (result.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    }
    return res;
  } catch (error) {
    console.log("AddAdditionalService-->", error);
  }
}

async function UpdateAdditionalService(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .input("ADDITIONAL_SERVICE_NAME", obj.ADDITIONAL_SERVICE_NAME)
      .input(
        "ADDITIONAL_SERVICE_CATEGORY_FKID",
        obj.ADDITIONAL_SERVICE_CATEGORY_FKID
      )
      .input("ADDITIONAL_SERVICE_PKID", id)
      .query(
        `update ADDITIONAL_SERVICE set ADDITIONAL_SERVICE_NAME = @ADDITIONAL_SERVICE_NAME, ADDITIONAL_SERVICE_CATEGORY_FKID = @ADDITIONAL_SERVICE_CATEGORY_FKID where ADDITIONAL_SERVICE_PKID = @ADDITIONAL_SERVICE_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("UpdateAdditionalService-->", error);
  }
}

async function DeleteAdditionalService(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let result1 = await pool
      .request()
      .input("ADDITIONAL_SERVICE_PKID", id)
      .query(
        "delete from ADDITIONAL_SERVICE where ADDITIONAL_SERVICE_PKID = @ADDITIONAL_SERVICE_PKID"
      );
    if (result1.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteAdditionalService-->", error);
  }
}

async function AddItemPrice(ServiceCat, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result1 = await pool
      .request()
      .input("ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
      .query(
        `select * from ITEM_PRICE where ITEM_PRICE_SERVICE_CATEGORY_FKID = @ITEM_PRICE_SERVICE_CATEGORY_FKID`
      );

    if (result1.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .input("ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
        .query(
          `delete from ITEM_PRICE where ITEM_PRICE_SERVICE_CATEGORY_FKID = @ITEM_PRICE_SERVICE_CATEGORY_FKID`
        );
      for (var i = 0; i < obj.Items.length; i++) {
        if (obj.Items[i].tier1 === "" || obj.Items[i].tier1 === null) {
        } else {
          var result = await pool
            .request()
            .input("ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
            .input("ITEM_PRICE_CATEGORY_FKID", obj.Items[i].ITEMS_CATEGORY_FKID)
            .input(
              "ITEM_PRICE_SUB_CATEGORY_FKID",
              obj.Items[i].ITEMS_SUB_CATEGORY_FKID
            )
            .input("ITEM_PRICE_ITEM_FKID", obj.Items[i].ITEMS_PKID)
            .input("ITEM_PRICE_TIER_1", obj.Items[i].tier1)
            .input("ITEM_PRICE_TIER_2", obj.Items[i].tier2)
            .input("ITEM_PRICE_TIER_3", obj.Items[i].tier3)
            .input("ITEM_PRICE_TIER_4", obj.Items[i].tier4)
            .query(
              `insert into ITEM_PRICE(ITEM_PRICE_SERVICE_CATEGORY_FKID,ITEM_PRICE_CATEGORY_FKID, ITEM_PRICE_SUB_CATEGORY_FKID,ITEM_PRICE_ITEM_FKID,ITEM_PRICE_TIER_1,ITEM_PRICE_TIER_2,ITEM_PRICE_TIER_3,ITEM_PRICE_TIER_4) values(@ITEM_PRICE_SERVICE_CATEGORY_FKID,@ITEM_PRICE_CATEGORY_FKID, @ITEM_PRICE_SUB_CATEGORY_FKID,@ITEM_PRICE_ITEM_FKID,@ITEM_PRICE_TIER_1,@ITEM_PRICE_TIER_2,@ITEM_PRICE_TIER_3,@ITEM_PRICE_TIER_4)`
            );
        }
      }
      res = true;
    } else {
      for (var i = 0; i < obj.Items.length; i++) {
        if (obj.Items[i].tier1 === "" || obj.Items[i].tier1 === null) {
        } else {
          var result = await pool
            .request()
            .input("ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
            .input("ITEM_PRICE_CATEGORY_FKID", obj.Items[i].ITEMS_CATEGORY_FKID)
            .input(
              "ITEM_PRICE_SUB_CATEGORY_FKID",
              obj.Items[i].ITEMS_SUB_CATEGORY_FKID
            )
            .input("ITEM_PRICE_ITEM_FKID", obj.Items[i].ITEMS_PKID)
            .input("ITEM_PRICE_TIER_1", obj.Items[i].tier1)
            .input("ITEM_PRICE_TIER_2", obj.Items[i].tier2)
            .input("ITEM_PRICE_TIER_3", obj.Items[i].tier3)
            .input("ITEM_PRICE_TIER_4", obj.Items[i].tier4)
            .query(
              `insert into ITEM_PRICE(ITEM_PRICE_SERVICE_CATEGORY_FKID,ITEM_PRICE_CATEGORY_FKID, ITEM_PRICE_SUB_CATEGORY_FKID,ITEM_PRICE_ITEM_FKID,ITEM_PRICE_TIER_1,ITEM_PRICE_TIER_2,ITEM_PRICE_TIER_3,ITEM_PRICE_TIER_4) values(@ITEM_PRICE_SERVICE_CATEGORY_FKID,@ITEM_PRICE_CATEGORY_FKID, @ITEM_PRICE_SUB_CATEGORY_FKID,@ITEM_PRICE_ITEM_FKID,@ITEM_PRICE_TIER_1,@ITEM_PRICE_TIER_2,@ITEM_PRICE_TIER_3,@ITEM_PRICE_TIER_4)`
            );
        }
      }
      res = true;
    }

    return res;
  } catch (error) {
    console.log("AddItemPrice-->", error);
  }
}

async function AddAdditionalServicePrice(ServiceCat, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result1 = await pool
      .request()
      .input("ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
      .query(
        `select * from ADITIONAL_ITEM_PRICE where ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID = @ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID`
      );

    if (result1.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .input("ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
        .query(
          `delete from ADITIONAL_ITEM_PRICE where ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID = @ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID`
        );
      for (var i = 0; i < obj.Items.length; i++) {
        if (obj.Items[i].tier1 === "" || obj.Items[i].tier1 === null) {
        } else {
          var result = await pool
            .request()
            .input("ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
            .input(
              "ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID",
              obj.Items[i].ADDITIONAL_SERVICE_PKID
            )
            .input("ADITIONAL_ITEM_PRICE_TIER_1", obj.Items[i].tier1)
            .input("ADITIONAL_ITEM_PRICE_TIER_2", obj.Items[i].tier2)
            .input("ADITIONAL_ITEM_PRICE_TIER_3", obj.Items[i].tier3)
            .input("ADITIONAL_ITEM_PRICE_TIER_4", obj.Items[i].tier4)
            .query(
              `insert into ADITIONAL_ITEM_PRICE(ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID,ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID, ADITIONAL_ITEM_PRICE_TIER_1, ADITIONAL_ITEM_PRICE_TIER_2, ADITIONAL_ITEM_PRICE_TIER_3, ADITIONAL_ITEM_PRICE_TIER_4) values(@ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID,@ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID, @ADITIONAL_ITEM_PRICE_TIER_1, @ADITIONAL_ITEM_PRICE_TIER_2, @ADITIONAL_ITEM_PRICE_TIER_3, @ADITIONAL_ITEM_PRICE_TIER_4)`
            );
        }
      }
      res = true;
    } else {
      for (var i = 0; i < obj.Items.length; i++) {
        if (obj.Items[i].tier1 === "" || obj.Items[i].tier1 === null) {
        } else {
          var result = await pool
            .request()
            .input("ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID", ServiceCat)
            .input(
              "ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID",
              obj.Items[i].ADDITIONAL_SERVICE_PKID
            )
            .input("ADITIONAL_ITEM_PRICE_TIER_1", obj.Items[i].tier1)
            .input("ADITIONAL_ITEM_PRICE_TIER_2", obj.Items[i].tier2)
            .input("ADITIONAL_ITEM_PRICE_TIER_3", obj.Items[i].tier3)
            .input("ADITIONAL_ITEM_PRICE_TIER_4", obj.Items[i].tier4)
            .query(
              `insert into ADITIONAL_ITEM_PRICE(ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID,ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID, ADITIONAL_ITEM_PRICE_TIER_1, ADITIONAL_ITEM_PRICE_TIER_2, ADITIONAL_ITEM_PRICE_TIER_3, ADITIONAL_ITEM_PRICE_TIER_4) values(@ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID,@ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID, @ADITIONAL_ITEM_PRICE_TIER_1, @ADITIONAL_ITEM_PRICE_TIER_2, @ADITIONAL_ITEM_PRICE_TIER_3, @ADITIONAL_ITEM_PRICE_TIER_4)`
            );
        }
      }
      res = true;
    }

    return res;
  } catch (error) {
    console.log("AddAdditionalServicePrice-->", error);
  }
}

async function GetAllAdditionalServiceForPlaceOrder(ServiceCatID, OutletID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select [ADDITIONAL_SERVICE_PKID], [ADDITIONAL_SERVICE_NAME],(case when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 1' then ADITIONAL_ITEM_PRICE_TIER_1 when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 2' then ADITIONAL_ITEM_PRICE_TIER_2 when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 3' then ADITIONAL_ITEM_PRICE_TIER_3 when (select [STORE_PRICE_TIER] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "') = 'Tier 4' then ADITIONAL_ITEM_PRICE_TIER_4 else null end) as ItemPrice from [dbo].[ADDITIONAL_SERVICE] join [dbo].[ADITIONAL_ITEM_PRICE] on [ADITIONAL_ITEM_PRICE_ADITIONAL_ITEM_FKID] = [ADDITIONAL_SERVICE_PKID] where [ADITIONAL_ITEM_PRICE_SERVICE_CATEGORY_FKID] = '" +
          ServiceCatID +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllAdditionalServiceForPlaceOrder-->", error);
    //
  }
}

module.exports = {
  GetAllItemCategory: GetAllItemCategory,
  AddItemCategory: AddItemCategory,
  UpdateItemCategory: UpdateItemCategory,
  DeleteItemCategory: DeleteItemCategory,
  GetAllItemSubCategory: GetAllItemSubCategory,
  GetAllItemSubCategoryByCategory: GetAllItemSubCategoryByCategory,
  AddItemSubCategory: AddItemSubCategory,
  UpdateItemSubCategory: UpdateItemSubCategory,
  DeleteItemSubCategory: DeleteItemSubCategory,
  GetAllItems: GetAllItems,
  GetAllItemsForPlaceOrder: GetAllItemsForPlaceOrder,
  GetAllItemsForPrice: GetAllItemsForPrice,
  AddItems: AddItems,
  UpdateItems: UpdateItems,
  DeleteItems: DeleteItems,
  GetAllAdditionalService: GetAllAdditionalService,
  GetAllAdditionalServiceForPrice: GetAllAdditionalServiceForPrice,
  AdditionalServiceByServiceCategory: AdditionalServiceByServiceCategory,
  AddAdditionalService: AddAdditionalService,
  UpdateAdditionalService: UpdateAdditionalService,
  DeleteAdditionalService: DeleteAdditionalService,
  AddItemPrice: AddItemPrice,
  AddAdditionalServicePrice: AddAdditionalServicePrice,
  GetAllAdditionalServiceForPlaceOrder: GetAllAdditionalServiceForPlaceOrder,
};
