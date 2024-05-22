import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import moment from "moment";

const apikey = "";
const apiSecret = "";
const host = "api.hbdm.com";

function put_post(name, value) {
  if (value !== null && value !== undefined) {
    if (typeof value === "object") {
      builder.post_map[name] = value;
    } else {
      builder.post_map[name] = String(value);
    }
  }
}

function serializeParams(params) {
  let serialized = "";
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      if (serialized !== "") {
        serialized += "&";
      }
      serialized +=
        encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    }
  }
  return serialized;
}

function create_signature(apikey, apiSecret, method, url, builder, endpoint) {
  if (!apikey || !apiSecret) {
    throw new Error("API key and secret key are required");
  }

  const keys = Object.keys(builder.param_map).sort();
  const qs0 = keys
    .map((key) => `${key}=${encodeURIComponent(builder.param_map[key])}`)
    .join("&");
  const payload0 = `${method}\n${host}\n${endpoint}\n${qs0}`;

  const hmac = crypto.createHmac("sha256", apiSecret);
  const digest = hmac.update(payload0).digest("base64");
  return (builder.param_map = {
    ...builder.param_map,
    Signature: digest,
  });
}

function create_request(host, method, url, builder) {
  const serializedParams = serializeParams(builder.param_map);
  const request = {
    method: method,
    url: url + `?${serializedParams}`,
    host: host,
    header: { "Content-Type": "application/json" },
    json_parser: null,
  };
  return request;
}

// Choose either the GET request example or the POST request example in the main method
// 1. The following is an example of the main method for sending GET requests:
// const method = 'GET';
async function http_request(method, endpoint, body) {
  const timestamp = moment.utc().format("YYYY-MM-DDTHH:mm:ss");

  const builder = {
    param_map: {
      AccessKeyId: apikey,
      SignatureVersion: "2",
      SignatureMethod: "HmacSHA256",
      Timestamp: timestamp,
    },
    post_map: {},
    post_list: [],
  };
  let sign = create_signature(
    apikey,
    apiSecret,
    method,
    `https://${host}${endpoint}`,
    builder,
    endpoint,
  );

  const request = create_request(host, "GET", endpoint, builder);

  let config = {
    method: method,
    url: "https://" + host + request.url,
    headers: request.header,
    data: body,
  };
  console.log("config", config);
  try {
    let res = await axios(config);
    console.log("res", res.data);
    return {
      statusCode: 200,
      status: "success",
      data: res.data,
    };
  } catch (e) {
    console.log(e);
  }
}

async function get_account() {
  const endpoint = `/linear-swap-api/v1/swap_balance_valuation`;
  const body = {
    valuation_asset: "USDT",
  };
  return await http_request("POST", endpoint, body);
}

async function set_leverage(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_switch_lever_rate`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_switch_lever_rate`);
  const body = {
    contract_code: `${j.symbol}`,
    lever_rate: `${j.leverage}`,
    pair: `${j.symbol}`, //only for cross
    contract_type: "swap", //only for cross
  };
  return await http_request("POST", endpoint, body);
}

async function get_order(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_order_info`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_order_info`);
  const body = {
    order_id: `${j.orderId}`, // put here order_id_str in response
    client_order_id: `${j.client_order_id}`,
    contract_code: `${j.symbol}`,
    pair: `${j.symbol}`, //field for cross
  };
  return await http_request("POST", endpoint, body);
}

async function get_allOrders(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_openorders`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_openorders`);
  const body = {
    contract_code: `${j.symbol}`,
    pair: `${j.symbol}`, //field for cross
    page_index: 1,
    page_size: 50,
    sort_by: "created_at",
    trade_type: 0,
  };
  return await http_request("POST", endpoint, body);
}

async function get_position(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_position_info`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_position_info`);
  const body = {
    contract: `${j.symbol}`,
    contract_code: `${j.symbol}`,
    pair: `${j.symbol}`,
    contract_type: "swap",
  };
  return await http_request("POST", endpoint, body);
}

async function cancel_order(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_cancel`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_cancel`);
  const body = {
    order_id: `${j.orderId}`,
    client_order_id: `${j.client_order_id}`,
    contract_code: `${j.symbol}`,
    pair: `${j.symbol}`, //field for cross
    contract_type: "swap",
  };
  return await http_request("POST", endpoint, body);
}

async function cancel_allOrders(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_cancelall`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_cancelall`);
  const body = {
    contract_code: `${j.symbol}`,
    direction: `${j.side}`, //buy or sell
    offset: `${j.offset}`, //open
    contract_type: "swap", //for croos
  };
  return await http_request("POST", endpoint, body);
}

async function new_limitOrder(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_order`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_order`);
  const body = {
    contract_code: "xrp-usdt",
    direction: "buy",
    offset: "open",
    price: "0.3",
    lever_rate: 5,
    volume: 1,
    order_price_type: "limit",
  };
  return await http_request("POST", endpoint, body);
}

async function new_marketOrder(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_order`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_order`);
  const body = {
    contract_code: "xrp-usdt",
    direction: "buy",
    offset: "open",
    lever_rate: 5,
    volume: 1,
    order_price_type: "market",
  };
  return await http_request("POST", endpoint, body);
}

async function new_sltpLimitOrder(j) {
  let endpoint;
  j.isolated
    ? (endpoint = `/linear-swap-api/v1/swap_order`)
    : (endpoint = `/linear-swap-api/v1/swap_cross_order`);
  const body = {
    contract_code: "xrp-usdt",
    direction: "buy",
    offset: "open",
    lever_rate: 1,
    volume: 1,
    price: "0.3",
    order_price_type: "limit",
    tp_trigger_price: "0.7",
    tp_order_price: "0.7",
    tp_order_price_type: "limit",
    sl_trigger_price: "0.2",
    sl_order_price: "0.2",
    sl_order_price_type: "limit",
  };
  return await http_request("POST", endpoint, body);
}

// get_account();
// new_limitOrder({ isolated: true });
// new_marketOrder({ isolated: true });
// cancel_order({
//   isolated: true,
//   symbol: "XRP-USDT",
//   orderId: "1242882924731932672",
// });
// cancel_allOrders({
//   isolated: true,
//   side: "buy",
//   offset: "open",
//   symbol: "XRP-USDT",
// });
// set_leverage({ isolated: true, symbol: "XRP-USDT", leverage: "1"});
// get_order({
//   isolated: true,
//   symbol: "XRP-USDT",
//   orderId: "1242882924731932672",
// });
// get_allOrders({ isolated: true, symbol: "XRP-USDT" });
// get_position({ isolated: true, symbol: "XRP-USDT" });
// new_sltpLimitOrder({ isolated: true });
