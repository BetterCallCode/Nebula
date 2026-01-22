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

//normalize z-index
function normalizeZIndex() {
  const items = [...canvas.children];
  items
    .sort(
      (a, b) =>
        (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0),
    )
    .forEach((el, index) => {
      el.style.zIndex = index;
    });
}

//z-index
document.getElementById("bringUp").onclick = () => {
  if (!selected) return;

  saveHistory();

  const items = [...canvas.children].sort(
    (a, b) => (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0),
  );

  const index = items.indexOf(selected);

  if (index < items.length - 1) {
    const currentZ = parseInt(selected.style.zIndex) || 0;
    const nextZ = parseInt(items[index + 1].style.zIndex) || 0;

    selected.style.zIndex = nextZ;
    items[index + 1].style.zIndex = currentZ;
  }

  normalizeZIndex();
  refreshLayers();
};

document.getElementById("sendDown").onclick = () => {
  if (!selected) return;

  saveHistory();

  const items = [...canvas.children].sort(
    (a, b) => (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0),
  );

  const index = items.indexOf(selected);

  if (index > 0) {
    const currentZ = parseInt(selected.style.zIndex) || 0;
    const prevZ = parseInt(items[index - 1].style.zIndex) || 0;

    selected.style.zIndex = prevZ;
    items[index - 1].style.zIndex = currentZ;
  }

  normalizeZIndex();
  refreshLayers();
};

//keyboard support
document.addEventListener("keydown", (e) => {
  if (!selected) return;

  // Prevent default for arrow keys and delete
  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Delete"].includes(
      e.key,
    )
  ) {
    e.preventDefault();
  }

  const rect = selected.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  let currentLeft = parseInt(selected.style.left) || 0;
  let currentTop = parseInt(selected.style.top) || 0;

  switch (e.key) {
    case "ArrowLeft":
      currentLeft = Math.max(0, currentLeft - 5);
      selected.style.left = currentLeft + "px";
      saveHistory();
      break;

    case "ArrowRight":
      currentLeft = Math.min(canvas.clientWidth - rect.width, currentLeft + 5);
      selected.style.left = currentLeft + "px";
      saveHistory();
      break;

    case "ArrowUp":
      currentTop = Math.max(0, currentTop - 5);
      selected.style.top = currentTop + "px";
      saveHistory();
      break;

    case "ArrowDown":
      currentTop = Math.min(canvas.clientHeight - rect.height, currentTop + 5);
      selected.style.top = currentTop + "px";
      saveHistory();
      break;

    case "Delete":
      saveHistory();
      selected.remove();
      selected = null;
      refreshLayers();
      syncProps();
      break;
  }
});

//layers
function refreshLayers() {
  layersEl.innerHTML = "";
  [...canvas.children]
    .sort(
      (a, b) =>
        (parseInt(b.style.zIndex) || 0) - (parseInt(a.style.zIndex) || 0),
    )
    .forEach((el) => {
      const div = document.createElement("div");
      div.className = "layer-item" + (el === selected ? " active" : "");
      div.textContent = el.dataset.name;
      div.onclick = () => select(el);

      // Store reference to element for real-time updates
      div.dataset.elementId = el.dataset.name;

      layersEl.appendChild(div);
    });

  // Scroll active layer into view
  if (selected) {
    const activeLayer = layersEl.querySelector(".layer-item.active");
    if (activeLayer) {
      activeLayer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
}

//update layer highlight
function updateLayerHighlight() {
  const allLayers = layersEl.querySelectorAll(".layer-item");
  allLayers.forEach((layer) => {
    if (selected && layer.dataset.elementId === selected.dataset.name) {
      layer.classList.add("active");
    } else {
      layer.classList.remove("active");
    }
  });
}

//undo and redo
document.getElementById("undoBtn").onclick = () => {
  if (!history.length) return;
  future.push(canvas.innerHTML);
  restore(history.pop());
};

document.getElementById("redoBtn").onclick = () => {
  if (!future.length) return;
  history.push(canvas.innerHTML);
  restore(future.pop());
};

//Export
document.getElementById("exportJSON").onclick = () =>
  download(
    new Blob([canvas.innerHTML], { type: "application/json" }),
    "design.json",
  );
document.getElementById("exportHTML").onclick = () =>
  download(new Blob([canvas.innerHTML], { type: "text/html" }), "design.html");

const download = (blob, name) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
};

const rgbToHex = (rgb) => {
  // Handle "transparent" and empty values
  if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") {
    return "#ffffff";
  }

  // Handle hex values that are already in correct format
  if (typeof rgb === "string" && rgb.startsWith("#")) {
    return rgb.length === 7 ? rgb : "#6366f1";
  }

  // Handle rgba and rgb formats
  const match = String(rgb).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, "0");
    const g = parseInt(match[2]).toString(16).padStart(2, "0");
    const b = parseInt(match[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }

  return "#6366f1";
};

//buttons to create shapes and text-box
addRect.onclick = () => create("rect");
addCircle.onclick = () => create("circle");
addText.onclick = () => create("text");

//Local storage
const STORAGE_KEY = "domfigma-layout";

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, canvas.innerHTML);
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  canvas.innerHTML = saved;
  [...canvas.children].forEach((el) => {
    makeInteractive(el);
    // Ensure z-index is set
    if (!el.style.zIndex) {
      el.style.zIndex = "0";
    }
  });

  refreshLayers();
}

["mouseup", "keyup", "input"].forEach((evt) => {
  document.addEventListener(evt, saveToLocalStorage);
});

window.addEventListener("load", loadFromLocalStorage);
