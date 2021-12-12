// Constants
const API = {
  COINS_LIST:
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
  COIN_INFO: "https://api.coingecko.com/api/v3/coins/",
};
const multiCheckPrice = (currencies) =>
  `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${currencies}&tsyms=USD`;

const DATA = "data";
const CLICK = "click";
const KEYUP = "keyup";
const CARD_DECK = ".card-deck";
const CHART = ".chart";
const UNLOAD = "unload";

const SEARCH_INPUT = $(".search-input");

// Elements
const cardElement = ({ name, id, symbol }, index) => `
  <div class="card main-card mt-4" style="flex: none;" id="card-${index}">
    <div class="card-body">
      <div class="header-card__container">
        <h5 class="card-title">${symbol.toUpperCase()}</h5>
        <label class="switch">
          <input type="checkbox" class="toggle-button" data-symbol="${symbol.toUpperCase()}">
          <span class="slider round"></span>
        </label>
      </div>
      
      <p class="card-text">${name}</p>
      <button type="button" class="btn btn-primary more-info" data-index="${index}" data-toggle="collapse"
        data-target="#id-${index}" data-id="${id}" data-bs-toggle="collapse" data-bs-target="#id-${index}"
        aria-expanded="false" aria-controls="id-${index}">
        <span class="spinner-border spinner-border-sm loading-${id}" role="status" aria-hidden="true"
          style="display:none"></span>
        <span class="more-info-${id}">More info</span>
        <span class="loading-${id}" style="display:none">Loading...</span>
      </button>
      <div class="collapse mt-3" id="id-${index}">
        <div class="card card-body" id="collapse-${index}"></div>
      </div>
    </div>
  </div>
  `;

const collapseElement = (usd, eur, ils, image) => {
  return `
  <div>
    <div class="image-wrapper">
      <img src="${image}" alt="image"/>
    </div>
    <ul class="list-group mt-2">
      <li class="list-group-item list-group-item-dark">\$${usd}</li>
      <li class="list-group-item list-group-item-dark">€${eur}</li>
      <li class="list-group-item list-group-item-dark" >₪${ils}</li>
    </ul>
  </div>
  `;
};

// Util functions, poor functions
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dataFromStorage() {
  return JSON.parse(localStorage.getItem(DATA));
}

let cashedItems = {};
let currencies = ["BTC"];
let isFirstLoad = true;
let nIntervalId;
let seconds = 0;

onload = () => {
  if (isFirstLoading()) {
    firstLoading();
  } else {
    const data = dataFromStorage();
    createElements(data);
    $(".spinner").hide();
  }
  createListeners();
};

// LISTENERS
const createListeners = () => {
  SEARCH_INPUT.on(KEYUP, onSearchKeyUpListener);
  $(".home-tab").on(CLICK, onHomeTabListener);
  $(".live-reports-tab").on(CLICK, onLiveReportsTabListener);
  $(".about-tab").on(CLICK, onAboutTabListener);
};

const onSearchKeyUpListener = (e) => {
  if (e.key === "Enter" || e.keyCode === 13) {
  }
  filterElements();
};

const onHomeTabListener = () => {
  $(CARD_DECK).show();

  stopLiveReports();
};

const onLiveReportsTabListener = () => {
  $(CARD_DECK).hide();
  $(CHART).show();
  startLiveReports();
};

const stopLiveReports = () => {
  $(CHART).hide();
  clearInterval(nIntervalId);
  // release our intervalID from the variable
  nIntervalId = null;
  seconds = 0;
};

const onAboutTabListener = () => {
  stopLiveReports();
};

const firstLoading = async () => {
  toggleMainLoading();
  const data = await $.ajax(API.COINS_LIST);
  toggleMainLoading();

  localStorage.setItem(DATA, JSON.stringify(data));
  if (!!data) {
    createElements(data);
    isFirstLoad = false;
  }
};

const isFirstLoading = () => {
  const firstLoading = localStorage.getItem(DATA);
  return !firstLoading;
};

const wasLoaded = (id) => {
  if (!cashedItems[id]) return true;
  const seconds = Date.now();
  return !cashedItems[id];
};

const compareTime = (id) => {
  const itemJson = localStorage.getItem(id);

  if (!itemJson) return true;

  const item = JSON.parse(itemJson);
  const timeNow = Date.now();
  const timeBefore = +item.timeStamp;
  const timeDifference = timeNow - timeBefore;
  if (timeDifference >= 120000) return true;
  const { index, crypto, image } = item;
  if (!cashedItems[id]) {
    $("#collapse-" + index).html(collapseElement(...crypto, image));
  }
  return false;
};

async function onMoreButton(buttonElement) {
  const { id, index } = buttonElement.dataset;
  const hasAccess = compareTime(id);

  if (hasAccess) {
    const data = await fetchData(API.COIN_INFO, id);
    const timeNow = Date.now();
    localStorage.setItem(id, timeNow.toString());
    console.log(cashedItems);
    cashedItems = { ...cashedItems, [id]: !cashedItems[id] };
    const { usd, eur, ils } = data.market_data?.current_price || "";
    let crypto = [usd, eur, ils];
    crypto = crypto.map((el) => numberWithCommas(el));
    const { large: image } = data.image || "";
    const item = {
      index,
      crypto,
      image,
      timeStamp: timeNow,
    };
    const jsonItem = JSON.stringify(item);
    localStorage.setItem(id, jsonItem);
    $("#collapse-" + index).html(collapseElement(...crypto, image));
  }
}

function createElements(data, filteredValue = "") {
  data.forEach((element, index) => {
    if (!filteredValue && isFirstLoad) {
      $(cardElement(element, index)).appendTo(CARD_DECK);
    }

    const name = element.name.toLowerCase();
    const symbol = element.symbol.toLowerCase();
    if (name.includes(filteredValue) || symbol.includes(filteredValue)) {
      $("#card-" + index).show();
    } else {
      $("#card-" + index).hide();
    }
  });
  if (isFirstLoad) {
    const moreBtn = $(".more-info").get();
    const toggleBtn = $(".toggle-button");
    moreBtn.forEach((button) => {
      $(button).on(CLICK, function () {
        onMoreButton(this);
      });
    });
    toggleBtn.on(CLICK, function () {
      onToggleButton(this);
    });
  }
}

const filterElements = () => {
  const inputValue = SEARCH_INPUT.val();
  const data = dataFromStorage();
  createElements(data, inputValue.toLowerCase());
};

const fetchData = async (url, id = "") => {
  toggleSmallLoading(id);
  const data = await $.ajax(url + id);
  toggleSmallLoading(id);
  return data;
};

const toggleSmallLoading = (id) => {
  $(".loading-" + id).toggle();
  $(".more-info-" + id).toggle();
};

function toggleMainLoading() {
  $(".spinner").toggle();
}

const createOptions = () => {
  const data = currencies.map((name) => {
    const dataPoints = [];
    return {
      type: "splineArea",
      axisXIndex: 0,
      showInLegend: true,
      name,
      yValueFormatString: "$#,###.##",
      xValueFormatString: "## sec.",
      dataPoints,
    };
  });

  const options = {
    animationEnabled: true,
    theme: "dark1",
    backgroundColor: "",
    title: {
      text: "Live Reports: " + currencies.join(", "),
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
    axisX: {
      suffix: "s",
      minimum: 0,
      // interval: 2,
      intervalType: "second",
      crosshair: {
        enabled: true,
      },
    },
    toolTip: {
      shared: true,
    },
    legend: {
      fontSize: 14,
      cursor: "pointer",
    },
    data,
  };
  console.log(options);
  return options;
};

const createChart = async () => {
  toggleMainLoading();
  const data = await getDataFromApi();
  const options = createOptions(data);
  $(CHART).CanvasJSChart(options);
  await renderChart();
  toggleMainLoading();
};

const getDataFromApi = () => $.ajax(multiCheckPrice(currencies.join(",")));

const dataToPoint = (data, name, x) => ({ x, y: data[name].USD });

const renderChart = async () => {
  const chart = $(CHART).CanvasJSChart();
  const data = await getDataFromApi();
  chart.options.data.forEach((option) => {
    const point = dataToPoint(data, option.name, seconds);
    option.dataPoints.push(point);
  });
  await chart.render();
  seconds = seconds + 2;
};

const startLiveReports = () => {
  createChart();
  if (!nIntervalId) {
    nIntervalId = setInterval(renderChart, 2000);
  }
};

const getFromDataset = (arr) => arr.map((el) => el.dataset["symbol"]);

const onToggleButton = () => {
  const toggleBtn = $(".toggle-button");
  const checkedButtons = $(".toggle-button:checked").get();
  currencies = getFromDataset(checkedButtons);
  console.log(currencies.join(","));
  // Less then four
  const isLessThenFive = $(".toggle-button:checked").length > 4;
  toggleBtn.not(":checked").attr("disabled", isLessThenFive);
}

$(window).on(UNLOAD, () => {
  localStorage.removeItem(DATA);
});
