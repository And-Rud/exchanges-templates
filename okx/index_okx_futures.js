import axios from "axios";
import crypto from "crypto";
import Big from "big.js";

const httpBase = "https://www.okx.com";
const apikey = "";
const apiSecret = "";
const passPhrase = "";
let textToSign = "";

// The first you must in OKX SWAP choose in setting account mode type single-currency margin
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

async function new_order_limit() {
  const params = {
    instId: "XRP-USDT-SWAP",
    tdMode: "cross",
    side: "buy",
    ordType: "limit",
    px: "0.001",
    sz: "10",
  };
  return await request("/api/v5/trade/order", params, "POST");
}

async function set_accountLevel() {
  const params = {
    acctLv: "2",
  };
  return await request("/api/v5/account/set-account-level", params, "POST");
}

async function new_order_market() {
  const params = {
    instId: "XRP-USDT",
    tdMode: "cross",
    ccy: "USDT", //this field only for cross
    side: "buy",
    ordType: "market",
    sz: "10",
  };
  return await request("/api/v5/trade/order", params, "POST");
}

async function cancel_order() {
  const params = {
    instId: "XRP-USDT",
    ordId: "1448690521339891712",
  };
  return await request("/api/v5/trade/cancel-order", params, "POST");
}

async function close_position() {
  const params = {
    instId: "XRP-USDT",
    mgnMode: "cross",
    ccy: "USDT",
  };
  return await request("/api/v5/trade/close-position", params, "POST");
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
      ordId: "1448692866123599873",
    },
  ];
  return await request("/api/v5/trade/cancel-batch-orders", params, "POST");
}

async function get_openOrders() {
  const params = {
    instType: "MARGIN",
    ordType: "limit",
  };
  return await request("/api/v5/trade/orders-pending", params, "get");
}

async function get_order() {
  const params = {
    ordId: "1448679000694099971",
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

async function getPosition() {
  const params = null;
  return await request("/api/v5/account/positions", params, "GET");
}

async function new_order_tpsl() {
  const params = {
    instId: "XRP-USDT-SWAP",
    tdMode: "cross",
    side: "buy",
    ordType: "market",
    // ccy: "USDT",
    px: "0.001",
    sz: "10",
    // tpTriggerPx: "0.64", //trigPrice xrp
    // tpOrdPx: "13", //tp in USDT if -1 that mean market price
    slTriggerPx: "0.0002", //trigPrice xrp
    slOrdPx: "10", //sl in USDT if -1 that mean market price
  };
  return await request("/api/v5/trade/order", params, "POST");
}

async function trailing_limitTradeOrder() {
  const params = {
    instId: "XRP-USDT-SWAP",
    tdMode: "isolated",
    side: "buy",
    px: "0.001",
    sz: "10",
    ordType: "move_order_stop",
    reduceOnly: false,
    // tpTriggerPx: "0.007", //trigPrice xrp
    // tpOrdPx: "13", //tp in USDT if -1 that mean market price
    // slTriggerPx: "0.7", //trigPrice xrp
    // slOrdPx: "0.3", //sl in USDT if -1 that mean market price
    callbackRatio: "0.02", //trailing price in %
    // callbackSpread: 1, //trailing price in USDT
    activePx: "0.3", //trigerPrice if empty - marketPrice
  };
  return await request("/api/v5/trade/order-algo", params, "POST");
}

async function getLeverage() {
  const params = {
    instId: "XRP-USDT-SWAP",
    mgnMode: "cross", //isolated or cross
  };
  return await request("/api/v5/account/leverage-info", params, "GET");
}

async function setLeverageAndMarginMode() {
  const params = {
    instId: "XRP-USDT-SWAP",
    lever: "3.00",
    mgnMode: "cross", //isolated or cross
  };
  return await request("/api/v5/account/set-leverage", params, "POST");
}

async function setPositionMode() {
  const params = {
    posMode: "net_mode", //net_mode or long_short_mode
  };
  return await request("/api/v5/account/set-position-mode", params, "POST");
}

// set_accountLevel();
// new_order_limit();
// new_order_market();
// get_order();
// get_openOrders();
// cancel_order();
// cancel_openOrders();
// close_position();
// new_order_tpsl();
// trailing_limitTradeOrder();
// getPosition();
// getLeverage();
// setLeverageAndMarginMode();
// setPositionMode();
