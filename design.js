const canvas = document.getElementById("canvas");
const layersEl = document.getElementById("layers");

let elements = [];
let selected = null;
let history = [];
let future = [];
let counters = { rect: 0, circle: 0, text: 0 };

