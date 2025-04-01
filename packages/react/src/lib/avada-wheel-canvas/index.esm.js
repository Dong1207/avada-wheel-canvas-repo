Array.prototype.includes || Object.defineProperty(Array.prototype, "includes", {
  value: function(a, t) {
    if (this == null)
      throw new TypeError('"this" is null or not defined');
    var e = Object(this), i = e.length >>> 0;
    if (i === 0)
      return !1;
    var s = t | 0, h = Math.max(s >= 0 ? s : i - Math.abs(s), 0);
    function r(n, o) {
      return n === o || typeof n == "number" && typeof o == "number" && isNaN(n) && isNaN(o);
    }
    for (; h < i; ) {
      if (r(e[h], a))
        return !0;
      h++;
    }
    return !1;
  }
});
String.prototype.includes || (String.prototype.includes = function(a, t) {
  return typeof t != "number" && (t = 0), t + a.length > this.length ? !1 : this.indexOf(a, t) !== -1;
});
Array.prototype.find || Object.defineProperty(Array.prototype, "find", {
  value: function(a) {
    if (this == null)
      throw new TypeError('"this" is null or not defined');
    var t = Object(this), e = t.length >>> 0;
    if (typeof a != "function")
      throw new TypeError("predicate must be a function");
    for (var i = arguments[1], s = 0; s < e; ) {
      var h = t[s];
      if (a.call(i, h, s, t))
        return h;
      s++;
    }
  }
});
const P = (a, ...t) => t.some((e) => Object.prototype.toString.call(a).slice(8, -1).toLowerCase() === e), _ = (a, t) => Object.prototype.hasOwnProperty.call(a, t), Z = (a) => [].filter.call(a, (t) => t !== `
`).join(""), ct = (a) => a === null ? 0 : typeof a == "object" ? NaN : typeof a == "number" ? a : typeof a == "string" ? a[a.length - 1] === "%" ? Number(a.slice(0, -1)) / 100 : Number(a) : NaN, O = (a) => {
  if (typeof a != "string" || (a = a.toLocaleLowerCase().trim(), a === "transparent")) return !1;
  if (/^rgba/.test(a)) {
    const t = /([^\s,]+)\)$/.exec(a);
    if (ct(t) === 0) return !1;
  }
  return !0;
}, st = (a, t) => {
  let e = a.padding?.split(" ").map((o) => t(o)) || [0], i = 0, s = 0, h = 0, r = 0;
  switch (e.length) {
    case 1:
      i = s = h = r = e[0];
      break;
    case 2:
      i = s = e[0], h = r = e[1];
      break;
    case 3:
      i = e[0], h = r = e[1], s = e[2];
      break;
    default:
      i = e[0], s = e[1], h = e[2], r = e[3];
  }
  const n = { paddingTop: i, paddingBottom: s, paddingLeft: h, paddingRight: r };
  for (let o in n)
    n[o] = _(a, o) && P(a[o], "string", "number") ? t(a[o]) : n[o];
  return [i, s, h, r];
}, dt = (a, t = 300) => {
  let e = null;
  return function(...i) {
    e || (e = setTimeout(() => {
      a.apply(this, i), clearTimeout(e), e = null;
    }, t));
  };
}, ht = (a) => {
  const t = [], e = a.map((s) => Number(s)).reduce((s, h) => {
    if (h > 0) {
      const r = s + h;
      return t.push(r), r;
    } else
      return t.push(NaN), s;
  }, 0), i = Math.random() * e;
  return t.findIndex((s) => i <= s);
}, J = (a, t, e, i = 1 / 0) => {
  i <= 0 && (i = 1 / 0);
  let s = "";
  const h = [], r = a.measureText("...").width;
  for (let n = 0; n < t.length; n++) {
    s += t[n];
    let o = a.measureText(s).width;
    const l = e(h);
    if (i === h.length + 1 && (o += r), l < 0) return h;
    if (o > l && (h.push(s.slice(0, -1)), s = t[n]), i === h.length)
      return h[h.length - 1] += "...", h;
  }
  return s && h.push(s), h.length || h.push(t), h;
}, gt = (a, t) => {
  const e = {}, i = [];
  for (let s = 0; s < a.length; s++)
    e[s] = a[s];
  for (let s = 0; s < t.length; s++) {
    const h = e[t[s]];
    h && (i[s] = h);
  }
  return i;
}, ft = "avada-wheel-canvas", q = "1.0.0";
class E {
  /**
   * Subscription center constructor
   */
  constructor() {
    this.subs = [];
  }
  /**
   * Collect dependencies
   * @param {*} sub 
   */
  addSub(t) {
    this.subs.includes(t) || this.subs.push(t);
  }
  /**
   * Dispatch updates
   */
  notify() {
    this.subs.forEach((t) => {
      t.update();
    });
  }
}
const ut = "__proto__" in {};
function et(a, t, e, i) {
  Object.defineProperty(a, t, {
    value: e,
    enumerable: !1,
    writable: !0,
    configurable: !0
  });
}
function pt(a) {
  a += ".";
  let t = [], e = "";
  for (let i = 0; i < a.length; i++) {
    let s = a[i];
    if (/\[|\./.test(s))
      t.push(e), e = "";
    else {
      if (/\W/.test(s))
        continue;
      e += s;
    }
  }
  return function(i) {
    return t.reduce((s, h) => s[h], i);
  };
}
function mt(a) {
  const t = (e) => {
    P(e, "array", "object") && Object.keys(e).forEach((i) => {
      const s = e[i];
      t(s);
    });
  };
  t(a);
}
const nt = Array.prototype, X = Object.create(nt), wt = ["push", "pop", "shift", "unshift", "sort", "splice", "reverse"];
wt.forEach((a) => {
  X[a] = function(...t) {
    const e = nt[a].apply(this, t), i = this.__luckyOb__;
    return ["push", "unshift", "splice"].includes(a) && i.walk(this), i.dep.notify(), e;
  };
});
class bt {
  /**
   * Observer constructor
   * @param value 
   */
  constructor(t) {
    this.dep = new E(), et(t, "__luckyOb__", this), Array.isArray(t) && (ut ? t.__proto__ = X : Object.getOwnPropertyNames(X).forEach((e) => {
      et(t, e, X[e]);
    })), this.walk(t);
  }
  walk(t) {
    Object.keys(t).forEach((e) => {
      rt(t, e, t[e]);
    });
  }
}
function it(a) {
  if (!a || typeof a != "object") return;
  let t;
  return "__luckyOb__" in a ? t = a.__luckyOb__ : t = new bt(a), t;
}
function rt(a, t, e) {
  const i = new E(), s = Object.getOwnPropertyDescriptor(a, t);
  if (s && s.configurable === !1)
    return;
  const h = s && s.get, r = s && s.set;
  (!h || r) && arguments.length === 2 && (e = a[t]);
  let n = it(e);
  Object.defineProperty(a, t, {
    get: () => {
      const o = h ? h.call(a) : e;
      return E.target && (i.addSub(E.target), n && n.dep.addSub(E.target)), o;
    },
    set: (o) => {
      o !== e && (e = o, !(h && !r) && (r ? r.call(a, o) : e = o, n = it(o), i.notify()));
    }
  });
}
let St = 0;
class yt {
  /**
   * Observer constructor
   * @param {*} $lucky 
   * @param {*} expr 
   * @param {*} cb 
   */
  constructor(t, e, i, s = {}) {
    this.id = St++, this.$lucky = t, this.expr = e, this.deep = !!s.deep, typeof e == "function" ? this.getter = e : this.getter = pt(e), this.cb = i, this.value = this.get();
  }
  /**
   * Get new value based on expression
   */
  get() {
    E.target = this;
    const t = this.getter.call(this.$lucky, this.$lucky);
    return this.deep && mt(t), E.target = null, t;
  }
  /**
   * Trigger watcher update
   */
  update() {
    const t = this.get(), e = this.value;
    this.value = t, this.cb.call(this.$lucky, t, e);
  }
}
class K {
  /**
   * Common constructor
   * @param config
   */
  constructor(t, e) {
    this.version = q, this.htmlFontSize = 16, this.rAF = function() {
    }, this.boxWidth = 0, this.boxHeight = 0, typeof t == "string" ? t = { el: t } : t.nodeType === 1 && (t = { el: "", divElement: t }), t = t, this.config = t, this.data = e, t.flag || (t.flag = "WEB"), t.el && (t.divElement = document.querySelector(t.el)), t.divElement && (t.canvasElement = document.createElement("canvas"), t.divElement.appendChild(t.canvasElement)), t.canvasElement && (t.ctx = t.canvasElement.getContext("2d"), t.canvasElement.setAttribute("package", `${ft}@${q}`), t.canvasElement.addEventListener("click", (i) => this.handleClick(i))), this.ctx = t.ctx, this.initWindowFunction(), this.config.ctx || console.error("Unable to get CanvasContext2D"), window && typeof window.addEventListener == "function" && window.addEventListener("resize", dt(() => this.resize(), 300)), window && typeof window.MutationObserver == "function" && new window.MutationObserver(() => {
      this.resize();
    }).observe(document.documentElement, { attributes: !0 });
  }
  static {
    this.version = q;
  }
  /**
   * Initialize component size/units
   */
  resize() {
    this.config.beforeResize?.(), this.setHTMLFontSize(), this.setDpr(), this.resetWidthAndHeight(), this.zoomCanvas();
  }
  /**
   * Initialize method
   */
  initLucky() {
    if (this.resize(), !this.boxWidth || !this.boxHeight)
      return console.error("Unable to get width or height");
  }
  /**
   * Mouse click event
   * @param e Event parameters
   */
  handleClick(t) {
  }
  /**
   * Root tag font size
   */
  setHTMLFontSize() {
    window && (this.htmlFontSize = +window.getComputedStyle(document.documentElement).fontSize.slice(0, -2));
  }
  // Clear canvas
  clearCanvas() {
    const [t, e] = [this.boxWidth, this.boxHeight];
    this.ctx.clearRect(-t, -e, t * 2, e * 2);
  }
  /**
   * Device pixel ratio
   * Automatically obtained in window environment, manually passed in other environments
   */
  setDpr() {
    const { config: t } = this;
    t.dpr || (window ? window.dpr = t.dpr = window.devicePixelRatio || 1 : t.dpr || console.error(t, "No dpr provided may cause rendering issues"));
  }
  /**
   * Reset box and canvas width/height
   */
  resetWidthAndHeight() {
    const { config: t, data: e } = this;
    let i = 0, s = 0;
    t.divElement && (i = t.divElement.offsetWidth, s = t.divElement.offsetHeight), this.boxWidth = this.getLength(e.width || t.width) || i, this.boxHeight = this.getLength(e.height || t.height) || s, t.divElement && (t.divElement.style.overflow = "hidden", t.divElement.style.width = this.boxWidth + "px", t.divElement.style.height = this.boxHeight + "px");
  }
  /**
   * Scale canvas according to dpr and handle displacement
   */
  zoomCanvas() {
    const { config: t, ctx: e } = this, { canvasElement: i, dpr: s } = t, [h, r] = [this.boxWidth * s, this.boxHeight * s];
    i && (i.width = h, i.height = r, i.style.width = `${h}px`, i.style.height = `${r}px`, i.style["transform-origin"] = "left top", i.style.transform = `scale(${1 / s})`, e.scale(s, s));
  }
  /**
   * Get some methods from window object
   */
  initWindowFunction() {
    const { config: t } = this;
    if (window) {
      this.rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) {
        window.setTimeout(e, 1e3 / 60);
      }, t.setTimeout = window.setTimeout, t.setInterval = window.setInterval, t.clearTimeout = window.clearTimeout, t.clearInterval = window.clearInterval;
      return;
    }
    if (t.rAF)
      this.rAF = t.rAF;
    else if (t.setTimeout) {
      const e = t.setTimeout;
      this.rAF = (i) => e(i, 16.7);
    } else
      this.rAF = (e) => setTimeout(e, 16.7);
  }
  isWeb() {
    return ["WEB", "UNI-H5", "TARO-H5"].includes(this.config.flag);
  }
  /**
   * Asynchronously load image and return image geometric information
   * @param src Image path
   * @param info Image information
   */
  loadImg(t, e, i = "$resolve") {
    return new Promise((s, h) => {
      if (t || h(`=> '${e.src}' cannot be empty or invalid`), this.config.flag === "WEB") {
        let r = new Image();
        r.crossorigin = "anonymous", r.onload = () => s(r), r.onerror = () => h(`=> '${e.src}' image load failed`), r.src = t;
      } else {
        e[i] = s, e.$reject = h;
        return;
      }
    });
  }
  /**
   * Common method for drawing images
   * @param imgObj Image object
   * @param rectInfo: [x-axis position, y-axis position, render width, render height] 
   */
  drawImage(t, e, ...i) {
    let s;
    const { flag: h, dpr: r } = this.config;
    if (["WEB", "MP-WX"].includes(h))
      s = e;
    else if (["UNI-H5", "UNI-MP", "TARO-H5", "TARO-MP"].includes(h))
      s = e.path;
    else
      return console.error("Unexpected flag, platform not yet compatible!");
    const n = (s.canvas || s).getContext?.("2d");
    if (n && !this.isWeb()) {
      i = i.map((l) => l * r);
      const o = n.getImageData(...i.slice(0, 4));
      t.putImageData(o, ...i.slice(4, 6));
    } else {
      i.length === 8 && (i = i.map((o, l) => l < 4 ? o * r : o));
      try {
        t.drawImage(s, ...i);
      } catch {
      }
    }
  }
  /**
   * Calculate image render width and height
   * @param imgObj Image tag element
   * @param imgInfo Image information
   * @param maxWidth Maximum width
   * @param maxHeight Maximum height
   * @return [render width, render height]
   */
  computedWidthAndHeight(t, e, i, s) {
    if (!e.width && !e.height)
      return [t.width, t.height];
    if (e.width && !e.height) {
      let h = this.getLength(e.width, i);
      return [h, t.height * (h / t.width)];
    } else if (!e.width && e.height) {
      let h = this.getLength(e.height, s);
      return [t.width * (h / t.height), h];
    }
    return [
      this.getLength(e.width, i),
      this.getLength(e.height, s)
    ];
  }
  /**
   * Convert units
   * @param { string } value Value to convert
   * @param { number } denominator Denominator
   * @return { number } Return new string
   */
  changeUnits(t, e = 1) {
    const { config: i } = this;
    return Number(t.replace(/^([-]*[0-9.]*)([a-z%]*)$/, (s, h, r) => {
      const n = {
        "%": (l) => l * (e / 100),
        px: (l) => l * 1,
        rem: (l) => l * this.htmlFontSize,
        vw: (l) => l / 100 * window.innerWidth
      }[r];
      if (n) return n(h);
      const o = i.handleCssUnit || i.unitFunc;
      return o ? o(h, r) : h;
    }));
  }
  /**
   * Get length
   * @param length Length to convert
   * @param maxLength Maximum length
   * @return Length
   */
  getLength(t, e) {
    return P(t, "number") ? t : P(t, "string") ? this.changeUnits(t, e) : 0;
  }
  /**
   * Get relative (centered) X coordinate
   * @param width
   * @param col
   */
  getOffsetX(t, e = 0) {
    return (e - t) / 2;
  }
  getOffscreenCanvas(t, e) {
    if (!_(this, "_offscreenCanvas") && (window && window.document && this.config.flag === "WEB" ? this._offscreenCanvas = document.createElement("canvas") : this._offscreenCanvas = this.config.offscreenCanvas, !this._offscreenCanvas))
      return console.error("Offscreen Canvas cannot render!");
    const i = this.config.dpr, s = this._offscreenCanvas;
    s.width = (t || 300) * i, s.height = (e || 150) * i;
    const h = s.getContext("2d");
    return h.clearRect(0, 0, t, e), h.scale(i, i), h.dpr = i, { _offscreenCanvas: s, _ctx: h };
  }
  /**
   * Add a new reactive data (temporary)
   * @param data Data
   * @param key Property
   * @param value New value
   */
  $set(t, e, i) {
    !t || typeof t != "object" || rt(t, e, i);
  }
  /**
   * Add a computed property (temporary)
   * @param data Source data
   * @param key Property name
   * @param callback Callback function
   */
  $computed(t, e, i) {
    Object.defineProperty(t, e, {
      get: () => i.call(this)
    });
  }
  /**
   * Add an observer create user watcher
   * @param expr Expression
   * @param handler Callback function
   * @param watchOpt Configuration parameters
   * @return Function to uninstall current observer (not yet returned)
   */
  $watch(t, e, i = {}) {
    typeof e == "object" && (i = e, e = i.handler);
    const s = new yt(this, t, e, i);
    return i.immediate && e.call(this, s.value), function() {
    };
  }
}
const T = (a) => Math.PI / 180 * a, Ct = (a, t) => [+(Math.cos(a) * t).toFixed(8), +(Math.sin(a) * t).toFixed(8)], zt = (a, t, e, i, s, h) => {
  a.beginPath();
  let r = T(90 / Math.PI / e * h), n = i + r, o = s - r;
  a.arc(0, 0, e, n, o, !1), a.lineTo(
    ...Ct(
      (i + s) / 2,
      h / 2 / Math.abs(Math.sin((i - s) / 2))
    )
  ), a.closePath();
}, R = (a, ...[t, e, i, s, h]) => {
  const r = Math.min(i, s), n = Math.PI;
  h > r / 2 && (h = r / 2), a.beginPath(), a.moveTo(t + h, e), a.lineTo(t + h, e), a.lineTo(t + i - h, e), a.arc(t + i - h, e + h, h, -n / 2, 0), a.lineTo(t + i, e + s - h), a.arc(t + i - h, e + s - h, h, 0, n / 2), a.lineTo(t + h, e + s), a.arc(t + h, e + s - h, h, n / 2, n), a.lineTo(t, e + h), a.arc(t + h, e + h, h, n, -n / 2), a.closePath();
}, vt = (a, t, e, i, s, h) => {
  const r = /linear-gradient\((.+)\)/.exec(h)[1].split(",").map((c) => c.trim());
  let n = r.shift(), o = [0, 0, 0, 0];
  if (n.includes("deg")) {
    n = n.slice(0, -3) % 360;
    const c = (d) => Math.tan(d / 180 * Math.PI);
    n >= 0 && n < 45 ? o = [t, e + s, t + i, e + s - i * c(n - 0)] : n >= 45 && n < 90 ? o = [t, e + s, t + i - s * c(n - 45), e] : n >= 90 && n < 135 ? o = [t + i, e + s, t + i - s * c(n - 90), e] : n >= 135 && n < 180 ? o = [t + i, e + s, t, e + i * c(n - 135)] : n >= 180 && n < 225 ? o = [t + i, e, t, e + i * c(n - 180)] : n >= 225 && n < 270 ? o = [t + i, e, t + s * c(n - 225), e + s] : n >= 270 && n < 315 ? o = [t, e, t + s * c(n - 270), e + s] : n >= 315 && n < 360 && (o = [t, e, t + i, e + s - i * c(n - 315)]);
  } else n.includes("top") ? o = [t, e + s, t, e] : n.includes("bottom") ? o = [t, e, t, e + s] : n.includes("left") ? o = [t + i, e, t, e] : n.includes("right") && (o = [t, e, t + i, e]);
  const l = a.createLinearGradient(...o.map((c) => c >> 0));
  return r.reduce((c, d, g) => {
    const p = d.split(" ");
    return p.length === 1 ? c.addColorStop(g, p[0]) : p.length === 2 && c.addColorStop(...p), c;
  }, l);
}, x = {
  easeIn: function(a, t, e, i) {
    return a >= i && (a = i), e * (a /= i) * a + t;
  },
  easeOut: function(a, t, e, i) {
    return a >= i && (a = i), -e * (a /= i) * (a - 2) + t;
  }
};
class $t extends K {
  /**
   * Lucky wheel constructor
   * @param config Configuration
   * @param data Lottery data
   */
  constructor(t, e) {
    super(t, {
      width: e.width,
      height: e.height
    }), this.blocks = [], this.prizes = [], this.buttons = [], this.defaultConfig = {}, this.defaultStyle = {}, this._defaultConfig = {}, this._defaultStyle = {}, this.Radius = 0, this.prizeRadius = 0, this.prizeDeg = 0, this.prizeAng = 0, this.rotateDeg = 0, this.maxBtnRadius = 0, this.startTime = 0, this.endTime = 0, this.stopDeg = 0, this.endDeg = 0, this.FPS = 16.6, this.step = 0, this.ImageCache = /* @__PURE__ */ new Map(), this.initData(e), this.initWatch(), this.initComputed(), t.beforeCreate?.call(this), this.init();
  }
  resize() {
    super.resize(), this.Radius = Math.min(this.boxWidth, this.boxHeight) / 2, this.ctx.translate(this.Radius, this.Radius), this.draw(), this.config.afterResize?.();
  }
  initLucky() {
    this.Radius = 0, this.prizeRadius = 0, this.prizeDeg = 0, this.prizeAng = 0, this.rotateDeg = 0, this.maxBtnRadius = 0, this.startTime = 0, this.endTime = 0, this.stopDeg = 0, this.endDeg = 0, this.FPS = 16.6, this.prizeFlag = -1, this.step = 0, super.initLucky();
  }
  /**
   * Initialize data
   * @param data
   */
  initData(t) {
    this.$set(this, "width", t.width), this.$set(this, "height", t.height), this.$set(this, "blocks", t.blocks || []), this.$set(this, "prizes", t.prizes || []), this.$set(this, "buttons", t.buttons || []), this.$set(this, "defaultConfig", t.defaultConfig || {}), this.$set(this, "defaultStyle", t.defaultStyle || {}), this.$set(this, "startCallback", t.start), this.$set(this, "endCallback", t.end);
  }
  /**
   * Initialize computed properties
   */
  initComputed() {
    this.$computed(this, "_defaultConfig", () => ({
      gutter: "0px",
      offsetDegree: 0,
      speed: 20,
      speedFunction: "quad",
      accelerationTime: 2500,
      decelerationTime: 2500,
      stopRange: 0,
      ...this.defaultConfig
    })), this.$computed(this, "_defaultStyle", () => ({
      fontSize: "18px",
      fontColor: "#000",
      fontStyle: "sans-serif",
      fontWeight: "400",
      background: "rgba(0,0,0,0)",
      wordWrap: !0,
      lengthLimit: "90%",
      ...this.defaultStyle
    }));
  }
  /**
   * Initialize observers
   */
  initWatch() {
    this.$watch("width", (t) => {
      this.data.width = t, this.resize();
    }), this.$watch("height", (t) => {
      this.data.height = t, this.resize();
    }), this.$watch("blocks", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("prizes", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("buttons", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("defaultConfig", () => this.draw(), { deep: !0 }), this.$watch("defaultStyle", () => this.draw(), { deep: !0 }), this.$watch("startCallback", () => this.init()), this.$watch("endCallback", () => this.init());
  }
  /**
   * Initialize canvas lottery
   */
  async init() {
    this.initLucky();
    const { config: t } = this;
    t.beforeInit?.call(this), this.draw(), this.draw(), await this.initImageCache(), t.afterInit?.call(this);
  }
  initImageCache() {
    return new Promise((t) => {
      const e = {
        blocks: this.blocks.map((i) => i.imgs),
        prizes: this.prizes.map((i) => i.imgs),
        buttons: this.buttons.map((i) => i.imgs)
      };
      Object.keys(e).forEach((i) => {
        const s = e[i], h = [];
        s && s.forEach((r, n) => {
          r && r.forEach((o, l) => {
            h.push(this.loadAndCacheImg(i, n, l));
          });
        }), Promise.all(h).then(() => {
          this.draw(), t();
        });
      });
    });
  }
  /**
   * Canvas click event
   * @param e Event parameters
   */
  handleClick(t) {
    const { ctx: e } = this;
    e.beginPath(), e.arc(0, 0, this.maxBtnRadius, 0, Math.PI * 2, !1), e.isPointInPath(t.offsetX, t.offsetY) && this.step === 0 && this.startCallback?.(t);
  }
  /**
   * Load and cache specified image by index
   * @param cellName Module name
   * @param cellIndex Module index
   * @param imgName Module image cache
   * @param imgIndex Image index
   */
  async loadAndCacheImg(t, e, i) {
    return new Promise((s, h) => {
      const r = this[t][e];
      if (!r || !r.imgs) return;
      const n = r.imgs[i];
      n && this.loadImg(n.src, n).then(async (o) => {
        typeof n.formatter == "function" && (o = await Promise.resolve(n.formatter.call(this, o))), this.ImageCache.set(n.src, o), s();
      }).catch((o) => {
        console.error(`${t}[${e}].imgs[${i}] ${o}`), h();
      });
    });
  }
  drawBlock(t, e, i) {
    const { ctx: s } = this;
    O(e.background) && (s.beginPath(), s.fillStyle = e.background, s.arc(0, 0, t, 0, Math.PI * 2, !1), s.fill()), e.imgs && e.imgs.forEach((h, r) => {
      const n = this.ImageCache.get(h.src);
      if (!n) return;
      const [o, l] = this.computedWidthAndHeight(n, h, t * 2, t * 2), [c, d] = [this.getOffsetX(o) + this.getLength(h.left, t * 2), this.getLength(h.top, t * 2) - t];
      s.save(), h.rotate && s.rotate(T(this.rotateDeg)), this.drawImage(s, n, c, d, o, l), s.restore();
    });
  }
  /**
   * Start drawing
   */
  draw() {
    const { config: t, ctx: e, _defaultConfig: i, _defaultStyle: s } = this;
    t.beforeDraw?.call(this, e), e.clearRect(-this.Radius, -this.Radius, this.Radius * 2, this.Radius * 2), this.prizeRadius = this.blocks.reduce((l, c, d) => (this.drawBlock(l, c, d), l - this.getLength(c.padding && c.padding.split(" ")[0])), this.Radius), this.prizeDeg = 360 / this.prizes.length, this.prizeAng = T(this.prizeDeg);
    const h = this.prizeRadius * Math.sin(this.prizeAng / 2) * 2;
    let r = T(this.rotateDeg - 90 + this.prizeDeg / 2 + i.offsetDegree);
    const n = (l, c) => this.getOffsetX(e.measureText(c).width) + this.getLength(l.left, h), o = (l, c, d) => {
      const g = l.lineHeight || s.lineHeight || l.fontSize || s.fontSize;
      return this.getLength(l.top, c) + (d + 1) * this.getLength(g);
    };
    e.save(), this.prizes.forEach((l, c) => {
      let d = r + c * this.prizeAng, g = this.prizeRadius - this.maxBtnRadius;
      const p = l.background || s.background;
      O(p) && (e.fillStyle = p, zt(
        e,
        this.maxBtnRadius,
        this.prizeRadius,
        d - this.prizeAng / 2,
        d + this.prizeAng / 2,
        this.getLength(i.gutter)
      ), e.fill());
      let f = Math.cos(d) * this.prizeRadius, w = Math.sin(d) * this.prizeRadius;
      e.translate(f, w), e.rotate(d + T(90)), l.imgs && l.imgs.forEach((u, b) => {
        const m = this.ImageCache.get(u.src);
        if (!m) return;
        const [S, y] = this.computedWidthAndHeight(
          m,
          u,
          this.prizeAng * this.prizeRadius,
          g
        ), [z, v] = [
          this.getOffsetX(S) + this.getLength(u.left, h),
          this.getLength(u.top, g)
        ];
        this.drawImage(e, m, z, v, S, y);
      }), l.fonts && l.fonts.forEach((u) => {
        const b = u.fontColor || s.fontColor, m = u.fontWeight || s.fontWeight, S = this.getLength(u.fontSize || s.fontSize), y = u.fontStyle || s.fontStyle, z = _(u, "wordWrap") ? u.wordWrap : s.wordWrap, v = u.lengthLimit || s.lengthLimit, A = u.lineClamp || s.lineClamp, W = u.rotate || 0;
        e.fillStyle = b, e.font = `${m} ${S >> 0}px ${y}`;
        let L = [], $ = String(u.text);
        z ? L = J(e, Z($), (k) => {
          let I = (this.prizeRadius - o(u, g, k.length)) * Math.tan(this.prizeAng / 2) * 2 - this.getLength(i.gutter);
          return this.getLength(v, I);
        }, A) : L = $.split(`
`), L.filter((k) => !!k).forEach((k, F) => {
          const H = n(u, k), I = o(u, g, F);
          e.save(), e.translate(H, I), e.rotate(T(W)), e.fillText(k, 0, 0), e.restore();
        });
      }), e.rotate(T(360) - d - T(90)), e.translate(-f, -w);
    }), e.restore(), this.buttons.forEach((l, c) => {
      let d = this.getLength(l.radius, this.prizeRadius);
      this.maxBtnRadius = Math.max(this.maxBtnRadius, d), O(l.background) && (e.beginPath(), e.fillStyle = l.background, e.arc(0, 0, d, 0, Math.PI * 2, !1), e.fill()), l.pointer && O(l.background) && (e.beginPath(), e.fillStyle = l.background, e.moveTo(-d, 0), e.lineTo(d, 0), e.lineTo(0, -d * 2), e.closePath(), e.fill()), l.imgs && l.imgs.forEach((g, p) => {
        const f = this.ImageCache.get(g.src);
        if (!f) return;
        const [w, u] = this.computedWidthAndHeight(f, g, d * 2, d * 2), [b, m] = [this.getOffsetX(w) + this.getLength(g.left, d), this.getLength(g.top, d)];
        this.drawImage(e, f, b, m, w, u);
      }), l.fonts && l.fonts.forEach((g) => {
        let p = g.fontColor || s.fontColor, f = g.fontWeight || s.fontWeight, w = this.getLength(g.fontSize || s.fontSize), u = g.fontStyle || s.fontStyle;
        e.fillStyle = p, e.font = `${f} ${w >> 0}px ${u}`, String(g.text).split(`
`).forEach((b, m) => {
          e.fillText(b, n(g, b), o(g, d, m));
        });
      });
    }), t.afterDraw?.call(this, e);
  }
  /**
   * Carve on gunwale of moving boat
   */
  carveOnGunwaleOfAMovingBoat() {
    const { _defaultConfig: t, prizeFlag: e, prizeDeg: i, rotateDeg: s } = this;
    this.endTime = Date.now();
    const h = this.stopDeg = s, r = t.speed, n = (Math.random() * i - i / 2) * this.getLength(t.stopRange);
    let o = 0, l = 0, c = 0;
    for (; ++o; ) {
      const d = 360 * o - e * i - s - t.offsetDegree + n - i / 2;
      let g = x.easeOut(this.FPS, h, d, t.decelerationTime) - h;
      if (g > r) {
        this.endDeg = r - l > g - r ? d : c;
        break;
      }
      c = d, l = g;
    }
  }
  /**
   * Exposed: Start lottery method
   */
  play() {
    this.step === 0 && (this.startTime = Date.now(), this.prizeFlag = void 0, this.step = 1, this.config.afterStart?.(), this.run());
  }
  /**
   * Exposed: Slow stop method
   * @param index Prize index
   */
  stop(t) {
    if (!(this.step === 0 || this.step === 3)) {
      if (!t && t !== 0) {
        const e = this.prizes.map((i) => i.range);
        t = ht(e);
      }
      t < 0 ? (this.step = 0, this.prizeFlag = -1) : (this.step = 2, this.prizeFlag = t % this.prizes.length);
    }
  }
  /**
   * Actually start execution method
   * @param num Record how many times frame animation executed
   */
  run(t = 0) {
    const { rAF: e, step: i, prizeFlag: s, _defaultConfig: h } = this, { accelerationTime: r, decelerationTime: n, speed: o } = h;
    if (i === 0) {
      this.endCallback?.(this.prizes.find((g, p) => p === s) || {});
      return;
    }
    if (s === -1) return;
    i === 3 && !this.endDeg && this.carveOnGunwaleOfAMovingBoat();
    const l = Date.now() - this.startTime, c = Date.now() - this.endTime;
    let d = this.rotateDeg;
    if (i === 1 || l < r) {
      this.FPS = l / t;
      const g = x.easeIn(l, 0, o, r);
      g === o && (this.step = 2), d = d + g % 360;
    } else i === 2 ? (d = d + o % 360, s !== void 0 && s >= 0 && (this.step = 3, this.stopDeg = 0, this.endDeg = 0)) : i === 3 ? (d = x.easeOut(c, this.stopDeg, this.endDeg, n), c >= n && (this.step = 0)) : this.stop(-1);
    this.rotateDeg = d, this.draw(), e(this.run.bind(this, t + 1));
  }
  /**
   * Convert render coordinates
   * @param x
   * @param y
   */
  conversionAxis(t, e) {
    const { config: i } = this;
    return [t / i.dpr - this.Radius, e / i.dpr - this.Radius];
  }
}
class At extends K {
  /**
   * Grid lottery constructor
   * @param config Configuration
   * @param data Lottery data
   */
  constructor(t, e) {
    super(t, {
      width: e.width,
      height: e.height
    }), this.rows = 3, this.cols = 3, this.blocks = [], this.prizes = [], this.buttons = [], this.defaultConfig = {}, this.defaultStyle = {}, this.activeStyle = {}, this._defaultConfig = {}, this._defaultStyle = {}, this._activeStyle = {}, this.cellWidth = 0, this.cellHeight = 0, this.startTime = 0, this.endTime = 0, this.currIndex = 0, this.stopIndex = 0, this.endIndex = 0, this.demo = !1, this.timer = 0, this.FPS = 16.6, this.step = 0, this.prizeFlag = -1, this.cells = [], this.ImageCache = /* @__PURE__ */ new Map(), this.initData(e), this.initWatch(), this.initComputed(), t.beforeCreate?.call(this), this.init();
  }
  resize() {
    super.resize(), this.draw(), this.config.afterResize?.();
  }
  initLucky() {
    this.cellWidth = 0, this.cellHeight = 0, this.startTime = 0, this.endTime = 0, this.currIndex = 0, this.stopIndex = 0, this.endIndex = 0, this.demo = !1, this.timer = 0, this.FPS = 16.6, this.prizeFlag = -1, this.step = 0, super.initLucky();
  }
  /**
   * Initialize data
   * @param data
   */
  initData(t) {
    this.$set(this, "width", t.width), this.$set(this, "height", t.height), this.$set(this, "rows", Number(t.rows) || 3), this.$set(this, "cols", Number(t.cols) || 3), this.$set(this, "blocks", t.blocks || []), this.$set(this, "prizes", t.prizes || []), this.$set(this, "buttons", t.buttons || []), this.$set(this, "button", t.button), this.$set(this, "defaultConfig", t.defaultConfig || {}), this.$set(this, "defaultStyle", t.defaultStyle || {}), this.$set(this, "activeStyle", t.activeStyle || {}), this.$set(this, "startCallback", t.start), this.$set(this, "endCallback", t.end);
  }
  /**
   * Initialize computed properties
   */
  initComputed() {
    this.$computed(this, "_defaultConfig", () => {
      const t = {
        gutter: 5,
        speed: 20,
        accelerationTime: 2500,
        decelerationTime: 2500,
        ...this.defaultConfig
      };
      return t.gutter = this.getLength(t.gutter), t.speed = t.speed / 40, t;
    }), this.$computed(this, "_defaultStyle", () => ({
      borderRadius: 20,
      fontColor: "#000",
      fontSize: "18px",
      fontStyle: "sans-serif",
      fontWeight: "400",
      background: "rgba(0,0,0,0)",
      shadow: "",
      wordWrap: !0,
      lengthLimit: "90%",
      ...this.defaultStyle
    })), this.$computed(this, "_activeStyle", () => ({
      background: "#ffce98",
      shadow: "",
      ...this.activeStyle
    }));
  }
  /**
   * Initialize observers
   */
  initWatch() {
    this.$watch("width", (t) => {
      this.data.width = t, this.resize();
    }), this.$watch("height", (t) => {
      this.data.height = t, this.resize();
    }), this.$watch("blocks", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("prizes", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("buttons", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("rows", () => this.init()), this.$watch("cols", () => this.init()), this.$watch("defaultConfig", () => this.draw(), { deep: !0 }), this.$watch("defaultStyle", () => this.draw(), { deep: !0 }), this.$watch("activeStyle", () => this.draw(), { deep: !0 }), this.$watch("startCallback", () => this.init()), this.$watch("endCallback", () => this.init());
  }
  /**
   * Initialize canvas lottery
   */
  async init() {
    this.initLucky();
    const { config: t } = this;
    t.beforeInit?.call(this), this.draw(), await this.initImageCache(), t.afterInit?.call(this);
  }
  initImageCache() {
    return new Promise((t) => {
      const e = this.buttons.map((s) => s.imgs);
      this.button && e.push(this.button.imgs);
      const i = {
        blocks: this.blocks.map((s) => s.imgs),
        prizes: this.prizes.map((s) => s.imgs),
        buttons: e
      };
      Object.keys(i).forEach((s) => {
        const h = i[s], r = [];
        h && h.forEach((n, o) => {
          n && n.forEach((l, c) => {
            r.push(this.loadAndCacheImg(s, o, c));
          });
        }), Promise.all(r).then(() => {
          this.draw(), t();
        });
      });
    });
  }
  /**
   * Canvas click event
   * @param e Event parameters
   */
  handleClick(t) {
    const { ctx: e } = this;
    [
      ...this.buttons,
      this.button
    ].forEach((i) => {
      if (!i) return;
      const [s, h, r, n] = this.getGeometricProperty([
        i.x,
        i.y,
        i.col || 1,
        i.row || 1
      ]);
      e.beginPath(), e.rect(s, h, r, n), e.isPointInPath(t.offsetX, t.offsetY) && this.step === 0 && (typeof i.callback == "function" && i.callback.call(this, i), this.startCallback?.(t, i));
    });
  }
  /**
   * Load and cache specified image by index
   * @param cellName Module name
   * @param cellIndex Module index
   * @param imgName Module image cache
   * @param imgIndex Image index
   */
  async loadAndCacheImg(t, e, i) {
    return new Promise((s, h) => {
      let r = this[t][e];
      if (t === "buttons" && !this.buttons.length && this.button && (r = this.button), !r || !r.imgs) return;
      const n = r.imgs[i];
      if (!n) return;
      const o = [
        this.loadImg(n.src, n),
        n.activeSrc && this.loadImg(n.activeSrc, n, "$activeResolve")
      ];
      Promise.all(o).then(async ([l, c]) => {
        const d = n.formatter;
        typeof d == "function" && (l = await Promise.resolve(d.call(this, l)), c && (c = await Promise.resolve(d.call(this, c)))), this.ImageCache.set(n.src, l), c && this.ImageCache.set(n.activeSrc, c), s();
      }).catch((l) => {
        console.error(`${t}[${e}].imgs[${i}] ${l}`), h();
      });
    });
  }
  /**
   * Draw grid lottery
   */
  draw() {
    const { config: t, ctx: e, _defaultConfig: i, _defaultStyle: s, _activeStyle: h } = this;
    t.beforeDraw?.call(this, e), e.clearRect(0, 0, this.boxWidth, this.boxHeight), this.cells = [
      ...this.prizes,
      ...this.buttons
    ], this.button && this.cells.push(this.button), this.cells.forEach((r) => {
      r.col = r.col || 1, r.row = r.row || 1;
    }), this.prizeArea = this.blocks.reduce(({ x: r, y: n, w: o, h: l }, c, d) => {
      const [g, p, f, w] = st(c, this.getLength.bind(this)), u = c.borderRadius ? this.getLength(c.borderRadius) : 0, b = c.background;
      return O(b) && (e.fillStyle = this.handleBackground(r, n, o, l, b), R(e, r, n, o, l, u), e.fill()), c.imgs && c.imgs.forEach((m, S) => {
        const y = this.ImageCache.get(m.src);
        if (!y) return;
        const [z, v] = this.computedWidthAndHeight(y, m, o, l), [A, W] = [
          this.getOffsetX(z, o) + this.getLength(m.left, o),
          this.getLength(m.top, l)
        ];
        this.drawImage(e, y, r + A, n + W, z, v);
      }), {
        x: r + f,
        y: n + g,
        w: o - f - w,
        h: l - g - p
      };
    }, { x: 0, y: 0, w: this.boxWidth, h: this.boxHeight }), this.cellWidth = (this.prizeArea.w - i.gutter * (this.cols - 1)) / this.cols, this.cellHeight = (this.prizeArea.h - i.gutter * (this.rows - 1)) / this.rows, this.cells.forEach((r, n) => {
      let [o, l, c, d] = this.getGeometricProperty([r.x, r.y, r.col, r.row]), g = !1;
      (this.prizeFlag === void 0 || this.prizeFlag > -1) && (g = n === this.currIndex % this.prizes.length >> 0);
      const p = g ? h.background : r.background || s.background;
      if (O(p)) {
        const f = (g ? h.shadow : r.shadow || s.shadow).replace(/px/g, "").split(",")[0].split(" ").map((u, b) => b < 3 ? Number(u) : u);
        f.length === 4 && (e.shadowColor = f[3], e.shadowOffsetX = f[0] * t.dpr, e.shadowOffsetY = f[1] * t.dpr, e.shadowBlur = f[2], f[0] > 0 ? c -= f[0] : (c += f[0], o -= f[0]), f[1] > 0 ? d -= f[1] : (d += f[1], l -= f[1])), e.fillStyle = this.handleBackground(o, l, c, d, p);
        const w = this.getLength(r.borderRadius ? r.borderRadius : s.borderRadius);
        R(e, o, l, c, d, w), e.fill(), e.shadowColor = "rgba(0, 0, 0, 0)", e.shadowOffsetX = 0, e.shadowOffsetY = 0, e.shadowBlur = 0;
      }
      n >= this.prizes.length && (n -= this.prizes.length), r.imgs && r.imgs.forEach((f, w) => {
        const u = this.ImageCache.get(f.src), b = this.ImageCache.get(f.activeSrc);
        if (!u) return;
        const m = g && b || u;
        if (!m) return;
        const [S, y] = this.computedWidthAndHeight(m, f, c, d), [z, v] = [
          o + this.getOffsetX(S, c) + this.getLength(f.left, c),
          l + this.getLength(f.top, d)
        ];
        this.drawImage(e, m, z, v, S, y);
      }), r.fonts && r.fonts.forEach((f) => {
        const w = g && h.fontStyle ? h.fontStyle : f.fontStyle || s.fontStyle, u = g && h.fontWeight ? h.fontWeight : f.fontWeight || s.fontWeight, b = g && h.fontSize ? this.getLength(h.fontSize) : this.getLength(f.fontSize || s.fontSize), m = g && h.lineHeight ? h.lineHeight : f.lineHeight || s.lineHeight || f.fontSize || s.fontSize, S = _(f, "wordWrap") ? f.wordWrap : s.wordWrap, y = f.lengthLimit || s.lengthLimit, z = f.lineClamp || s.lineClamp;
        e.font = `${u} ${b >> 0}px ${w}`, e.fillStyle = g && h.fontColor ? h.fontColor : f.fontColor || s.fontColor;
        let v = [], A = String(f.text);
        if (S) {
          let W = this.getLength(y, c);
          v = J(e, Z(A), () => W, z);
        } else
          v = A.split(`
`);
        v.forEach((W, L) => {
          e.fillText(
            W,
            o + this.getOffsetX(e.measureText(W).width, c) + this.getLength(f.left, c),
            l + this.getLength(f.top, d) + (L + 1) * this.getLength(m)
          );
        });
      });
    }), t.afterDraw?.call(this, e);
  }
  /**
   * Handle background color
   * @param x
   * @param y
   * @param width
   * @param height
   * @param background
   * @param isActive
   */
  handleBackground(t, e, i, s, h) {
    const { ctx: r } = this;
    return h.includes("linear-gradient") && (h = vt(r, t, e, i, s, h)), h;
  }
  /**
   * Carve on gunwale of moving boat
   */
  carveOnGunwaleOfAMovingBoat() {
    const { _defaultConfig: t, prizeFlag: e, currIndex: i } = this;
    this.endTime = Date.now();
    const s = this.stopIndex = i, h = t.speed;
    let r = 0, n = 0, o = 0;
    for (; ++r; ) {
      const l = this.prizes.length * r + e - s, c = x.easeOut(this.FPS, s, l, t.decelerationTime) - s;
      if (c > h) {
        this.endIndex = h - n > c - h ? l : o;
        break;
      }
      o = l, n = c;
    }
  }
  /**
   * Exposed: Start lottery method
   */
  play() {
    this.step === 0 && (this.startTime = Date.now(), this.prizeFlag = void 0, this.step = 1, this.config.afterStart?.(), this.run());
  }
  /**
   * Exposed: Slow stop method
   * @param index Prize index
   */
  stop(t) {
    if (!(this.step === 0 || this.step === 3)) {
      if (!t && t !== 0) {
        const e = this.prizes.map((i) => i.range);
        t = ht(e);
      }
      t < 0 ? (this.step = 0, this.prizeFlag = -1) : (this.step = 2, this.prizeFlag = t % this.prizes.length);
    }
  }
  /**
   * Actually start execution method
   * @param num Record how many times frame animation executed
   */
  run(t = 0) {
    const { rAF: e, step: i, prizes: s, prizeFlag: h, _defaultConfig: r } = this, { accelerationTime: n, decelerationTime: o, speed: l } = r;
    if (i === 0) {
      this.endCallback?.(this.prizes.find((p, f) => f === h) || {});
      return;
    }
    if (h === -1) return;
    i === 3 && !this.endIndex && this.carveOnGunwaleOfAMovingBoat();
    const c = Date.now() - this.startTime, d = Date.now() - this.endTime;
    let g = this.currIndex;
    if (i === 1 || c < n) {
      this.FPS = c / t;
      const p = x.easeIn(c, 0.1, l - 0.1, n);
      p === l && (this.step = 2), g = g + p % s.length;
    } else i === 2 ? (g = g + l % s.length, h !== void 0 && h >= 0 && (this.step = 3, this.stopIndex = 0, this.endIndex = 0)) : i === 3 ? (g = x.easeOut(d, this.stopIndex, this.endIndex, o), d >= o && (this.step = 0)) : this.stop(-1);
    this.currIndex = g, this.draw(), e(this.run.bind(this, t + 1));
  }
  /**
   * Calculate prize cell geometric properties
   * @param { array } [...matrix coordinates, col, row]
   * @return { array } [...real coordinates, width, height]
   */
  getGeometricProperty([t, e, i = 1, s = 1]) {
    const { cellWidth: h, cellHeight: r } = this, n = this._defaultConfig.gutter;
    let o = [
      this.prizeArea.x + (h + n) * t,
      this.prizeArea.y + (r + n) * e
    ];
    return i && s && o.push(
      h * i + n * (i - 1),
      r * s + n * (s - 1)
    ), o;
  }
  /**
   * Convert render coordinates
   * @param x
   * @param y
   */
  conversionAxis(t, e) {
    const { config: i } = this;
    return [t / i.dpr, e / i.dpr];
  }
}
class Wt extends K {
  /**
   * Slot machine constructor
   * @param config Configuration
   * @param data Lottery data
   */
  constructor(t, e) {
    super(t, {
      width: e.width,
      height: e.height
    }), this.blocks = [], this.prizes = [], this.slots = [], this.defaultConfig = {}, this._defaultConfig = {}, this.defaultStyle = {}, this._defaultStyle = {}, this.endCallback = () => {
    }, this.cellWidth = 0, this.cellHeight = 0, this.cellAndSpacing = 0, this.widthAndSpacing = 0, this.heightAndSpacing = 0, this.FPS = 16.6, this.scroll = [], this.stopScroll = [], this.endScroll = [], this.startTime = 0, this.endTime = 0, this.defaultOrder = [], this.step = 0, this.prizeFlag = void 0, this.ImageCache = /* @__PURE__ */ new Map(), this.initData(e), this.initWatch(), this.initComputed(), t.beforeCreate?.call(this), this.init();
  }
  resize() {
    super.resize(), this.draw(), this.config.afterResize?.();
  }
  initLucky() {
    this.cellWidth = 0, this.cellHeight = 0, this.cellAndSpacing = 0, this.widthAndSpacing = 0, this.heightAndSpacing = 0, this.FPS = 16.6, this.scroll = [], this.stopScroll = [], this.endScroll = [], this.startTime = 0, this.endTime = 0, this.prizeFlag = void 0, this.step = 0, super.initLucky();
  }
  /**
   * Initialize data
   * @param data
   */
  initData(t) {
    this.$set(this, "width", t.width), this.$set(this, "height", t.height), this.$set(this, "blocks", t.blocks || []), this.$set(this, "prizes", t.prizes || []), this.$set(this, "slots", t.slots || []), this.$set(this, "defaultConfig", t.defaultConfig || {}), this.$set(this, "defaultStyle", t.defaultStyle || {}), this.$set(this, "endCallback", t.end);
  }
  /**
   * Initialize computed properties
   */
  initComputed() {
    this.$computed(this, "_defaultConfig", () => {
      const t = {
        mode: "vertical",
        rowSpacing: 0,
        colSpacing: 5,
        speed: 20,
        direction: 1,
        accelerationTime: 2500,
        decelerationTime: 2500,
        ...this.defaultConfig
      };
      return t.rowSpacing = this.getLength(t.rowSpacing), t.colSpacing = this.getLength(t.colSpacing), t;
    }), this.$computed(this, "_defaultStyle", () => ({
      borderRadius: 0,
      fontColor: "#000",
      fontSize: "18px",
      fontStyle: "sans-serif",
      fontWeight: "400",
      background: "rgba(0,0,0,0)",
      wordWrap: !0,
      lengthLimit: "90%",
      ...this.defaultStyle
    }));
  }
  /**
   * Initialize observers
   */
  initWatch() {
    this.$watch("width", (t) => {
      this.data.width = t, this.resize();
    }), this.$watch("height", (t) => {
      this.data.height = t, this.resize();
    }), this.$watch("blocks", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("prizes", (t) => {
      this.initImageCache();
    }, { deep: !0 }), this.$watch("slots", (t) => {
      this.drawOffscreenCanvas(), this.draw();
    }, { deep: !0 }), this.$watch("defaultConfig", () => this.draw(), { deep: !0 }), this.$watch("defaultStyle", () => this.draw(), { deep: !0 }), this.$watch("endCallback", () => this.init());
  }
  /**
   * Initialize canvas lottery
   */
  async init() {
    this.initLucky();
    const { config: t } = this;
    t.beforeInit?.call(this), this.drawOffscreenCanvas(), this.draw(), await this.initImageCache(), t.afterInit?.call(this);
  }
  initImageCache() {
    return new Promise((t) => {
      const e = {
        blocks: this.blocks.map((i) => i.imgs),
        prizes: this.prizes.map((i) => i.imgs)
      };
      Object.keys(e).forEach((i) => {
        const s = e[i], h = [];
        s && s.forEach((r, n) => {
          r && r.forEach((o, l) => {
            h.push(this.loadAndCacheImg(i, n, l));
          });
        }), Promise.all(h).then(() => {
          this.drawOffscreenCanvas(), this.draw(), t();
        });
      });
    });
  }
  /**
   * Load and cache specified image by index
   * @param cellName Module name
   * @param cellIndex Module index
   * @param imgName Module image cache
   * @param imgIndex Image index
   */
  async loadAndCacheImg(t, e, i) {
    return new Promise((s, h) => {
      let r = this[t][e];
      if (!r || !r.imgs) return;
      const n = r.imgs[i];
      n && this.loadImg(n.src, n).then(async (o) => {
        typeof n.formatter == "function" && (o = await Promise.resolve(n.formatter.call(this, o))), this.ImageCache.set(n.src, o), s();
      }).catch((o) => {
        console.error(`${t}[${e}].imgs[${i}] ${o}`), h();
      });
    });
  }
  /**
   * Draw offscreen canvas
   */
  drawOffscreenCanvas() {
    const { _defaultConfig: t, _defaultStyle: e } = this, { w: i, h: s } = this.drawBlocks(), h = this.prizes.length, { cellWidth: r, cellHeight: n, widthAndSpacing: o, heightAndSpacing: l } = this.displacementWidthOrHeight();
    this.defaultOrder = new Array(h).fill(void 0).map((w, u) => u);
    let c = 0, d = 0;
    this.slots.forEach((w, u) => {
      this.scroll[u] === void 0 && (this.scroll[u] = 0);
      const m = (w.order || this.defaultOrder).length;
      c = Math.max(c, i + o * m), d = Math.max(d, s + l * m);
    });
    const g = this.getOffscreenCanvas(c, d);
    if (!g)
      throw new Error("Failed to create offscreen canvas");
    const { _offscreenCanvas: p, _ctx: f } = g;
    this._offscreenCanvas = p, this.slots.forEach((w, u) => {
      const b = r * u, m = n * u;
      let S = 0;
      const y = gt(this.prizes, w.order || this.defaultOrder);
      if (!y.length) return;
      y.forEach(($, k) => {
        if (!$) return;
        const F = o * k + t.colSpacing / 2, H = l * k + t.rowSpacing / 2, [I, j, ot] = this.displacement(
          [b, H, l],
          [F, m, o]
        );
        S += ot;
        const Q = $.background || e.background;
        if (O(Q)) {
          const C = this.getLength(_($, "borderRadius") ? $.borderRadius : e.borderRadius);
          R(f, I, j, r, r, C), f.fillStyle = Q, f.fill();
        }
        $.imgs && $.imgs.forEach((C, V) => {
          const D = this.ImageCache.get(C.src);
          if (!D) return;
          const [M, U] = this.computedWidthAndHeight(D, C, r, n), [N, G] = [
            I + this.getOffsetX(M, r) + this.getLength(C.left, r),
            j + this.getLength(C.top, n)
          ];
          this.drawImage(f, D, N, G, M, U);
        }), $.fonts && $.fonts.forEach((C) => {
          const V = C.fontStyle || e.fontStyle, D = C.fontWeight || e.fontWeight, M = this.getLength(C.fontSize || e.fontSize), U = C.lineHeight || e.lineHeight || C.fontSize || e.fontSize, N = _(C, "wordWrap") ? C.wordWrap : e.wordWrap, G = C.lengthLimit || e.lengthLimit, at = C.lineClamp || e.lineClamp;
          f.font = `${D} ${M >> 0}px ${V}`, f.fillStyle = C.fontColor || e.fontColor;
          let Y = [], tt = String(C.text);
          if (N) {
            let B = this.getLength(G, r);
            Y = J(f, Z(tt), () => B, at);
          } else
            Y = tt.split(`
`);
          Y.forEach((B, lt) => {
            f.fillText(
              B,
              I + this.getOffsetX(f.measureText(B).width, r) + this.getLength(C.left, r),
              j + this.getLength(C.top, n) + (lt + 1) * this.getLength(U)
            );
          });
        });
      });
      const [z, v, A, W] = this.displacement(
        [b, 0, r, S],
        [0, m, S, n]
      );
      let L = S;
      for (; L < d + S; ) {
        const [$, k] = this.displacement([z, L], [L, v]);
        this.drawImage(
          f,
          p,
          z,
          v,
          A,
          W,
          $,
          k,
          A,
          W
        ), L += S;
      }
    });
  }
  /**
   * Draw background area
   */
  drawBlocks() {
    const { config: t, ctx: e, _defaultConfig: i, _defaultStyle: s } = this;
    return this.prizeArea = this.blocks.reduce(({ x: h, y: r, w: n, h: o }, l, c) => {
      const [d, g, p, f] = st(l, this.getLength.bind(this)), w = l.borderRadius ? this.getLength(l.borderRadius) : 0, u = l.background || s.background;
      return O(u) && (R(e, h, r, n, o, w), e.fillStyle = u, e.fill()), l.imgs && l.imgs.forEach((b, m) => {
        const S = this.ImageCache.get(b.src);
        if (!S) return;
        const [y, z] = this.computedWidthAndHeight(S, b, n, o), [v, A] = [this.getOffsetX(y, n) + this.getLength(b.left, n), this.getLength(b.top, o)];
        this.drawImage(e, S, h + v, r + A, y, z);
      }), {
        x: h + p,
        y: r + d,
        w: n - p - f,
        h: o - d - g
      };
    }, { x: 0, y: 0, w: this.boxWidth, h: this.boxHeight });
  }
  /**
   * Draw slot machine lottery
   */
  draw() {
    const { config: t, ctx: e, _defaultConfig: i, _defaultStyle: s } = this;
    t.beforeDraw?.call(this, e), e.clearRect(0, 0, this.boxWidth, this.boxHeight);
    const { x: h, y: r, w: n, h: o } = this.drawBlocks();
    if (!this._offscreenCanvas) return;
    const { cellWidth: l, cellHeight: c, cellAndSpacing: d, widthAndSpacing: g, heightAndSpacing: p } = this;
    this.slots.forEach((f, w) => {
      const u = f.order || this.defaultOrder, b = d * u.length, m = this.displacement(-(o - p) / 2, -(n - g) / 2);
      let S = this.scroll[w] + m;
      S < 0 && (S = S % b + b), S > b && (S = S % b);
      const [y, z, v, A] = this.displacement(
        [l * w, S, l, o],
        [S, c * w, n, c]
      ), [W, L, $, k] = this.displacement(
        [h + g * w, r, l, o],
        [h, r + p * w, n, c]
      );
      this.drawImage(e, this._offscreenCanvas, y, z, v, A, W, L, $, k);
    });
  }
  /**
   * Carve on gunwale of moving boat
   */
  carveOnGunwaleOfAMovingBoat() {
    const { _defaultConfig: t, prizeFlag: e, cellAndSpacing: i } = this;
    this.endTime = Date.now(), this.slots.forEach((s, h) => {
      const r = s.order || this.defaultOrder;
      if (!r.length) return;
      const n = s.speed || t.speed, o = s.direction || t.direction, l = r.findIndex((p) => p === e[h]), c = i * r.length, d = this.stopScroll[h] = this.scroll[h];
      let g = 0;
      for (; ++g; ) {
        const p = i * l + c * g * o - d, f = x.easeOut(this.FPS, d, p, t.decelerationTime) - d;
        if (Math.abs(f) > n) {
          this.endScroll[h] = p;
          break;
        }
      }
    });
  }
  /**
   * Exposed: Start lottery method
   */
  play() {
    this.step === 0 && (this.startTime = Date.now(), this.prizeFlag = void 0, this.step = 1, this.config.afterStart?.(), this.run());
  }
  /**
   * Exposed: Slow stop method
   * @param index Prize index
   */
  stop(t) {
    if (!(this.step === 0 || this.step === 3)) {
      if (typeof t == "number")
        this.prizeFlag = new Array(this.slots.length).fill(t);
      else if (P(t, "array"))
        if (t.length === this.slots.length)
          this.prizeFlag = t;
        else
          return this.stop(-1), console.error(`stop([${t}]) parameter length is incorrect`);
      else
        return this.stop(-1), console.error(`stop() cannot recognize parameter type ${typeof t}`);
      this.prizeFlag?.includes(-1) ? (this.prizeFlag = [], this.step = 0) : this.step = 2;
    }
  }
  /**
   * Make game run
   * @param num Record how many times frame animation executed
   */
  run(t = 0) {
    const { rAF: e, step: i, prizeFlag: s, _defaultConfig: h, cellAndSpacing: r, slots: n } = this, { accelerationTime: o, decelerationTime: l } = h;
    if (this.step === 0 && s?.length === n.length) {
      let g = s[0];
      for (let p = 0; p < n.length; p++) {
        const f = n[p], w = s[p];
        if (!(f.order || this.defaultOrder)?.includes(w) || g !== w) {
          g = -1;
          break;
        }
      }
      this.endCallback?.(this.prizes.find((p, f) => f === g) || void 0);
      return;
    }
    if (s !== void 0 && !s.length) return;
    this.step === 3 && !this.endScroll.length && this.carveOnGunwaleOfAMovingBoat();
    const c = Date.now() - this.startTime, d = Date.now() - this.endTime;
    n.forEach((g, p) => {
      const f = g.order || this.defaultOrder;
      if (!f || !f.length) return;
      const w = r * f.length, u = Math.abs(g.speed || h.speed), b = g.direction || h.direction;
      let m = 0, S = this.scroll[p];
      if (i === 1 || c < o) {
        this.FPS = c / t;
        const y = x.easeIn(c, 0, u, o);
        y === u && (this.step = 2), m = (S + y * b) % w;
      } else if (i === 2)
        m = (S + u * b) % w, s?.length === n.length && (this.step = 3, this.stopScroll = [], this.endScroll = []);
      else if (i === 3 && d) {
        const y = this.stopScroll[p], z = this.endScroll[p];
        m = x.easeOut(d, y, z, l), d >= l && (this.step = 0);
      }
      this.scroll[p] = m;
    }), this.draw(), e(this.run.bind(this, t + 1));
  }
  // Swap values according to mode
  displacement(t, e) {
    return this._defaultConfig.mode === "horizontal" ? e : t;
  }
  // Calculate width and height according to mode
  displacementWidthOrHeight() {
    const t = this._defaultConfig.mode, e = this.slots.length, { colSpacing: i, rowSpacing: s } = this._defaultConfig, { x: h, y: r, w: n, h: o } = this.prizeArea || this.drawBlocks();
    let l = 0, c = 0, d = 0, g = 0;
    return t === "horizontal" ? (c = this.cellHeight = (o - s * (e - 1)) / e, l = this.cellWidth = c) : (l = this.cellWidth = (n - i * (e - 1)) / e, c = this.cellHeight = l), d = this.widthAndSpacing = this.cellWidth + i, g = this.heightAndSpacing = this.cellHeight + s, t === "horizontal" ? this.cellAndSpacing = d : this.cellAndSpacing = g, {
      cellWidth: l,
      cellHeight: c,
      widthAndSpacing: d,
      heightAndSpacing: g
    };
  }
}
const kt = (a, t) => {
  const e = document.createElement("canvas"), i = e.getContext("2d"), { width: s, height: h } = a;
  return e.width = s, e.height = h, R(i, 0, 0, s, h, t), i.clip(), i.drawImage(a, 0, 0, s, h), e;
}, Lt = (a, t) => {
  const e = document.createElement("canvas"), i = e.getContext("2d"), { width: s, height: h } = a;
  if (e.width = s, e.height = h, typeof i.filter == "string")
    i.filter = `opacity(${t * 100}%)`, i.drawImage(a, 0, 0, s, h);
  else {
    i.drawImage(a, 0, 0, s, h);
    const r = i.getImageData(0, 0, s, h), { data: n } = r, o = n.length;
    for (let l = 0; l < o; l += 4) {
      const c = n[l + 3];
      c !== 0 && (n[l + 3] = c * t);
    }
    i.putImageData(r, 0, 0);
  }
  return e;
};
export {
  At as LuckyGrid,
  $t as LuckyWheel,
  Wt as SlotMachine,
  kt as cutRound,
  Lt as opacity
};
