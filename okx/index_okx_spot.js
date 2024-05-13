import axios from "axios";
import crypto from "crypto";
import Big from "big.js";

const httpBase = "https://www.okx.com";
const apikey = "";
const apiSecret = "";
const passPhrase = "";
let textToSign = "";

function getTimestamp() {
  const date = new Date();
  const formattedDate = date.toISOString().slice(0, -5) + "Z";
  return formattedDate;
}

async function request(requestPath, params, method, cursor = false) {
  console.log(params);
  if (method.toUpperCase() === "GET") {
    requestPath += params ? `?${new URLSearchParams(params).toString()}` : "";
    params = {};
  }
  console.log("requestPath", requestPath);

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
    data: body,
  };
  if (method === "POST") {
    config.data = body;
    console.log();
  }

  let res;
  try {
    res = await axios(config);
    const data = res.data;
    console.log("data", JSON.stringify(data));
    return {
      statusCode: 200,
      status: "success",
      data: data.data,
    };
  } catch (e) {
    console.error(e.response.data);
  }
}

function signature(timestamp, method, requestPath, body, secretKey) {
  // if (method === "GET") {
  //   body = "";
  // }
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

async function new_order_limit() {
  const params = {
    instId: "XRP-USDT",
    tdMode: "cash",
    side: "buy",
    ordType: "limit",
    px: "0.2",
    sz: "30",
  };
  return await request("/api/v5/trade/order", params, "POST");
}

async function new_order_market() {
  const params = {
    instId: "XRP-USDT",
    tdMode: "cash",
    side: "buy",
    ordType: "market",
    sz: "7",
  };
  return await request("/api/v5/trade/order", params, "POST");
}

async function cancel_order() {
  const params = {
    instId: "XRP-USDT",
    ordId: "1445738346510848000",
  };
  return await request("/api/v5/trade/cancel-order", params, "POST");
}

async function cancel_trailingStopOrder() {
  const params = [
    {
      instId: "XRP-USDT",
      algoId: "710217886954164224",
    },
  ];
  return await request("/api/v5/trade/cancel-algos", params, "POST");
}

async function get_price() {
  const params = {
    instId: "XRP-USDT",
  };
  return await request("/api/v5/market/ticker", params, "GET");
}

async function cancel_openOrders() {
  const params = [
    {
      instId: "XRP-USDT",
      ordId: "1445827864802922496",
    },
  ];
  return await request("/api/v5/trade/cancel-batch-orders", params, "POST");
}

async function get_openOrders() {
  const params = {
    instType: "SPOT",
    ordType: "limit",
  };
  return await request("/api/v5/trade/orders-pending", params, "get");
}

async function get_order() {
  const params = {
    ordId: "710217886954164224",
    instId: "XRP-USDT",
  };
  return await request("/api/v5/trade/order", params, "GET");
}

async function get_openOrdersTrailingStop() {
  const params = {
    ordType: "move_order_stop",
  };
  return await request("/api/v5/trade/orders-algo-pending", params, "get");
}

async function get_orderTrailingStop() {
  const params = {
    algoId: "710221015615541248",
  };
  return await request("/api/v5/trade/order-algo", params, "GET");
}

async function getMyTrades() {
  const params = {
    instId: "XRP-USDT",
  };
  return await request("/api/v5/market/trades", params, "GET");
}

async function new_order_tpsl() {
  const params = {
    instId: "XRP-USDT",
    tdMode: "cash",
    side: "buy",
    ordType: "market",
    px: "0.2",
    sz: "7",
    tpTriggerPx: "0.4", //trigPrice xrp
    tpOrdPx: "13", //tp in USDT if -1 that mean market price
    slTriggerPx: "0.7", //trigPrice xrp
    slOrdPx: "0.3", //sl in USDT if -1 that mean market price
  };
  return await request("/api/v5/trade/order", params, "POST");
}

async function trailing_limitTradeOrder() {
  const params = {
    instId: "XRP-USDT",
    tdMode: "cash",
    side: "buy",
    ordType: "move_order_stop",
    sz: "7",
    // tpTriggerPx: "0.7", //trigPrice xrp
    // tpOrdPx: "13", //tp in USDT if -1 that mean market price
    // slTriggerPx: "0.7", //trigPrice xrp
    // slOrdPx: "0.3", //sl in USDT if -1 that mean market price
    callbackRatio: "0.02", //trailing price in %
    // callbackSpread: 1, //trailing price in USDT
    activePx: "0.7", //trigerPrice if empty - marketPrice
  };
  return await request("/api/v5/trade/order-algo", params, "POST");
}

// getPriceTicker();
// cancel_order();
// cancel_trailingStopOrder();
// new_order_limit();
// cancel_openOrders();
// get_openOrders();
// get_order();
// get_orderTrailingStop();
// get_openOrdersTrailingStop();
// get_price();
// getMyTrades();
// new_order_tpsl();
// trailing_limitTradeOrder();
