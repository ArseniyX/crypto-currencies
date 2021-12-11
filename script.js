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
const cardElement = ({ name, id, image, symbol }, index) => `
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
    $(".spinner-border").hide();
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
    // no need for now
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

async function onMoreButton(buttonElement) {
  const { id, index } = buttonElement.dataset;

  if (!cashedItems[id]) {
    const data = await fetchData(API.COIN_INFO, id);
    cashedItems = { ...cashedItems, [id]: true };
    const { usd, eur, ils } = data.market_data?.current_price || "";
    let crypto = [usd, eur, ils];
    crypto = crypto.map((el) => numberWithCommas(el));
    const { large: image } = data.image || "";

    $("#collapse-" + index).html(collapseElement(...crypto, image));
  }
}

function createElements(data, filteredValue = "") {
  data.forEach((element, index) => {
    if (!filteredValue && isFirstLoad) {
      console.log("first load");

      $(cardElement(element, index)).appendTo(CARD_DECK);
    }

    const name = element.name.toLowerCase();
    const symbol = element.symbol.toLowerCase();
    console.log(symbol);
    if (name.includes(filteredValue) || symbol.includes(filteredValue)) {
      $("#card-" + index).show();
    } else {
      $("#card-" + index).hide();
    }
  });
  if (isFirstLoad) {
    const moreBtn = $(".more-info").get();
    const toggleBtn = $(".toggle-button");
    for (let button of moreBtn) {
      $(button).on(CLICK, function () {
        onMoreButton(this);
      });
    }
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
  $(".spinner-border").toggle();
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
  const data = await getDataFromApi();
  const options = createOptions(data);
  $(CHART).CanvasJSChart(options);
  addPoints();
};

const getDataFromApi = () => $.ajax(multiCheckPrice(currencies.join(",")));

const dataToPoint = (data, name, x) => ({ x, y: data[name].USD });

const addPoints = async () => {
  const chart = $(CHART).CanvasJSChart();
  const data = await getDataFromApi();
  chart.options.data.forEach((option) => {
    const point = dataToPoint(data, option.name, seconds);
    option.dataPoints.push(point);
  });
  chart.render();
  seconds = seconds + 2;
};

const startLiveReports = () => {
  createChart();
  if (!nIntervalId) {
    nIntervalId = setInterval(addPoints, 2000);
  }

  console.log("interval started");
};

const getFromDataset = (arr) => arr.map((el) => el.dataset["symbol"]);

function onToggleButton() {
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

var options = {
  animationEnabled: true,
  theme: "dark1",
  title: {
    text: "Live Reports, 2016-17",
  },
  axisY: {
    includeZero: false,
    prefix: "$",
    lineThickness: 0,
  },
  toolTip: {
    shared: true,
  },
  legend: {
    fontSize: 13,
  },
  data: [
    {
      type: "splineArea",
      showInLegend: true,
      name: "Salaries",
      yValueFormatString: "$#,##0",
      xValueFormatString: "MMM YYYY",
      dataPoints: [
        { x: new Date(2016, 2), y: 28000 },
        { x: new Date(2016, 3), y: 31500 },
        { x: new Date(2016, 4), y: 28500 },
        { x: new Date(2016, 5), y: 30400 },
        { x: new Date(2016, 6), y: 26900 },
        { x: new Date(2016, 7), y: 31400 },
        { x: new Date(2016, 8), y: 31400 },
        { x: new Date(2016, 9), y: 31000 },
        { x: new Date(2016, 10), y: 33000 },
        { x: new Date(2016, 11), y: 35000 },
        { x: new Date(2017, 0), y: 37900 },
        { x: new Date(2017, 1), y: 38000 },
      ],
    },
    {
      type: "splineArea",
      showInLegend: true,
      name: "Office Cost",
      yValueFormatString: "$#,##0",
      dataPoints: [
        { x: new Date(2016, 2), y: 18100 },
        { x: new Date(2016, 3), y: 15000 },
        { x: new Date(2016, 4), y: 14000 },
        { x: new Date(2016, 5), y: 18500 },
        { x: new Date(2016, 6), y: 18500 },
        { x: new Date(2016, 7), y: 21800 },
        { x: new Date(2016, 8), y: 20000 },
        { x: new Date(2016, 9), y: 23000 },
        { x: new Date(2016, 10), y: 22000 },
        { x: new Date(2016, 11), y: 24000 },
        { x: new Date(2017, 0), y: 23000 },
        { x: new Date(2017, 1), y: 20500 },
      ],
    },
    {
      type: "splineArea",
      showInLegend: true,
      name: "Entertainment",
      yValueFormatString: "$#,##0",
      dataPoints: [
        { x: new Date(2016, 2), y: 13100 },
        { x: new Date(2016, 3), y: 8000 },
        { x: new Date(2016, 4), y: 5400 },
        { x: new Date(2016, 5), y: 4000 },
        { x: new Date(2016, 6), y: 7000 },
        { x: new Date(2016, 7), y: 7500 },
        { x: new Date(2016, 8), y: 6200 },
        { x: new Date(2016, 9), y: 8500 },
        { x: new Date(2016, 10), y: 11300 },
        { x: new Date(2016, 11), y: 12500 },
        { x: new Date(2017, 0), y: 10500 },
        { x: new Date(2017, 1), y: 9500 },
      ],
    },
    {
      type: "splineArea",
      showInLegend: true,
      yValueFormatString: "$#,##0",
      name: "Maintenance",
      dataPoints: [
        { x: new Date(2016, 2), y: 1900 },
        { x: new Date(2016, 3), y: 2300 },
        { x: new Date(2016, 4), y: 1650 },
        { x: new Date(2016, 5), y: 1860 },
        { x: new Date(2016, 6), y: 1200 },
        { x: new Date(2016, 7), y: 1000 },
        { x: new Date(2016, 8), y: 1200 },
        { x: new Date(2016, 9), y: 4500 },
        { x: new Date(2016, 10), y: 1300 },
        { x: new Date(2016, 11), y: 3700 },
        { x: new Date(2017, 0), y: 2700 },
        { x: new Date(2017, 1), y: 2300 },
      ],
    },
  ],
};
