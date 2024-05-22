import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import CryptoJS from "crypto-js";

const apikey = "";
const apiSecret = "";
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
  const endpoint = "/api/v2/mix/account/accounts";
  const body = null;
  const queryParams = "?productType=USDT-FUTURES";
  return await request("GET", endpoint, body, queryParams);
}

async function get_position(j) {
  const endpoint = "/api/v2/mix/position/single-position";
  const body = null;
  const queryParams = `?symbol=${j.symbol.toLowerCase()}&productType=${j.productType.toUpperCase()}&marginCoin=${j.marginCoin.toUpperCase()}`;
  return await request("GET", endpoint, body, queryParams);
}

async function get_order(j) {
  const endpoint = "/api/v2/mix/order/detail";
  const body = null;
  const queryParams = `?symbol=${j.symbol.toLowerCase()}&productType=${j.productType.toUpperCase()}&orderId=${j.orderId}`;
  return await request("GET", endpoint, body, queryParams);
}

async function get_openOrders(j) {
  const endpoint = "/api/v2/mix/order/orders-pending";
  const body = null;
  const queryParams = `?productType=${j.productType.toLowerCase()}`;
  return await request("GET", endpoint, body, queryParams);
}

async function set_leverage(j) {
  const endpoint = "/api/v2/mix/account/set-leverage";
  const body = {
    symbol: `${j.symbol.toUpperCase()}`,
    productType: `${j.productType.toLowerCase()}`,
    marginCoin: `${j.marginCoin.toUpperCase()}`,
    leverage: `${j.leverage}`,
    holdSide: `${j.holdSide}`,
  };
  const queryParams = ``;
  return await request("POST", endpoint, body, queryParams);
}

async function change_marginMode(j) {
  const endpoint = "/api/v2/mix/account/set-margin-mode";
  const body = {
    symbol: `${j.symbol.toUpperCase()}`,
    productType: `${j.productType.toLowerCase()}`,
    marginCoin: `${j.marginCoin.toUpperCase()}`,
    marginMode: `${j.marginMode}`,
  };
  const queryParams = ``;
  return await request("POST", endpoint, body, queryParams);
}

async function cancel_order(j) {
  const endpoint = "/api/v2/mix/order/cancel-order";
  const body = {
    orderId: `${j.orderId}`,
    symbol: `${j.symbol.toUpperCase()}`,
    productType: `${j.productType.toLowerCase()}`,
    marginCoin: `${j.marginCoin.toUpperCase()}`,
  };
  const queryParams = ``;
  return await request("POST", endpoint, body, queryParams);
}

async function cancel_allOrders(j) {
  const endpoint = "/api/v2/mix/order/cancel-all-orders";
  const body = {
    symbol: `${j.symbol.toUpperCase()}`,
    productType: `${j.productType.toLowerCase()}`,
    marginCoin: `${j.marginCoin.toUpperCase()}`,
  };
  const queryParams = ``;
  return await request("POST", endpoint, body, queryParams);
}

async function new_marketOrder() {
  const endpoint = "/api/v2/mix/order/place-order";
  const body = {
    symbol: "XRPUSDT",
    productType: "usdt-futures",
    marginMode: "isolated",
    marginCoin: "USDT",
    size: "25",
    side: "buy",
    tradeSide: "open",
    orderType: "market",
    force: "gtc",
    clientOid: `${Date.now()}`,
  };
  return await request("POST", endpoint, body, "");
}

async function new_limitOrder() {
  const endpoint = "/api/v2/mix/order/place-order";
  const body = {
    symbol: "XRPUSDT",
    productType: "usdt-futures",
    marginMode: "isolated",
    marginCoin: "USDT",
    size: "25",
    price: "0.3",
    side: "buy",
    tradeSide: "open",
    orderType: "limit",
    force: "gtc",
    clientOid: `${Date.now()}`,
  };
  return await request("POST", endpoint, body, "");
}

async function new_tpslLimitOrder() {
  const endpoint = "/api/v2/mix/order/place-order";
  const body = {
    symbol: "XRPUSDT",
    productType: "usdt-futures",
    marginMode: "isolated",
    marginCoin: "USDT",
    size: "25",
    price: "0.3",
    side: "buy",
    tradeSide: "open",
    orderType: "limit",
    force: "gtc",
    presetStopSurplusPrice: "0.7",
    presetStopLossPrice: "0.2",
    clientOid: `${Date.now()}`,
  };
  return await request("POST", endpoint, body, "");
}

async function new_tpslOrder() {
  const endpoint = "/api/v2/mix/order/place-order";
  const body = {
    symbol: "XRPUSDT",
    productType: "usdt-futures",
    marginMode: "isolated",
    marginCoin: "USDT",
    size: "18",
    side: "buy",
    tradeSide: "open",
    orderType: "market",
    force: "gtc",
    presetStopSurplusPrice: "0.7",
    presetStopLossPrice: "0.2",
    clientOid: `${Date.now()}`,
  };
  return await request("POST", endpoint, body, "");
}

// new_tpslLimitOrder();
// new_tpslOrder();
// get_account();
// new_limitOrder();
// new_marketOrder();
// get_position({
//   symbol: "XRPUSDT",
//   productType: "USDT-FUTURES",
//   marginCoin: "USDT",
// });
// get_order({
//   symbol: "XRPUSDT",
//   productType: "USDT-FUTURES",
//   orderId: "1177151178774003731",
// });
// get_openOrders({ productType: "USDT-FUTURES" });
// cancel_order({
//   symbol: "XRPUSDT",
//   productType: "USDT-FUTURES",
//   marginCoin: "USDT",
//   orderId: "1177151178774003731",
// });
// cancel_allOrders({
//   symbol: "XRPUSDT",
//   productType: "USDT-FUTURES",
//   marginCoin: "USDT",
// });
// set_leverage({
//   symbol: "XRPUSDT",
//   productType: "USDT-FUTURES",
//   marginCoin: "USDT",
//   leverage: 2,
//   holdSide: "long",
// });
// change_marginMode({
//   symbol: "XRPUSDT",
//   productType: "USDT-FUTURES",
//   marginCoin: "USDT",
//   marginMode: "crossed", //isolated or crossed
// });
