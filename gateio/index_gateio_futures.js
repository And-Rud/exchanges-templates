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

async function account_information() {
  const url = "/api/v4/futures/usdt/accounts";
  const queryParameters = "";
  const payloadString = "";
  const method = "GET";
  return request(method, url, queryParameters, payloadString);
}

async function get_openOrders(j) {
  const url = `/api/v4/futures/${j.settle}/orders`;
  const queryParameters = "status=open";
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function get_order(j) {
  const url = `/api/v4/futures/${j.settle}/orders/${j.orderId}`;
  const queryParameters = "";
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function get_position(j) {
  const url = `/api/v4/futures/${j.settle}/positions/${j.symbol}`;
  const queryParameters = "";
  const payloadString = "";
  return request("GET", url, queryParameters, payloadString);
}

async function cancel_allOpenOrders(j) {
  const url = `/api/v4/futures/${j.settle}/orders`;
  const queryParameters = `contract=${j.symbol}`;
  const payloadString = "";
  return request("DELETE", url, queryParameters, payloadString);
}

async function cancel_order(j) {
  const url = `/api/v4/futures/${j.settle}/orders/${j.orderId}`;
  const queryParameters = ``;
  const payloadString = "";
  return request("DELETE", url, queryParameters, payloadString);
}

async function set_leverage(j) {
  //not work!!!!
  const url = `/api/v4/futures/${j.settle}/positions/${j.symbol}/leverage`;
  const queryParameters = `leverage=${j.leverage}`;
  const payloadString = "";
  return request("POST", url, queryParameters, payloadString);
}

async function new_limitOrder() {
  const url = `/api/v4/futures/usdt/orders`;
  const queryParameters = "";
  const payloadString = {
    contract: "XRP_USDT",
    size: 2, //positive number to make a bid, and negative number to ask
    iceberg: 0,
    price: "0.4",
    tif: "gtc",
    text: "t-my-custom-id",
    stp_act: "-",
  };
  return request("POST", url, queryParameters, payloadString);
}

async function new_marketOrder() {
  const url = `/api/v4/futures/usdt/orders`;
  const queryParameters = "";
  const payloadString = {
    contract: "XRP_USDT",
    size: 1, //positive number to make a bid, and negative number to ask
    iceberg: 0,
    price: "0",
    tif: "ioc",
    text: "t-my-custom-id",
    stp_act: "-",
  };
  return request("POST", url, queryParameters, payloadString);
}

async function new_sltpOrder(j) {
  //this order dont work!!!
  const url = `/api/v4/futures/usdt/price_orders`;
  const queryParameters = "";
  const payloadString = {
    initial: {
      contract: "BTC_USDT",
      size: 100,
      price: "0",
      order_type: "close-long-order",
      tif: "ioc",
    },
    trigger: {
      strategy_type: 0,
      price_type: 2,
      price: "30000",
      rule: 2, //if 1 - price must be < last price, if 2- price>last price
      expiration: 86400,
      tif: "gtc",
      order_type: "close-long-order",
    },
    order_type: "close-long-position",
  };
  return request("POST", url, queryParameters, payloadString);
}

// account_information();
// set_leverage({ symbol: "XRP_USDT", leverage: 10, settle: "usdt" });
// new_limitOrder();
// new_marketOrder();
// cancel_allOpenOrders({ symbol: "XRP_USDT", settle: "usdt" });
// cancel_order({ settle: "usdt", orderId: "473885400313" });
// get_order({ settle: "usdt", orderId: "473885400313" });
// get_openOrders({ settle: "usdt" });
// get_position({ symbol: "XRP_USDT", settle: "usdt" });
// new_sltpOrder();
