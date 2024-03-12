const express = require("express");
const path = require("path");

const app = express();

const mailRouter = require("./router");


app.use("/mail", mailRouter);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
  //__dirname : It will resolve to your project folder.
});

app.get("/kimo", (req, res) => {
  res.send("AM ALIVE!");
});




app.listen(1234, () => {
  console.log(`Server started on port Alive!`);
});
