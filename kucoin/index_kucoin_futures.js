import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import CryptoJS from "crypto-js";

const apikey = "";
const apiSecret = "";
const recvWindow = 10000;
const httpBase = "https://api-futures.kucoin.com";
const passphrase = "";

async function http_request(method = "GET", endpoint, data = null) {
  const url = httpBase + endpoint;

  console.log(`send ${method} request to ${url}:`);
  const timestamp = new Date().getTime();
  const passph = crypto
    .createHmac("sha256", apiSecret)
    .update(passphrase)
    .digest("base64");
  const signString = timestamp + method.toUpperCase() + endpoint + data;
  console.log("signString", signString);
  const sign = crypto
    .createHmac("sha256", apiSecret)
    .update(signString)
    .digest("base64");
  console.log("sign", sign);

  const headers = {
    "Content-Type": "application/json",
    "KC-API-KEY-VERSION": "2",
    "KC-API-KEY": apikey,
    "KC-API-TIMESTAMP": timestamp,
    "KC-API-PASSPHRASE": passph,
    "KC-API-SIGN": sign,
  };
  console.log("Headers", headers);

  const config = {
    method: method,
    url: url,
    headers: headers,
  };
  if (data !== "") {
    config.data = data;
  }
  console.log("config", config);
  try {
    const res = await axios(config);
    console.log("res", res);
    // return {
    //   statusCode: 200,
    //   status: "success",
    //   data: res.data.data,
    // };
  } catch (e) {
    console.log(e.response.data);
  }
}

async function get_account() {
  const endpoint = "/api/v1/account-overview?currency=USDT";
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

async function get_serverTime() {
  const endpoint = "/api/v1/timestamp";
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

async function get_Position(j) {
  const endpoint = `/api/v1/position?symbol=${j.symbol}`;
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

async function get_order(j) {
  const endpoint = `/api/v1/orders/${j.orderId}`;
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

async function get_openOrders(j) {
  const endpoint = `/api/v1/orders?status=active`;
  const body = "";
  const response = await http_request("GET", endpoint, body);
  return response;
}

async function cancel_order(j) {
  const endpoint = `/api/v1/orders/${j.orderId}`;
  const body = "";
  const response = await http_request("DELETE", endpoint, body);
  return response;
}

async function cancel_allOrders(j) {
  const endpoint = `/api/v1/orders?symbol=${j.symbol}`;
  const body = "";
  const response = await http_request("DELETE", endpoint, body);
  return response;
}

async function new_order_limit(j) {
  // this order buy USDT behind XRP
  const endpoint = `/api/v1/orders`;
  const body = {
    symbol: "XRPUSDM",
    side: "buy",
    type: "limit",
    price: "0.3",
    leverage: 1,
    size: "3",
    clientOid: `${Date.now()}`,
  };
  const response = await http_request("POST", endpoint, JSON.stringify(body));
  return response;
}

async function new_order_market(j) {
  // this order buy USDT behind XRP
  const endpoint = `/api/v1/orders`;
  const body = {
    symbol: "XRPUSDM",
    side: "buy",
    type: "market",
    leverage: 1,
    size: "2",
    clientOid: `${Date.now()}`,
  };
  const response = await http_request("POST", endpoint, JSON.stringify(body));
  return response;
}

async function close_Position(j) {
  const endpoint = `/api/v1/orders`;
  const body = {
    symbol: "XRPUSDM",
    side: "buy",
    type: "market",
    leverage: 1,
    size: "2",
    clientOid: `${Date.now()}`,
    closeOrder: true,
    orderId: `${j.orderId}`,
  };
  const response = await http_request("POST", endpoint, JSON.stringify(body));
  return response;
}

async function new_stop_order(j) {
  // this order buy USDT behind XRP
  const endpoint = `/api/v1/orders`;
  const body = {
    symbol: "XRPUSDM",
    side: "buy",
    type: "limit",
    price: "0.3",
    leverage: 1,
    size: "3",
    stop: "up",
    stopPriceType: "TP",
    stopPrice: "0.4",
    clientOid: `${Date.now()}`,
  };
  const response = await http_request("POST", endpoint, JSON.stringify(body));
  return response;
}

// get_account();
// get_serverTime();
// get_Position({ symbol: "XRPUSDT" });
// close_Position({ orderId: "181976470351044608" });
// get_order({ orderId: "181970401797144577" });
// get_openOrders();
// cancel_allOrders({ symbol: "XRPUSDM" });
// cancel_order({ orderId: "181970401797144577" });

// new_order_limit();
// new_order_market();
// new_stop_order();
