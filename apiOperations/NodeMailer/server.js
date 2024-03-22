/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-07-01 13:28:12
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-07-04 17:53:46
 */

var config = require("../../dbconfig");
const sql = require("mssql");

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

var transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "order-update@laundrexx.com",
      pass: "gxdlqqpafkvszhly",
    },
  })
);

function generateOTP() {
  // Declare a digits variable
  // which stores all digits
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

async function forgotPassword(obj) {
  console.log("forgotPassword :", obj);
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("REGISTERED_USERS_EMAIL", obj.FORGET_PASSWORD_EMAIL)
      .query(
        "SELECT * from REGISTERED_USERS WHERE REGISTERED_USERS_EMAIL=@REGISTERED_USERS_EMAIL"
      );

    if (result.recordsets[0].length > 0) {
      const resOtp = await generateOTP();

      var insertOTP = await pool
        .request()
        .input(
          "FORGET_PASSWORD_EMAIL",
          result.recordsets[0][0].REGISTERED_USERS_EMAIL
        )
        .input("FORGET_PASSWORD_OTP", resOtp)
        .input("FORGET_PASSWORD_ISACTIVE", "1")
        .query(
          `insert into FORGET_PASSWORD (FORGET_PASSWORD_OTP,FORGET_PASSWORD_ISACTIVE,FORGET_PASSWORD_EMAIL)  values(@FORGET_PASSWORD_OTP,@FORGET_PASSWORD_ISACTIVE,@FORGET_PASSWORD_EMAIL)`
        );
      console.log("OTP IS :", resOtp);
      if (insertOTP.rowsAffected == 1) {
        var mailOptions = {
          from: "order-update@laundrexx.com",
          to: obj.FORGET_PASSWORD_EMAIL,
          subject: "Forget Password OTP",
          html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
              <div style="border-bottom:1px solid #eee">
                <a href="https://aaprobics.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">AA Probics</a>
              </div>
              <p style="font-size:1.1em">Hi,</p>
              <p><b>Use the following OTP to complete your Account Recovery!</b></p>
              <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${resOtp}</h2>
              <p style="font-size:0.9em;">Regards,<br />AA Probics,</p>
              <hr style="border:none;border-top:1px solid #eee" />
              <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
              </div>
            </div>
          </div>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (error) {
    console.log("FORGOT_PASSWORD-->", error);
  }
}

async function checkOTP(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("FORGET_PASSWORD_EMAIL", obj.FORGET_PASSWORD_EMAIL)
      .input("FORGET_PASSWORD_OTP", obj.FORGET_PASSWORD_OTP)
      .query(
        `SELECT MAX(FORGET_PASSWORD_PKID) FROM FORGET_PASSWORD WHERE FORGET_PASSWORD_OTP = @FORGET_PASSWORD_OTP AND FORGET_PASSWORD_EMAIL=@FORGET_PASSWORD_EMAIL 
        AND FORGET_PASSWORD_PKID = (SELECT MAX(FORGET_PASSWORD_PKID) FROM FORGET_PASSWORD WHERE FORGET_PASSWORD_EMAIL=@FORGET_PASSWORD_EMAIL)`
      );
    const xkimo = result.recordsets[0];

    const Ykimo = Object.values(xkimo[0]);
    console.log(Ykimo[0]);

    if (Ykimo[0] >= 1) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("checkOTP-->", error);
  }
}

async function ResetPassword(obj) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("REGISTERED_USERS_EMAIL", obj.REGISTERED_USERS_EMAIL)
      .input("REGISTERED_USERS_PASSWORD", obj.REGISTERED_USERS_PASSWORD)
      .query(
        `UPDATE REGISTERED_USERS SET 
        REGISTERED_USERS_PASSWORD = @REGISTERED_USERS_PASSWORD 
        WHERE REGISTERED_USERS_EMAIL =@REGISTERED_USERS_EMAIL`
      );

    let message = false;

    if (result.rowsAffected) {
      message = true;
    }

    return message;
  } catch (error) {
    console.log("ResetPassword-->", error);
  }
}

async function MemberCouponsToMail(Email) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select [MEMBER_COUPON_CODE], [MEMBER_COUPON_DISCOUNT] from [dbo].[MEMBER_COUPON] join [dbo].[MEMBER] on [MEMBER_PKID] = [MEMBER_COUPON_MEMBER_FKID] where [MEMBER_EMAIL] = '" +
        Email +
        "'"
      );
    var itemarrrr = result.recordsets[0];
    var Tdata = "";
    var cntt = 0;
    for (var i = 0; i < itemarrrr.length; i++) {
      cntt++;
      Tdata +=
        "<tr><td>" +
        cntt +
        "</td><td>" +
        itemarrrr[i].MEMBER_COUPON_CODE +
        "</td><td>" +
        itemarrrr[i].MEMBER_COUPON_DISCOUNT +
        "%</td></tr>";
    }
    var mailOptions = {
      from: "order-update@laundrexx.com",
      to: Email,
      subject: "Coupon Details",
      html: `<htm><head><style>
      #customers {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      #customers td, #customers th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      
      #customers tr:nth-child(even){background-color: #f2f2f2;}
      
      #customers tr:hover {background-color: #ddd;}
      
      #customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #0081c8;
        color: white;
      }
      </style></head><body><div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="https://aaprobics.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Coupons From AA Probics</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p><b>Please find the below list of coupons assigned to you!</b></p>
      <table id="customers">
      <thead><tr><th>Sl No</th><th>Coupon Code</th><th>Coupon Discount</th></tr></thead>
      <tbody>${Tdata}</thead>
      </table>
      <p style="font-size:0.9em;">Regards,<br />AA Probics,</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
  </div></body></htm>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    return true;
  } catch (error) {
    console.log("MemberCouponsToMail-->", error);
  }
}

async function SendMailForSubscribers() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        "select [PRODUCT_PKID],[PRODUCT_CATEGORY_NAME], [PRODUCT_SUB_CATEGORY_NAME], [PRODUCT_NAME] from [dbo].[PRODUCTS] join [dbo].[PRODUCT_CATEGORY] on [PRODUCT_CATEGORY_PKID] = [PRODUCT_CAT_FKID] join [dbo].[PRODUCT_SUB_CATEGORY] on [PRODUCT_SUB_CATEGORY_PKID] = [PRODUCT_SUB_CAT_FKID] where [PRODUCT_PKID] = (select max([PRODUCT_PKID]) from [dbo].[PRODUCTS])"
      );

    let resultInner = await pool
      .request()
      .query(
        "select [SUBSCRIBED_USERS_EMAIL] from [dbo].[SUBSCRIBED_USERS] where [SUBSCRIBED_USERS_ACTIVE] = 1"
      );
    var resultInnerrr = resultInner.recordsets[0];
    for (var i = 0; i < resultInnerrr.length; i++) {
      var mailOptions = {
        from: "order-update@laundrexx.com",
        to: resultInnerrr[i].SUBSCRIBED_USERS_EMAIL,
        subject: "Subscription Notification",
        html: `<htm><head><style>
        #customers {
          font-family: Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }
        
        #customers td, #customers th {
          border: 1px solid #ddd;
          padding: 8px;
        }
        
        #customers tr:nth-child(even){background-color: #f2f2f2;}
        
        #customers tr:hover {background-color: #ddd;}
        
        #customers th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #0081c8;
          color: white;
        }
        </style></head><body><div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="https://aaprobics.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">AA Probics Subscription Notifications</a>
        </div>
        <p style="font-size:1.1em">Dear Customer,</p>
        <p><b>AA Probics added a new product, please find the below table for updated product details, if you want to view full details please click the below link!</b></p>
        <table id="customers">
        <tbody>
        <tr>
        <td><b>Product Name</b></td>
        <td>${result.recordsets[0][0].PRODUCT_NAME}</td>
        </tr>
        <tr>
        <td><b>Product Category</b></td>
        <td>${result.recordsets[0][0].PRODUCT_CATEGORY_NAME}</td>
        </tr>
        <tr>
        <td><b>Product Sub Category</b></td>
        <td>${result.recordsets[0][0].PRODUCT_SUB_CATEGORY_NAME}</td>
        </tr>
        <tr>
        <td><b>Product Link</b></td>
        <td><a href="https://aaprobics.com/shop/products/${result.recordsets[0][0].PRODUCT_PKID}" target="_blank">View</a></td>
        </tr>
        </tbody>
        </table>
        <p style="font-size:0.9em;">Regards,<br />AA Probics,</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        </div>
      </div>
    </div></body></htm>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
    return true;
  } catch (error) {
    console.log("MemberCouponsToMail-->", error);
  }
}

async function SendMailForScienceSubscribers() {
  try {
    console.log("hii");
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .query(
        "select [SCIENCE_TYPE_NAME],[SCIENCE_DATA],[SCIENCE_DATA_FILE] from [dbo].[SCIENCE_DATA] join [SCIENCE_TYPE] ON [SCIENCE_DATA_TYPE_FKID]=[SCIENCE_TYPE_PKID] WHERE SCIENCE_DATA_TYPE_FKID=(SELECT MAX(SCIENCE_DATA_TYPE_FKID) from SCIENCE_DATA)"
      );

    let resultInner = await pool
      .request()
      .query(
        "select [SUBSCRIBED_USERS_EMAIL] from [dbo].[SUBSCRIBED_USERS] where [SUBSCRIBED_USERS_ACTIVE] = 1  select REGISTERED_USERS_EMAIL as Emails from REGISTERED_USERS  union select SUBSCRIBED_USERS_EMAIL as Emails from SUBSCRIBED_USERS where [SUBSCRIBED_USERS_ACTIVE] = 1"
      );
    var resultInnerrr = resultInner.recordsets[0];
    console.log(resultInner.recordsets[0]);
    for (var i = 0; i < resultInnerrr.length; i++) {
      var mailOptions = {
        from: "order-update@laundrexx.com",
        to: resultInnerrr[i].SUBSCRIBED_USERS_EMAIL,
        subject: "Science Subscription Notification",
        html: `<htm><head><style>
        #customers {
          font-family: Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }
        
        #customers td, #customers th {
          border: 1px solid #ddd;
          padding: 8px;
          width: 100%;
        }
        
        #customers tr:nth-child(even){background-color: #f2f2f2;}
        
        #customers tr:hover {background-color: #ddd;}
        
        #customers th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #0081c8;
          color: white;
          width: 100%;
        }
        </style></head><body><div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="https://aaprobics.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">AA Probics Subscription Notifications</a>
        </div>
        <p style="font-size:1.1em">Dear Customer,</p>
        <p><b>AA Probics added a new Science Data, if you want to view full details in below Table!</b></p>
        <table id="customers">
        <tbody>
        <tr>
        <td><b>SCIENCE DATA</b></td>
        <td>${result.recordsets[0][0].SCIENCE_DATA}</td>
        </tr>
        <tr>
        <td><b>SCIENCE DATA TYPE</b></td>
        <td>${result.recordsets[0][0].SCIENCE_TYPE_NAME}</td>
        </tr>
        <tr>
        <td><b>SCIENCE DATA FILE</b></td>
        <td>
        <img src="http://192.168.1.7:7760/${result.recordsets[0][0].SCIENCE_DATA_FILE}" style="width:104px;height:142px;">
        </td>
        </tr>
        </tbody>
        </table>
        <p style="font-size:0.9em;">Regards,<br />AA Probics,</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        </div>
      </div>
    </div></body></htm>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
    return true;
  } catch (error) {
    console.log("MemberCouponsToMail-->", error);
  }
}



async function SendMailForScienceSubscribersupdate() {
  try {
    console.log("hii");
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .query(
        "select [SCIENCE_TYPE_NAME],[SCIENCE_DATA],[SCIENCE_DATA_FILE] from [dbo].[SCIENCE_DATA] join [SCIENCE_TYPE] ON [SCIENCE_DATA_TYPE_FKID]=[SCIENCE_TYPE_PKID] WHERE SCIENCE_DATA_TYPE_FKID=(SELECT MAX(SCIENCE_DATA_TYPE_FKID) from SCIENCE_DATA)"
      );

    let resultInner = await pool
      .request()
      .query(
        "select [SUBSCRIBED_USERS_EMAIL] from [dbo].[SUBSCRIBED_USERS] where [SUBSCRIBED_USERS_ACTIVE] = 1  select REGISTERED_USERS_EMAIL as Emails from REGISTERED_USERS  union select SUBSCRIBED_USERS_EMAIL as Emails from SUBSCRIBED_USERS where [SUBSCRIBED_USERS_ACTIVE] = 1"
        // select [SUBSCRIBED_USERS_EMAIL] from [dbo].[SUBSCRIBED_USERS] where [SUBSCRIBED_USERS_ACTIVE] = 1
      );
    var resultInnerrr = resultInner.recordsets[0];
    console.log(resultInner.recordsets[0]);
    for (var i = 0; i < resultInnerrr.length; i++) {
      var mailOptions = {
        from: "order-update@laundrexx.com",
        to: resultInnerrr[i].SUBSCRIBED_USERS_EMAIL,
        subject: "Science Subscription Notification",
        html: `<htm><head><style>
        #customers {
          font-family: Arial, Helvetica, sans-serif;
          border-collapse: collapse;
          width: 100%;
        }
        
        #customers td, #customers th {
          border: 1px solid #ddd;
          padding: 8px;
          width: 100%;
        }
        
        #customers tr:nth-child(even){background-color: #f2f2f2;}
        
        #customers tr:hover {background-color: #ddd;}
        
        #customers th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: left;
          background-color: #0081c8;
          color: white;
          width: 100%;
        }
        </style></head><body><div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="https://aaprobics.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">AA Probics Subscription Notifications</a>
        </div>
        <p style="font-size:1.1em">Dear Customer,</p>
        <p><b>AA Probics Updated Science Data, if you want to view full details in below Table!</b></p>
        <table id="customers">
        <tbody>
        <tr>
        <td><b>SCIENCE DATA</b></td>
        <td>${result.recordsets[0][0].SCIENCE_DATA}</td>
        </tr>
        <tr>
        <td><b>SCIENCE DATA TYPE</b></td>
        <td>${result.recordsets[0][0].SCIENCE_TYPE_NAME}</td>
        </tr>
        <tr>
        <td><b>SCIENCE DATA FILE</b></td>
        <td>
        <img src="http://192.168.1.7:7760/${result.recordsets[0][0].SCIENCE_DATA_FILE}" style="width:104px;height:142px;">
        </td>
        </tr>
        </tbody>
        </table>
        <p style="font-size:0.9em;">Regards,<br />AA Probics,</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        </div>
      </div>
    </div></body></htm>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
    return true;
  } catch (error) {
    console.log("MemberCouponsToMail-->", error);
  }
}


module.exports = {
  forgotPassword,
  checkOTP,
  ResetPassword,
  MemberCouponsToMail,
  SendMailForSubscribers,
  SendMailForScienceSubscribers,
  SendMailForScienceSubscribersupdate,
};
