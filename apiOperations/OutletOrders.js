/*
 * @Author: ---- KIMO a.k.a KIMOSABE ----
 * @Date: 2022-02-19 12:05:08
 * @Last Modified by: ---- KIMO a.k.a KIMOSABE ----
 * @Last Modified time: 2022-06-20 19:33:40
 */

var config = require("../dbconfig");
const sql = require("mssql");
const QRCode = require("qrcode");
const path = require("path");
var request = require("request");

var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

var transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  })
);

async function SampleMailTest() {
  try {
    var options = {
      method: "POST",
      url: process.env.SMSCOUNTRY_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.SMSCOUNTRY_AUTHKEY,
      },
      body: JSON.stringify({
        Text: "Welcome to the world of Laundrexx! Your OTP for account creation is 433330. Enter this code to create your account. We're excited to have you on board! -Laundrexx",
        Number: "919591769165",
        SenderId: "LNDREX",
        DRNotifyUrl: "https://www.domainname.com/notifyurl",
        DRNotifyHttpMethod: "POST",
        Tool: "API",
      }),
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);
    });

    // var mailOptions = {
    //   from: process.env.EMAIL,
    //   to: "jafaraftab15011@gmail.com",
    //   // cc: "",
    //   attachments: [
    //     {
    //       // utf-8 string as an attachment
    //       filename: "text1.pdf",
    //       content: `<html><head>
    //       <style>

    // </style></head>
    // <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
    //                 <div style="border-bottom:1px solid #eee">
    //                   <a href="https://laundrexx.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Laundrexx Fabric Care India Pvt Ltd</a>
    //                 </div>
    //                 <p style="font-size: 16px;color: black;font-weight: 600;">Dear Customer,</p>
    //                 <p style="font-size: 14px;color: black;">Your order <b>( D17-0002-24 )</b> is confirmed.</p>
    //                 <p style="font-size: 14px;color: black;">Your order due date is <b>2024-02-29</b>. We'll text you when your order is ready. </p>
    //                 <p style="font-size: 14px;color: black;">If you have any question, contact us at <b>+91 938-000-0005</b> -Laundrexx</p>
    //               </div>
    //               </html>`,
    //       contentType: "application/pdf",
    //     },
    //   ],
    //   subject: "Order Confirmation!",
    //   // html: ,
    // };

    // transporter.sendMail(mailOptions, function (error, info) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Email sent: " + info.response);
    //   }
    // });
  } catch (error) {
    console.log("GetDueDate-->", error);
  }
}

async function GetDueDate(ServiceCategoryID, ServiceTypeID, OutletID) {
  try {
    let pool = await sql.connect(config);
    let result = await pool
      .request()
      .input("ServiceCategoryID", ServiceCategoryID)
      .input("ServiceTypeID", ServiceTypeID)
      .input("OutletID", OutletID)
      .execute("getDueDate");
    return result.recordsets[0];
  } catch (error) {
    console.log("GetDueDate-->", error);
  }
}

async function GetInvoiceNumber(OutletID) {
  try {
    let pool = await sql.connect(config);

    let FinalOrderNumber = "";
    let FinalInvoiceNumber = "";
    let FYear = "";
    let OutletCode = "";

    var result3 = await pool
      .request()
      .query(
        "select [STORE_CODE] from [dbo].[STORES] where [STORE_PKID] = '" +
          OutletID +
          "'"
      );

    OutletCode = result3.recordsets[0][0].STORE_CODE;

    var result2 = await pool.request().query(
      `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) as fyear`
      // `select cast(( YEAR( GETDATE() ) % 100 ) as nvarchar(100)) + '/'+ cast(( YEAR( GETDATE() ) % 100 + 1 ) as nvarchar(100)) as fyear`
    );

    FYear = result2.recordsets[0][0].fyear;

    var result1 = await pool
      .request()
      .query(
        "select ORDER_ORDER_NUMBER, ORDER_INVOICE_NUMBER from ORDERS where ORDER_PKID = (select max(ORDER_PKID) from ORDERS where ORDER_OUTLET_FKID = '" +
          OutletID +
          "')"
      );
    if (result1.rowsAffected[0] > 0) {
      var OrderNo =
        parseInt(result1.recordsets[0][0].ORDER_ORDER_NUMBER.split("-")[1]) + 1;
      var InvoiceNo =
        parseInt(result1.recordsets[0][0].ORDER_INVOICE_NUMBER) + 1;
      if (OrderNo.toString().length === 4) {
        FinalOrderNumber = OutletCode + "-" + OrderNo + "-" + FYear + "";
      } else if (OrderNo.toString().length === 3) {
        FinalOrderNumber = OutletCode + "-0" + OrderNo + "-" + FYear + "";
      } else if (OrderNo.toString().length === 2) {
        FinalOrderNumber = OutletCode + "-00" + OrderNo + "-" + FYear + "";
      } else if (OrderNo.toString().length === 1) {
        FinalOrderNumber = OutletCode + "-000" + OrderNo + "-" + FYear + "";
      }

      if (InvoiceNo.toString().length === 4) {
        FinalInvoiceNumber = InvoiceNo;
      } else if (InvoiceNo.toString().length === 3) {
        FinalInvoiceNumber = "0" + InvoiceNo;
      } else if (InvoiceNo.toString().length === 2) {
        FinalInvoiceNumber = "00" + InvoiceNo;
      } else if (InvoiceNo.toString().length === 1) {
        FinalInvoiceNumber = "000" + InvoiceNo;
      }
    } else {
      FinalOrderNumber = OutletCode + "-0001-" + FYear + "";
      FinalInvoiceNumber = "0001";
    }

    return {
      FinalOrderNumber: FinalOrderNumber,
      FinalInvoiceNumber: FinalInvoiceNumber,
    };
  } catch (error) {
    console.log("GetDueDate-->", error);
  }
}

async function OutletPlaceOrder(obj) {
  try {
    var arr = [];

    var res = false;

    var OutletCode = "";

    let pool = await sql.connect(config);

    var OutletDetails = await pool
      .request()
      .query(
        "select * from STORES where STORE_PKID = '" +
          obj.ORDER_OUTLET_FKID +
          "'"
      );

    if (OutletDetails.recordsets[0].length > 0) {
      OutletCode = OutletDetails.recordsets[0][0].STORE_CODE;
    }

    QRCode.toFile(
      path.join(
        __dirname,
        "../resources/static/assets/uploads",
        "" + OutletCode + "-" + obj.ORDER_INVOICE_NUMBER + ".png"
      ),
      `${obj.ORDER_ORDER_NUMBER}`,
      (err) => {
        if (err) throw err;
      }
    );

    var result = await pool
      .request()
      .input("ORDER_OUTLET_FKID", obj.ORDER_OUTLET_FKID)
      .input("ORDER_STAFF_FKID", obj.ORDER_STAFF_FKID)
      .input("ORDER_INVOICE_NUMBER", obj.ORDER_INVOICE_NUMBER)
      .input("ORDER_ORDER_NUMBER", obj.ORDER_ORDER_NUMBER)
      .input("ORDER_IS_PICKUP", obj.ORDER_IS_PICKUP)
      .input("ORDER_IS_PICKUP_ID", obj.ORDER_IS_PICKUP_ID)
      .input("ORDER_DOOR_DELIVERY", obj.ORDER_DOOR_DELIVERY)
      .input("ORDER_SERVICE_CATEGORY_FKID", obj.ORDER_SERVICE_CATEGORY_FKID)
      .input("ORDER_SERVICE_TYPE_FKID", obj.ORDER_SERVICE_TYPE_FKID)
      .input("ORDER_CUSTOMER_FKID", obj.ORDER_CUSTOMER_FKID)
      .input("ORDER_DUE_DATE", obj.ORDER_DUE_DATE)
      .input("ORDER_ITEMS", obj.ORDER_ITEMS.length)
      .input("ORDER_COUPON_FKID", obj.ORDER_COUPONS.COUPONS_PKID)
      .input("ORDER_COUPON_TYPE", obj.ORDER_COUPONS.COUPON_TYPE)
      .input("ORDER_AMOUNT", obj.ORDER_AMOUNT)
      .input("ORDER_DISCOUNT", obj.ORDER_DISCOUNT)
      .input("ORDER_DELIVERY_CHARGE", obj.ORDER_DELIVERY_CHARGE)
      .input("ORDER_TOTAL_ORDER_AMOUNT", obj.ORDER_TOTAL_ORDER_AMOUNT)
      .input("ORDER_CGST", obj.ORDER_CGST)
      .input("ORDER_SGST", obj.ORDER_SGST)
      .input("ORDER_CGST_PERCENTAGE", obj.ORDER_CGST_PERCENTAGE)
      .input("ORDER_SGST_PERCENTAGE", obj.ORDER_SGST_PERCENTAGE)
      .input("ORDER_TOTAL_SUR_CHARGE", obj.ORDER_TOTAL_SUR_CHARGE)
      .input("ORDER_TOTAL_INVOICE_VALUE", obj.ORDER_TOTAL_INVOICE_VALUE)
      .input("ORDER_ROUND_OFF_INVOICE", obj.ORDER_ROUND_OFF_INVOICE)
      .input("ORDER_GRAND_TOTAL_AMOUNT", obj.ORDER_GRAND_TOTAL_AMOUNT)
      .input("ORDER_FINAL_ORDER_AMOUNT", obj.ORDER_GRAND_TOTAL_AMOUNT)
      .input("ORDER_STATUS", "0")
      .input("ORDER_MODIFICATION_STATUS", "New Order")
      .input(
        "ORDER_QR",
        "" + OutletCode + "-" + obj.ORDER_INVOICE_NUMBER + ".png"
      )
      .query(
        "insert into ORDERS(ORDER_DATE,ORDER_OUTLET_FKID,ORDER_INVOICE_NUMBER,ORDER_ORDER_NUMBER,ORDER_IS_PICKUP,ORDER_IS_PICKUP_ID,ORDER_DOOR_DELIVERY,ORDER_SERVICE_CATEGORY_FKID,ORDER_SERVICE_TYPE_FKID,ORDER_CUSTOMER_FKID,ORDER_DUE_DATE,ORDER_ITEMS,ORDER_COUPON_FKID,ORDER_AMOUNT,ORDER_DISCOUNT,ORDER_TOTAL_ORDER_AMOUNT,ORDER_CGST,ORDER_SGST,ORDER_TOTAL_INVOICE_VALUE,ORDER_ROUND_OFF_INVOICE,ORDER_GRAND_TOTAL_AMOUNT,ORDER_STATUS,ORDER_MODIFICATION_STATUS,ORDER_QR,ORDER_STAFF_FKID,ORDER_TOTAL_SUR_CHARGE,ORDER_COUPON_TYPE,ORDER_DELIVERY_CHARGE,ORDER_CGST_PERCENTAGE,ORDER_SGST_PERCENTAGE,ORDER_FINAL_ORDER_AMOUNT) values(getdate(),@ORDER_OUTLET_FKID,@ORDER_INVOICE_NUMBER,@ORDER_ORDER_NUMBER,@ORDER_IS_PICKUP,@ORDER_IS_PICKUP_ID,@ORDER_DOOR_DELIVERY,@ORDER_SERVICE_CATEGORY_FKID,@ORDER_SERVICE_TYPE_FKID,@ORDER_CUSTOMER_FKID,@ORDER_DUE_DATE,@ORDER_ITEMS,@ORDER_COUPON_FKID,@ORDER_AMOUNT,@ORDER_DISCOUNT,@ORDER_TOTAL_ORDER_AMOUNT,@ORDER_CGST,@ORDER_SGST,@ORDER_TOTAL_INVOICE_VALUE,@ORDER_ROUND_OFF_INVOICE,@ORDER_GRAND_TOTAL_AMOUNT,@ORDER_STATUS,@ORDER_MODIFICATION_STATUS,@ORDER_QR,@ORDER_STAFF_FKID,@ORDER_TOTAL_SUR_CHARGE,@ORDER_COUPON_TYPE,@ORDER_DELIVERY_CHARGE,@ORDER_CGST_PERCENTAGE,@ORDER_SGST_PERCENTAGE,@ORDER_FINAL_ORDER_AMOUNT)"
      );

    if (result.rowsAffected > 0) {
      if (obj.ORDER_COUPONS.COUPONS_NAME == "New Customer") {
        var UpdateCoupon = await pool
          .request()
          .query(
            `update CUSTOMER_COUPON set CUSTOMER_COUPON_ACTIVE = 2 where CUSTOMER_COUPON_PKID = '${obj.ORDER_COUPONS.COUPONS_PKID}'`
          );
      }

      if (obj.ORDER_COUPONS.CUSTOMER_COUPON_TYPE == "OneTimeUse") {
        var UpdateCoupon = await pool
          .request()
          .query(
            `update CUSTOMER_COUPON set CUSTOMER_COUPON_ACTIVE = 2 where CUSTOMER_COUPON_PKID = '${obj.ORDER_COUPONS.COUPONS_PKID}'`
          );
      }

      var result1 = await pool
        .request()
        .query(
          `select * from ORDERS where ORDER_PKID = (select max(ORDER_PKID) as ORDER_PKID from ORDERS)`
        );
      if (result1.recordsets[0].length > 0) {
        var cnt = 0;
        for (var i = 0; i < obj.ORDER_ITEMS.length; i++) {
          cnt++;
          var OrderItemNumber =
            obj.ORDER_ORDER_NUMBER + "-" + cnt + "/" + obj.ORDER_ITEMS.length;
          QRCode.toFile(
            path.join(
              __dirname,
              "../resources/static/assets/uploads",
              "" +
                OutletCode +
                "-" +
                obj.ORDER_INVOICE_NUMBER +
                "-" +
                cnt +
                "-" +
                obj.ORDER_ITEMS.length +
                ".png"
            ),
            `${OrderItemNumber}`,
            (err) => {
              if (err) throw err;
            }
          );

          var result2 = await pool
            .request()
            .input("ORDER_ITEM_ORDER_FKID", result1.recordsets[0][0].ORDER_PKID)
            .input("ORDER_ITEM_ITEM_FKID", obj.ORDER_ITEMS[i].itemID)
            .input(
              "ORDER_ITEM_ADDITIONAL_REQUEST_FKID",
              obj.ORDER_ITEMS[i].AdditionalRequestID
            )
            .input("ORDER_ITEM_QUANTITY", obj.ORDER_ITEMS[i].itemQuantity)
            .input("ORDER_ITEM_COUNT", obj.ORDER_ITEMS[i].itemCount)
            .input("ORDER_ITEM_DEFECT", obj.ORDER_ITEMS[i].itemDefects)
            .input("ORDER_ITEM_AMOUNT", obj.ORDER_ITEMS[i].itemAmount)
            .input(
              "ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT",
              obj.ORDER_ITEMS[i].AdditionalRequestAmount
            )
            .input("ORDER_ITEM_TOTAL_AMOUNT", obj.ORDER_ITEMS[i].totalAmount)
            .input("ORDER_ITEM_DISCOUNT", obj.ORDER_ITEMS[i].itemDiscount)
            .input(
              "ORDER_ITEM_FINAL_AMOUNT",
              obj.ORDER_ITEMS[i].itemFinalAmount
            )
            .input(
              "ORDER_ITEM_QR",
              "" +
                OutletCode +
                "-" +
                obj.ORDER_INVOICE_NUMBER +
                "-" +
                cnt +
                "-" +
                obj.ORDER_ITEMS.length +
                ".png"
            )
            .input("ORDER_ITEM_NUMBER", OrderItemNumber)
            .query(
              `insert into ORDER_ITEMS(ORDER_ITEM_ORDER_FKID,ORDER_ITEM_ITEM_FKID,ORDER_ITEM_ADDITIONAL_REQUEST_FKID,ORDER_ITEM_QUANTITY,ORDER_ITEM_DEFECT,ORDER_ITEM_AMOUNT,ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT,ORDER_ITEM_TOTAL_AMOUNT,ORDER_ITEM_QR,ORDER_ITEM_NUMBER,ORDER_ITEM_COUNT,ORDER_ITEM_DISCOUNT,ORDER_ITEM_FINAL_AMOUNT) values(@ORDER_ITEM_ORDER_FKID,@ORDER_ITEM_ITEM_FKID,@ORDER_ITEM_ADDITIONAL_REQUEST_FKID,@ORDER_ITEM_QUANTITY,@ORDER_ITEM_DEFECT,@ORDER_ITEM_AMOUNT,@ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT,@ORDER_ITEM_TOTAL_AMOUNT,@ORDER_ITEM_QR,@ORDER_ITEM_NUMBER,@ORDER_ITEM_COUNT,@ORDER_ITEM_DISCOUNT,@ORDER_ITEM_FINAL_AMOUNT)`
            );
        }
        var OrderItemResult = await pool
          .request()
          .input("ORDER_ITEM_ORDER_FKID", result1.recordsets[0][0].ORDER_PKID)
          .query(
            "select ITEMS_NAME, ORDER_ITEM_DEFECT, ORDER_ITEM_NUMBER,ORDER_ITEM_QR, '" +
              OutletCode +
              "' as OutletCode, '" +
              result1.recordsets[0][0].ORDER_QR +
              "' as OrderQR,ORDER_ITEM_COUNT from ORDER_ITEMS join ITEMS on ITEMS_PKID = ORDER_ITEM_ITEM_FKID where ORDER_ITEM_ORDER_FKID = @ORDER_ITEM_ORDER_FKID"
          );
        var OrderDetails = await pool
          .request()
          .input("ORDER_PKID", result1.recordsets[0][0].ORDER_PKID)
          .query(
            "select [ORDER_QR], [ORDER_INVOICE_NUMBER], [ORDER_ORDER_NUMBER], [SERVICE_CATEGORY_NAME], [SERVICE_CATEGORY_HSN], (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,SERVICE_TYPE_NAME from [dbo].[ORDERS] join [dbo].[SERVICE_CATEGORY] on [SERVICE_CATEGORY_PKID] = [ORDER_SERVICE_CATEGORY_FKID] join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID where [ORDER_PKID] = @ORDER_PKID"
          );
        let objj = {
          OrderDetailsForInvoice: OrderDetails.recordsets[0],
          ItemDetailsForTags: OrderItemResult.recordsets[0],
        };
        arr.push(objj);
        res = arr;

        var CustomerDetails = await pool
          .request()
          .input("CUSTOMER_PKID", obj.ORDER_CUSTOMER_FKID)
          .query(
            "select * from CUSTOMERS where CUSTOMER_PKID = @CUSTOMER_PKID"
          );

        // CustomerDetails.recordsets[0][0].CUSTOMER_CONTACT_NUMBER
        // CustomerDetails.recordsets[0][0].CUSTOMER_ALT_NUMBER
        // CustomerDetails.recordsets[0][0].CUSTOMER_EMAIL

        var options = {
          method: "POST",
          url: process.env.SMSCOUNTRY_URL,
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.SMSCOUNTRY_AUTHKEY,
          },
          body: JSON.stringify({
            Text: `Your order ${obj.ORDER_ORDER_NUMBER} is confirmed. Your order due date is ${SplitDate(obj.ORDER_DUE_DATE)}. We'll text you when your order is ready. If you have any question, contact us at +91 938-000-0005 -Laundrexx`,
            Number:
              "91" + CustomerDetails.recordsets[0][0].CUSTOMER_CONTACT_NUMBER + "",
            SenderId: "LNDREX",
            DRNotifyUrl: "https://www.domainname.com/notifyurl",
            DRNotifyHttpMethod: "POST",
            Tool: "API",
          }),
        };
        console.log(options)
        request(options, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body);
        });

        var mailOptions = {
          from: process.env.EMAIL,
          to: CustomerDetails.recordsets[0][0].CUSTOMER_EMAIL,
          subject: "Order Confirmation!",
          html: `<html><head>
                <style>
         
          </style></head>
          <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0">
                          <div style="border-bottom:1px solid #eee">
                            <a href="https://laundrexx.com/" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Laundrexx Fabric Care India Pvt Ltd</a>
                          </div>
                          <p style="font-size: 16px;color: black;font-weight: 600;">Dear ${CustomerDetails.recordsets[0][0].CUSTOMER_NAME},</p>
                          <p style="font-size: 14px;color: black;">Your order <b>( ${obj.ORDER_ORDER_NUMBER} )</b> is confirmed.</p>
                          <p style="font-size: 14px;color: black;">Your order due date is <b>${SplitDate(obj.ORDER_DUE_DATE)}</b>. We'll text you when your order is ready. </p>
                          <p style="font-size: 14px;color: black;">If you have any question, contact us at <b>+91 938-000-0005</b> -Laundrexx</p>
                        </div>
                        </html>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      } else {
        res = false;
      }
    } else {
      res = false;
    }

    return res;
  } catch (error) {
    console.log("OutletPlaceOrder-->", error);
  }
}

async function OutletOrderUpdate(OrderID, obj) {
  try {
    var res = false;

    var OutletCode = "";

    let pool = await sql.connect(config);

    let OrderLogs = await pool
      .request()
      .input("Type", "Edit")
      .input("OrderID", OrderID)
      .input("MadifiedBy", obj.ORDER_MODIFIED_BY)
      .input("ModifiedByID", obj.ORDER_MODIFIED_BY_FKID)
      .execute("OrderLogs");

    var OutletDetails = await pool
      .request()
      .query(
        "select * from STORES where STORE_PKID = '" +
          obj.ORDER_OUTLET_FKID +
          "'"
      );

    if (OutletDetails.recordsets[0].length > 0) {
      OutletCode = OutletDetails.recordsets[0][0].STORE_CODE;
    }

    var result = await pool
      .request()
      .input("ORDER_OUTLET_FKID", obj.ORDER_OUTLET_FKID)
      .input("ORDER_INVOICE_NUMBER", obj.ORDER_INVOICE_NUMBER)
      .input("ORDER_ORDER_NUMBER", obj.ORDER_ORDER_NUMBER)
      .input("ORDER_IS_PICKUP", obj.ORDER_IS_PICKUP)
      .input("ORDER_IS_PICKUP_ID", obj.ORDER_IS_PICKUP_ID)
      .input("ORDER_DOOR_DELIVERY", obj.ORDER_DOOR_DELIVERY)
      .input("ORDER_SERVICE_CATEGORY_FKID", obj.ORDER_SERVICE_CATEGORY_FKID)
      .input("ORDER_SERVICE_TYPE_FKID", obj.ORDER_SERVICE_TYPE_FKID)
      .input("ORDER_CUSTOMER_FKID", obj.ORDER_CUSTOMER_FKID)
      .input("ORDER_DUE_DATE", obj.ORDER_DUE_DATE)
      .input("ORDER_ITEMS", obj.ORDER_ITEMS.length)
      .input("ORDER_COUPON_FKID", obj.ORDER_COUPONS.COUPONS_PKID)
      .input("ORDER_COUPON_TYPE", obj.ORDER_COUPONS.COUPON_TYPE)
      .input("ORDER_AMOUNT", obj.ORDER_AMOUNT)
      .input("ORDER_DISCOUNT", obj.ORDER_DISCOUNT)
      .input("ORDER_TOTAL_ORDER_AMOUNT", obj.ORDER_TOTAL_ORDER_AMOUNT)
      .input("ORDER_CGST", obj.ORDER_CGST)
      .input("ORDER_SGST", obj.ORDER_SGST)
      .input("ORDER_CGST_PERCENTAGE", obj.ORDER_CGST_PERCENTAGE)
      .input("ORDER_SGST_PERCENTAGE", obj.ORDER_SGST_PERCENTAGE)
      .input("ORDER_DELIVERY_CHARGE", obj.ORDER_DELIVERY_CHARGE)
      .input("ORDER_TOTAL_SUR_CHARGE", obj.ORDER_TOTAL_SUR_CHARGE)
      .input("ORDER_TOTAL_INVOICE_VALUE", obj.ORDER_TOTAL_INVOICE_VALUE)
      .input("ORDER_ROUND_OFF_INVOICE", obj.ORDER_ROUND_OFF_INVOICE)
      .input("ORDER_GRAND_TOTAL_AMOUNT", obj.ORDER_GRAND_TOTAL_AMOUNT)
      .input("ORDER_FINAL_ORDER_AMOUNT", obj.ORDER_GRAND_TOTAL_AMOUNT)
      .input("ORDER_PKID", OrderID)
      .input("ORDER_MODIFICATION_STATUS", "Edited Order")
      .input("ORDER_MODIFIED_BY", obj.ORDER_MODIFIED_BY)
      .input("ORDER_MODIFIED_BY_FKID", obj.ORDER_MODIFIED_BY_FKID)
      .query(
        "update ORDERS set ORDER_FINAL_ORDER_AMOUNT = @ORDER_FINAL_ORDER_AMOUNT, ORDER_CGST_PERCENTAGE = @ORDER_CGST_PERCENTAGE, ORDER_SGST_PERCENTAGE = @ORDER_SGST_PERCENTAGE, ORDER_DELIVERY_CHARGE = @ORDER_DELIVERY_CHARGE,ORDER_TOTAL_SUR_CHARGE = @ORDER_TOTAL_SUR_CHARGE, ORDER_COUPON_TYPE = @ORDER_COUPON_TYPE, ORDER_MODIFICATION_STATUS = @ORDER_MODIFICATION_STATUS, ORDER_OUTLET_FKID = @ORDER_OUTLET_FKID,ORDER_INVOICE_NUMBER = @ORDER_INVOICE_NUMBER,ORDER_ORDER_NUMBER = @ORDER_ORDER_NUMBER,ORDER_IS_PICKUP = @ORDER_IS_PICKUP,ORDER_IS_PICKUP_ID = @ORDER_IS_PICKUP_ID,ORDER_DOOR_DELIVERY = @ORDER_DOOR_DELIVERY,ORDER_SERVICE_CATEGORY_FKID = @ORDER_SERVICE_CATEGORY_FKID,ORDER_SERVICE_TYPE_FKID = @ORDER_SERVICE_TYPE_FKID,ORDER_CUSTOMER_FKID = @ORDER_CUSTOMER_FKID,ORDER_DUE_DATE = @ORDER_DUE_DATE,ORDER_ITEMS = @ORDER_ITEMS,ORDER_COUPON_FKID = @ORDER_COUPON_FKID,ORDER_AMOUNT = @ORDER_AMOUNT,ORDER_DISCOUNT = @ORDER_DISCOUNT,ORDER_TOTAL_ORDER_AMOUNT = @ORDER_TOTAL_ORDER_AMOUNT,ORDER_CGST = @ORDER_CGST,ORDER_SGST = @ORDER_SGST,ORDER_TOTAL_INVOICE_VALUE = @ORDER_TOTAL_INVOICE_VALUE,ORDER_ROUND_OFF_INVOICE = @ORDER_ROUND_OFF_INVOICE,ORDER_GRAND_TOTAL_AMOUNT = @ORDER_GRAND_TOTAL_AMOUNT, ORDER_MODIFIED_BY = @ORDER_MODIFIED_BY,ORDER_MODIFIED_BY_FKID = @ORDER_MODIFIED_BY_FKID where ORDER_PKID = @ORDER_PKID"
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .query(
          `delete from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = ${OrderID}`
        );
      var cnt = 0;
      for (var i = 0; i < obj.ORDER_ITEMS.length; i++) {
        cnt++;
        var OrderItemNumber =
          obj.ORDER_ORDER_NUMBER + "-" + cnt + "/" + obj.ORDER_ITEMS.length;
        QRCode.toFile(
          path.join(
            __dirname,
            "../resources/static/assets/uploads",
            "" +
              OutletCode +
              "-" +
              obj.ORDER_INVOICE_NUMBER +
              "-" +
              cnt +
              "-" +
              obj.ORDER_ITEMS.length +
              ".png"
          ),
          `${obj.ORDER_ORDER_NUMBER}-${cnt}/${obj.ORDER_ITEMS.length}`,
          (err) => {
            if (err) throw err;
          }
        );

        var result2 = await pool
          .request()
          .input("ORDER_ITEM_ORDER_FKID", OrderID)
          .input("ORDER_ITEM_ITEM_FKID", obj.ORDER_ITEMS[i].itemID)
          .input(
            "ORDER_ITEM_ADDITIONAL_REQUEST_FKID",
            obj.ORDER_ITEMS[i].AdditionalRequestID
          )
          .input("ORDER_ITEM_QUANTITY", obj.ORDER_ITEMS[i].itemQuantity)
          .input("ORDER_ITEM_COUNT", obj.ORDER_ITEMS[i].itemCount)
          .input("ORDER_ITEM_DEFECT", obj.ORDER_ITEMS[i].itemDefects)
          .input("ORDER_ITEM_AMOUNT", obj.ORDER_ITEMS[i].itemAmount)
          .input(
            "ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT",
            obj.ORDER_ITEMS[i].AdditionalRequestAmount
          )
          .input("ORDER_ITEM_TOTAL_AMOUNT", obj.ORDER_ITEMS[i].totalAmount)
          .input("ORDER_ITEM_DISCOUNT", obj.ORDER_ITEMS[i].itemDiscount)
          .input("ORDER_ITEM_FINAL_AMOUNT", obj.ORDER_ITEMS[i].itemFinalAmount)
          .input(
            "ORDER_ITEM_QR",
            "" +
              OutletCode +
              "-" +
              obj.ORDER_INVOICE_NUMBER +
              "-" +
              cnt +
              "-" +
              obj.ORDER_ITEMS.length +
              ".png"
          )
          .input("ORDER_ITEM_NUMBER", OrderItemNumber)
          .query(
            `insert into ORDER_ITEMS(ORDER_ITEM_ORDER_FKID,ORDER_ITEM_ITEM_FKID,ORDER_ITEM_ADDITIONAL_REQUEST_FKID,ORDER_ITEM_QUANTITY,ORDER_ITEM_DEFECT,ORDER_ITEM_AMOUNT,ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT,ORDER_ITEM_TOTAL_AMOUNT,ORDER_ITEM_QR,ORDER_ITEM_NUMBER,ORDER_ITEM_COUNT,ORDER_ITEM_DISCOUNT,ORDER_ITEM_FINAL_AMOUNT) values(@ORDER_ITEM_ORDER_FKID,@ORDER_ITEM_ITEM_FKID,@ORDER_ITEM_ADDITIONAL_REQUEST_FKID,@ORDER_ITEM_QUANTITY,@ORDER_ITEM_DEFECT,@ORDER_ITEM_AMOUNT,@ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT,@ORDER_ITEM_TOTAL_AMOUNT,@ORDER_ITEM_QR,@ORDER_ITEM_NUMBER,@ORDER_ITEM_COUNT,@ORDER_ITEM_DISCOUNT,@ORDER_ITEM_FINAL_AMOUNT)`
          );
      }
      res = true;
    } else {
      res = false;
    }

    return res;
  } catch (error) {
    console.log("OutletOrderUpdate-->", error);
  }
}

async function AllOrders() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "All")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllOrders-->", error);
  }
}

async function DeliveredOrders(UserType, UserID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", UserID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", UserType === "Admin" ? "Delivered" : "DeliveredForManager")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("DeliveredOrders-->", error);
  }
}

async function Admin_User_CurrentDayOrders(UserType, UserID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", UserID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input(
        "Type",
        UserType === "Admin"
          ? "UserCurrentDayForAdmin"
          : "UserCurrentDayForManager"
      )
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("Admin_User_CurrentDayOrders-->", error);
  }
}

async function Admin_User_CurrentDayOrdersFilter(UserType, UserID, OutletID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", UserID)
      .input("Month", OutletID)
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input(
        "Type",
        UserType === "Admin"
          ? "UserCurrentDayForAdminByOutlet"
          : "UserCurrentDayForManagerByOutlet"
      )
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("Admin_User_CurrentDayOrdersFilter-->", error);
  }
}

async function AllAdminDoorDeliveryOrders() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "AdminDoorDeliveryOrders")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllAdminDoorDeliveryOrders-->", error);
  }
}

async function AllManagerDoorDeliveryOrders(ManagerID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ManagerDoorDeliveryOrders")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllManagerDoorDeliveryOrders-->", error);
  }
}

async function AllAdminDoorDeliveryOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,[ASSIGNED_DOOR_DELIVERY].*,[PICKUPS].*,[DRIVERS].*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[ASSIGNED_DOOR_DELIVERY] on [ASSIGNED_DOOR_DELIVERY_ORDER_FKID] = [ORDER_PKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = ORDER_IS_PICKUP_ID
    left join [dbo].[DRIVERS] on [DRIVER_PKID] = [ASSIGNED_DOOR_DELIVERY_DRIVER_FKID]
    where [ORDER_DOOR_DELIVERY] = '1' AND ([ORDER_STATUS]=4 or [ORDER_STATUS]=5 or [ORDER_STATUS]=6) and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc `;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc `;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("AllAdminDoorDeliveryOrdersWithFilter-->", error);
  }
}

async function AllManagerDoorDeliveryOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,[ASSIGNED_DOOR_DELIVERY].*,[PICKUPS].*,[DRIVERS].*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[USER_OUTLETS] on [USER_OUTLETS_OUTLET_FKID] = STORE_PKID and [USER_OUTLETS_USER_FKID] = '${obj.ManagerID}'
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[ASSIGNED_DOOR_DELIVERY] on [ASSIGNED_DOOR_DELIVERY_ORDER_FKID] = [ORDER_PKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = ORDER_IS_PICKUP_ID
    left join [dbo].[DRIVERS] on [DRIVER_PKID] = [ASSIGNED_DOOR_DELIVERY_DRIVER_FKID]
    where [ORDER_DOOR_DELIVERY] = '1' AND ([ORDER_STATUS]=4 or [ORDER_STATUS]=5 or [ORDER_STATUS]=6) and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc `;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc `;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("AllManagerDoorDeliveryOrdersWithFilter-->", error);
  }
}

async function AllOrdersForManager(ManagerID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "AllForManager")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllOrdersForManager-->", error);
  }
}

async function OrderDetailsByNumber(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", obj.OrderNumber)
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "OrderByNumber")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("OrderDetailsByNumber-->", error);
  }
}

async function ItemDetailsByItemNumber(obj) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select SERVICE_CATEGORY_CODE,CUSTOMER_NAME, ORDER_QR, ORDER_DUE_DATE, ORDER_ORDER_NUMBER, ORDER_INVOICE_NUMBER, STORE_NAME, STORE_CODE, [ITEMS_NAME],ORDER_ITEM_QR,ORDER_ITEM_NUMBER from ORDER_ITEMS join ORDERS on ORDER_PKID = ORDER_ITEM_ORDER_FKID join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID] join STORES on STORE_PKID = ORDER_OUTLET_FKID join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID  join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] where ORDER_ITEM_NUMBER = '" +
          obj.ItemNumber +
          "'"
      );

    return result.recordsets[0];
  } catch (error) {
    console.log("ItemDetailsByItemNumber-->", error);
  }
}

async function OrderDetailsByNumberPrint(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", obj.OrderNumber)
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "OrderByNumber")
      .execute("ViewOrders");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var OrderItems = await pool
        .request()
        .query(
          "select [ITEMS_NAME],ORDER_ITEM_QR,ORDER_ITEM_NUMBER from ORDER_ITEMS join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] where ORDER_ITEM_ORDER_FKID = '" +
            result.recordsets[0][i].ORDER_PKID +
            "'"
        );
      var obj = {
        CUSTOMER_NAME: result.recordsets[0][i].CUSTOMER_NAME,
        ORDER_QR: result.recordsets[0][i].ORDER_QR,
        ORDER_DUE_DATE: result.recordsets[0][i].ORDER_DUE_DATE,
        ORDER_ORDER_NUMBER: result.recordsets[0][i].ORDER_ORDER_NUMBER,
        ORDER_INVOICE_NUMBER: result.recordsets[0][i].ORDER_INVOICE_NUMBER,
        STORE_NAME: result.recordsets[0][i].STORE_NAME,
        STORE_CODE: result.recordsets[0][i].STORE_CODE,
        SERVICE_CATEGORY_CODE: result.recordsets[0][i].STORE_CODE,
        Items: OrderItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("OrderDetailsByNumberPrint-->", error);
  }
}

async function OrderDetailsByItemNumberPrint(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", obj.ItemNumber)
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "OrderByItemNumber")
      .execute("ViewOrders");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var OrderItems = await pool
        .request()
        .query(
          "select [ITEMS_NAME],ORDER_ITEM_QR,ORDER_ITEM_NUMBER from ORDER_ITEMS join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] where ORDER_ITEM_NUMBER = '" +
            obj.ItemNumber +
            "'"
        );
      var obj = {
        CUSTOMER_NAME: result.recordsets[0][i].CUSTOMER_NAME,
        ORDER_QR: result.recordsets[0][i].ORDER_QR,
        ORDER_DUE_DATE: result.recordsets[0][i].ORDER_DUE_DATE,
        ORDER_ORDER_NUMBER: result.recordsets[0][i].ORDER_ORDER_NUMBER,
        ORDER_INVOICE_NUMBER: result.recordsets[0][i].ORDER_INVOICE_NUMBER,
        STORE_NAME: result.recordsets[0][i].STORE_NAME,
        STORE_CODE: result.recordsets[0][i].STORE_CODE,
        SERVICE_CATEGORY_CODE: result.recordsets[0][i].STORE_CODE,
        Items: OrderItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("OrderDetailsByItemNumberPrint-->", error);
  }
}

async function OrderDetailsByDCNumber(obj) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", obj.OrderNumber)
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "OrderByOutletDCNumber")
      .execute("ViewOrders");

    for (var i = 0; i < result.recordsets[0].length; i++) {
      var OrderItems = await pool
        .request()
        .query(
          "select [ITEMS_NAME],ORDER_ITEM_QR,ORDER_ITEM_NUMBER from ORDER_ITEMS join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] where ORDER_ITEM_ORDER_FKID = '" +
            result.recordsets[0][i].ORDER_PKID +
            "'"
        );
      var obj = {
        CUSTOMER_NAME: result.recordsets[0][i].CUSTOMER_NAME,
        ORDER_QR: result.recordsets[0][i].ORDER_QR,
        ORDER_DUE_DATE: result.recordsets[0][i].ORDER_DUE_DATE,
        ORDER_ORDER_NUMBER: result.recordsets[0][i].ORDER_ORDER_NUMBER,
        ORDER_INVOICE_NUMBER: result.recordsets[0][i].ORDER_INVOICE_NUMBER,
        STORE_NAME: result.recordsets[0][i].STORE_NAME,
        STORE_CODE: result.recordsets[0][i].STORE_CODE,
        SERVICE_CATEGORY_CODE: result.recordsets[0][i].STORE_CODE,
        Items: OrderItems.recordsets[0],
      };
      arr.push(obj);
    }

    return arr;
  } catch (error) {
    console.log("OrderDetailsByDCNumber-->", error);
  }
}

async function GetAllOrdersWithFilters(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable,
  isnull(PICKUP_ADDRESS, '-') as PICKUP_ADDRESS,isnull(cast(PICKUP_DATE as nvarchar(max)), '-') as PICKUP_DATE,isnull(DRIVER_NAME, '-') as DRIVER_NAME
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = [ORDER_IS_PICKUP_ID]
	left join [dbo].[DRIVERS] on [DRIVER_PKID] = [PICKUP_DRIVER_FKID]
    where year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllOrdersWithFilters-->", error);
  }
}

async function GetDeliveredOrdersWithFilters(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    ${
      obj.UserType === "Admin"
        ? ""
        : "join [dbo].[USER_OUTLETS] on [USER_OUTLETS_OUTLET_FKID] = [STORE_PKID] and USER_OUTLETS_USER_FKID = " +
          obj.UserID +
          ""
    }
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where year(ORDER_DATE) = '${obj.Year}'  and ORDER_STATUS = 5 `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetDeliveredOrdersWithFilters-->", error);
  }
}

async function GetAllOrdersWithFiltersForManager(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable,
  isnull(PICKUP_ADDRESS, '-') as PICKUP_ADDRESS,isnull(cast(PICKUP_DATE as nvarchar(max)), '-') as PICKUP_DATE,isnull(DRIVER_NAME, '-') as DRIVER_NAME
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join USER_OUTLETS on USER_OUTLETS_OUTLET_FKID = STORE_PKID and USER_OUTLETS_USER_FKID = '${obj.ManagerID}'
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = [ORDER_IS_PICKUP_ID]
	 left join [dbo].[DRIVERS] on [DRIVER_PKID] = [PICKUP_DRIVER_FKID]
    where year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllOrdersWithFilters-->", error);
  }
}

async function AllOrderItemsByOrderID(OrderID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select ORDER_ITEMS.*,[ITEM_CATEGORY_NAME], [SUB_CATEGORY_NAME], [ITEMS_NAME],[ADDITIONAL_SERVICE_NAME]  from ORDER_ITEMS join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] join [dbo].[ITEM_CATEGORY] on [ITEM_CATEGORY_PKID] = [ITEMS_CATEGORY_FKID] join [dbo].[SUB_CATEGORY] on [SUB_CATEGORY_PKID] = [ITEMS_SUB_CATEGORY_FKID] left join [dbo].[ADDITIONAL_SERVICE] on [ADDITIONAL_SERVICE_PKID] = [ORDER_ITEM_ADDITIONAL_REQUEST_FKID] where ORDER_ITEM_ORDER_FKID = '" +
          OrderID +
          "'"
      );
    return result.recordsets[0];
  } catch (error) {
    console.log("AllOrderItemsByOrderID-->", error);
  }
}

async function AllOrderItemsForEditByOrderID(OrderID) {
  try {
    var arr = [];
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select ORDER_ITEMS.*,[ITEM_CATEGORY_NAME], [SUB_CATEGORY_NAME], [ITEMS_NAME],[ITEMS_DISPLAY_NAME],isnull([ADDITIONAL_SERVICE_NAME], 'None') as ADDITIONAL_SERVICE_NAME  from ORDER_ITEMS join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] join [dbo].[ITEM_CATEGORY] on [ITEM_CATEGORY_PKID] = [ITEMS_CATEGORY_FKID] join [dbo].[SUB_CATEGORY] on [SUB_CATEGORY_PKID] = [ITEMS_SUB_CATEGORY_FKID] left join [dbo].[ADDITIONAL_SERVICE] on [ADDITIONAL_SERVICE_PKID] = [ORDER_ITEM_ADDITIONAL_REQUEST_FKID] where ORDER_ITEM_ORDER_FKID = '" +
          OrderID +
          "'"
      );
    for (var i = 0; i < result.recordsets[0].length; i++) {
      const itemList = {
        itemID: result.recordsets[0][i].ORDER_ITEM_ITEM_FKID,
        itemName: result.recordsets[0][i].ITEMS_DISPLAY_NAME,
        itemAmount: parseFloat(result.recordsets[0][i].ORDER_ITEM_AMOUNT),
        AdditionalRequestID:
          result.recordsets[0][i].ORDER_ITEM_ADDITIONAL_REQUEST_FKID,
        AdditionalRequest: result.recordsets[0][i].ADDITIONAL_SERVICE_NAME,
        AdditionalRequestAmount: parseFloat(
          result.recordsets[0][i].ORDER_ITEM_ADDITIONAL_REQUEST_AMOUNT
        ),
        itemQuantity: parseInt(result.recordsets[0][i].ORDER_ITEM_QUANTITY),
        itemCount: parseInt(result.recordsets[0][i].ORDER_ITEM_COUNT),
        itemDefects: result.recordsets[0][i].ORDER_ITEM_DEFECT,
        totalAmount: parseFloat(
          result.recordsets[0][i].ORDER_ITEM_TOTAL_AMOUNT
        ),
        itemDiscount: parseFloat(result.recordsets[0][i].ORDER_ITEM_DISCOUNT),
        itemFinalAmount: parseFloat(
          result.recordsets[0][i].ORDER_ITEM_FINAL_AMOUNT
        ),
      };

      arr.push(itemList);
    }
    return arr;
  } catch (error) {
    console.log("AllOrderItemsForEditByOrderID-->", error);
  }
}

async function GetAllOutletOrders(OrderID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ByOutletCurrentDay")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOutletOrders-->", error);
  }
}

async function GetAllOutletOrdersWithFilters(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where ORDER_OUTLET_FKID = '${obj.Outlet}' and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.CustomerType == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.CustomerType == "-") {
      } else {
        MyQuery += `and CUSTOMER_GST_TYPE = '${obj.CustomerType}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllOutletOrdersWithFilters-->", error);
  }
}

async function GetAllDoorDeliveryOrders(OrderID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "DoorDeliveryOrders")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllDoorDeliveryOrders-->", error);
  }
}

async function GetAllDoorDeliveryOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,[ASSIGNED_DOOR_DELIVERY].*,[PICKUPS].*,[DRIVERS].*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[ASSIGNED_DOOR_DELIVERY] on [ASSIGNED_DOOR_DELIVERY_ORDER_FKID] = [ORDER_PKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = ORDER_IS_PICKUP_ID
    left join [dbo].[DRIVERS] on [DRIVER_PKID] = [ASSIGNED_DOOR_DELIVERY_DRIVER_FKID]
    where ORDER_OUTLET_FKID = '${obj.Outlet}' and [ORDER_DOOR_DELIVERY] = 1 AND [ORDER_STATUS]= 4 and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.CustomerType == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.CustomerType == "-") {
      } else {
        MyQuery += `and CUSTOMER_GST_TYPE = '${obj.CustomerType}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllDoorDeliveryOrdersWithFilter-->", error);
  }
}

async function GetAllOutForDeliveryOrders(OrderID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "OutForDelivery")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOutForDeliveryOrders-->", error);
  }
}

async function GetAllOutForDeliveryOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);
    console.log(obj);
    var MyQuery = `select ORDERS.*,[ASSIGNED_DOOR_DELIVERY].*,[PICKUPS].*,[DRIVERS].*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[ASSIGNED_DOOR_DELIVERY] on [ASSIGNED_DOOR_DELIVERY_ORDER_FKID] = [ORDER_PKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = ORDER_IS_PICKUP_ID
    left join [dbo].[DRIVERS] on [DRIVER_PKID] = [ASSIGNED_DOOR_DELIVERY_DRIVER_FKID]
    where ORDER_OUTLET_FKID = '${obj.Outlet}' and [ORDER_DOOR_DELIVERY] = 1 AND [ORDER_STATUS]=6 AND year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.CustomerType == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc `;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.CustomerType == "-") {
      } else {
        MyQuery += `and CUSTOMER_GST_TYPE = '${obj.CustomerType}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllOutForDeliveryOrdersWithFilter-->", error);
  }
}

async function GetAllDeliveredOrders(OrderID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "Delivered")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllDeliveredOrders-->", error);
  }
}

async function GetAllDeliveredOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);
    var MyQuery = `select ORDERS.*,[ASSIGNED_DOOR_DELIVERY].*,[PICKUPS].*,[DRIVERS].*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[ASSIGNED_DOOR_DELIVERY] on [ASSIGNED_DOOR_DELIVERY_ORDER_FKID] = [ORDER_PKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = ORDER_IS_PICKUP_ID
    left join [dbo].[DRIVERS] on [DRIVER_PKID] = [ASSIGNED_DOOR_DELIVERY_DRIVER_FKID]
    where ORDER_OUTLET_FKID = '${obj.Outlet}' AND [ORDER_STATUS]=5 AND year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.CustomerType == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc `;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.CustomerType == "-") {
      } else {
        MyQuery += `and CUSTOMER_GST_TYPE = '${obj.CustomerType}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllDeliveredOrdersWithFilter-->", error);
  }
}

async function GetAllOutletOrdersCurrentDay(OrderID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ByOutletCurrentDay")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOutletOrdersCurrentDay-->", error);
  }
}

async function GetAllOutletOrdersWithFilters(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable, isnull(DRIVER_NAME, '-') as DRIVER_NAME, isnull(PICKUP_ADDRESS, '-') as PICKUP_ADDRESS, isnull(cast(PICKUP_DATE as varchar(max)), '-') as PICKUP_DATE, isnull(PICKUP_BULK_ITEMS, 0) as PICKUP_BULK_ITEMS
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = [ORDER_IS_PICKUP_ID]
	  left join [dbo].[DRIVERS] on [DRIVER_PKID] = [PICKUP_DRIVER_FKID]
    where ORDER_OUTLET_FKID = '${obj.Outlet}' and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.CustomerType == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.CustomerType == "-") {
      } else {
        MyQuery += `and CUSTOMER_GST_TYPE = '${obj.CustomerType}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllOutletOrdersWithFilters-->", error);
  }
}

async function OutletGetReadyForDeliveryOrders(OrderID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "ByOutletReadyForDelivery")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("OutletGetReadyForDeliveryOrders-->", error);
  }
}

async function OutletGetReadyForDeliveryOrdersFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable, isnull(DRIVER_NAME, '-') as DRIVER_NAME, isnull(PICKUP_ADDRESS, '-') as PICKUP_ADDRESS, isnull(cast(PICKUP_DATE as varchar(max)), '-') as PICKUP_DATE, isnull(PICKUP_BULK_ITEMS, 0) as PICKUP_BULK_ITEMS
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    left join [dbo].[PICKUPS] on [PICKUP_CODE] = [ORDER_IS_PICKUP_ID]
	  left join [dbo].[DRIVERS] on [DRIVER_PKID] = [PICKUP_DRIVER_FKID]
    where ORDER_OUTLET_FKID = '${obj.Outlet}' and ORDER_STATUS = 4 and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.CustomerType == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.CustomerType == "-") {
      } else {
        MyQuery += `and CUSTOMER_GST_TYPE = '${obj.CustomerType}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("OutletGetReadyForDeliveryOrdersFilter-->", error);
  }
}

async function DeleteOrder(id, ModifiedBy, ModifiedByID) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    let OrderLogs = await pool
      .request()
      .input("Type", "Delete")
      .input("OrderID", id)
      .input("MadifiedBy", ModifiedBy)
      .input("ModifiedByID", ModifiedByID)
      .execute("OrderLogs");

    let result1 = await pool
      .request()
      .input("ORDER_ITEM_ORDER_FKID", id)
      .query(
        "delete from ORDER_ITEMS where ORDER_ITEM_ORDER_FKID = @ORDER_ITEM_ORDER_FKID"
      );
    if (result1.rowsAffected > 0) {
      let result2 = await pool
        .request()
        .input("ORDER_PKID", id)
        .query("delete from ORDERS where ORDER_PKID = @ORDER_PKID");
      if (result2.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("DeleteOrder-->", error);
  }
}

async function GetOrderModifiedDates(id) {
  try {
    var res = false;
    var pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select ORDER_MODIFICATION_DATE, ORDER_MODIFICATION_TIME from ORDERS_LOG where ORDER_PKID = '" +
          id +
          "'"
      );
    return result.recordsets[0];
  } catch (error) {
    console.log("GetOrderModifiedDates-->", error);
  }
}

async function GetModifiedOrder(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", obj.OrderID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", obj.Date)
      .input("ToDate", obj.Time)
      .input("Type", "Modified")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetModifiedOrder-->", error);
  }
}

async function GetAllDeletedOrders() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "Deleted")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllDeletedOrders-->", error);
  }
}

async function GetAllDeletedOrdersForManager(ManagerID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "DeletedManager")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllDeletedOrdersForManager-->", error);
  }
}

async function GetAllDeletedOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS_LOG.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS_LOG] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS_LOG] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED
    from ORDERS_LOG 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where ORDER_LOG_TYPE = 'Deleted Order' and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc `;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc `;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllDeletedOrdersWithFilter-->", error);
  }
}

async function GetAllDeletedOrdersWithFilterForManager(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS_LOG.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS_LOG] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS_LOG] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED
    from ORDERS_LOG 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join USER_OUTLETS on USER_OUTLETS_OUTLET_FKID = STORE_PKID and USER_OUTLETS_USER_FKID = '${obj.ManagerID}'
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where ORDER_LOG_TYPE = 'Deleted Order' and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}') `;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("GetAllDeletedOrdersWithFilterForManager-->", error);
  }
}

async function GetAllOrderItemsForDeletedOrder(OrderID) {
  try {
    let pool = await sql.connect(config);

    var result = await pool
      .request()
      .query(
        "select ORDER_ITEMS_LOG.*,[ITEM_CATEGORY_NAME], [SUB_CATEGORY_NAME], [ITEMS_NAME],[ADDITIONAL_SERVICE_NAME]  from ORDER_ITEMS_LOG join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] join [dbo].[ITEM_CATEGORY] on [ITEM_CATEGORY_PKID] = [ITEMS_CATEGORY_FKID] join [dbo].[SUB_CATEGORY] on [SUB_CATEGORY_PKID] = [ITEMS_SUB_CATEGORY_FKID] left join [dbo].[ADDITIONAL_SERVICE] on [ADDITIONAL_SERVICE_PKID] = [ORDER_ITEM_ADDITIONAL_REQUEST_FKID] where ORDER_ITEM_ORDER_FKID = '" +
          OrderID +
          "'"
      );
    return result.recordsets[0];
  } catch (error) {
    console.log("GetAllOrderItemsForDeletedOrder-->", error);
  }
}

async function LogsOrderItems(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("ORDER_ITEM_ORDER_FKID", obj.OrderID)
      .input("ORDER_ITEM_MODIFICATION_DATE", obj.Date)
      .input("ORDER_ITEM_MODIFICATION_TIME", obj.Time)
      .query(
        "select distinct ORDER_ITEMS_LOG.*,[ITEM_CATEGORY_NAME], [SUB_CATEGORY_NAME], [ITEMS_NAME],[ADDITIONAL_SERVICE_NAME]  from ORDER_ITEMS_LOG join [dbo].[ITEMS] on [ITEMS_PKID] = [ORDER_ITEM_ITEM_FKID] join [dbo].[ITEM_CATEGORY] on [ITEM_CATEGORY_PKID] = [ITEMS_CATEGORY_FKID] join [dbo].[SUB_CATEGORY] on [SUB_CATEGORY_PKID] = [ITEMS_SUB_CATEGORY_FKID] left join [dbo].[ADDITIONAL_SERVICE] on [ADDITIONAL_SERVICE_PKID] = [ORDER_ITEM_ADDITIONAL_REQUEST_FKID] where ORDER_ITEM_ORDER_FKID = @ORDER_ITEM_ORDER_FKID and ORDER_ITEM_MODIFICATION_DATE = @ORDER_ITEM_MODIFICATION_DATE and ORDER_ITEM_MODIFICATION_TIME = @ORDER_ITEM_MODIFICATION_TIME"
      );
    return result.recordsets[0];
  } catch (error) {
    console.log("LogsOrderItems-->", error);
  }
}

async function AllB2BCustomerOrders() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "B2BAll")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllB2BCustomerOrders-->", error);
  }
}

async function AllB2BCustomerOrdersWithFilter(obj) {
  try {
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where CUSTOMER_GST_TYPE = 'B2B' and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("AllB2BCustomerOrdersWithFilter-->", error);
  }
}

async function AllB2BCustomerOrdersForManager(ManagerID) {
  try {
    let pool = await sql.connect(config);
    console.log(ManagerID, "ManagerID");
    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "B2BAllForManager")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllB2BCustomerOrdersForManager-->", error);
  }
}

async function AllB2BCustomerOrdersWithFilterForManager(obj) {
  try {
    let pool = await sql.connect(config);
    console.log(obj);
    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join USER_OUTLETS on USER_OUTLETS_OUTLET_FKID = STORE_PKID and USER_OUTLETS_USER_FKID = '${obj.ManagerID}'
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID] 
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where CUSTOMER_GST_TYPE = 'B2B' and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("AllB2BCustomerOrdersWithFilterForManager-->", error);
  }
}

async function OrderAssignDeliveryPerson(obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);
    var result = await pool
      .request()
      .input("ASSIGNED_DOOR_DELIVERY_ORDER_FKID", obj.OrderID)
      .input("ASSIGNED_DOOR_DELIVERY_DRIVER_FKID", obj.DriverID)
      .input("ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY", obj.AssignedBy)
      .input("ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY_FKID", obj.AssignedByID)
      .query(
        `insert into ASSIGNED_DOOR_DELIVERY(ASSIGNED_DOOR_DELIVERY_ORDER_FKID,ASSIGNED_DOOR_DELIVERY_DRIVER_FKID,ASSIGNED_DOOR_DELIVERY_DATE,ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY,ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY_FKID,ASSIGNED_DOOR_DELIVERY_STATUS) values(@ASSIGNED_DOOR_DELIVERY_ORDER_FKID,@ASSIGNED_DOOR_DELIVERY_DRIVER_FKID,getdate(),@ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY,@ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY_FKID,1)`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("OrderAssignDeliveryPerson-->", error);
  }
}

async function OrderUpdateDeliveryPerson(id, obj) {
  try {
    var res = false;
    var pool = await sql.connect(config);
    var result = await pool
      .request()
      .input("ASSIGNED_DOOR_DELIVERY_PKID", id)
      .input("ASSIGNED_DOOR_DELIVERY_ORDER_FKID", obj.OrderID)
      .input("ASSIGNED_DOOR_DELIVERY_DRIVER_FKID", obj.DriverID)
      .input("ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY", obj.AssignedBy)
      .input("ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY_FKID", obj.AssignedByID)
      .query(
        `update ASSIGNED_DOOR_DELIVERY set ASSIGNED_DOOR_DELIVERY_ORDER_FKID=@ASSIGNED_DOOR_DELIVERY_ORDER_FKID,ASSIGNED_DOOR_DELIVERY_DRIVER_FKID=@ASSIGNED_DOOR_DELIVERY_DRIVER_FKID,ASSIGNED_DOOR_DELIVERY_DATE=getdate(),ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY=@ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY,ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY_FKID=@ASSIGNED_DOOR_DELIVERY_ASSIGNED_BY_FKID,ASSIGNED_DOOR_DELIVERY_STATUS='1' where ASSIGNED_DOOR_DELIVERY_PKID = @ASSIGNED_DOOR_DELIVERY_PKID`
      );

    if (result.rowsAffected > 0) {
      res = true;
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("OrderUpdateDeliveryPerson-->", error);
  }
}

async function updateOutletHandoverToDriver(OrderID) {
  try {
    var res = false;
    var pool = await sql.connect(config);
    var result = await pool
      .request()
      .input("ORDER_PKID", OrderID)
      .query(
        `update ORDERS set ORDER_STATUS = '6' where ORDER_PKID = @ORDER_PKID`
      );

    if (result.rowsAffected > 0) {
      var result1 = await pool
        .request()
        .input("STORE_INVENTORY_ORDER_FKID", OrderID)
        .query(
          `update STORE_INVENTORY set STORE_INVENTORY_STATUS = 0 where STORE_INVENTORY_ORDER_FKID = @STORE_INVENTORY_ORDER_FKID`
        );
      if (result1.rowsAffected > 0) {
        res = true;
      } else {
        res = false;
      }
    } else {
      res = false;
    }
    return res;
  } catch (error) {
    console.log("updateOutletHandoverToDriver-->", error);
  }
}

async function AllOrdersForBadDebits() {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", "")
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "BadDebitsAllOrder")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllOrdersForBadDebits-->", error);
  }
}

async function AllOrdersForBadDebitsForManager(ManagerID) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .input("Outlet", ManagerID)
      .input("Month", "")
      .input("Year", "")
      .input("FromDate", "")
      .input("ToDate", "")
      .input("Type", "BadDebitsAllOrderForManager")
      .execute("ViewOrders");

    return result.recordsets[0];
  } catch (error) {
    console.log("AllOrdersForBadDebitsForManager-->", error);
  }
}

async function AllOrdersForBadDebitsFilter(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where (ORDER_STATUS = 4 or ORDER_STATUS = 6) and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("AllOrdersForBadDebitsFilter-->", error);
  }
}

async function AllOrdersForBadDebitsFilterForManager(obj) {
  try {
    console.log(obj);
    let pool = await sql.connect(config);

    var MyQuery = `select ORDERS.*,SERVICE_CATEGORY_NAME,SERVICE_TYPE_NAME,SERVICE_CATEGORY_HSN,STORE_STAFF_NAME,SERVICE_CATEGORY_CGST,SERVICE_CATEGORY_SGST,
    (select sum(cast([ORDER_ITEM_QUANTITY] as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalQuantity,
    (select sum(cast(ORDER_ITEM_COUNT as int)) from [dbo].[ORDER_ITEMS] where [ORDER_ITEM_ORDER_FKID] = [ORDER_PKID]) TotalCount,
    ISNULL((case when ORDERS.ORDER_MODIFIED_BY_FKID = 0 then ORDERS.ORDER_MODIFIED_BY else (select [USER_NAME] from [dbo].[USERS] where USER_PKID = ORDERS.ORDER_MODIFIED_BY_FKID) end),'-') as ModifiedBy,
    (select [DIGITAL_SIGNATURE_FILE] from [dbo].[DIGITAL_SIGNATURE] where [DIGITAL_SIGNATURE_PKID] = (select max([DIGITAL_SIGNATURE_PKID]) from [dbo].[DIGITAL_SIGNATURE])) as DIGITAL_SIGNATURE,
    STORES.*,FACTORY_NAME,FACTORY_CODE,ROUTE_NAME,ROUTE_CODE,SERVICE_TYPE_SURCHARGE,
    [CUSTOMER_PKID], [CUSTOMER_NAME], [CUSTOMER_CONTACT_NUMBER], [CUSTOMER_GST_TYPE], [CUSTOMER_EMAIL], [CUSTOMER_ADDRESS],[CUSTOMER_TYPE_NAME],CUSTOMER_GST_NUMBER,
    case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PKID else COUPONS.COUPONS_PKID end as COUPONS_PKID, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_NAME else COUPONS.COUPONS_NAME end as COUPONS_NAME, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 'CustomerBasedCoupon' else (case when COUPONS.COUPONS_ITEM_BASED = 0 then 'OrderBasedCoupon' else  'ItemBasedCoupon' end) end as COUPON_TYPE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_TYPE else COUPONS.COUPONS_VALIDITY end as COUPONS_VALIDITY, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then '-' else cast(COUPONS.COUPONS_VALIDITY_DATE as nvarchar(max)) end as COUPONS_VALIDITY_DATE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_CODE else COUPONS.COUPONS_CODE end as COUPONS_CODE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_PERCENT_OR_PRICE else COUPONS.COUPONS_PRICE_OR_PERCENTAGE end as COUPONS_PRICE_OR_PERCENTAGE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_DISCOUNT else COUPONS.COUPONS_DISCOUNT end as COUPONS_DISCOUNT, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then CUSTOMER_COUPON.CUSTOMER_COUPON_ACTIVE else COUPONS.COUPONS_ACTIVE end as COUPONS_ACTIVE, 
	case when ORDER_COUPON_TYPE = 'CustomerBasedCoupon' then 0 else COUPONS.COUPONS_ITEM_BASED end as COUPONS_ITEM_BASED, 
	cast((case when DATEDIFF(day, ORDER_DATE, getdate()) > 2 then 0 else 1 end) as bit) as IsEditable
    from ORDERS 
    join SERVICE_CATEGORY on SERVICE_CATEGORY_PKID = ORDER_SERVICE_CATEGORY_FKID 
    join SERVICE_TYPE on SERVICE_TYPE_PKID = ORDER_SERVICE_TYPE_FKID 
    join STORES on STORE_PKID = ORDER_OUTLET_FKID
    join [dbo].[USER_OUTLETS] on [USER_OUTLETS_OUTLET_FKID] = [STORE_PKID] and [USER_OUTLETS_USER_FKID] = '${obj.ManagerID}'
    join [dbo].[STORE_STAFF] on [STORE_STAFF_PKID] = [ORDER_STAFF_FKID]
    join [dbo].[ROUTES] on ROUTE_PKID = STORE_ROUTE_FKID 
    join FACTORY on FACTORY_PKID = STORE_DEFAULT_FACTORY 
    join [dbo].[CUSTOMERS] on [CUSTOMER_PKID] = [ORDER_CUSTOMER_FKID]
    join [dbo].[CUSTOMER_TYPE] on [CUSTOMER_TYPE_PKID] = [CUSTOMER_TYPE_FKID]
    left join COUPONS on [COUPONS_PKID] = [ORDER_COUPON_FKID]
    left join CUSTOMER_COUPON on CUSTOMER_COUPON_PKID = [ORDER_COUPON_FKID]
    where (ORDER_STATUS = 4 or ORDER_STATUS = 6) and year(ORDER_DATE) = '${obj.Year}' `;

    if (
      obj.Outlet == "-" &&
      obj.Month == "-" &&
      obj.FromDate == "-" &&
      obj.ToDate == "-"
    ) {
      MyQuery += `order by ORDER_PKID desc`;
      var result3 = await pool.request().query(MyQuery);
      return result3.recordsets[0];
    } else {
      if (obj.Outlet == "-") {
      } else {
        MyQuery += `and ORDER_OUTLET_FKID = '${obj.Outlet}' `;
      }
      if (obj.Month == "-") {
      } else {
        MyQuery += `and month(ORDER_DATE) = '${obj.Month}' `;
      }
      if (obj.FromDate == "-") {
      } else {
        MyQuery += `and (ORDER_DATE between '${obj.FromDate}' and '${obj.ToDate}')`;
      }
      MyQuery += `order by ORDER_PKID desc`;
      var result4 = await pool.request().query(MyQuery);
      return result4.recordsets[0];
    }
  } catch (error) {
    console.log("AllOrdersForBadDebitsFilterForManager-->", error);
  }
}

async function UpdateOrderBadDebits(obj) {
  try {
    let pool = await sql.connect(config);

    let result = await pool
      .request()
      .query(
        `update ORDERS set ORDER_BAD_DEBITS = '${obj.OrderBadDebits}', ORDER_FINAL_ORDER_AMOUNT = '${obj.FinalOrderAmount}' where ORDER_PKID = '${obj.OrderPkid}'`
      );
    if (result.rowsAffected > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("UpdateOrderBadDebits-->", error);
  }
}

const SplitDate = (OrderDate) => {
  const MainDate = OrderDate.split("T");
  const SplitT = MainDate[0];
  const OrderDates = SplitT.split("-");
  const FinalDate = OrderDates[2] + "-" + OrderDates[1] + "-" + OrderDates[0];
  return FinalDate;
}

module.exports = {
  GetDueDate: GetDueDate,
  GetInvoiceNumber: GetInvoiceNumber,
  OutletPlaceOrder: OutletPlaceOrder,
  OutletOrderUpdate: OutletOrderUpdate,
  AllOrders: AllOrders,
  DeliveredOrders: DeliveredOrders,
  GetDeliveredOrdersWithFilters: GetDeliveredOrdersWithFilters,
  Admin_User_CurrentDayOrders: Admin_User_CurrentDayOrders,
  Admin_User_CurrentDayOrdersFilter: Admin_User_CurrentDayOrdersFilter,
  AllOrdersForManager: AllOrdersForManager,
  OrderDetailsByNumber: OrderDetailsByNumber,
  OrderDetailsByNumberPrint: OrderDetailsByNumberPrint,
  OrderDetailsByItemNumberPrint: OrderDetailsByItemNumberPrint,
  ItemDetailsByItemNumber: ItemDetailsByItemNumber,
  OrderDetailsByDCNumber: OrderDetailsByDCNumber,
  GetAllOrdersWithFilters: GetAllOrdersWithFilters,
  GetAllOrdersWithFiltersForManager: GetAllOrdersWithFiltersForManager,
  AllOrderItemsByOrderID: AllOrderItemsByOrderID,
  AllOrderItemsForEditByOrderID: AllOrderItemsForEditByOrderID,
  GetAllOutletOrders: GetAllOutletOrders,
  GetAllDoorDeliveryOrders: GetAllDoorDeliveryOrders,
  GetAllDoorDeliveryOrdersWithFilter: GetAllDoorDeliveryOrdersWithFilter,
  GetAllOutForDeliveryOrders: GetAllOutForDeliveryOrders,
  GetAllOutForDeliveryOrdersWithFilter: GetAllOutForDeliveryOrdersWithFilter,
  GetAllDeliveredOrders: GetAllDeliveredOrders,
  GetAllDeliveredOrdersWithFilter: GetAllDeliveredOrdersWithFilter,
  GetAllOutletOrdersCurrentDay: GetAllOutletOrdersCurrentDay,
  GetAllOutletOrdersWithFilters: GetAllOutletOrdersWithFilters,
  OutletGetReadyForDeliveryOrders: OutletGetReadyForDeliveryOrders,
  OutletGetReadyForDeliveryOrdersFilter: OutletGetReadyForDeliveryOrdersFilter,
  DeleteOrder: DeleteOrder,
  GetOrderModifiedDates: GetOrderModifiedDates,
  GetModifiedOrder: GetModifiedOrder,
  GetAllDeletedOrders: GetAllDeletedOrders,
  GetAllDeletedOrdersForManager: GetAllDeletedOrdersForManager,
  GetAllDeletedOrdersWithFilter: GetAllDeletedOrdersWithFilter,
  GetAllDeletedOrdersWithFilterForManager:
    GetAllDeletedOrdersWithFilterForManager,
  GetAllOrderItemsForDeletedOrder: GetAllOrderItemsForDeletedOrder,
  LogsOrderItems: LogsOrderItems,
  AllB2BCustomerOrders: AllB2BCustomerOrders,
  AllB2BCustomerOrdersWithFilter: AllB2BCustomerOrdersWithFilter,
  AllB2BCustomerOrdersForManager: AllB2BCustomerOrdersForManager,
  AllB2BCustomerOrdersWithFilterForManager:
    AllB2BCustomerOrdersWithFilterForManager,
  AllAdminDoorDeliveryOrders: AllAdminDoorDeliveryOrders,
  AllManagerDoorDeliveryOrders: AllManagerDoorDeliveryOrders,
  AllAdminDoorDeliveryOrdersWithFilter: AllAdminDoorDeliveryOrdersWithFilter,
  AllManagerDoorDeliveryOrdersWithFilter:
    AllManagerDoorDeliveryOrdersWithFilter,
  OrderAssignDeliveryPerson: OrderAssignDeliveryPerson,
  OrderUpdateDeliveryPerson: OrderUpdateDeliveryPerson,
  updateOutletHandoverToDriver: updateOutletHandoverToDriver,
  AllOrdersForBadDebits: AllOrdersForBadDebits,
  AllOrdersForBadDebitsForManager: AllOrdersForBadDebitsForManager,
  AllOrdersForBadDebitsFilter: AllOrdersForBadDebitsFilter,
  AllOrdersForBadDebitsFilterForManager: AllOrdersForBadDebitsFilterForManager,
  UpdateOrderBadDebits: UpdateOrderBadDebits,
  SampleMailTest: SampleMailTest,
};
