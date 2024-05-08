import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import JSONbig from "json-bigint";

const apiKey =
  "";
const apiSecret =
  "";
const httpBase = "https://open-api.bingx.com";
const timestamp = new Date().getTime();
const recvWindow = 5000;

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

async function call_api(method, url, apiKey) {
  const config = {
    method,
    url: httpBase + url,
    headers: {
      "X-BX-APIKEY": apiKey,
    },
    transformResponse: (resp) => {
      const parsedResp = JSONbig.parse(resp);
      // BingX success code by default is 0
      if (parsedResp.code !== 0) {
        return Error(parsedResp.message);
      }
      return parsedResp;
    },
  };

  const resp = await axios(config);

  if (resp.status !== 200) {
    throw new Error(JSON.stringify(resp));
  }

  const formattedResp = {
    statusCode: resp.status,
    status: "success",
    data: resp.data.data,
  };
  console.log("formattedResp", formattedResp.data.orderId.toString());
  return formattedResp;
}

// Listen key endpoints have slightly different behaviour
async function call_api_listen_key(method, url, apiKey) {
  const config = {
    method,
    url: httpBase + url,
    headers: {
      "X-BX-APIKEY": apiKey,
    },
    transformResponse: (resp) => {
      if (resp) {
        console.log("resp", resp);
        const parsedResp = JSON.parse(resp);
        return parsedResp;
      }

      return {
        statusCode: 200,
        data: resp,
      };
    },
  };

  const resp = await axios(config);

  if (resp.status !== 200) {
    throw new Error(JSON.stringify(resp));
  }

  const formattedResp = {
    statusCode: resp.status,
    status: "success",
    data: resp.data,
  };

  return formattedResp;
}

async function get_account() {
  const payload = {
    recvWindow: recvWindow,
    timestamp: new Date().getTime(),
  };

  let path = `/openApi/spot/v1/account/balance` + "?" + sign_sha(payload);

  return call_api("GET", path, apiKey);
}

get_listen_key();

function get_listen_key() {
  const payload = {};

  let path = "/openApi/user/auth/userDataStream" + "?" + sign_sha(payload);

  return call_api_listen_key("POST", path, apiKey);
}

function keep_alive_listen_key(listenKey) {
  const payload = {
    listenKey,
  };

  let path = "/openApi/user/auth/userDataStream" + "?" + sign_sha(payload);

  return call_api_listen_key("PUT", path, apiKey);
}

function close_listen_key(listenKey) {
  const payload = {
    listenKey,
  };

  let path = "/openApi/user/auth/userDataStream" + "?" + sign_sha(payload);

  return call_api_listen_key("DELETE", path, apiKey);
}

// new_order({
//   symbol: "BTC-USDT",
//   side: "BUY",
//   type: "LIMIT",
//   quantity: "0.00011",
//   price: "20000",
//   timeInForce: "GTC",
//   quoteOrderQty: 7,
// });

function new_order(j) {
  j.timestamp = new Date().getTime();
  j.symbol = j.symbol.toUpperCase();
  j.side = j.side.toUpperCase();
  j.type = j.type.toUpperCase();

  let path = "/openApi/spot/v1/trade/order" + "?" + sign_sha(j);

  return call_api("POST", path, apiKey);
}

function cancel_order(j) {
  j.symbol = j.symbol.toUpperCase();
  j.orderId = BigInt(j.orderId);
  j.timestamp = new Date().getTime();

  let path = "/openApi/spot/v1/trade/cancel" + "?" + sign_sha(j);
  return call_api("POST", path, apiKey);
}

function cancel_orders(j) {
  j.symbol = j.symbol.toUpperCase();
  j.timestamp = new Date().getTime();

  let path = "/openApi/spot/v1/trade/cancelOrders" + "?" + sign_sha(j);
  return call_api("POST", path, apiKey);
}

function get_open_orders(j) {
  if (typeof j.symbol === "string" && j.symbol.length > 1) {
    j.symbol = j.symbol.toUpperCase();
  }
  j.timestamp = new Date().getTime();
  j.recvWindow = recvWindow;

  let path = "/openApi/spot/v1/trade/openOrders" + "?" + sign_sha(j);
  console.log("path", path);
  return call_api("GET", path, apiKey);
}

function cancel_open_orders(j) {
  j.symbol = j.symbol.toUpperCase();
  j.timestamp = new Date().getTime();

  let path = "/openApi/spot/v1/trade/cancelOpenOrders" + "?" + sign_sha(j);
  return call_api("POST", path, apiKey);
}
