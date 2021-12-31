const api = "https://api.coingecko.com/api/v3/coins/";

const currencies = ["bitcoin", "ethereum", "binancecoin", "tether", "solana"];

const pendingData = currencies.map((el) => fetch(api + el));

Promise.all(pendingData)
  .then((resps) =>
    resps.map((data, index) =>
      data
        .json()
        .then((curr) =>
          console.log(index + ": " + curr.market_data.current_price.usd + "$")
        )
    )
  )
  .catch((err) => console.error(err));
