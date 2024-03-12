/*
 * @Author: Hey Kimo here!
 * @Date: 2022-02-07 18:02:44
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-08-18 15:28:27
 */
"use strict";
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const nocache = require("nocache");

var app = express();
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

var router = express.Router();
// using bodyParser to parse JSON bodies into JS objects
router.use(bodyParser.json());

// -------Operations Files ----------
var Logins = require("./apiOperations/Logins");
var Roles = require("./apiOperations/Roles");
var ServiceCategoryAndType = require("./apiOperations/ServiceCategoryAndType");
var UserType = require("./apiOperations/UserType");
var Users = require("./apiOperations/Users");
var Factory = require("./apiOperations/Factory");
var Outlets = require("./apiOperations/StoreOrOutlet");
var DigitalSignature = require("./apiOperations/DigitalSignature");
var Items = require("./apiOperations/Items");
var Customers = require("./apiOperations/Customers");
var Coupon = require("./apiOperations/Coupons");
var Holiday = require("./apiOperations/DaysManagement");
var Drivers = require("./apiOperations/Drivers");
var OutletOrders = require("./apiOperations/OutletOrders");
var Pickup = require("./apiOperations/Pickup");
var OutletDayClose = require("./apiOperations/OutletDayClose");
var FactoryModule = require("./apiOperations/FactoryModule");
var OutletIntake = require("./apiOperations/OutletIntake");
var OutletOrderDelivery = require("./apiOperations/OutletOrderDelivery");

// ----------------Zeus Routes for APP--------------------------------------

// ----------------Building a Secure Node js REST API---------------------//
app.use(express.static(__dirname + "/resources/static/assets/uploads"));
app.use(express.static("public"));
app.use(express.static("/resources/static/assets/uploads"));
app.get("/*", function (req, res, next) {
  res.setHeader("Last-Modified", new Date().toUTCString());
  next();
});

// // adding Helmet to enhance your Rest API's security
app.use(helmet());
// adding morgan to log HTTP requests
app.use(morgan("dev"));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// ----CORS Configuration----

app.use(cors());

// app.options("*", cors());

app.use(cors({ origin: true, credentials: true }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  next();
});

// ----CORS Configuration---

app.use(nocache());

// Modify the setHeaders function so it looks like this:{
app.use(
  express.static("public", {
    etag: true, // Just being explicit about the default.
    lastModified: true, // Just being explicit about the default.
    setHeaders: (res, path) => {
      const hashRegExp = new RegExp("\\.[0-9a-f]{8}\\.");

      if (path.endsWith(".html")) {
        // All of the project's HTML files end in .html
        res.setHeader("Cache-Control", "no-cache");
      } else if (hashRegExp.test(path)) {
        // If the RegExp matched, then we have a versioned URL.
        res.setHeader("Cache-Control", "max-age=31536000");
      }
    },
  })
);
app.use("/api", router);

//--------- Setting cache control middleware in Express{
let setCache = function (req, res, next) {
  // here you can define period in second, this one is 5 minutes
  const period = 60 * 5;

  // you only want to cache for GET requests
  if (req.method == "GET") {
    res.set("Cache-control", `public, max-age=${period}`);
  } else {
    // for the other requests set strict no caching parameters
    res.set("Cache-control", `no-store`);
  }

  // remember to call next() to pass on the request
  next();
};

// now call the new middleware function in your app

app.use(setCache);
router.use(setCache);
//--------- Setting cache control middleware in Express}

// file Upload -----------------------
global.__basedir = __dirname;

const initRoutes = require("./src/routes");
const { Router } = require("express/lib/express");
// const Zone = require("./apiOperations/Zone");

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
initRoutes(app);
// file Upload --------------------------------

// // ----------------Building a Secure Node js REST API---------------------//

app.set("etag", false);

app.get("/*", function (req, res, next) {
  res.setHeader("Last-Modified", new Date().toUTCString());
  next();
});

app.get("/", (req, res) => {
  var responseText = `<h1 style="font-family: 'Lobster', cursive;
    font-size: 4em;
    text-align: center;
    margin: 10px;
    text-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);">🤠 Restful APIs Using Nodejs is Started ✌️ </h1>`;
  res.send(responseText);
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

router.use((req, res, next) => {
  var time = new Date();
  console.log(
    "---------------------------->  RECENT REQUEST TRIGGERED AT <------------------------ : ",
    time.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      second: "numeric",
    })
  );
  next();
});

// -----------Login Api's--------------- //

router.route("/AdminLogin").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Logins.getAdminLogin(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ManagerLogin").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Logins.getManagerLogin(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/OutletLogin").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Logins.OutletLogin(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/FactoryLogin").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Logins.GetFactoryLogin(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ChangePassword").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Logins.ChangePassword(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetManagerProfile/:id", async (req, res) => {
  res.json(await Logins.GetManagerProfile(req.params.id));
});

router.get("/GetYearsList", async (req, res) => {
  res.json(await Logins.getYearLists());
});

// -----------Roles And Navigation--------------- //

router.get("/GetManagerNavigation/:id", async (req, res) => {
  res.json(await Roles.GetManagerNavigation(req.params.id));
});

router.get("/GetAllRoles", async (req, res) => {
  res.json(await Roles.GetAllRoles());
});

router.get("/GetAllRolesByUserType/:id", async (req, res) => {
  res.json(await Roles.GetAllRolesByUserType(req.params.id));
});

// -----------------------Digital Signature----------------
router.get("/DigitalSignature", async (req, res) => {
  await DigitalSignature.GetDigitalSignature().then((data) => {
    res.json(data);
  });
});

router.route("/DigitalSignature").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await DigitalSignature.AddDigitalSignature(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/DigitalSignature/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await DigitalSignature.UpdateDigitalSignature(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/DigitalSignature/:id").delete(async (req, res) => {
  await DigitalSignature.DeleteDigitalSignature(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------User Type----------------
router.get("/UserType", async (req, res) => {
  await UserType.GetAllUserType().then((data) => {
    res.json(data);
  });
});

router.route("/UserType").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await UserType.AddUserType(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/UserType/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await UserType.UpdateUserType(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/UserType/:id").delete(async (req, res) => {
  await UserType.DeleteUserType(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Manage Users----------------
router.get("/Users", async (req, res) => {
  await Users.GetAllUsers().then((data) => {
    res.json(data);
  });
});

router.get("/UsersForManager/:ManagerID", async (req, res) => {
  await Users.GetAllUsersForManager(req.params.ManagerID).then((data) => {
    res.json(data);
  });
});

router.route("/Users").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Users.AddUser(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Users/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Users.UpdateUser(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.put("/UsersProfileUpdate/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Users.UsersProfileUpdate(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Users/:id").delete(async (req, res) => {
  await Users.DeleteUser(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Service Category----------------
router.get("/ServiceCategory", async (req, res) => {
  await ServiceCategoryAndType.getAllServiceCategory().then((data) => {
    res.json(data);
  });
});

router.get("/ServiceCategory/:CategoryID", async (req, res) => {
  await ServiceCategoryAndType.getAllServiceCategoryByID(
    req.params.CategoryID
  ).then((data) => {
    res.json(data);
  });
});

router.route("/ServiceCategory").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await ServiceCategoryAndType.AddServiceCategory(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/ServiceCategory/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(
      await ServiceCategoryAndType.UpdateServiceCategory(req.params.id, obj)
    );
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/ServiceCategory/:id").delete(async (req, res) => {
  await ServiceCategoryAndType.DeleteServiceCategory(req.params.id).then(
    (data) => {
      res.json(data);
    }
  );
});

router.get("/ServiceCategoryFroDropDown", async (req, res) => {
  await ServiceCategoryAndType.getAllServiceCategoryForDropDown().then(
    (data) => {
      res.json(data);
    }
  );
});

// -----------------------Service Type----------------
router.get("/ServiceType", async (req, res) => {
  await ServiceCategoryAndType.getAllServiceType().then((data) => {
    res.json(data);
  });
});

router.get("/ServiceTypeByCategory/:CategoryID", async (req, res) => {
  await ServiceCategoryAndType.getAllServiceTypeByCategory(
    req.params.CategoryID
  ).then((data) => {
    res.json(data);
  });
});

router.route("/ServiceType").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await ServiceCategoryAndType.AddServiceType(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/ServiceType/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(
      await ServiceCategoryAndType.UpdateServiceType(req.params.id, obj)
    );
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/ServiceType/:id").delete(async (req, res) => {
  await ServiceCategoryAndType.DeleteServiceType(req.params.id).then((data) => {
    res.json(data);
  });
});

router.get("/getAllServiceTypeByID/:Pkid", async (req, res) => {
  await ServiceCategoryAndType.getAllServiceTypeByID(req.params.Pkid).then(
    (data) => {
      res.json(data);
    }
  );
});

// -----------------------Factory----------------
router.get("/Factory", async (req, res) => {
  await Factory.GetAllFactory().then((data) => {
    res.json(data);
  });
});

router.route("/Factory").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Factory.AddFactory(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Factory/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Factory.UpdateFactory(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Factory/:id").delete(async (req, res) => {
  await Factory.DeleteFactory(req.params.id).then((data) => {
    res.json(data);
  });
});

router.get("/FactoryForDropDown", async (req, res) => {
  await Factory.GetAllFactoryForDropDown().then((data) => {
    res.json(data);
  });
});

// -----------------------Factory Staff----------------
router.get("/FactoryStaff", async (req, res) => {
  await Factory.GetAllFactoryStaff().then((data) => {
    res.json(data);
  });
});

router.route("/FactoryStaff").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Factory.AddFactoryStaff(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/FactoryStaff/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Factory.UpdateFactoryStaff(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/FactoryStaff/:id").delete(async (req, res) => {
  await Factory.DeleteFactoryStaff(req.params.id).then((data) => {
    res.json(data);
  });
});

// ----------------------Route----------------
router.get("/Route", async (req, res) => {
  await Outlets.GetAllRoutes().then((data) => {
    res.json(data);
  });
});

router.route("/Route").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Outlets.AddRoute(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Route/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Outlets.UpdateRoute(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Route/:id").delete(async (req, res) => {
  await Outlets.DeleteRoute(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Store Or Outlet----------------
router.get("/Outlets", async (req, res) => {
  await Outlets.GetAllOutlets().then((data) => {
    res.json(data);
  });
});

router.get("/OutletsByManager/:ManagerID", async (req, res) => {
  await Outlets.GetAllOutletsByManager(req.params.ManagerID).then((data) => {
    res.json(data);
  });
});

router.get("/Outlets/:OutletID/:StaffID", async (req, res) => {
  await Outlets.GetOutletByID(req.params.OutletID, req.params.StaffID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/Outlets").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Outlets.AddOutlets(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/AddOutletsByManager").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Outlets.AddOutletsByManager(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Outlets/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Outlets.UpdateOutlets(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Outlets/:id").delete(async (req, res) => {
  await Outlets.DeleteOutlet(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Outlet Staff----------------
router.get("/OutletStaff", async (req, res) => {
  await Outlets.GetAllOutletStaff().then((data) => {
    res.json(data);
  });
});

router.get("/OutletStaffForManager/:ManagerID", async (req, res) => {
  await Outlets.GetAllOutletStaffForManager(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/OutletStaff").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Outlets.AddOutletStaff(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/OutletStaff/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Outlets.UpdateOutletStaff(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/OutletStaff/:id").delete(async (req, res) => {
  await Outlets.DeleteOutletStaff(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Item Category----------------
router.get("/ItemCategory", async (req, res) => {
  await Items.GetAllItemCategory().then((data) => {
    res.json(data);
  });
});

router.route("/ItemCategory").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Items.AddItemCategory(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/ItemCategory/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Items.UpdateItemCategory(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/ItemCategory/:id").delete(async (req, res) => {
  await Items.DeleteItemCategory(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Item Sub Category----------------
router.get("/ItemSubCategory", async (req, res) => {
  await Items.GetAllItemSubCategory().then((data) => {
    res.json(data);
  });
});

router.get("/ItemSubCategory/:CatID", async (req, res) => {
  await Items.GetAllItemSubCategoryByCategory(req.params.CatID).then((data) => {
    res.json(data);
  });
});

router.route("/ItemSubCategory").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Items.AddItemSubCategory(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/ItemSubCategory/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Items.UpdateItemSubCategory(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/ItemSubCategory/:id").delete(async (req, res) => {
  await Items.DeleteItemSubCategory(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Item Master----------------
router.get("/Items", async (req, res) => {
  await Items.GetAllItems().then((data) => {
    res.json(data);
  });
});

router.get("/ItemForPrice/:CatID", async (req, res) => {
  await Items.GetAllItemsForPrice(req.params.CatID).then((data) => {
    res.json(data);
  });
});

router.route("/Items").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Items.AddItems(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Items/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Items.UpdateItems(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Items/:id").delete(async (req, res) => {
  await Items.DeleteItems(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Item Price Master----------------

router.put("/ItemPrice/:ServiceCat", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Items.AddItemPrice(req.params.ServiceCat, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.put(
  "/AdditionalServicePrice/:ServiceCat",
  async function (req, res, next) {
    let obj = {
      ...req.body,
    };
    try {
      res.json(
        await Items.AddAdditionalServicePrice(req.params.ServiceCat, obj)
      );
    } catch (err) {
      console.error(`Error while updating`, err.message);
      next(err);
    }
  }
);

// -----------------------Additional Service----------------
router.get("/AdditionalService", async (req, res) => {
  await Items.GetAllAdditionalService().then((data) => {
    res.json(data);
  });
});

router.get("/AdditionalServiceForPrice/:CatID", async (req, res) => {
  await Items.GetAllAdditionalServiceForPrice(req.params.CatID).then((data) => {
    res.json(data);
  });
});

router.get("/AdditionalServiceByServiceCategory/:CatID", async (req, res) => {
  await Items.AdditionalServiceByServiceCategory(req.params.CatID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/AdditionalService").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Items.AddAdditionalService(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/AdditionalService/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Items.UpdateAdditionalService(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/AdditionalService/:id").delete(async (req, res) => {
  await Items.DeleteAdditionalService(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Coupons----------------
router.get("/Coupon", async (req, res) => {
  await Coupon.GetAllCoupons().then((data) => {
    res.json(data);
  });
});

router.get("/CouponForManager/:ManagerID", async (req, res) => {
  await Coupon.GetAllCouponsForManager(req.params.ManagerID).then((data) => {
    res.json(data);
  });
});

router.route("/Coupon").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Coupon.AddCoupon(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Coupon/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Coupon.UpdateCoupon(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Coupon/:id").delete(async (req, res) => {
  await Coupon.DeleteCoupons(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Manage Customer----------------
router.get("/GetCustomerType", async (req, res) => {
  await Customers.GetAllCustomerType().then((data) => {
    res.json(data);
  });
});

router.route("/Customers").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Customers.AddCustomer(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Customers/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Customers.UpdateCustomer(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Customers/:id").delete(async (req, res) => {
  await Customers.DeleteCustomer(req.params.id).then((data) => {
    res.json(data);
  });
});

router.get(
  "/Activate_DeactivateCustomer/:CustomerID/:Status",
  async (req, res) => {
    await Customers.Activate_DeactivateCustomer(
      req.params.CustomerID,
      req.params.Status
    ).then((data) => {
      res.json(data);
    });
  }
);

router.get("/Customers", async (req, res) => {
  await Customers.GetAllCustomers().then((data) => {
    res.json(data);
  });
});

router.get("/GetNewCustomerCoupon/:CustomerID", async (req, res) => {
  await Customers.GetNewCustomerCoupon(req.params.CustomerID).then((data) => {
    res.json(data);
  });
});

router.get("/GetAllCustomersForManager/:ManagerID", async (req, res) => {
  await Customers.GetAllCustomersForManager(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.get("/GetAllCustomersForCoupons", async (req, res) => {
  await Customers.GetAllCustomersForCoupons().then((data) => {
    res.json(data);
  });
});

router.get(
  "/GetAllCustomersForCouponsForManager/:ManagerID",
  async (req, res) => {
    await Customers.GetAllCustomersForCouponsForManager(
      req.params.ManagerID
    ).then((data) => {
      res.json(data);
    });
  }
);

router.route("/AllCustomersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Customers.GetAllCustomersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/GetAllCustomersWithFilterByManager").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Customers.GetAllCustomersWithFilterByManager(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetAllCustomersForPickup", async (req, res) => {
  await Customers.GetAllCustomersForPickup().then((data) => {
    res.json(data);
  });
});

router.get("/GetCutomerDetailsByID/:CustomerID", async (req, res) => {
  await Customers.GetCutomerDetailsByID(req.params.CustomerID).then((data) => {
    res.json(data);
  });
});

router.get("/GetAllCustomerCoupons", async (req, res) => {
  await Customers.GetAllCustomerCoupons().then((data) => {
    res.json(data);
  });
});

router.get("/GetAllCustomerCouponsForManager/:ManagerID", async (req, res) => {
  await Customers.GetAllCustomerCouponsForManager(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/AddCustomerCoupon").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Customers.AddCustomerCoupon(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/UpdateCustomerCoupon/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Customers.UpdateCustomerCoupon(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/DeleteCustomerCoupon/:id").delete(async (req, res) => {
  await Customers.DeleteCustomerCoupon(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Holiday Master----------------
router.get("/Holiday", async (req, res) => {
  await Holiday.GetAllHoliday().then((data) => {
    res.json(data);
  });
});

router.route("/Holiday").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Holiday.AddHoliday(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Holiday/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Holiday.UpdateHoliday(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Holiday/:id").delete(async (req, res) => {
  await Holiday.DeleteHoliday(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Due Date Master----------------
router.get("/DueDates", async (req, res) => {
  await Holiday.GetAllDueDates().then((data) => {
    res.json(data);
  });
});

router.route("/DueDates").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Holiday.AddDueDates(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/DueDates/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Holiday.UpdateDueDates(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/DueDates/:id").delete(async (req, res) => {
  await Holiday.DeleteDueDates(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Manage Drivers----------------
router.get("/Drivers", async (req, res) => {
  await Drivers.GetAllDrivers().then((data) => {
    res.json(data);
  });
});

router.route("/Drivers").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Drivers.AddDrivers(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Drivers/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Drivers.UpdateDrivers(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Drivers/:id").delete(async (req, res) => {
  await Drivers.DeleteDrivers(req.params.id).then((data) => {
    res.json(data);
  });
});

// -----------------------Admin Manage Pickup----------------

router.get("/AdminPickup", async (req, res) => {
  await Pickup.GetAllAdminPickups().then((data) => {
    res.json(data);
  });
});

router.get("/ManagerViewPickup/:ManagerID", async (req, res) => {
  await Pickup.GetAllManagerAddedPickups(req.params.ManagerID).then((data) => {
    res.json(data);
  });
});

router.get("/AdminPickupFilter/:FromDate/:ToDate", async (req, res) => {
  await Pickup.GetAllAdminPickupsFilter(
    req.params.FromDate,
    req.params.ToDate
  ).then((data) => {
    res.json(data);
  });
});

router.get(
  "/GetAllManagerPickupsFilter/:FromDate/:ToDate",
  async (req, res) => {
    await Pickup.GetAllManagerPickupsFilter(
      req.params.FromDate,
      req.params.ToDate,
      req.params.ManagerID
    ).then((data) => {
      res.json(data);
    });
  }
);

router.route("/Pickup").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Pickup.AddPickup(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ManagerAddPickup").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Pickup.ManagerAddPickup(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/Pickup/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await Pickup.UpdatePickup(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.route("/Pickup/:id").delete(async (req, res) => {
  await Pickup.DeletePickup(req.params.id).then((data) => {
    res.json(data);
  });
});

router.get("/Pickup", async (req, res) => {
  await Pickup.GetAllPickups().then((data) => {
    res.json(data);
  });
});

router.get("/PickupFilter/:Type/:Fdate/:Tdate", async (req, res) => {
  await Pickup.GetAllPickupsFilter(
    req.params.Type,
    req.params.Fdate,
    req.params.Tdate
  ).then((data) => {
    res.json(data);
  });
});

router.get(
  "/GetPickupCustomerDetails/:PickupID/:CustomerID",
  async (req, res) => {
    await Pickup.GetPickupCustomerDetails(
      req.params.PickupID,
      req.params.CustomerID
    ).then((data) => {
      res.json(data);
    });
  }
);

router.get("/AssignDriver/:PickupID/:DriverID", async (req, res) => {
  await Pickup.AssignDriver(req.params.PickupID, req.params.DriverID).then(
    (data) => {
      res.json(data);
    }
  );
});

// -----------------------Outlet Orders----------------
router.get(
  "/GetDueDate/:ServiceCategoryID/:ServiceTypeID/:OutletID",
  async (req, res) => {
    await OutletOrders.GetDueDate(
      req.params.ServiceCategoryID,
      req.params.ServiceTypeID,
      req.params.OutletID
    ).then((data) => {
      res.json(data);
    });
  }
);

router.route("/OrderAssignDeliveryPerson").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OrderAssignDeliveryPerson(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/OrderUpdateDeliveryPerson/:id", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await OutletOrders.OrderUpdateDeliveryPerson(req.params.id, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.get("/CustomersByOutlet/:OutletID", async (req, res) => {
  await Customers.GetAllCustomersForPlaceOrder(req.params.OutletID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.get(
  "/ItemsForPlaceOrder/:ServiceCategoryID/:OutletID",
  async (req, res) => {
    await Items.GetAllItemsForPlaceOrder(
      req.params.ServiceCategoryID,
      req.params.OutletID
    ).then((data) => {
      res.json(data);
    });
  }
);

router.get(
  "/AdditionalServiceForPlaceOrder/:ServiceCategoryID/:OutletID",
  async (req, res) => {
    await Items.GetAllAdditionalServiceForPlaceOrder(
      req.params.ServiceCategoryID,
      req.params.OutletID
    ).then((data) => {
      res.json(data);
    });
  }
);

router.get("/CouponByOutlet/:OutletID/:CustomerID/:ServiceTypeID", async (req, res) => {
  await Coupon.GetAllOutletCoupons(
    req.params.OutletID,
    req.params.CustomerID,
    req.params.ServiceTypeID
  ).then((data) => {
    res.json(data);
  });
});

router.get("/GetCouponItemListByCouponID/:CouponPkid", async (req, res) => {
  await Coupon.GetCouponItemListByCouponID(req.params.CouponPkid).then(
    (data) => {
      res.json(data);
    }
  );
});

router.get("/GetInvoiceNumber/:OutletID", async (req, res) => {
  await OutletOrders.GetInvoiceNumber(req.params.OutletID).then((data) => {
    res.json(data);
  });
});

router.route("/OutletPlaceOrder").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OutletPlaceOrder(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/OutletPlaceOrder/:OrderID").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OutletPlaceOrder(obj, req.params.OrderID).then((data) => {
    res.status(201).json(data);
  });
});

router.put("/OutletPlaceOrder/:OrderID", async function (req, res, next) {
  let obj = {
    ...req.body,
  };
  try {
    res.json(await OutletOrders.OutletOrderUpdate(req.params.OrderID, obj));
  } catch (err) {
    console.error(`Error while updating`, err.message);
    next(err);
  }
});

router.get("/AllOrders", async (req, res) => {
  await OutletOrders.AllOrders().then((data) => {
    res.json(data);
  });
});

router.get("/AllAdminDoorDeliveryOrders", async (req, res) => {
  await OutletOrders.AllAdminDoorDeliveryOrders().then((data) => {
    res.json(data);
  });
});

router.get("/AllManagerDoorDeliveryOrders/:ManagerID", async (req, res) => {
  await OutletOrders.AllManagerDoorDeliveryOrders(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/AllAdminDoorDeliveryOrdersWithFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.AllAdminDoorDeliveryOrdersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router
  .route("/AllManagerDoorDeliveryOrdersWithFilter")
  .post(async (req, res) => {
    let obj = {
      ...req.body,
    };

    await OutletOrders.AllManagerDoorDeliveryOrdersWithFilter(obj).then(
      (data) => {
        res.status(201).json(data);
      }
    );
  });

router.get("/AllOrdersForManager/:ManagerID", async (req, res) => {
  await OutletOrders.AllOrdersForManager(req.params.ManagerID).then((data) => {
    res.json(data);
  });
});

router.route("/OrderDetailsByNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OrderDetailsByNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/OrderDetailsByNumberPrint").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OrderDetailsByNumberPrint(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/OrderDetailsByItemNumberPrint").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OrderDetailsByItemNumberPrint(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ItemDetailsByItemNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.ItemDetailsByItemNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/OrderDetailsByDCNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.OrderDetailsByDCNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/AllOrdersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllOrdersWithFilters(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/AllOrdersFilterForManager").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllOrdersWithFiltersForManager(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/OutletOrders/:OutetID", async (req, res) => {
  await OutletOrders.GetAllOutletOrders(req.params.OutetID).then((data) => {
    res.json(data);
  });
});

router.get("/GetAllDoorDeliveryOrders/:OutetID", async (req, res) => {
  await OutletOrders.GetAllDoorDeliveryOrders(req.params.OutetID).then(
    (data) => {
      res.json(data);
    }
  );
});
router.route("/GetAllDoorDeliveryOrdersWithFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllDoorDeliveryOrdersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/updateOutletHandoverToDriver/:OrderID", async (req, res) => {
  await OutletOrders.updateOutletHandoverToDriver(req.params.OrderID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/GetAllOutletOrdersWithFilters").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllOutletOrdersWithFilters(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetAllOutForDeliveryOrders/:OutetID", async (req, res) => {
  await OutletOrders.GetAllOutForDeliveryOrders(req.params.OutetID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/GetAllOutForDeliveryOrdersWithFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllOutForDeliveryOrdersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetAllDeliveredOrders/:OutetID", async (req, res) => {
  await OutletOrders.GetAllDeliveredOrders(req.params.OutetID).then((data) => {
    res.json(data);
  });
});

router.route("/GetAllDeliveredOrdersWithFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllDeliveredOrdersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/OutletOrdersCurrentDay/:OutetID", async (req, res) => {
  await OutletOrders.GetAllOutletOrdersCurrentDay(req.params.OutetID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/OutletOrderFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllOutletOrdersWithFilters(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/OutletGetReadyForDeliveryOrders/:OutetID", async (req, res) => {
  await OutletOrders.OutletGetReadyForDeliveryOrders(req.params.OutetID).then(
    (data) => {
      res.json(data);
    }
  );
});

router
  .route("/OutletGetReadyForDeliveryOrdersFilter")
  .post(async (req, res) => {
    let obj = {
      ...req.body,
    };

    await OutletOrders.OutletGetReadyForDeliveryOrdersFilter(obj).then(
      (data) => {
        res.status(201).json(data);
      }
    );
  });

router.route("/GetPickupDetailsByCode").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await Pickup.GetAllPickupsByID(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/AllOrderItemsByOrderID/:OrderID", async (req, res) => {
  await OutletOrders.AllOrderItemsByOrderID(req.params.OrderID).then((data) => {
    res.json(data);
  });
});

router.get("/AllOrderItemsForEditByOrderID/:OrderID", async (req, res) => {
  await OutletOrders.AllOrderItemsForEditByOrderID(req.params.OrderID).then(
    (data) => {
      res.json(data);
    }
  );
});

router
  .route("/DeleteOrder/:id/:ModifiedBy/:ModifiedByID")
  .delete(async (req, res) => {
    await OutletOrders.DeleteOrder(
      req.params.id,
      req.params.ModifiedBy,
      req.params.ModifiedByID
    ).then((data) => {
      res.json(data);
    });
  });

router.get("/GetModifiedDates/:OrderID", async (req, res) => {
  await OutletOrders.GetOrderModifiedDates(req.params.OrderID).then((data) => {
    res.json(data);
  });
});

router.route("/GetModifiedOrder").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetModifiedOrder(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetDeletedOrders", async (req, res) => {
  await OutletOrders.GetAllDeletedOrders().then((data) => {
    res.json(data);
  });
});

router.get("/GetDeletedOrdersForManager/:ManagerID", async (req, res) => {
  await OutletOrders.GetAllDeletedOrdersForManager(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.get("/GetAllOrderItemsForDeletedOrder/:OrderID", async (req, res) => {
  await OutletOrders.GetAllOrderItemsForDeletedOrder(req.params.OrderID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/AllDeletedOrdersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllDeletedOrdersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/AllDeletedOrdersFilterForManager").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.GetAllDeletedOrdersWithFilterForManager(obj).then(
    (data) => {
      res.status(201).json(data);
    }
  );
});

router.route("/LogsOrderItems").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.LogsOrderItems(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/B2BCustomerOrders", async (req, res) => {
  await OutletOrders.AllB2BCustomerOrders().then((data) => {
    res.json(data);
  });
});

router.route("/B2BCustomerOrdersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.AllB2BCustomerOrdersWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/B2BCustomerOrdersForManager/:ManagerID", async (req, res) => {
  await OutletOrders.AllB2BCustomerOrdersForManager(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/B2BCustomerOrdersFilterForManager").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.AllB2BCustomerOrdersWithFilterForManager(obj).then(
    (data) => {
      res.status(201).json(data);
    }
  );
});

router.get("/AllOrdersForBadDebits", async (req, res) => {
  await OutletOrders.AllOrdersForBadDebits().then((data) => {
    res.json(data);
  });
});

router.get("/AllOrdersForBadDebitsForManager/:ManagerID", async (req, res) => {
  await OutletOrders.AllOrdersForBadDebitsForManager(req.params.ManagerID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/AllOrdersForBadDebitsFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.AllOrdersForBadDebitsFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router
  .route("/AllOrdersForBadDebitsFilterForManager")
  .post(async (req, res) => {
    let obj = {
      ...req.body,
    };

    await OutletOrders.AllOrdersForBadDebitsFilterForManager(obj).then(
      (data) => {
        res.status(201).json(data);
      }
    );
  });

router.route("/UpdateOrderBadDebits").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrders.UpdateOrderBadDebits(obj).then((data) => {
    res.status(201).json(data);
  });
});

// -----------------------Outlet InTake----------------

router.get("/GetDCFromFactory/:OutletID", async (req, res) => {
  await OutletIntake.GetDCFromFactory(req.params.OutletID).then((data) => {
    res.json(data);
  });
});

router.get(
  "/ViewOutletDCForIntakeWithoutFactory/:OutletID",
  async (req, res) => {
    await OutletIntake.ViewOutletDCForIntake(req.params.OutletID).then(
      (data) => {
        res.json(data);
      }
    );
  }
);

router
  .route("/ViewOutletDCForIntakeWithoutFactoryFilter")
  .post(async (req, res) => {
    let obj = {
      ...req.body,
    };

    await OutletIntake.ViewOutletDCForIntakeFilter(obj).then((data) => {
      res.status(201).json(data);
    });
  });

router.route("/GetDCFromFactoryWithFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.GetDCFromFactoryWithFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/OutletConfirmIntake/:DcPkid", async (req, res) => {
  await OutletIntake.OutletConfirmIntake(req.params.DcPkid).then((data) => {
    res.json(data);
  });
});

router.get("/OutletConfirmIntakeWithoutFactoryDC/:DcPkid", async (req, res) => {
  await OutletIntake.OutletConfirmIntakeWithoutFactoryDC(
    req.params.DcPkid
  ).then((data) => {
    res.json(data);
  });
});

router.get("/OutletAllInventory/:OutletID", async (req, res) => {
  await OutletIntake.OutletAllInventory(req.params.OutletID).then((data) => {
    res.json(data);
  });
});

router.get("/OutletAllInventoryForAdmin/:OutletID", async (req, res) => {
  await OutletIntake.OutletAllInventoryForAdmin(req.params.OutletID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/OutletAllInventoryFromOrderNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.OutletAllInventoryFromOrderNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/OutletCurrentInventory/:OutletID", async (req, res) => {
  await OutletIntake.OutletCurrentInventory(req.params.OutletID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/OutletCurrentInventoryFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.OutletCurrentInventoryFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ConfirmSelfAuditReport").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.ConfirmSelfAuditReport(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ViewSelfAuditReport/:OutletID", async (req, res) => {
  await OutletIntake.ViewSelfAuditReport(req.params.OutletID).then((data) => {
    res.json(data);
  });
});

router.route("/ViewSelfAuditReportFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.ViewSelfAuditReportFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ConfirmMainAudit").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.ConfirmMainAudit(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetPreviousAuditReport/:UserBy/:UserID", async (req, res) => {
  await OutletIntake.GetPreviousAuditReport(
    req.params.UserBy,
    req.params.UserID
  ).then((data) => {
    res.json(data);
  });
});

router.route("/GetPreviousAuditReportFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.GetPreviousAuditReportFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetErrorReportForUsers/:UserBy/:UserID", async (req, res) => {
  await OutletIntake.GetErrorReportForUsers(
    req.params.UserBy,
    req.params.UserID
  ).then((data) => {
    res.json(data);
  });
});

router.route("/GetErrorReportForUsersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletIntake.GetErrorReportForUsersFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ViewAuditReportForUser/:AuditPkID", async (req, res) => {
  await OutletIntake.ViewAuditReportForUser(req.params.AuditPkID).then(
    (data) => {
      res.json(data);
    }
  );
});

// -----------------------Outlet Order Delivery----------------

router.get("/SendOTP/:OrderID/:CustomerPhone", async (req, res) => {
  await OutletOrderDelivery.SendOTP(
    req.params.OrderID,
    req.params.CustomerPhone
  ).then((data) => {
    res.json(data);
  });
});

router.route("/VerifyDeliveryOTP").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrderDelivery.VerifyDeliveryOTP(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/VerifyDeliveryCode").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrderDelivery.VerifyDeliveryCode(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetOrdersListByPhoneNumber/:CustomerPhone", async (req, res) => {
  await OutletOrderDelivery.GetOrdersListByPhoneNumber(
    req.params.CustomerPhone
  ).then((data) => {
    res.json(data);
  });
});

router.route("/ConfirmDelivery").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrderDelivery.ConfirmDelivery(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetOutletCollectionReport/:OutletID", async (req, res) => {
  await OutletOrderDelivery.GetOutletCollectionReport(req.params.OutletID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/GetOutletCollectionReportFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletOrderDelivery.GetOutletCollectionReportFilter(obj).then(
    (data) => {
      res.status(201).json(data);
    }
  );
});

// -----------------------Outlet Day Close----------------
router.get("/GetTodayDC/:OutletID", async (req, res) => {
  await OutletDayClose.GetTodayDC(req.params.OutletID).then((data) => {
    res.json(data);
  });
});

router.get("/GetDCNo/:OutletID", async (req, res) => {
  await OutletDayClose.GetDCNo(req.params.OutletID).then((data) => {
    res.json(data);
  });
});

router.route("/OutletDayClose").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletDayClose.DayClose(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetOutletToFactoryDC/:OutletID", async (req, res) => {
  await OutletDayClose.GetOutletToFactoryDC(req.params.OutletID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/GetOutletToFactoryDCByDCNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletDayClose.GetOutletToFactoryDCByDCNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/GetOutletToFactoryDCFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await OutletDayClose.GetOutletToFactoryDCFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/GetOutletToFactryDCItems/:Pkid", async (req, res) => {
  await OutletDayClose.GetOutletToFactryDCItems(req.params.Pkid).then(
    (data) => {
      res.json(data);
    }
  );
});

// ------------------------ Factory Module ----------------------------------

router.get("/FactoryViewInTakeOrders/:FactoryID", async (req, res) => {
  await FactoryModule.FactoryViewInTakeOrders(req.params.FactoryID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/FactoryViewInTakeOrdersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.FactoryViewInTakeOrdersFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/FactoryConfirmInTake/:DCID", async (req, res) => {
  await FactoryModule.FactoryConfirmInTake(req.params.DCID).then((data) => {
    res.json(data);
  });
});

router.get("/ViewConfirmedOutletIntake/:FactoryID", async (req, res) => {
  await FactoryModule.ViewConfirmedOutletIntake(req.params.FactoryID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/ViewConfirmedOutletIntakeFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ViewConfirmedOutletIntakeFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ViewConfirmedOutletIntakeByDCNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ViewConfirmedOutletIntakeByDCNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/FactoryViewInTakeOrdersFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.FactoryViewInTakeOrdersFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get(
  "/FactoryViewInTakeOrdersFromFactory/:FactoryID",
  async (req, res) => {
    await FactoryModule.FactoryViewInTakeOrdersFromFactory(
      req.params.FactoryID
    ).then((data) => {
      res.json(data);
    });
  }
);

router
  .route("/FactoryViewInTakeOrdersFromFactoryFilter")
  .post(async (req, res) => {
    let obj = {
      ...req.body,
    };

    await FactoryModule.FactoryViewInTakeOrdersFromFactoryFilter(obj).then(
      (data) => {
        res.status(201).json(data);
      }
    );
  });

router.get("/FactoryConfirmInTakeFromFactory/:DCID", async (req, res) => {
  await FactoryModule.FactoryConfirmInTakeFromFactory(req.params.DCID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.get("/ViewConfirmedFactoryIntake/:FactoryID", async (req, res) => {
  await FactoryModule.ViewConfirmedFactoryIntake(req.params.FactoryID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/ViewConfirmedFactoryIntakeFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ViewConfirmedFactoryIntakeFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ViewConfirmedFactoryIntakeDCPrint").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ViewConfirmedFactoryIntakeDCPrint(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ReturnToOutletValidateOrder").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToOutletValidateOrder(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ReturnToOutlet").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToOutlet(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ReturnToOutletView/:FactoryID", async (req, res) => {
  await FactoryModule.ReturnToOutletView(req.params.FactoryID).then((data) => {
    res.json(data);
  });
});

router.route("/ReturnToOutletViewFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToOutletViewFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ReturnToOutletOrderList/:Pkid", async (req, res) => {
  await FactoryModule.ReturnToOutletOrderList(req.params.Pkid).then((data) => {
    res.json(data);
  });
});

router.route("/ReturnToOutletViewByDCNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToOutletViewByDCNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ReturnToFactoryList/:Pkid", async (req, res) => {
  await FactoryModule.ReturnToFactoryList(req.params.Pkid).then((data) => {
    res.json(data);
  });
});

router.route("/GetInventoryForReturnToFactoryBulk").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.GetInventoryForReturnToFactoryBulk(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ReturnFactoryOutletList/:Pkid", async (req, res) => {
  await FactoryModule.ReturnFactoryOutletList(req.params.Pkid).then((data) => {
    res.json(data);
  });
});

router.route("/GetItemDetailsByItemNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.GetItemDetailsByItemNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.route("/ReturnToFactory").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToFactory(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ReturnToFactoryView/:FactoryID", async (req, res) => {
  await FactoryModule.ReturnToFactoryView(req.params.FactoryID).then((data) => {
    res.json(data);
  });
});

router.route("/ReturnToFactoryViewFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToFactoryViewFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/ReturnedToFactoryItemList/:Pkid", async (req, res) => {
  await FactoryModule.ReturnedToFactoryItemList(req.params.Pkid).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/ReturnToFactoryViewByDCNumber").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.ReturnToFactoryViewByDCNumber(obj).then((data) => {
    res.status(201).json(data);
  });
});

router.get("/CurrentFactoryInventory/:FactoryID", async (req, res) => {
  await FactoryModule.CurrentFactoryInventory(req.params.FactoryID).then(
    (data) => {
      res.json(data);
    }
  );
});

router.route("/CurrentFactoryInventoryFilter").post(async (req, res) => {
  let obj = {
    ...req.body,
  };

  await FactoryModule.CurrentFactoryInventoryFilter(obj).then((data) => {
    res.status(201).json(data);
  });
});

// -------END----------------------------------------------------//
var port = process.env.PORT || 7760;

const server = app.listen(port, () =>
  console.log("API is runnning at http://localhost:" + port)
);

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Process terminated");
  });
});
