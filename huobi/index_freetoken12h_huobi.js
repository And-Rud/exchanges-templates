
import crypto from "crypto";
import axios from "axios";
import Big from "big.js";
import moment from "moment";

const apikey = "";
const apiSecret = "";
const baseURL = "api.hbdm.com";

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
  const payload0 = `${method}\n${baseURL}\n${endpoint}\n${qs0}`;

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

async function request(
  method = "POST",
  endpoint = "/linear-swap-api/v1/swap_available_level_rate",
  body = "",
  key = apikey,
) {
  const timestamp = new Date().toISOString().slice(0, 19).replace(" ", "T");
  key = {
    key: "fd7a39cd-3cf7a7a5-86e0e9b3-dbuqg6hkte",
    secret: "5996be01-1112ddda-9f309af6-77f6c",
  };
  const builder = {
    param_map: {
      AccessKeyId: key.key,
      SignatureVersion: "2",
      SignatureMethod: "HmacSHA256",
      Timestamp: timestamp,
    },
    post_map: {},
    post_list: [],
  };
  let sign = create_signature(
    key.key,
    key.secret,
    method,
    `https://${baseURL}${endpoint}`,
    builder,
    endpoint,
  );

  const request = create_request(baseURL, "GET", endpoint, builder);

  let config = {
    method: method,
    url: "https://" + baseURL + request.url,
    headers: request.header,
    body: body,
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
  }
}

async function getSymbols(isSpot) {
  if (isSpot) {
    const response = await axios.get(
      "https://api.huobi.pro/v1/settings/common/symbols",
    );
    return response.data.data;
  } else {
    const response = await request();
    return response.data.data;
  }
}

function groupPairsByQuoteAsset(symbols, isFutures) {
  const pairsByQuoteAsset = {};
  symbols.forEach((item) => {
    if (!isFutures) {
      const { bcdn, qcdn, state } = item;
      if (state === "online") {
        if (!pairsByQuoteAsset[qcdn]) {
          pairsByQuoteAsset[qcdn] = [];
        }
        pairsByQuoteAsset[qcdn].push(bcdn);
      }
    } else {
      const { contract_code, available_level_rate } = item;
      let lever = available_level_rate.split(",").map(Number);
      const [baseAsset, quoteAsset] = contract_code.split("-");
      if (!pairsByQuoteAsset[quoteAsset]) {
        pairsByQuoteAsset[quoteAsset] = [];
      }
      pairsByQuoteAsset[quoteAsset].push({
        baseAsset: baseAsset,
        minLeverage: lever[0],
        maxLeverage: lever[lever.length - 1],
      });
    }
  });
  return { data: pairsByQuoteAsset };
}

async function getFreeToken(event) {
  try {
    const symbolsInfoSpot = await getSymbols(true);
    const symbolsInfoFutures = await getSymbols(false);

    const putItemsSpot = groupPairsByQuoteAsset(symbolsInfoSpot, false);
    const putItemsFutures = groupPairsByQuoteAsset(symbolsInfoFutures, true);

    return JSON.stringify(putItemsFutures);
    // let okxExchangeSpot = new OkxExchangeModel(Environment.config.okx.API_PROD);
    // let okxExchangeFutures = new OkxExchangeModel(
    //   Environment.config.okx.API_FUTURES,
    // );

    // let itemsSpot;
    // let itemsFutures;

    // try {
    //   itemsSpot = await mapper.get(okxExchangeSpot);
    //   itemsFutures = await mapper.get(okxExchangeFutures);
    // } catch (err) {
    //   itemsSpot = null;
    //   itemsFutures = null;
    //   console.log(err);
    // }

    //   okxExchangeSpot.baseByQuoteAssetsSpot = putItemsSpot.data;
    //   okxExchangeFutures.baseByQuoteAssetsSpot = putItemsFutures.data;

    //   let createItemArr = [okxExchangeSpot, okxExchangeFutures];

    //   if (itemsSpot && itemsFutures) {
    //     let updateItemArr = [itemsSpot, itemsFutures];

    //     updateItemArr[0].baseByQuoteAssetsSpot = putItemsSpot.data;
    //     updateItemArr[0].updatedAt = new Date().getTime();
    //     updateItemArr[0].updatedAtHumanReadable = new Date().toLocaleString();
    //     updateItemArr[1].baseByQuoteAssetsSpot = putItemsFutures.data;
    //     updateItemArr[1].updatedAt = new Date().getTime();
    //     updateItemArr[1].updatedAtHumanReadable = new Date().toLocaleString();

    //     for (let item of updateItemArr) {
    //       await mapper
    //         .update(item)
    //         .then((item) => {
    //           if (typeof item.baseByQuoteAssetsSpot !== "undefined") {
    //             console.warn("PK: " + item.PK);
    //             console.warn("SK: " + item.SK);
    //             console.warn(
    //               "FOUND: " + Object.keys(item.baseByQuoteAssetsSpot).length,
    //             );
    //           }
    //         })
    //         .catch((err) => {
    //           if (err.name == "ItemNotFoundException") {
    //             console.info("PProcess ItemNotFoundException ");
    //           } else {
    //             console.error("\t EEE1 Error err: " + err);
    //           }
    //         });
    //     }
    //   } else {
    //     for (let item of createItemArr) {
    //       await mapper
    //         .put(item)
    //         .then((item) => {
    //           if (typeof item.baseByQuoteAssetsSpot !== "undefined") {
    //             console.warn("PK: " + item.PK);
    //             console.warn("SK: " + item.SK);
    //             console.warn(
    //               "FOUND: " + Object.keys(item.baseByQuoteAssetsSpot).length,
    //             );
    //           }
    //         })
    //         .catch((err) => {
    //           if (err.name == "ItemNotFoundException") {
    //             console.info("PProcess ItemNotFoundException ");
    //           } else {
    //             console.error("\t EEE1 Error err: " + err);
    //           }
    //         });
    //     }
    //   }
  } catch (error) {
    console.error("Error when saving to DB:", error.message);
  }
}

let a = await getFreeToken();
console.log(a);

// const response = await axios.post(
//   "https://api.hbdm.com/linear-swap-api/v1/swap_available_level_rate",
// );
// console.log(response);
