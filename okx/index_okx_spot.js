import axios from "axios";
let crypto = require("crypto");

const httpBase = "https://www.okx.com";
const apikey = "";
const apiSecret = "";
const passPhrase = "1";
const textToSign = "";

async function request(requestPath, params, method, cursor = false) {
  console.log(params);
  if (method.toUpperCase() === "GET") {
    requestPath += params ? `?${new URLSearchParams(params).toString()}` : "";
    params = {};
  }

  const url = `${httpBase}${requestPath}`;
  const body = params ? JSON.stringify(params) : "";
  const timestamp = getTimestamp();

  const sign = signature(timestamp, method, requestPath, body, apiSecret);
  const headers = {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": apikey,
    "OK-ACCESS-SIGN": sign,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": passPhrase,
    "OK-TEXT-TO-SIGN": textToSign,
  };
  console.log(url);
  console.log("Headers:", headers);
  let config = {
    method: method,
    url: url,
    headers: headers,
    body: body,
  };
  if (method === "POST") {
    config.body = body;
  }

  try {
    const response = await axios(config);
    const data = response.data;
    return {
      statusCode: 200,
      status: "success",
      content: data.data,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

function getTimestamp() {
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, -5) + "Z";
  return formattedDate;
}

function signature(timestamp, method, requestPath, body, secretKey) {
  if (method === "GET") {
    body = "";
  }
  const message = `${timestamp}${method.toUpperCase()}${requestPath}${body}`;
  textToSign = message;
  console.log("message", message);
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("base64");
  return signature;
}

async function get_account() {
  const params = null;
  return await request("/api/v5/account/balance", params, "GET");
}

async function getPriceTicker() {
  const params = { instType: "SPOT" };
  return await request("/api/v5/market/tickers", params, "GET");
}
