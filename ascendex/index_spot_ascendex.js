
import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import CryptoJS from "crypto-js";

const apikey = "";
const apiSecret =
  "";
const recvWindow = 10000;
const httpBase = "https://ascendex.com";

async function http_request(
  method = "GET",
  endpoint,
  data = null,
  signEndpoint,
  params = "",
) {
  const url = httpBase + endpoint;
  const timestamp = new Date().getTime();

  const signString = [timestamp, "+", signEndpoint].join("");
  console.log("signString", signString);

  const sign = crypto
    .createHmac("sha256", apiSecret)
    .update(signString)
    .digest("base64");
  console.log("sign", sign);

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-auth-key": apikey,
    "x-auth-timestamp": timestamp,
    "x-auth-signature": sign,
  };
  console.log("Headers", headers);
  let config = {
    method: method,
    url: url,
    headers: headers,
  };
  if (method === "GET") config.params = params;
  if (method === "POST" || method === "DELETE") config.data = data;
  console.log("config", config);
  try {
    const res = await axios(config);
    console.log("res", JSON.stringify(res.data));
    return {
      statusCode: 200,
      status: "success",
      data: res.data,
    };
  } catch (e) {
    console.log(1);
  }
}

async function account_info() {
  const endpoint = "/api/pro/v1/info";
  const body = "";
  const signEndpoint = "user/info";
  const response = await http_request("GET", endpoint, body, signEndpoint);
  return response;
}

async function get_account() {
  const account_group = await account_info();
  console.log("!!!!!!!!!!", account_group);
  const endpoint = `/${account_group.data.data.accountGroup}/api/pro/v1/cash/balance`;
  const body = "";
  const signEndpoint = "balance";
  const response = await http_request("GET", endpoint, body, signEndpoint);
  return response;
}

async function getPriceTicker() {
  const endpoint = "/api/pro/v1/spot/ticker";
  const body = "";
  const response = await http_request("GET", endpoint, body, null);
  return response;
}


// get_account();
// account_info();
// getPriceTicker();
