const api = "https://api.coingecko.com/api/v3/coins/";

const currencies = ["bitcoin", "ethereum", "binancecoin", "tether", "solana"];

const responses = currencies.map((el) => fetch(api + el));

const testFunction = (a) => (b) =>
  console.log(...a, ...b)
  

const hello = console.save()
console.log(hello)

Promise.all(responses)
  .then((resps) =>
    resps.map((data, index) =>
      data
        .json()
        .then((curr) =>
          console.log(index + ": " + curr.market_data.current_price.usd + "$")
        )
    )
  )
  .catch((err) => {
    console.error(err);
  });
