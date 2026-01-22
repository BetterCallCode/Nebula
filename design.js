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


