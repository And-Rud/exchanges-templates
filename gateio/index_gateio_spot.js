import crypto from "crypto";
import axios from "axios";
const basePath = "https://api.gateio.ws";

const apikey = "";
const apiSecret = "";

async function request(method, url, queryParameters, payloadString) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  if (payloadString !== "") {
    payloadString = JSON.stringify(payloadString);
  }

  const hashedPayload = crypto
    .createHash("sha512")
    .update(payloadString, "utf-8")
    .digest("hex");

  const signatureString =
    method +
    "\n" +
    url +
    "\n" +
    queryParameters +
    "\n" +
    hashedPayload +
    "\n" +
    timestamp;
  console.log("signatureString", signatureString);
  let signature = crypto
    .createHmac("sha512", apiSecret)
    .update(signatureString, "utf-8")
    .digest("hex");

  const headers = {
    Timestamp: timestamp,
    KEY: apikey,
    "Content-Type": "application/json",
    Accept: "application/json",
    SIGN: signature,
  };
  console.log("Headers:", headers);

  const config = {
    method: method,
    data: payloadString,
    headers: headers,
    url: basePath + url + (queryParameters ? `?${queryParameters}` : ""),
  };
  console.log("config", config);
  try {
    let res = await axios(config);
    console.log("res", res.data);
    // return {
    //   statusCode: 200,
    //   status: "success",
    //   content: res.data,
    // };
  } catch (e) {
    console.log(e.response.data);
  }
}

async function get_account() {
  const url = "/api/v4/spot/accounts";
  const queryParameters = "";
  const payloadString = "";
  const method = "GET";
  return request(method, url, queryParameters, payloadString);
}

async function getPriceTicker() {
  const url = "/api/v4/spot/tickers";
  const queryParameters = "";
  const payloadString = "";
  const method = "GET";
  return request(method, url, queryParameters, payloadString);
}

async function get_sltpOrder(j) {
  const url = `/api/v4/spot/price_orders/${j.orderId}`;
  const queryParameters = `currency_pair=${j.symbol}`;
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function get_order(j) {
  const url = `/api/v4/spot/orders/${j.orderId}`;
  const queryParameters = `currency_pair=${j.symbol}`;
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function cancel_order(j) {
  const url = `/api/v4/spot/orders/${j.orderId}`;
  const queryParameters = `currency_pair=${j.symbol}`;
  const payloadString = "";
  return request("DELETE", url, queryParameters, payloadString);
}

async function cancel_allOpenOrders(j) {
  const url = `/api/v4/spot/orders`;
  const queryParameters = `currency_pair=${j.symbol}`;
  const payloadString = "";
  return request("DELETE", url, queryParameters, payloadString);
}

async function cancel_sltpOrder(j) {
  const url = `/api/v4/spot/price_orders/${j.orderId}`;
  const queryParameters = `currency_pair=${j.symbol}`;
  const payloadString = "";
  return request("DELETE", url, queryParameters, payloadString);
}

async function cancel_allOpenSltpOrders(j) {
  const url = `/api/v4/spot/price_orders`;
  const queryParameters = "";
  const payloadString = "";
  return request("DELETE", url, queryParameters, payloadString);
}

async function get_allOpenOrders(j) {
  const url = `/api/v4/spot/open_orders`;
  const queryParameters = "";
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function get_allOpenSltpOrders(j) {
  const url = `/api/v4/spot/price_orders`;
  const queryParameters = "status=open";
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function new_limitOrder(j) {
  const url = "/api/v4/spot/orders";
  const queryParameters = "";
  return request("POST", url, queryParameters, j);
}

async function new_marketOrder(j) {
  const url = "/api/v4/spot/orders";
  const queryParameters = "";
  return request("POST", url, queryParameters, j);
}

async function new_sltpLimitOrder(j) {
  const url = "/api/v4/spot/price_orders";
  const queryParameters = "";
  return request("POST", url, queryParameters, j);
}

async function new_sltpOrder(j) {
  const url = "/api/v4/spot/price_orders";
  const queryParameters = "";
  return request("POST", url, queryParameters, j);
}

async function get_myTrades(j) {
  const url = `/api/v4/spot/trades`;
  const queryParameters = "currency_pair=XRP_USDT";
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

// get_account();
// new_limitOrder({
//   currency_pair: "XRP_USDT",
//   amount: "30",
//   side: "buy",
//   type: "limit",
//   price: "0.2",
//   size: "7",
// });
// new_marketOrder({
//   currency_pair: "XRP_USDT",
//   amount: "7", //if buy amount in USDT, if sell amount in base currency BTC or XRP
//   side: "buy",
//   type: "market",
//   time_in_force: "ioc",
// });
// cancel_order({ orderId: "802392029", symbol: "XRP_USDT" });
// get_allOpenOrders();
// get_order({ orderId: "588663660914", symbol: "XRP_USDT" });
// cancel_allOpenOrders({ symbol: "XRP_USDT" });

// cancel_sltpOrder({ orderId: "802392029", symbol: "XRP_USDT" });
// cancel_allOpenSltpOrders();
// get_allOpenSltpOrders();
// get_sltpOrder({ orderId: "802392038", symbol: "XRP_USDT" });
// new_sltpOrder({
//   trigger: { price: "0.7", rule: ">=", expiration: 3600 },
//   put: {
//     type: "market",
//     side: "buy",
//     amount: "20",
//     account: "normal",
//     time_in_force: "ioc",
//     text: "api",
//   },
//   market: "XRP_USDT",
// });
// new_sltpLimitOrder({
//   trigger: { price: "0.7", rule: ">=", expiration: 3600 },
//   put: {
//     type: "limit",
//     side: "buy",
//     amount: "20",
//     price: "0.2",
//     account: "normal",
//     time_in_force: "ioc",
//     text: "api",
//   },
//   market: "XRP_USDT",
// });
// get_myTrades();
