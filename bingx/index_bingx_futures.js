import crypto from "crypto";
import axios from "axios";
import Big from "big.js";

const apiKey =  "";
const apiSecret =  "";
const baseURL = "https://open-api.bingx.com";
const timestamp = new Date().getTime();
const recvWindow = 10000;

// changeMarginTypeBingx(
//   {
//     timestamp: timestamp,
//     symbol: "BTC-USDT",
//     recvWindow: recvWindow,
//     marginType: "ISOLATED", //CROSSED
//     // side: "BOTH",
//   },
//   {
//     key: apiKey,
//     secret: apiSecret,
//   },
// );

async function changeMarginTypeBingx(params, keys) {
  let result = await composeAndRun(
    {
      method: "POST",
      url: "/openApi/swap/v2/trade/marginType",
      params,
      keys,
    },
    "bingx",
  );

  if (result.data.code !== 0)
    throw new Error(
      "Failed to change margin type. " + JSON.stringify(result.data),
    );
}

// changeInitialLeverageBingx(
//   {
//     timestamp: timestamp,
//     symbol: "BTC-USDT",
//     leverage: BigInt(5),
//     recvWindow: recvWindow,
//     side: "BOTH",
//   },
//   {
//     key: apiKey,
//     secret: apiSecret,
//   },
// );

async function changeInitialLeverageBingx(params, keys) {
  await composeAndRun(
    {
      method: "POST",
      url: "/openApi/swap/v2/trade/leverage",
      params,
      keys,
    },
    "bingx",
  );
}

// queryOrders(
//   {
//     timestamp: timestamp,
//     symbol: "BTC-USDT",
//     orderId: BigInt(1776198789520109600),
//     recvWindow: recvWindow,
//   },
//   { key: apiKey, secret: apiSecret },
// ).then((data) => {
//   console.log(data);
//   console.log(data.data.data.order);
// });

// getOpenOrders(
//   {
//     timestamp: timestamp,
//     symbol: "BTC-USDT",
//     recvWindow: recvWindow,
//   },
//   { key: apiKey, secret: apiSecret },
// ).then((data) => {
//   console.log(data);
//   console.log(data.data.data.orders[0].orderId);
// });

function getOpenOrders(params, keys) {
  return composeAndRun(
    {
      method: "GET",
      url: "/openApi/swap/v2/trade/openOrders",
      params,
      keys,
    },
    "bingx",
  );
}

function queryOrders(params, keys) {
  return composeAndRun(
    {
      method: "GET",
      url: "/openApi/swap/v2/trade/order",
      params,
      keys,
    },
    "bingx",
  );
}

// startUserDataStream(
//   {
//     timestamp: timestamp,
//     leverage: "8",
//     side: "BOTH",
//     symbol: "BTC-USDT",
//     recvWindow: recvWindow,
//   },
//   { key: apiKey, secret: apiSecret },
// ).then((data) => {
//   console.log(data);
// });

// function startUserDataStream(params, keys) {
//   return composeAndRun(
//     {
//       method: "POST",
//       url: "/openApi/swap/v2/trade/leverage",
//       params,
//       keys,
//     },
//     "bingx",
//   );
// }

// cancelOrder(
//   {
//     orderId: BigInt(1780899052986249200),
//     symbol: "BTC-USDT",
//     timestamp: timestamp,
//   },
//   { key: apiKey, secret: apiSecret },
// ).then((data) => {
//   console.log(data);
// });

function cancelOrder(params, keys) {
  // const { orderId, symbol } = params;
  // if (!orderId && !symbol) {
  //   throw new Error("Missing parameters " + JSON.stringify(params));
  // }
  console.log(params);
  return composeAndRun(
    {
      method: "DELETE",
      url: "/openApi/swap/v2/trade/order",
      params,
      keys,
    },
    "bingx",
  );
}

newOrder(
  {
    symbol: "BTC-USDT",
    side: "BUY",
    positionSide: "BOTH",
    type: "MARKET",
    //timeInForce: "GTC",
    //price: "23000.0",
    //stopPrice: "31968.0",
    quantity: 7,
    takeProfit:
      '{"type": "TAKE_PROFIT_MARKET", "stopPrice": 31968.0,"price": 31968.0,"workingType":"MARK_PRICE"}',
    // stop: {
    //   stopPrice: 15000,
    //   price: 23000,
    //   workingType: "MARK_PRICE",
    // },
    timestamp: timestamp,
    recvWindow: recvWindow,
  },
  { key: apiKey, secret: apiSecret },
).then((data) => {
  console.log("data", data);
  // console.log("JSONdata", JSON.stringify(data.data.data.order));
});

function newOrder(params, keys) {
  console.log("params", params);
  const { type, timeInForce, quantity, price, stopPrice } = params;

  return composeAndRun(
    {
      method: "POST",
      url: "/openApi/swap/v2/trade/order",
      params,
      keys,
    },
    "bingx",
  );
}

// accountInformation(
//   { timestamp: timestamp, recvWindow: recvWindow },
//   { key: apiKey, secret: apiSecret },
// ).then((data) => {
//   console.log(data);
//   console.log(data.data.data.balance);
// });

function accountInformation(params, keys) {
  return composeAndRun(
    {
      method: "GET",
      url: "/openApi/swap/v2/user/balance",
      params,
      keys,
    },
    "bingx",
  );
}

function extractCurrent1mWeightUsed(axiosResponse) {
  let weightStr = axiosResponse.headers["x-bx-used-weight-1m"];
  return parseInt(weightStr);
}

function extractCurrent1dOrderCountUsed(axiosResponse) {
  let weightStr = axiosResponse.headers["x-bx-order-count-1m"];
  return parseInt(weightStr);
}

function extractCurrent1mOrderCountUsed(axiosResponse) {
  let weightStr = axiosResponse.headers["x-bx-order-count-10s"];
  return parseInt(weightStr);
}

function getSignedParams(data, secret) {
  let pars = [];
  for (let item in data) {
    pars.push(item + "=" + data[item]);
  }
  let p = pars.sort().join("&");
  let hash = crypto.createHmac("sha256", secret);
  hash.update(p);
  let sig = hash.digest("hex");
  p += `&signature=${sig}`;
  return p;
}

function axiosResponseToBinanceResponse(axiosResponse) {
  // console.log("HEADERS");
  // console.log(JSON.stringify(axiosResponse.headers, null, 4));
  // console.log(axiosResponse);
  return {
    //current1dOrderCountUsed: extractCurrent1dOrderCountUsed(axiosResponse),
    //current1mOrderCountUsed: extractCurrent1mOrderCountUsed(axiosResponse),
    //current1mIpWeightUsed: extractCurrent1mWeightUsed(axiosResponse),
    data: axiosResponse.data,
  };
}

function composeAxiosRequest(requestParts) {
  const { method, url, data, headers } = requestParts;
  return axios({
    method,
    baseURL: baseURL,
    url,
    data,
    headers,
  });
}

function error1010ToKnownError(msg) {
  switch (msg) {
    case "Order would trigger immediately.":
      return new StopPriceWouldTriggerImmediatelyError(1010, msg);
    case "Account has insufficient balance for requested action.":
      return new InsufficientBalanceError(1010, msg);
    default:
      return null;
  }
}

function responseToKnownError(data) {
  switch (data.code) {
    case -10010:
      return error1010ToKnownError(data.msg);
    case -2019:
      return new MarginIsInsufficientError(data.code, data.msg);
    case -2021:
      return new StopPriceWouldTriggerImmediatelyError(data.code, data.msg);
    case -2027:
      return new MaxLeverageRatioError(data.code, data.msg);
    case -4061:
      return new OrderPositionSideDoesNotMatchUserSetting(data.code, data.msg);
    // case -1102: missing or malformed param
    //     return new
    default:
      return null;
  }
}

async function composeAndRun(requestParts, api) {
  let rp = requestParts;
  if (requestParts.keys) {
    if (api === "bingx") {
      rp = { ...requestParts };
      rp.headers = rp.headers || {};
      rp.headers["X-BX-APIKEY"] = requestParts.keys.key;
    } else {
      rp = { ...requestParts };
      rp.headers = rp.headers || {};
      rp.headers["X-MBX-APIKEY"] = requestParts.keys.key;
    }
    let signedParams = getSignedParams(
      requestParts.params,
      requestParts.keys.secret,
    );
    delete rp.params;
    delete rp.keys;
    rp.url += "?" + signedParams;
  } else {
    if (requestParts.method === "GET") {
      if (rp.params) {
        let parStr = "";
        for (let p in rp.params) parStr += `${p}=${rp.params[p]}`;
        if (parStr.length > 0) rp.url += "?" + parStr;
      }
    }
  }
  try {
    let axiosResponse = await composeAxiosRequest(rp);
    return axiosResponseToBinanceResponse(axiosResponse);
  } catch (e) {
    console.log("error", e);

    if (e.isAxiosError) {
      let knownError = responseToKnownError(e.response.data);
      if (knownError) throw knownError;
      // throw new Error(JSON.stringify(e.response));
    }
    // throw e;
  }
}
