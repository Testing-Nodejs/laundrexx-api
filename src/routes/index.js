const express = require("express");
var cors = require("cors");
const router = express.Router();
const controller = require("../../controller/file.controller");
let routes = (app) => {
  router.use(cors());
  router.use(cors({ origin: true, credentials: true }));
  router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    next();
  });
  router.post("/api/upload", controller.upload);
  router.get("/api/files", controller.getListFiles);
  router.get("/api/files/:name", controller.download);
  app.use(router);
};
module.exports = routes;
