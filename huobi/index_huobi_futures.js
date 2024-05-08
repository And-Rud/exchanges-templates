import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import moment from "moment";

const apikey = "";
const apiSecret = "";
const recvWindow = 10000;
const timeout = 10000;
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

async function get_account() {
  const endpoint = `/linear-swap-api/v1/swap_balance_valuation`;
  const method = "POST";
  const body = {
    valuation_asset: "USDT",
  };
  return await http_request(method, endpoint, body);
}

// let res = await get_account();

// console.log("res", res.data);

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
//
// const request = create_request(host, method, api_path_post, builder);
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
