export const numberWithCommas = (x) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const getItem = (key) => {
  const itemString = localStorage.getItem(key);
  if (!itemString) {
    localStorage.setItem(key, "");
    return false;
  }
  if (itemString[0] !== "{") return itemString;

  const item = JSON.parse(itemString);
  return item;
};

export const setItem = (key, item) => {
  if (typeof item === "string") {
    localStorage.setItem(key, item);
  }

  const itemString = item !== "" ? JSON.stringify(item) : "";

  localStorage.setItem(key, itemString);
};

