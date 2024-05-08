import crypto from "crypto";
import axios from "axios";
import Big from "big.js";

const apikey = "";
const apiSecret = "";
const recvWindow = 5000;
const timestamp = new Date().getTime();
const httpBase = "https://api.mexc.com";

// new_order({
//   symbol: "EOSUSDT",
//   side: "Buy",
//   type: "LIMIT",
//   price: Big("0.04"),
//   quantity: Big("151"),
//   quoteOrderQty: Big("151"),
// });

// create_listen_key({});

// keepalive_listen_key({
//   listenKey: "f74fa6c416c4fe1feef562c8b9a61c94275da950b4d4d48c1453913a8e624942",
// });

// delete_listen_key({
//   listenKey: "f74fa6c416c4fe1feef562c8b9a61c94275da950b4d4d48c1453913a8e624942",
// });

// get_exchangeInfo({});

// cancel_openOrders({
//   symbol: "LBTCUSDT",
// });

// get_openOrders({
//   symbol: "LBTCUSDT",
// });

// cancel_order({
//   symbol: "LBTCUSDT",
//   orderId: "C02__411441719440064512000",
// });

// get_order({
//   symbol: "LBTCUSDT",
//   orderId: "C02__411450764049793024000",
// });

function create_listen_key(j) {
  j.timestamp = new Date().getTime();
  j.recvWindow = recvWindow;
  let path = "/api/v3/userDataStream" + "?" + sign_sha(j);
  return call_api("POST", path, apikey);
}

function keepalive_listen_key(j) {
  j.timestamp = new Date().getTime();
  j.recvWindow = recvWindow;
  let path = "/api/v3/userDataStream" + "?" + sign_sha(j);
  return call_api("PUT", path, apikey);
}

function delete_listen_key(j) {
  j.timestamp = new Date().getTime();
  j.recvWindow = recvWindow;
  let path = "/api/v3/userDataStream" + "?" + sign_sha(j);
  return call_api("DELETE", path, apikey);
}

function cancel_order(j) {
  j.timestamp = new Date().getTime();
  j.symbol = j.symbol.toUpperCase();
  j.recvWindow = recvWindow;
  let path = "/api/v3/order" + "?" + sign_sha(j);
  return call_api("DELETE", path, apikey);
}

function cancel_openOrders(j) {
  j.timestamp = new Date().getTime();
  j.symbol = j.symbol.toUpperCase();
  j.recvWindow = recvWindow;
  let path = "/api/v3/openOrders" + "?" + sign_sha(j);
  return call_api("DELETE", path, apikey);
}

function get_exchangeInfo(j) {
  j.timestamp = new Date().getTime();
  j.recvWindow = recvWindow;
  let path = "/api/v3/exchangeInfo" + "?" + sign_sha(j);
  return call_api("GET", path, apikey);
}

function get_openOrders(j) {
  j.timestamp = new Date().getTime();
  j.symbol = j.symbol.toUpperCase();
  j.recvWindow = recvWindow;
  let path = "/api/v3/openOrders" + "?" + sign_sha(j);
  return call_api("GET", path, apikey);
}

function get_order(j) {
  j.timestamp = new Date().getTime();
  j.symbol = j.symbol.toUpperCase();
  j.recvWindow = recvWindow;
  let path = "/api/v3/order" + "?" + sign_sha(j);
  return call_api("GET", path, apikey);
}

function new_order(j) {
  j.timestamp = new Date().getTime();
  j.symbol = j.symbol.toUpperCase();
  j.side = j.side.toUpperCase();
  j.type = j.type.toUpperCase();
  j.recvWindow = recvWindow;
  let path = "/api/v3/order" + "?" + sign_sha(j);
  return call_api("POST", path, apikey);
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

async function call_api(method, url, apiKey) {
  let headers = {
    "X-MEXC-APIKEY": apiKey,
    "Content-Type": "application/json",
  };

  let config = {
    method,
    url: httpBase + url,
    headers,
  };

  const resp = await axios(config);
  if (resp.status !== 200) {
    console.log("Ops.....erroorrrr");
    throw new Error(JSON.stringify(resp));
  }
  const formattedResp = {
    statusCode: resp.status,
    status: "success",
    data: resp.data,
  };
  console.log("===asdas===", resp.data);
  return formattedResp;
}

async function TestCase() {
  const endpoint = "/api/v3/account";
  const timestamp = new Date().getTime();
  const data = "recvWindow=5000&timestamp=" + timestamp;

  // console.log(data);
  const test = await http_request(endpoint, "GET", data);
  // const grouped = groupPairsByQuoteAssetWithFuturesLeverage(
  //   test.data.result.list,
  // );

  // console.log(test);
}
