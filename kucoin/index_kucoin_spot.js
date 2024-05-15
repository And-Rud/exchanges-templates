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
    "KC-API-KEY": apikey,
    "KC-API-KEY-VERSION": "2",
    "KC-API-TIMESTAMP": timestamp,
    "KC-API-PASSPHRASE": passph,
    "KC-API-SIGN": sign,
  };
  console.log("Headers", headers);
  let config = {
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
  const endpoint = "/api/v1/accounts?type=trade";
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

async function marketOrder() {
  const endpoint = "/api/v1/orders";
  const body = {
    symbol: "XRP-USDT",
    side: "buy",
    type: "market",
    size: "30",
    clientOid: `${Date.now()}`,
  };
  return await http_request("POST", endpoint, JSON.stringify(body));
}

async function limitOrder() {
  const endpoint = "/api/v1/orders";
  const body = {
    symbol: "XRP-USDT",
    side: "buy",
    type: "limit",
    price: "0.2",
    size: "30",
    clientOid: `${Date.now()}`,
  };
  return await http_request("POST", endpoint, JSON.stringify(body));
}

async function cancelOrder() {
  const params = {
    symbol: "XRP-USDT",
    orderId: "664387d90a20f50007e89629",
  };
  const body = "";
  const endpoint = `/api/v1/orders/${params.orderId}?symbol=${params.symbol}`;

  return await http_request("DELETE", endpoint, JSON.stringify(body));
}

async function cancelAllOrders() {
  const params = {
    symbol: "XRP-USDT",
    tradeType: "TRADE",
  };
  const body = "";
  const endpoint = `/api/v1/orders?symbol=${params.symbol}&tradeType=${params.tradeType}`;

  return await http_request("DELETE", endpoint, JSON.stringify(body));
}

async function getAllOrders() {
  const body = "";
  const endpoint = `/api/v1/orders?status=active`;

  return await http_request("GET", endpoint, body);
}

async function sltpOrder() {
  const endpoint = "/api/v3/oco/order";
  const body = {
    symbol: "XRP-USDT",
    side: "buy",
    stopPrice: "0.7",
    price: "0.2",
    size: "30",
    limitPrice: "0.6",
    clientOid: `${Date.now()}`,
  };
  return await http_request("POST", endpoint, JSON.stringify(body));
}

// marketOrder();
// get_account();
// limitOrder();
// cancelOrder();
// cancelAllOrders();
// getAllOrders();
// sltpOrder();
