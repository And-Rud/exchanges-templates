import crypto from "crypto";
import axios from "axios";
import Big from "big.js";

const apikey = "";
const apiSecret = "";
const recvWindow = 10000;
const timestamp = new Date().getTime();
const httpBase = "https://api.bybit.com";

// new_order({
//   category: "spot",
//   symbol: "BTCUSDT",
//   side: "BUY",
//   orderType: "LIMIT",
//   price: "55000",
//   qty: "0.00011",
//   timeInForce: "GTC",
//   // triggerPrice: "55800",
//   // orderFilter: "StopOrder",
// });

// cancel_order({
//   category: "spot",
//   symbol: "BTCUSDT",
//   orderId: "1671943556111272704",
// });

// cancel_openOrders({
//   category: "spot",
// });

// get_openOrders("category=spot");

// get_openOrder("category=spot&orderId=1671961772728519424");

function sign_sha(data) {
  return crypto
    .createHmac("sha256", apiSecret)
    .update(timestamp + apikey + recvWindow + data)
    .digest("hex");
}

async function call_api(endpoint, method, data, info) {
  console.log("data: " + data);

  let sign = sign_sha(data);
  let fullEndpoint;

  // Build the request URL based on the method
  if (method === "POST") {
    fullEndpoint = httpBase + endpoint;
  } else {
    fullEndpoint = httpBase + endpoint + "?" + data;
    data = "";
  }

  let headers = {
    "X-BAPI-SIGN-TYPE": "2",
    "X-BAPI-SIGN": sign,
    "X-BAPI-API-KEY": apikey,
    "X-BAPI-TIMESTAMP": timestamp,
    "X-BAPI-RECV-WINDOW": recvWindow.toString(),
  };

  if (method === "POST") {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  let config = {
    method,
    url: fullEndpoint,
    headers,
    data,
  };

  console.log("config: " + JSON.stringify(config));

  console.log(info + " " + config.method + " " + config.url);

  console.log(info + " Calling....");

  const response = await axios(config);

  if (response.status !== 200) {
    throw new Error(JSON.stringify(response));
  }

  console.log(info + " request result: " + JSON.stringify(response.data));

  const formattedResp = {
    statusCode: response.status,
    status: "success",
    data: JSON.stringify(response.data),
  };
  console.log("formattedResp", formattedResp);
  return formattedResp;
}

async function get_wallet_balances(j) {
  const endpoint = "/v5/account/wallet-balance";
  const data = `accountType=${j.accountType}`;
  const response = await call_api(endpoint, "GET", data, "Order List");

  return response;
}

async function new_order(j) {
  const endpoint = "/v5/order/create";
  const response = await call_api(endpoint, "POST", j, "Create Order");
  return response;
}

async function cancel_order(j) {
  const endpoint = "/v5/order/cancel";
  const response = await call_api(endpoint, "POST", j, "Cancel Order");
  return response;
}

async function cancel_openOrders(j) {
  const endpoint = "/v5/order/cancel-all";
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Cancel Open Orders",
  );
  return response;
}

async function get_openOrders(j) {
  const endpoint = "/v5/order/realtime";
  const response = await call_api(endpoint, "GET", j, "Get Open Orders");
  return response;
}

async function get_openOrder(j) {
  const endpoint = "/v5/order/realtime";
  const response = await call_api(endpoint, "GET", j, "Get Open Orders");
  return response;
}

async function get_symbols(j) {
  const endpoint = "/v5/market/instruments-info";
  const data = `category=${j.category}`;
  const response = await call_api(endpoint, "GET", data, "Get ByBit Symbols");

  return response;
}
