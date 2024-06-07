
import axios from "axios";

async function getSymbols(isSpot) {
  if (isSpot) {
    const response = await axios.get(
      "https://api.gateio.ws/api/v4/spot/currency_pairs",
    );
    return response.data;
  } else {
    const response = await axios.get(
      "https://api.gateio.ws/api/v4/margin/uni/currency_pairs",
    );
    return response.data;
  }
}

function groupPairsByQuoteAsset(symbols, isFutures) {
  const pairsByQuoteAsset = {};
  symbols.forEach((item) => {
    if (!isFutures) {
      const { base, quote, trade_status } = item;
      let baseCoin = base;
      if (trade_status === "tradable") {
        if (!pairsByQuoteAsset[quote]) {
          pairsByQuoteAsset[quote] = [];
        }
      }
      pairsByQuoteAsset[quote].push(baseCoin);
    } else {
      const { currency_pair, leverage } = item;
      if (!pairsByQuoteAsset[currency_pair.split("_")[1]]) {
        pairsByQuoteAsset[currency_pair.split("_")[1]] = [];
      }
      pairsByQuoteAsset[currency_pair.split("_")[1]].push({
        baseAsset: currency_pair.split("_")[0],
        maxLeverage: leverage,
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
    // const putItemsFutures = groupPairsByQuoteAsset(symbolsInfoFutures, true);

    return JSON.stringify(putItemsSpot);
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
