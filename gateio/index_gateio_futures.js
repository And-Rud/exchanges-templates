import crypto from "crypto";
import axios from "axios";
const basePath = "https://api.gateio.ws";
const apikey = "";
const apiSecret =
  "";

async function request(method, url, queryParameters, payloadString) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  if (payloadString !== "") {
    payloadString = `${payloadString}`;
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
    url: basePath + url,
  };

  try {
    let res = await axios(config);
    return {
      statusCode: 200,
      status: "success",
      content: res.data,
    };
  } catch (e) {
    console.log(e);
    throw new Error(JSON.stringify(e));
  }
}

async function account_information() {
  const url = "/api/v4/futures/usdt/accounts";
  const queryParameters = "";
  const payloadString = "";
  const method = "GET";
  return request(method, url, queryParameters, payloadString);
}

let res = await get_account();
// let res = await getPriceTicker();

console.log("res", res); //JSON.stringify(res)
