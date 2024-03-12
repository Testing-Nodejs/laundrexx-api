/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");

async function GetManagerNavigation(id) {
  try {
    var NavigationArr = [];
    var pool = await sql.connect(config);

    var MainQuery = "";
    if (id === "All") {
      MainQuery =
        "select distinct [ROLES_MODULES_PKID],[ROLES_MODULES_NAME],[ROLES_MODULES_IS_SUBMODULES],[ROLES_MODULES_LINK] from [dbo].[ROLES_MODULES] where ROLES_MODULES_ACTIVE = '1'";
    } else {
      MainQuery =
        "select distinct [ROLES_MODULES_PKID],[ROLES_MODULES_NAME],[ROLES_MODULES_IS_SUBMODULES],[ROLES_MODULES_LINK] from [dbo].[USER_ROLE] join [dbo].[ROLES_MODULES] on [USER_ROLE_MODULE_FKID] = [ROLES_MODULES_PKID] where USER_ROLE_USER_TYPE_FKID = '" +
        id +
        "'";
    }

    var result = await pool.request().query(MainQuery);
    var Modules = result.recordsets[0];
    for (let i = 0; i < Modules.length; i++) {
      var InnerNavigaation = [];
      if (Modules[i].ROLES_MODULES_IS_SUBMODULES === true) {
        var InnerResult = await pool
          .request()
          .input("ROLE_SUB_MODULES_MODULE_FKID", Modules[i].ROLES_MODULES_PKID)
          .input("USER_ROLE_USER_TYPE_FKID", id)
          .query(
            id === "All"?"select distinct [ROLE_SUB_MODULES_PKID],[ROLE_SUB_MODULES_NAME],[ROLE_SUB_MODULES_PAGE_LINK] from [dbo].[ROLE_SUB_MODULES] where [ROLE_SUB_MODULES_MODULE_FKID] = @ROLE_SUB_MODULES_MODULE_FKID order by [ROLE_SUB_MODULES_PKID]":"select distinct [ROLE_SUB_MODULES_PKID],[ROLE_SUB_MODULES_NAME],[ROLE_SUB_MODULES_PAGE_LINK] from [dbo].[ROLE_SUB_MODULES]  join [dbo].[USER_ROLE] on [USER_ROLE_SUB_MODULE_FKID] = [ROLE_SUB_MODULES_PKID] and USER_ROLE_USER_TYPE_FKID = @USER_ROLE_USER_TYPE_FKID where [ROLE_SUB_MODULES_MODULE_FKID] = @ROLE_SUB_MODULES_MODULE_FKID order by [ROLE_SUB_MODULES_PKID]"
          );
        var SubModules = InnerResult.recordsets[0];
        for (let j = 0; j < SubModules.length; j++) {
          var InnerObj = {
            _tag: "CSidebarNavItem",
            name: SubModules[j].ROLE_SUB_MODULES_NAME,
            to: SubModules[j].ROLE_SUB_MODULES_PAGE_LINK,
            icon: "cilArrowRight",
          };
          InnerNavigaation.push(InnerObj);
        }
        var MainObj = {
          _tag: "CSidebarNavDropdown",
          name: Modules[i].ROLES_MODULES_NAME,
          _children: InnerNavigaation,
          icon: "cil-cursor",
        };
        NavigationArr.push(MainObj);
      } else {
        var obj = {
          _tag: "CSidebarNavItem",
          name: Modules[i].ROLES_MODULES_NAME,
          to: Modules[i].ROLES_MODULES_LINK,
          icon: "cil-cursor",
        };
        NavigationArr.push(obj);
      }
    }
    return NavigationArr;
  } catch (error) {
    console.log("GetManagerNavigation-->", error);
  }
}

async function GetAllRoles() {
  try {
    var NavigationArr = [];
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select distinct [ROLES_MODULES_PKID],[ROLES_MODULES_NAME],[ROLES_MODULES_IS_SUBMODULES],[ROLES_MODULES_LINK] from [dbo].[ROLES_MODULES] where ROLES_MODULES_ACTIVE = '1'"
      );
    var Modules = result.recordsets[0];
    for (let i = 0; i < Modules.length; i++) {
      var InnerNavigaation = [];
      if (Modules[i].ROLES_MODULES_IS_SUBMODULES === true) {
        var InnerResult = await pool
          .request()
          .input("ROLE_SUB_MODULES_MODULE_FKID", Modules[i].ROLES_MODULES_PKID)
          .query(
            "select distinct [ROLE_SUB_MODULES_PKID],[ROLE_SUB_MODULES_NAME],[ROLE_SUB_MODULES_PAGE_LINK] from [dbo].[ROLE_SUB_MODULES] where [ROLE_SUB_MODULES_MODULE_FKID] = @ROLE_SUB_MODULES_MODULE_FKID order by [ROLE_SUB_MODULES_PKID]"
          );
        var SubModules = InnerResult.recordsets[0];
        for (let j = 0; j < SubModules.length; j++) {
          var InnerObj = {
            id: SubModules[j].ROLE_SUB_MODULES_PKID,
            name: SubModules[j].ROLE_SUB_MODULES_NAME,
            checked: false,
            ParentID: Modules[i].ROLES_MODULES_PKID,
          };
          InnerNavigaation.push(InnerObj);
        }
        var MainObj = {
          name: Modules[i].ROLES_MODULES_NAME,
          id: Modules[i].ROLES_MODULES_PKID,
          familyMembers: InnerNavigaation,
          checked: false,
        };
        NavigationArr.push(MainObj);
      } else {
        var obj = {
          name: Modules[i].ROLES_MODULES_NAME,
          id: Modules[i].ROLES_MODULES_PKID,
          familyMembers: [],
          checked: false,
        };
        NavigationArr.push(obj);
      }
    }
    return NavigationArr;
  } catch (error) {
    console.log("GetAllRoles-->", error);
  }
}

async function GetAllRolesByUserType(id) {
  try {
    var NavigationArr = [];
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select distinct [ROLES_MODULES_PKID],[ROLES_MODULES_NAME],[ROLES_MODULES_IS_SUBMODULES],[ROLES_MODULES_LINK],case when isnull(USER_ROLE_PKID, 0) = 0 then 0 else 1 end as USER_ROLE_PKID from [dbo].[ROLES_MODULES] left join USER_ROLE on USER_ROLE_MODULE_FKID = ROLES_MODULES_PKID and USER_ROLE_USER_TYPE_FKID = '" +
          id +
          "' where ROLES_MODULES_ACTIVE = '1'"
      );
    var Modules = result.recordsets[0];
    for (let i = 0; i < Modules.length; i++) {
      var InnerNavigaation = [];
      if (Modules[i].ROLES_MODULES_IS_SUBMODULES === true) {
        var InnerResult = await pool
          .request()
          .input("ROLE_SUB_MODULES_MODULE_FKID", Modules[i].ROLES_MODULES_PKID)
          .input("USER_ROLE_USER_TYPE_FKID", id)
          .input("USER_ROLE_MODULE_FKID", Modules[i].ROLES_MODULES_PKID)
          .query(
            "select distinct [ROLE_SUB_MODULES_PKID],[ROLE_SUB_MODULES_NAME],[ROLE_SUB_MODULES_PAGE_LINK],case when isnull(USER_ROLE_PKID, 0) = 0 then 0 else 1 end as USER_ROLE_PKID from [dbo].[ROLE_SUB_MODULES] left join USER_ROLE on USER_ROLE_SUB_MODULE_FKID = ROLE_SUB_MODULES_PKID and USER_ROLE_USER_TYPE_FKID = @USER_ROLE_USER_TYPE_FKID and USER_ROLE_MODULE_FKID = @USER_ROLE_MODULE_FKID where [ROLE_SUB_MODULES_MODULE_FKID] = @ROLE_SUB_MODULES_MODULE_FKID order by [ROLE_SUB_MODULES_PKID]"
          );
        var SubModules = InnerResult.recordsets[0];
        for (let j = 0; j < SubModules.length; j++) {
          var InnerObj = {
            id: SubModules[j].ROLE_SUB_MODULES_PKID,
            name: SubModules[j].ROLE_SUB_MODULES_NAME,
            checked: SubModules[j].USER_ROLE_PKID,
            ParentID: Modules[i].ROLES_MODULES_PKID,
          };
          InnerNavigaation.push(InnerObj);
        }
        var MainObj = {
          name: Modules[i].ROLES_MODULES_NAME,
          id: Modules[i].ROLES_MODULES_PKID,
          familyMembers: InnerNavigaation,
          checked: Modules[i].USER_ROLE_PKID,
        };
        NavigationArr.push(MainObj);
      } else {
        var obj = {
          name: Modules[i].ROLES_MODULES_NAME,
          id: Modules[i].ROLES_MODULES_PKID,
          familyMembers: [],
          checked: Modules[i].USER_ROLE_PKID,
        };
        NavigationArr.push(obj);
      }
    }
    return NavigationArr;
  } catch (error) {
    console.log("GetAllRolesByUserType-->", error);
  }
}

module.exports = {
  GetManagerNavigation: GetManagerNavigation,
  GetAllRoles: GetAllRoles,
  GetAllRolesByUserType: GetAllRolesByUserType,
};
