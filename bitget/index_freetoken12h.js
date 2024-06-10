
import axios from "axios";

async function getSymbols(isSpot) {
  if (isSpot) {
    const response = await axios.get(
      "https://api.bitget.com/api/v2/spot/public/symbols",
    );
    return response.data.data;
  } else {
    const response = await axios.get(
      "https://api.bitget.com/api/v2/mix/market/contracts?productType=usdt-futures",
    );
    return response.data.data;
  }
}

function groupPairsByQuoteAsset(symbols, isFutures) {
  const pairsByQuoteAsset = {};
  symbols.forEach((item) => {
    if (!isFutures) {
      const { baseCoin, quoteCoin, status } = item;
      if (status === "online") {
        if (!pairsByQuoteAsset[quoteCoin]) {
          pairsByQuoteAsset[quoteCoin] = [];
        }
        pairsByQuoteAsset[quoteCoin].push(baseCoin);
      }
    } else {
      const { baseCoin, quoteCoin, minLever, maxLever } = item;
      if (!pairsByQuoteAsset[quoteCoin]) {
        pairsByQuoteAsset[quoteCoin] = [];
      }
      pairsByQuoteAsset[quoteCoin].push({
        baseAsset: baseCoin,
        minLeverage: minLever,
        maxLeverage: maxLever,
      });
    }
  });
  return { data: pairsByQuoteAsset };
}

async function getFreeToken(event) {
  try {
    // const symbolsInfoSpot = await getSymbols(true);
    const symbolsInfoFutures = await getSymbols(false);

    // const putItemsSpot = groupPairsByQuoteAsset(symbolsInfoSpot, false);
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

// const response = await axios.get(
//   "https://api.gateio.ws/api/v4/spot/currency_pairs",
// );
// console.log(response.data[0]);
