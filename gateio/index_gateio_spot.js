import crypto from "crypto";
import axios from "axios";
const basePath = "https://api.gateio.ws";
const apikey = "4f7869a388d3f69b06917d147ca8afe4";
const apiSecret =
  "f7914b87719cb61718db7951940de5c28014665f94521868a99114c721bbbbbd";

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

async function get_account() {
  const url = "/api/v4/spot/accounts";
  const queryParameters = "";
  const payloadString = "";
  const method = "GET";
  return request(method, url, queryParameters, payloadString);
}

async function getPriceTicker() {
  const url = "/api/v4/spot/tickers";
  const queryParameters = "";
  const payloadString = "";
  const method = "GET";
  return request(method, url, queryParameters, payloadString);
}

// let res = await get_account();
// let res = await getPriceTicker();

// console.log("res", JSON.stringify(res)); //JSON.stringify(res)
