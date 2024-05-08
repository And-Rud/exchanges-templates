import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import moment from "moment";

const apikey = "";
const apiSecret = "";
const recvWindow = 10000;
const timeout = 10000;
const URL = "https://api.huobi.pro";
const host = "api.huobi.pro";

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
async function http_request(method, endpoint) {
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
  };
  console.log("config", config);
  try {
    let res = await axios(config);
    return {
      statusCode: 200,
      status: "success",
      data: res.data,
    };
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}

async function get_account_id() {
  const endpoint = "/v1/account/accounts";
  const method = "GET";
  return await http_request(method, endpoint);
}

async function get_account() {
  let account_id = await get_account_id();
  let id = account_id.data.data[0].id;
  console.log("account_id", account_id, id);
  const endpoint = `/v1/account/accounts/${id}/balance`;
  const method = "GET";
  return await http_request(method, endpoint);
}

async function getPriceTicker() {
  const endpoint = `/market/tickers`;
  const method = "GET";
  return await http_request(method, endpoint);
}

// let res = await get_account();
// let res2 = await getPriceTicker();

// let find = res.data.data.list.find((i) => i.balance > 0);
// console.log("res", find);
// console.log("res", res2.data.data);

// 2. The following is an example of the main method for sending POST requests:
// const method = 'POST';
// const post_body = {
//     "from": "spot",
//     "to": "linear-swap",
//     "currency": "usdt",
//     "amount": "0.01",
//     "margin-account": "USDT"
// };
// const json_data = JSON.stringify(post_body);
//
// const builder = new UrlParamsBuilder();
// create_signature(api_key, secret_key, method, `https://${host}${api_path_post}`, builder);
// console.log('[Signature Result]:', builder.param_map);
//
// const request = create_request(host, method, api_path_post, builder);
// console.log('[Request Url]:', request.url);
//
// const options = {
//     headers: request.header
// };
//
// const postRequest = https.request(request.url, options, (response) => {
//     let data = '';
//
//     response.on('data', (chunk) => {
//         data += chunk;
//     });
//
//     response.on('end', () => {
//         console.log('[Response]:', data);
//     });
// });
//
// postRequest.write(json_data);
// postRequest.end();
