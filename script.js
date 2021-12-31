// Constants
import { API, COLORS } from "./constants.js";
// Elements
import { cardElement, collapseElement, dialogElement } from "./elements.js";
// Util functions
import { numberWithCommas, getItem, setItem } from "./utils.js";

const DATA = "data";
const SMART_SEARCH = "smart-search";
const CLICK = "click";
const KEYUP = "keyup";
const CARD_DECK = ".card-deck";
const CHART = ".chart";
const UNLOAD = "unload";

const SEARCH_INPUT = $(".search-input");

// Global variables
let buttonState = {};
let currencies = ["BTC"];
let isFirstLoad = true;
let dialogState = true;
let nIntervalId;
let seconds = 0;

$(() => {
  const value = !!getItem(SMART_SEARCH);
  switchVisibility(".submit-button", value);

  if (isFirstLoading()) {
    firstLoading();
  } else {
    const data = dataFromStorage();
    filterElements(data);
    $(".spinner").hide();
  }
  createListeners();
});

// Listeners
const createListeners = () => {
  SEARCH_INPUT.on(KEYUP, onSearchKeyUpListener);
  $(".home-tab").on(CLICK, onHomeTabListener);
  $(".live-reports-tab").on(CLICK, onLiveReportsTabListener);
  $(".about-tab").on(CLICK, onAboutTabListener);
  $(".submit-button").on(CLICK, onSearchButton);
  $(".smart-search").on(CLICK, onSmartSearch);
  $(".close-button, .save-button").on(CLICK, onCancelButton);
  $(".dialog-container").on(CLICK, onCancelButton);
  $(".dialog-content").on(CLICK, (e) => e.stopPropagation());
};

const onCancelButton = () => {
  const isLessThenFive = $(".toggle-button:checked").length === 5;
  $(".dialog-container").css("visibility", "hidden");
  if (!isLessThenFive) {
    $(".toggle-button").parent().off(CLICK);
  }

  dialogState = true;
};

const onSearchKeyUpListener = (e) => {
  if (e.key === "Enter" || e.keyCode === 13) {
  }
  const stateSmartBtn = !!getItem(SMART_SEARCH);
  if (stateSmartBtn) {
    filterElements();
  }
};

const onSearchButton = (e) => {
  e.preventDefault();
  filterElements();
};

const onHomeTabListener = () => {
  hideAboutPage();
  stopLiveReports();
  $(CARD_DECK).show();
  $(".form-inline").show();
  $(".smart-search-container").show();
};

const onLiveReportsTabListener = () => {
  hideAboutPage();
  hideHome();
  $(CHART).show();
  if (seconds === 0) {
    startLiveReports();
  }
};

const onAboutTabListener = () => {
  hideHome();
  stopLiveReports();
  $(".about-page").show();
};

const onSmartSearch = () => {
  const state = !!getItem(SMART_SEARCH);
  changeState(SMART_SEARCH, state);
  switchVisibility(".submit-button", !state);
};

const hideHome = () => {
  $(`${CARD_DECK}, .form-inline, .smart-search-container`).hide();
};

const hideAboutPage = () => {
  $(".about-page").hide();
};

// this function change state of item in local storage
const changeState = (key, state) => {
  if (state) {
    setItem(key, "");
  } else {
    setItem(key, 1);
  }
};

const switchVisibility = (el, bool) => {
  if (bool || bool === "true") {
    $(el).hide();
  } else {
    $(el).show();
  }
};

const stopLiveReports = () => {
  $(CHART).hide();
  clearInterval(nIntervalId);
  // release our intervalID from the variable
  nIntervalId = null;
  seconds = 0;
};

function dataFromStorage() {
  return JSON.parse(getItem(DATA));
}

const firstLoading = async () => {
  toggleMainLoading();
  const data = await sortAPI(API.COINS_LIST);
  toggleMainLoading();
  setItem(DATA, data);
  if (!!data) {
    filterElements(data);
    isFirstLoad = false;
  }
};

const sortAPI = (api) =>
  $.ajax(api)
    .then((resp) =>
      resp.map((el) => ({ id: el.id, name: el.name, symbol: el.symbol }))
    )
    .fail((err) => console.error(err));

const isFirstLoading = () => {
  const firstLoading = getItem(DATA);
  return !firstLoading;
};

const compareTime = (id) => {
  const item = getItem(id);
  if (!buttonState[id]) return false;
  if (!item) return true;

  const timeNow = Date.now();
  const timeBefore = +item.timeStamp;
  const timeDifference = timeNow - timeBefore;
  if (timeDifference >= 120000) return true;
  const { index, crypto, image } = item;
  if (item) {
    $("#collapse-" + index).html(collapseElement(...crypto, image));
  }
  return false;
};

async function onMoreButton(buttonElement) {
  const { id, index } = buttonElement.dataset;
  buttonState = { ...buttonState, [id]: !buttonState[id] };
  const hasAccess = compareTime(id);
  console.log(buttonState);

  if (hasAccess) {
    const data = await fetchData(API.COIN_INFO, id);
    const timeStamp = Date.now();
    localStorage.setItem(id, timeStamp.toString());

    const { usd, eur, ils } = data.market_data?.current_price || "";
    let crypto = [usd, eur, ils];
    crypto = crypto.map((el) => numberWithCommas(el));
    const { large: image } = data.image || "";
    const item = {
      index,
      crypto,
      image,
      timeStamp,
    };
    setItem(id, item);
    $("#collapse-" + index).html(collapseElement(...crypto, image));
  }
}

function createElements(data, filteredValue = "") {
  data.forEach((element, index) => {
    if (isFirstLoad) {
      $(cardElement(element, index)).appendTo(CARD_DECK);
    }

    const name = element.name.toLowerCase();

    const symbol = element.symbol.toLowerCase();

    const smartButtonState = !!getItem(SMART_SEARCH);

    if (smartButtonState) {
      const value =
        name.includes(filteredValue) || symbol.includes(filteredValue);

      switchVisibility("#card-" + index, !value);
    } else {
      const value = symbol === filteredValue || filteredValue === "";
      switchVisibility("#card-" + index, !value);
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
  const inputValue = SEARCH_INPUT.val() || "";

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
  CanvasJS.addColorSet("crypto", COLORS);

  const data = currencies.map((name) => {
    const dataPoints = [];
    return {
      type: "line",
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
    colorSet: "crypto",
    title: {
      fontColor: "#43A9E2",
      text: "Live Reports: " + currencies.join(", "),
    },
    axisY: CHART.axisY,
    axisX: CHART.axisX,
    toolTip: {
      shared: true,
    },
    legend: {
      fontSize: 14,
      cursor: "pointer",
    },
    data,
  };
  return options;
};

const createChart = async () => {
  toggleMainLoading();
  const data = await getDataFromApi();
  const options = createOptions(data);
  $(CHART).CanvasJSChart(options);
  await updateChart();
  toggleMainLoading();
};

const getDataFromApi = () => $.ajax(API.multiCheckPrice(currencies.join(",")));

const dataToPoint = (data, name, x) => ({ x, y: data[name].USD });

const updateChart = async () => {
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
    nIntervalId = setInterval(updateChart, 2000);
  }
};

const getFromDataset = (arr) => arr.map((el) => el.dataset["symbol"]);

const onToggleButton = () => {
  const toggleBtn = $(".toggle-button");
  const checkedButtons = $(".toggle-button:checked").get();
  currencies = getFromDataset(checkedButtons);
  // Less then five
  const isLessThenFive = $(".toggle-button:checked").length === 5;
  toggleBtn.not(":checked").attr("disabled", isLessThenFive);
  if (isLessThenFive) {
    const parent = $(".toggle-button:disabled").parent();
    parent.off(CLICK);
    parent.on(CLICK, function () {
      showDialogWindow(this);
    });
    dialogState = false;
  }
};

const showDialogWindow = (context) => {
  const child = $(context).children()["0"];
  const isDisabled = !!$(child).attr("disabled");
  if (isDisabled) {
    const isLessThenFive = $(".toggle-button:checked").length === 5;
    if (!isLessThenFive) return;

    $(".dialog-list").empty();
    $(".dialog-container").css("visibility", "visible");
    const checkedButtons = $(".toggle-button:checked").get();
    const names = getFromDataset(checkedButtons);

    names.forEach((el) => {
      $(dialogElement(el)).appendTo(".dialog-list");
    });
    $(".inputs").each(function (index) {
      $(this).on(CLICK, () => triggerSwitchButton(checkedButtons, index));
    });
  }
};

function triggerSwitchButton(btn, index) {
  $($(btn)[index]).trigger(CLICK);
}

$(window).on(UNLOAD, () => {
  localStorage.removeItem(DATA);
});
