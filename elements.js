export const cardElement = ({ name, id, symbol }, index) => `
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

export const collapseElement = (usd, eur, ils, image) => {
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

export const dialogElement = (el) => `
    <li class="list-group-item">
      <label>
        <input type="checkbox" class="form-check-input me-1 inputs" checked />
      ${el}</label>
    </li>`;
