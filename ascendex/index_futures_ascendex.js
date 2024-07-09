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

async function get_snapshot() {
  const body = "";
  const params = { date: new Date().toISOString().split("T")[0] };
  const endpoint = `/api/pro/data/v1/futures/balance/snapshot`;
  const signEndpoint = "data/v1/futures/balance/snapshot";
  const response = await http_request(
    "GET",
    endpoint,
    body,
    signEndpoint,
    params,
  );
  return response;
}

async function get_account_futures() {
  let snapshot = await get_snapshot();
  console.log("snapshot", snapshot.data.meta.sn);
  const body = "";
  const params = { sn: snapshot.data.meta.sn + 2 };
  const endpoint = `/api/pro/data/v1/futures/balance/history`;
  const signEndpoint = "data/v1/futures/balance/history";
  const response = await http_request(
    "GET",
    endpoint,
    body,
    signEndpoint,
    params,
  );
  console.log(
    "response",
    response.data.balance[response.data.balance.length - 1].data,
  );
  const sortedBalances = response.data.balance.sort(
    (a, b) => b.transactTime - a.transactTime,
  );
  console.log("sortedBalances", sortedBalances[0]);
  return sortedBalances;
}

// get_account();
// account_info();
// getPriceTicker();
get_account_futures();

