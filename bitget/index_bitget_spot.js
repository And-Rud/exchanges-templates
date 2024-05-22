import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import CryptoJS from "crypto-js";

const apikey = "";
const apiSecret ="";
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
  body ? (body = JSON.stringify(body)) : null;
  let signString = timestamp + method + endpoint + queryParams + body;
  console.log("signString", signString);
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

  const config = {
    method: method,
    url: httpBase + endpoint + (queryParams ? queryParams : ""),
    headers: headers,
    data: body,
  };
  console.log("config", config);
  try {
    const res = await axios(config);
    console.log("res", res.data);
    return {
      statusCode: 200,
      status: "success",
      content: res.data,
    };
  } catch (e) {
    console.log(e);
  }
}

async function get_account() {
  const endpoint = "/api/v2/spot/account/assets";
  const body = null;
  const queryParams = "";
  return await request("GET", endpoint, body, queryParams);
}

async function getPriceTicker() {
  const method = "GET";
  const endpoint = "/api/v2/spot/market/tickers";
  const body = null;
  const queryParams = "";
  return await request(method, endpoint, body, queryParams);
}

async function getPrice(symbol) {
  const endpoint = "/api/v2/spot/market/tickers";
  const queryParams = `?symbol=${symbol}`;
  return await request("GET", endpoint, null, queryParams);
}

async function cancel_order(j) {
  const endpoint = "/api/v2/spot/trade/cancel-order";
  const body = { symbol: `${j.symbol}`, orderId: `${j.orderId}` };
  return await request("POST", endpoint, body, "");
}

async function cancel_allOrders(j) {
  const endpoint = "/api/v2/spot/trade/cancel-symbol-order";
  const body = { symbol: `${j.symbol}` };
  return await request("POST", endpoint, body, "");
}

async function get_order(j) {
  const endpoint = "/api/v2/spot/trade/orderInfo";
  const queryParams = `?orderId=${j.orderId}`;
  return await request("GET", endpoint, null, queryParams);
}

async function get_openOrders(j) {
  const endpoint = "/api/v2/spot/trade/unfilled-orders";
  const queryParams = ``;
  return await request("GET", endpoint, null, queryParams);
}

async function new_limitOrder() {
  const endpoint = "/api/v2/spot/trade/place-order";
  const body = {
    symbol: "XRPUSDT",
    side: "buy",
    orderType: "limit",
    force: "gtc",
    price: "0.3",
    size: "25",
    clientOid: `${Date.now()}`,
  };
  return await request("POST", endpoint, body, "");
}

async function new_marketOrder() {
  const endpoint = "/api/v2/spot/trade/place-order";
  const body = {
    symbol: "XRPUSDT",
    side: "buy",
    orderType: "market",
    size: "7",
    clientOid: `${Date.now()}`,
  };
  return await request("POST", endpoint, body, "");
}

async function new_sltpLimitOrder() {
  const endpoint = "/api/v2/spot/trade/place-order";
  const body = {
    symbol: "XRPUSDT",
    side: "buy",
    orderType: "limit",
    force: "gtc",
    price: "0.3",
    size: "25",
    triggerPrice: "0.7",
    tpslType: "tpsl",
  };
  return await request("POST", endpoint, body, "");
}

async function new_sltpOrder() {
  const endpoint = "/api/v2/spot/trade/place-order";
  const body = {
    symbol: "XRPUSDT",
    side: "buy",
    orderType: "market",
    size: "7",
    triggerPrice: "0.7",
    tpslType: "tpsl",
  };
  return await request("POST", endpoint, body, "");
}

// get_account();
// new_limitOrder();
// new_marketOrder();
// cancel_order({ symbol: "XRPUSDT", orderId: "1177113058197540875" });
// get_order({ orderId: "1177113058197540875" });
// cancel_allOrders({ symbol: "XRPUSDT" });
// get_openOrders();
// getPrice("XRPUSDT");
// new_sltpLimitOrder();
// new_sltpOrder();
