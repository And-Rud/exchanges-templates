import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import CryptoJS from "crypto-js";

const apikey = "";
const apiSecret =
  "";
const httpBase = "https://api.bitget.com";
const passphrase = "";

function sign(message) {
  const hmac = crypto.createHmac("sha256", apiSecret);
  hmac.update(message);
  return hmac.digest("base64");
}

function preHash(timestamp, method, requestPath, body) {
  return timestamp + method.toUpperCase() + requestPath + body;
}

function parseParamsToStr(params) {
  const sortedParams = Object.entries(params).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );
  const queryString = sortedParams
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return queryString ? `?${queryString}` : "";
}
async function request(method, endpoint, body, queryParams) {
  const timestamp = Date.now().toString(); //Math.round(new Date())
  // let requestPath = "/api/v2/mix/order/place-order";

  // // POST
  // const params = {
  //   symbol: "TRXUSDT",
  //   marginCoin: "USDT",
  //   price: 0.0555,
  //   size: 551,
  //   side: "buy",
  //   orderType: "limit",
  //   force: "normal",
  // };
  // const body = JSON.stringify(params);
  // let sign = sign(
  //   preHash(timestamp, "POST", requestPath, body)
  // );
  // console.log(sign);

  // GET

  let signString = timestamp + method + endpoint + queryParams + body;
  let sign = crypto
    .createHmac("sha256", apiSecret)
    .update(signString)
    .digest("base64");
  // sign = sign(preHash(timestamp, "GET", endpoint, body), apiSecret);
  console.log(sign);

  const headers = {
    "Content-Type": "application/json",
    "ACCESS-KEY": apikey,
    "ACCESS-TIMESTAMP": timestamp,
    "ACCESS-PASSPHRASE": passphrase,
    "ACCESS-SIGN": sign,
    locale: "en-US",
  };
  console.log("Headers", headers);

  const requestOptions = {
    method: method,
    url: httpBase + endpoint + queryParams,
    headers: headers,
    data: body,
  };
  try {
    const res = await axios(requestOptions);
    return {
      statusCode: 200,
      status: "success",
      content: res.data.data,
    };
  } catch (e) {
    console.log(e);
  }
}

async function get_account() {
  const method = "GET";
  const endpoint = "/api/v2/mix/account/accounts";
  const body = null;
  const queryParams = "?productType=USDT-FUTURES";
  const response = await request(method, endpoint, body, queryParams);
  return response;
}

// let res = await get_account();

// console.log("res", res);
