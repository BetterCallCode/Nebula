const canvas = document.getElementById("canvas");
const layersEl = document.getElementById("layers");

let elements = [];
let selected = null;
let history = [];
let future = [];
let counters = { rect: 0, circle: 0, text: 0 };

const saveHistory = () => {
  history.push(canvas.innerHTML);
  future = [];
};

const restore = (html) => {
  canvas.innerHTML = html;
  // Re-initialize interactivity after restore
  [...canvas.children].forEach((el) => {
    makeInteractive(el);
  });
  selected = null;
  refreshLayers();
};

// Create element
function create(type) {
  saveHistory();
  counters[type]++;
  const el = document.createElement("div");
  el.className = `element ${type}`;
  el.dataset.type = type;
  el.dataset.name = `${type}${counters[type]}`;
  el.textContent = type === "text" ? el.dataset.name : "";
  el.style.left = "60px";
  el.style.top = "60px";
  el.style.width = type === "text" ? "120px" : "100px";
  el.style.height = type === "text" ? "30px" : "100px";

  // Set default background color
  if (type !== "text") {
    el.style.backgroundColor = "#6366f1";
  }

  // Initialize z-index
  el.style.zIndex = canvas.children.length;

  canvas.appendChild(el);
  makeInteractive(el);
  select(el);
  refreshLayers();
}
