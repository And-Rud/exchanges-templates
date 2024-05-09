import crypto from "crypto";
import axios from "axios";
import Big from "big.js";

const apikey = "";
const apiSecret = "";
const recvWindow = 10000;
const timestamp = new Date().getTime();
const httpBase = "https://api.bybit.com";

// new_order({
//   category: "linear",
//   symbol: "XRPUSDT",
//   side: "Buy",
//   orderType: "LIMIT",
//   price: "0.2",
//   qty: "25",
//   timeInForce: "GTC",
//   isLeverage: 1,
//   stopPrice: "0.15",
//   takeProfit: "0.3",
//   // stopLoss: "0.1",
// });

// close_position({
//   category: "linear",
//   symbol: "XRPUSDT",
//   side: "Sell",
//   orderType: "MARKET",
//   qty: "25",
//   timeInForce: "GTC",
//   reduceOnly: true,
// });

// set_leverage({
//   category: "linear",
//   symbol: "XRPUSDT",
//   buyLeverage: "1",
//   sellLeverage: "1",
// });

// switch_mode({
//   category: "linear",
//   symbol: "XRPUSDT",
//   mode: 0, //0 or 3
// });

// change_margin_type({
//   setMarginMode: "ISOLATED_MARGIN", //REGULAR_MARGIN, ISOLATED_MARGIN
// });

// cancel_order({
//   category: "linear",
//   symbol: "XRPUSDT",
//   orderId: "a2ff202f-1c74-4742-a860-12bece382fec",
// });

// cancel_openOrders({
//   category: "linear",
//   symbol: "XRPUSDT",
// });

// get_openOrders("category=linear&symbol=XRPUSDT");

// get_server_time();

// get_position("category=linear&symbol=XRPUSDT");

// get_tickers("category=linear&symbol=XRPUSDT");

// get_symbols("category=linear");

// get_openOrder("category=linear&orderId=a2ff202f-1c74-4742-a860-12bece382fec");

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
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Create Order",
  );
  return response;
}

async function close_position(j) {
  const endpoint = "/v5/order/create";
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Close Position",
  );
  return response;
}

async function cancel_order(j) {
  const endpoint = "/v5/order/cancel";
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Cancel Order",
  );
  return response;
}

async function change_margin_type(j) {
  const endpoint = "/v5/account/set-margin-mode";
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Change Margin Type",
  );
  return response;
}

async function set_leverage(j) {
  const endpoint = "/v5/position/set-leverage";
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Set Leverage Order",
  );
  return response;
}

async function switch_mode(j) {
  const endpoint = "/v5/position/switch-mode";
  const response = await call_api(
    endpoint,
    "POST",
    JSON.stringify(j),
    "Switch Mode",
  );
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

async function get_server_time(j) {
  const endpoint = "/v5/market/time";
  const response = await call_api(endpoint, "GET", j, "Get Server Time");
  return response;
}

async function get_position(j) {
  const endpoint = "/v5/position/list";
  const response = await call_api(endpoint, "GET", j, "Get Position");
  return response;
}

async function get_tickers(j) {
  const endpoint = "/v5/market/tickers";
  const response = await call_api(endpoint, "GET", j, "Get Position");
  return response;
}

async function get_openOrder(j) {
  const endpoint = "/v5/order/realtime";
  const response = await call_api(endpoint, "GET", j, "Get Open Order");
  return response;
}

async function get_symbols(j) {
  const endpoint = "/v5/market/instruments-info";
  const response = await call_api(endpoint, "GET", j, "Get ByBit Symbols");

  return response;
}
