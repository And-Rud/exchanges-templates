import crypto from "crypto";
import axios from "axios";

const apikey = "";
const apiSecret = "";
const baseURL = "https://contract.mexc.com";
const timestamp = Date.now();

// let res = await setLeverage(
//   { positionId: 1, leverage: 5 },
//   { key: apikey, secret: apiSecret },
// );

// let res = await getLeverage(
//   { symbol: "LBTCUSDT" },
//   { key: apikey, secret: apiSecret },
// );

// let res = await accountInformation({}, { key: apikey, secret: apiSecret });

// console.log(res.data);

function getLeverage(options = {}, key) {
  return SignRequest("GET", "/api/v1/private/position/leverage", options, key);
}

function setLeverage(options = {}, key) {
  return SignRequest(
    "POST",
    "/api/v1/private/position/change_leverage",
    options,
    key,
  );
}

function accountInformation(options = {}, key) {
  return SignRequest("GET", "/api/v1/private/account/assets", options, key);
}

function SignRequest(method, path, params = {}, key) {
  console.log(params);
  params = removeEmptyValue(params);
  const timestamp = Date.now();
  const apiKey = key.key;
  let objectString = apiKey + timestamp;

  if (method === "POST") {
    path = `${path}`;
    objectString += JSON.stringify(params);
  } else {
    let queryString = buildQueryString({ ...params });
    path = `${path}?${queryString}`;
    objectString += queryString;
  }
  const Signature = crypto
    .createHmac("sha256", key.secret)
    .update(objectString)
    .digest("hex");
  return CreateRequest({
    method: method,
    baseURL: baseURL,
    url: path,
    apiKey: apiKey,
    timestamp: timestamp,
    Signature: Signature,
    params: params,
  });
}

function removeEmptyValue(obj) {
  if (!(obj instanceof Object)) return {};
  Object.keys(obj).forEach((key) => isEmptyValue(obj[key]) && delete obj[key]);
  return obj;
}

function buildQueryString(params) {
  if (!params) return "";
  return Object.entries(params).map(stringifyKeyValuePair).join("&");
}

function CreateRequest(config) {
  const { baseURL, method, url, params, apiKey, timestamp, Signature } = config;
  if (method === "GET" || method === "DELETE") {
    return getRequestInstance({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        ApiKey: apiKey,
        "Request-Time": timestamp,
        Signature: Signature,
      },
    }).request({
      method,
      url,
      params,
    });
  }
  if (method === "POST") {
    return getRequestInstance({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        ApiKey: apiKey,
        "Request-Time": timestamp,
        Signature: Signature,
      },
    }).request({
      method,
      url,
      data: params,
    });
  }
}

function getRequestInstance(config) {
  return axios.create({
    ...config,
  });
}

function createRequest(config) {
  const { baseURL, apiKey, method, url } = config;
  return getRequestInstance({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "X-MEXC-APIKEY": apiKey,
    },
  }).request({
    method,
    url,
  });
}

function isEmptyValue(input) {
  return (
    (!input && input !== false && input !== 0) ||
    ((typeof input === "string" || input instanceof String) &&
      /^\s+$/.test(input)) ||
    (input instanceof Object && !Object.keys(input).length) ||
    (Array.isArray(input) && !input.length)
  );
}

function stringifyKeyValuePair([key, value]) {
  let valueString;
  if (typeof value === "object") {
    valueString = JSON.stringify(value);
  } else {
    valueString = value;
  }
  return `${key}=${encodeURIComponent(valueString)}`;
}
