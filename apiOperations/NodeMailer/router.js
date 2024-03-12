//require
var express = require("express"),
  router = express.Router(),
  smtpTransport = require("nodemailer-smtp-transport");

require("dotenv").config();
//setup nodemailer
const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: process.env.MY_GMAIL,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MY_GMAIL,
        pass: process.env.MY_PASSWORD,
    },
  });



router.get("/hey", (req, res) => {
  res.send({
    user: process.env.MY_GMAIL,
    pass: process.env.MY_PASSWORD,
  });
});

var message = "The quick brown fox jumps over the lazy dog";
//get route to send mail, from form
router.post("/send-mail", function (req, res) {
  const mailOptions = {
    from: process.env.MY_GMAIL, // sender address
    to: process.env.MY_GMAIL, // list of receivers
    subject: "Nodemailer", // Subject line
    html: message, // plain text body
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
});


module.exports = router;
