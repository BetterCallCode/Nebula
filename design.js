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

//Resize
function addHandles(el) {
  ["br", "bl", "tr", "tl"].forEach((p) => {
    const h = document.createElement("div");
    h.className = `handle ${p}`;
    el.appendChild(h);
    h.onmousedown = (e) => {
      e.stopPropagation();
      const sw = el.offsetWidth,
        sh = el.offsetHeight;
      const sx = e.clientX,
        sy = e.clientY;
      const move = (ev) => {
        el.style.width = Math.max(20, sw + ev.clientX - sx) + "px";
        el.style.height = Math.max(20, sh + ev.clientY - sy) + "px";
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
        saveHistory();
        syncProps();
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    };
  });
}

const removeHandles = (el) =>
  el.querySelectorAll(".handle").forEach((h) => h.remove());

const pWidth = document.getElementById("pWidth");
const pHeight = document.getElementById("pHeight");
const pOpacity = document.getElementById("pOpacity");
const pRotate = document.getElementById("pRotate");
const pBg = document.getElementById("pBg");
const pText = document.getElementById("pText");

function syncProps() {
  if (!selected) {
    pWidth.value = "";
    pHeight.value = "";
    pOpacity.value = 1;
    pRotate.value = 0;
    pBg.value = "#6366f1";
    pText.value = "";
    return;
  }

  pWidth.value = selected.offsetWidth;
  pHeight.value = selected.offsetHeight;
  pOpacity.value = selected.style.opacity || 1;
  pRotate.value = selected.dataset.rotate || 0;

  // Get the actual background color
  if (selected.dataset.type === "text") {
    // For text elements, use their style or default
    const bgColor = selected.style.backgroundColor;
    if (bgColor && bgColor !== "transparent" && bgColor !== "") {
      pBg.value = rgbToHex(bgColor);
    } else {
      pBg.value = "#ffffff";
    }
  } else {
    // For rect and circle, always get the actual color
    if (selected.style.backgroundColor) {
      pBg.value = rgbToHex(selected.style.backgroundColor);
    } else {
      pBg.value = "#6366f1";
    }
  }

  pText.value = selected.dataset.type === "text" ? selected.textContent : "";
}

pWidth.oninput = () => {
  if (!selected) return;
  selected.style.width = pWidth.value + "px";
  saveHistory();
};

pHeight.oninput = () => {
  if (!selected) return;
  selected.style.height = pHeight.value + "px";
  saveHistory();
};

pOpacity.oninput = () => {
  if (!selected) return;
  selected.style.opacity = pOpacity.value;
};

pRotate.oninput = () => {
  if (!selected) return;
  selected.dataset.rotate = pRotate.value;
  selected.style.transform = `rotate(${pRotate.value}deg)`;
};

pBg.oninput = () => {
  if (!selected) return;
  selected.style.backgroundColor = pBg.value;
};

pText.oninput = () => {
  if (!selected || selected.dataset.type !== "text") return;
  selected.textContent = pText.value;
};

document.querySelectorAll("[data-align]").forEach((btn) => {
  btn.onclick = () => {
    if (!selected || selected.dataset.type !== "text") return;
    selected.style.textAlign = btn.dataset.align;
  };
});
