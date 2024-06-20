import crypto from "crypto";
import axios from "axios";
import http from "http-client";
import Big from "big.js";

const apikey = "";
const apiSecret = "";
const httpBase = "https://api.binance.com";
const recvWindow = 10000;

async function call_api(method, path, payload, body) {
  let url = `${httpBase}${path}?${payload}`;
  let headers = { "X-MBX-APIKEY": apikey };
  let config = {
    method: method,
    url: url,
    body: body,
    headers: headers,
  };
  console.log("config", config);
  try {
    let res = await axios(config);
    console.log("res-call-api111", res.data, res.headers);
    //data.limits = extractWeightLimitsByHeaders(data.headers);
    return res;
  } catch (e) {
    console.log(e);
  }
}

async function call_unsigned_get(path) {
  let url = `${httpBase}${path}`;
  console.log("call_unsigned_get: " + url);
  try {
    let res = await axios({ method: "GET", url: url });
    // data.limits = extractWeightLimitsByHeaders(res.headers);
    console.log("res1", res.data, "\n", res.headers);
    return res;
  } catch (e) {
    console.log(e);
  }
}
async function axios_call_unsigned_get(path, timeout) {
  let url = `${httpBase}${path}`;
  console.log("axios_all_unsigned_get: " + url);
  try {
    let res = await axios({ method: "GET", url: url, timeout: timeout });
    console.log("res1", res.data, "\n", res.headers);
    return res;
  } catch (e) {
    console.log(e);
  }
}

function extractWeightLimitsByHeaders(headers) {
  console.log("111");
  let limits = [];
  let propertyNames = Object.keys(headers).filter(function (propertyName) {
    return (
      propertyName.indexOf("x-mbx-used-weight-") === 0 ||
      propertyName.indexOf("x-mbx-order-count-") === 0
    );
  });

  for (const propertyName of propertyNames) {
    const limit = {
      name: "",
      used: "0",
      intervalNum: "",
      intervalLetter: "",
      usedRateLimits: "",
    };
    limit.name = propertyName;
    limit.usedRateLimits = headers[propertyName];
    let propertyNameValues = "";

    if (propertyName.indexOf("x-mbx-used-weight-") === 0) {
      propertyNameValues = propertyName.split("x-mbx-used-weight-")[1];
    }
    if (propertyName.indexOf("x-mbx-order-count-") === 0) {
      propertyNameValues = propertyName.split("x-mbx-order-count-")[1];
    }

    if (propertyNameValues.length > 0) {
      limit.intervalLetter = propertyNameValues.substring(
        propertyNameValues.length - 1,
      );
      limit.intervalNum = propertyNameValues.substring(
        0,
        propertyNameValues.length - 1,
      );
    }
    limits.push(limit);
  }
  return limits;
}

function sign_sha(data) {
  let pars = [];
  for (let item in data) {
    pars.push(item + "=" + data[item]);
  }
  let p = pars.sort().join("&");
  let hash = crypto.createHmac("sha256", apiSecret);
  hash.update(p);
  let sig = hash.digest("hex");
  p += `&signature=${sig}`;
  console.log(p);
  return p;
}

function get_account() {
  let path = `/api/v3/account`;
  let timer = new Date();
  let body = { timestamp: timer.getTime(), recvWindow: recvWindow };
  let payload = sign_sha(body);
  return call_api("GET", path, payload, body);
}

function get_listen_key() {
  let path = "/api/v3/userDataStream";
  let headers = { "X-MBX-APIKEY": apikey };
  let url = `${httpBase}${path}`;
  let config = {
    method: "POST",
    url: url,
    headers: headers,
  };
  console.log("config", config);
  try {
    let res = axios(config);
    console.log("res", res);
    return res;
  } catch (e) {
    console.log(1);
  }
}

function keep_alive_listen_key(j) {
  console.info(j);
  let path = "/api/v3/userDataStream";
  let p = "listenKey=" + j.listenKey.replace(/[^A-Za-z0-9]/g, "");
  return call_api("PUT", path, p, {});
}

function close_listen_key(j) {
  console.info(j);
  let path = "/api/v3/userDataStream";
  let p = "listenKey=" + j.listenKey.replace(/[^A-Za-z0-9]/g, "");
  return call_api("DELETE", path, p, {});
}

async function server_time() {
  let path = `/api/v3/time`;
  return await call_unsigned_get(path);
}

async function exchange_info(symbol, symbols) {
  let params_query = "";
  if (typeof symbol !== "undefined" && symbol != null) {
    params_query = `?symbol=` + symbol.toUpperCase();
  }

  if (typeof symbols !== "undefined" && symbols != null) {
    params_query =
      `?symbols=[` +
      symbols
        .map(function (sym) {
          return '"' + sym.toUpperCase() + '"';
        })
        .join(",") +
      `]`;
  }

  let path = `/api/v3/exchangeInfo` + params_query;
  // console.warn(path);
  return await call_unsigned_get(path);
}

async function ticker24(symbol) {
  let path = `/api/v3/ticker/24hr?symbol=` + symbol.toUpperCase();
  return await call_unsigned_get(path);
}

async function ticker_price(symbol) {
  let params_query = "";
  if (symbol) {
    params_query = `?symbol=` + symbol.toUpperCase();
  }
  let path = `/api/v3/ticker/price` + params_query;
  return await call_unsigned_get(path);
}

async function ticker_book(symbol) {
  let params_query = "";
  if (symbol) {
    params_query = `?symbol=` + symbol.toUpperCase();
  }
  let path = `/api/v3/ticker/bookTicker` + params_query;
  return await call_unsigned_get(path);
}

async function order_book(symbol, limit) {
  let params_query = "";
  if (typeof symbol !== "undefined" && symbol != null) {
    params_query = `?symbol=` + symbol.toUpperCase();
  }

  if (typeof limit !== "undefined" && limit != null) {
    params_query += `&limit=${limit}`;
  }

  let path = `/api/v3/depth` + params_query;
  // console.warn(path);
  return await call_unsigned_get(path);
}

function new_order(j) {
  let path = "/api/v3/order";
  j.timestamp = Date.now();
  j.symbol = j.symbol.toUpperCase();
  j.side = j.side.toUpperCase();
  j.type = j.type.toUpperCase();
  // j.newOrderRespType = "ACK";
  j.newOrderRespType = "FULL";
  let payload = sign_sha(j);
  return call_api("POST", path, payload, j);
}

function query_order(j) {
  let path = "/api/v3/order";
  let timer = new Date();
  let body = { timestamp: timer.getTime(), recvWindow: recvWindow };
  body.orderId = j.orderId;
  body.symbol = j.symbol.toUpperCase();
  let payload = sign_sha(body);
  return call_api("GET", path, payload, body);
}

function myTrades(j) {
  let path = "/api/v3/myTrades";
  let timer = new Date();
  let body = { timestamp: timer.getTime(), recvWindow: recvWindow };
  body.symbol = j.symbol.toUpperCase();
  if (j.startTime) body.startTime = j.startTime;
  if (j.endTime) body.endTime = j.endTime;
  if (j.fromId) body.fromId = j.fromId;
  if (j.limit) body.limit = j.limit;
  let payload = sign_sha(body);
  return call_api("GET", path, payload, body);
}

function get_open_orders(j) {
  let path = "/api/v3/openOrders";
  let body = { timestamp: new Date().getTime(), recvWindow: recvWindow };
  if (typeof j.symbol === "string" && j.symbol.length > 1) {
    body.symbol = j.symbol.toUpperCase();
  }
  let payload = sign_sha(body);
  return call_api("GET", path, payload, body);
}

function get_all_orders(j) {
  let path = "/api/v3/allOrders";
  let body = { timestamp: new Date().getTime(), recvWindow: recvWindow };
  body.symbol = j.symbol.toUpperCase();
  if (j.orderId) body.orderId = j.orderId;
  if (j.startTime) body.startTime = j.startTime;
  if (j.endTime) body.endTime = j.endTime;
  if (j.recvWindow) body.recvWindow = j.recvWindow;

  let payload = sign_sha(body);
  return call_api("GET", path, payload, body);
}

function cancel_order(j) {
  console.info(j);
  let path = "/api/v3/order";
  let timer = new Date();
  let body = { timestamp: timer.getTime() };
  body.orderId = j.orderId;
  body.symbol = j.symbol.toUpperCase();
  let payload = sign_sha(body);
  return call_api("DELETE", path, payload, body);
}

function cancel_all_orders(j) {
  console.info(j);
  let path = "/api/v3/openOrders";
  let timer = new Date();
  let body = { timestamp: timer.getTime() };
  body.symbol = j.symbol.toUpperCase();
  let payload = sign_sha(body);
  return call_api("DELETE", path, payload, body);
}

async function getPriceTicker() {
  try {
    const res = await axios.get("https://api.binance.com/api/v3/ticker/price");
    if (res.status === 200) {
      return res.data;
    } else {
      throw new Error(JSON.stringify(res));
    }
  } catch (e) {
    console.error("Error ", e);
  }
}

// get_all_orders({
//   symbol: "XRPUSDT",
// });
// ticker_price("XRPUSDT");
