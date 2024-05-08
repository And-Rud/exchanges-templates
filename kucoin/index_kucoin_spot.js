import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import CryptoJS from "crypto-js";

const apikey = "";
const apiSecret = "";
const recvWindow = 10000;
const httpBase = "https://api.kucoin.com";
const passphrase = "";

async function http_request(method = "GET", endpoint, data = null) {
  const url = httpBase + endpoint;

  console.log(`send ${method} request to ${url}:`);
  const timestamp = new Date().getTime();

  const headers = {
    "Content-Type": "application/json",
    "KC-API-KEY": apikey,
    "KC-API-TIMESTAMP": timestamp,
    "KC-API-PASSPHRASE": passphrase,
    "KC-API-SIGN": signature(endpoint, data, timestamp, method),
  };
  console.log("Headers", headers);

  const requestOptions = {
    method: method,
    url: url,
    headers: headers,
    body: data,
  };
  try {
    const res = await axios(requestOptions);
    return {
      statusCode: 200,
      status: "success",
      data: res.data.data,
    };
  } catch (e) {
    console.log(e);
  }
}

function signature(
  request_path = "",
  body = "",
  timestamp = "",
  method = "GET",
) {
  body = Array.isArray(body) ? JSON.stringify(body, null, 0) : body;
  const what = timestamp + method + request_path + body;

  return crypto.createHmac("sha256", apiSecret).update(what).digest("base64");
}

async function get_account() {
  const endpoint = "/api/v1/account-overview?currency=USDT";
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

async function getPriceTicker() {
  const endpoint = "/api/v1/market/allTickers";
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

// let res = await get_account();
// console.log(res);
