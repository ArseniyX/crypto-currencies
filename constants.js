export const API = {
  COINS_LIST:
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
  COIN_INFO: "https://api.coingecko.com/api/v3/coins/",
  multiCheckPrice: (currencies) =>
  `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${currencies}&tsyms=USD`
};

export const COLORS = ["#ffa600", "#ff6361", "#bc5090", "#58508d", "#003f5c"];

export const CHART = {
  axisX: {
    suffix: "s",
    minimum: 0,
    // interval: 2,
    intervalType: "second",
    crosshair: {
      enabled: true,
    },
  },
  axisY: {
    includeZero: false,
    prefix: "$",
    lineThickness: 0,
    logarithmic: true,
    crosshair: {
      enabled: true,
    },
  },
};