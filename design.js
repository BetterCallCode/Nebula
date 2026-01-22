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

// Selection and deselection
function select(el) {
  if (selected) deselect();
  selected = el;
  el.classList.add("selected");
  el.classList.remove("ghost");
  addHandles(el);
  syncProps();
  updateLayerHighlight();
}

function deselect() {
  if (!selected) return;
  selected.classList.remove("selected");
  selected.classList.add("ghost");
  removeHandles(selected);
  selected = null;
  syncProps();
  updateLayerHighlight();
}

canvas.addEventListener("mousedown", (e) => e.target === canvas && deselect());

//Drag and drop feature
function makeInteractive(el) {
  el.onmousedown = (e) => {
    if (e.target.classList.contains("handle")) return;
    select(el);
    const sx = e.clientX,
      sy = e.clientY;
    const r = el.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();

    const move = (ev) => {
      let x = r.left + ev.clientX - sx - c.left;
      let y = r.top + ev.clientY - sy - c.top;
      x = Math.max(0, Math.min(x, canvas.clientWidth - r.width));
      y = Math.max(0, Math.min(y, canvas.clientHeight - r.height));
      el.style.left = x + "px";
      el.style.top = y + "px";
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      saveHistory();
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };
}
