// src/dom/data.js
var elementMap = /* @__PURE__ */ new Map();
var data_default = {
  set(element, key, instance) {
    if (!elementMap.has(element)) {
      elementMap.set(element, /* @__PURE__ */ new Map());
    }
    const instanceMap = elementMap.get(element);
    if (!instanceMap.has(key) && instanceMap.size !== 0) {
      console.error(`Bootstrap doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
      return;
    }
    instanceMap.set(key, instance);
  },
  get(element, key) {
    if (elementMap.has(element)) {
      return elementMap.get(element).get(key) || null;
    }
    return null;
  },
  remove(element, key) {
    if (!elementMap.has(element)) {
      return;
    }
    const instanceMap = elementMap.get(element);
    instanceMap.delete(key);
    if (instanceMap.size === 0) {
      elementMap.delete(element);
    }
  }
};

// src/util/index.js
var MAX_UID = 1e6;
var MILLISECONDS_MULTIPLIER = 1e3;
var TRANSITION_END = "transitionend";
var parseSelector = (selector) => {
  if (selector && window.CSS && window.CSS.escape) {
    selector = selector.replace(/#([^\s"#']+)/g, (match, id) => `#${CSS.escape(id)}`);
  }
  return selector;
};
var toType = (object) => {
  if (object === null || object === void 0) {
    return `${object}`;
  }
  return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
};
var getUID = (prefix) => {
  do {
    prefix += Math.floor(Math.random() * MAX_UID);
  } while (document.getElementById(prefix));
  return prefix;
};
var getTransitionDurationFromElement = (element) => {
  if (!element) {
    return 0;
  }
  let { transitionDuration, transitionDelay } = window.getComputedStyle(element);
  const floatTransitionDuration = Number.parseFloat(transitionDuration);
  const floatTransitionDelay = Number.parseFloat(transitionDelay);
  if (!floatTransitionDuration && !floatTransitionDelay) {
    return 0;
  }
  transitionDuration = transitionDuration.split(",")[0];
  transitionDelay = transitionDelay.split(",")[0];
  return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
};
var triggerTransitionEnd = (element) => {
  element.dispatchEvent(new Event(TRANSITION_END));
};
var isElement = (object) => {
  if (!object || typeof object !== "object") {
    return false;
  }
  if (typeof object.jquery !== "undefined") {
    object = object[0];
  }
  return typeof object.nodeType !== "undefined";
};
var getElement = (object) => {
  if (isElement(object)) {
    return object.jquery ? object[0] : object;
  }
  if (typeof object === "string" && object.length > 0) {
    return document.querySelector(parseSelector(object));
  }
  return null;
};
var isVisible = (element) => {
  if (!isElement(element) || element.getClientRects().length === 0) {
    return false;
  }
  const elementIsVisible = getComputedStyle(element).getPropertyValue("visibility") === "visible";
  const closedDetails = element.closest("details:not([open])");
  if (!closedDetails) {
    return elementIsVisible;
  }
  if (closedDetails !== element) {
    const summary = element.closest("summary");
    if (summary && summary.parentNode !== closedDetails) {
      return false;
    }
    if (summary === null) {
      return false;
    }
  }
  return elementIsVisible;
};
var isDisabled = (element) => {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true;
  }
  if (element.classList.contains("disabled")) {
    return true;
  }
  if (typeof element.disabled !== "undefined") {
    return element.disabled;
  }
  return element.hasAttribute("disabled") && element.getAttribute("disabled") !== "false";
};
var findShadowRoot = (element) => {
  if (!document.documentElement.attachShadow) {
    return null;
  }
  if (typeof element.getRootNode === "function") {
    const root = element.getRootNode();
    return root instanceof ShadowRoot ? root : null;
  }
  if (element instanceof ShadowRoot) {
    return element;
  }
  if (!element.parentNode) {
    return null;
  }
  return findShadowRoot(element.parentNode);
};
var noop = () => {
};
var reflow = (element) => {
  element.offsetHeight;
};
var getjQuery = () => {
  if (window.jQuery && !document.body.hasAttribute("data-bs-no-jquery")) {
    return window.jQuery;
  }
  return null;
};
var DOMContentLoadedCallbacks = [];
var onDOMContentLoaded = (callback) => {
  if (document.readyState === "loading") {
    if (!DOMContentLoadedCallbacks.length) {
      document.addEventListener("DOMContentLoaded", () => {
        for (const callback2 of DOMContentLoadedCallbacks) {
          callback2();
        }
      });
    }
    DOMContentLoadedCallbacks.push(callback);
  } else {
    callback();
  }
};
var isRTL = () => document.documentElement.dir === "rtl";
var defineJQueryPlugin = (plugin) => {
  onDOMContentLoaded(() => {
    const $ = getjQuery();
    if ($) {
      const name = plugin.NAME;
      const JQUERY_NO_CONFLICT = $.fn[name];
      $.fn[name] = plugin.jQueryInterface;
      $.fn[name].Constructor = plugin;
      $.fn[name].noConflict = () => {
        $.fn[name] = JQUERY_NO_CONFLICT;
        return plugin.jQueryInterface;
      };
    }
  });
};
var execute = (possibleCallback, args = [], defaultValue = possibleCallback) => {
  return typeof possibleCallback === "function" ? possibleCallback.call(...args) : defaultValue;
};
var executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
  if (!waitForTransition) {
    execute(callback);
    return;
  }
  const durationPadding = 5;
  const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
  let called = false;
  const handler = ({ target }) => {
    if (target !== transitionElement) {
      return;
    }
    called = true;
    transitionElement.removeEventListener(TRANSITION_END, handler);
    execute(callback);
  };
  transitionElement.addEventListener(TRANSITION_END, handler);
  setTimeout(() => {
    if (!called) {
      triggerTransitionEnd(transitionElement);
    }
  }, emulatedDuration);
};
var getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
  const listLength = list.length;
  let index = list.indexOf(activeElement);
  if (index === -1) {
    return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
  }
  index += shouldGetNext ? 1 : -1;
  if (isCycleAllowed) {
    index = (index + listLength) % listLength;
  }
  return list[Math.max(0, Math.min(index, listLength - 1))];
};

// src/dom/event-handler.js
var namespaceRegex = /[^.]*(?=\..*)\.|.*/;
var stripNameRegex = /\..*/;
var stripUidRegex = /::\d+$/;
var eventRegistry = {};
var uidEvent = 1;
var customEvents = {
  mouseenter: "mouseover",
  mouseleave: "mouseout"
};
var nativeEvents = /* @__PURE__ */ new Set([
  "click",
  "dblclick",
  "mouseup",
  "mousedown",
  "contextmenu",
  "mousewheel",
  "DOMMouseScroll",
  "mouseover",
  "mouseout",
  "mousemove",
  "selectstart",
  "selectend",
  "keydown",
  "keypress",
  "keyup",
  "orientationchange",
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
  "pointerdown",
  "pointermove",
  "pointerup",
  "pointerleave",
  "pointercancel",
  "gesturestart",
  "gesturechange",
  "gestureend",
  "focus",
  "blur",
  "change",
  "reset",
  "select",
  "submit",
  "focusin",
  "focusout",
  "load",
  "unload",
  "beforeunload",
  "resize",
  "move",
  "DOMContentLoaded",
  "readystatechange",
  "error",
  "abort",
  "scroll"
]);
function makeEventUid(element, uid) {
  return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
}
function getElementEvents(element) {
  const uid = makeEventUid(element);
  element.uidEvent = uid;
  eventRegistry[uid] = eventRegistry[uid] || {};
  return eventRegistry[uid];
}
function bootstrapHandler(element, fn) {
  return function handler(event) {
    hydrateObj(event, { delegateTarget: element });
    if (handler.oneOff) {
      EventHandler.off(element, event.type, fn);
    }
    return fn.apply(element, [event]);
  };
}
function bootstrapDelegationHandler(element, selector, fn) {
  return function handler(event) {
    const domElements = element.querySelectorAll(selector);
    for (let { target } = event; target && target !== this; target = target.parentNode) {
      for (const domElement of domElements) {
        if (domElement !== target) {
          continue;
        }
        hydrateObj(event, { delegateTarget: target });
        if (handler.oneOff) {
          EventHandler.off(element, event.type, selector, fn);
        }
        return fn.apply(target, [event]);
      }
    }
  };
}
function findHandler(events, callable, delegationSelector = null) {
  return Object.values(events).find((event) => event.callable === callable && event.delegationSelector === delegationSelector);
}
function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
  const isDelegated = typeof handler === "string";
  const callable = isDelegated ? delegationFunction : handler || delegationFunction;
  let typeEvent = getTypeEvent(originalTypeEvent);
  if (!nativeEvents.has(typeEvent)) {
    typeEvent = originalTypeEvent;
  }
  return [isDelegated, callable, typeEvent];
}
function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
  if (typeof originalTypeEvent !== "string" || !element) {
    return;
  }
  let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
  if (originalTypeEvent in customEvents) {
    const wrapFunction = (fn2) => {
      return function(event) {
        if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
          return fn2.call(this, event);
        }
      };
    };
    callable = wrapFunction(callable);
  }
  const events = getElementEvents(element);
  const handlers = events[typeEvent] || (events[typeEvent] = {});
  const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
  if (previousFunction) {
    previousFunction.oneOff = previousFunction.oneOff && oneOff;
    return;
  }
  const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ""));
  const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
  fn.delegationSelector = isDelegated ? handler : null;
  fn.callable = callable;
  fn.oneOff = oneOff;
  fn.uidEvent = uid;
  handlers[uid] = fn;
  element.addEventListener(typeEvent, fn, isDelegated);
}
function removeHandler(element, events, typeEvent, handler, delegationSelector) {
  const fn = findHandler(events[typeEvent], handler, delegationSelector);
  if (!fn) {
    return;
  }
  element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
  delete events[typeEvent][fn.uidEvent];
}
function removeNamespacedHandlers(element, events, typeEvent, namespace) {
  const storeElementEvent = events[typeEvent] || {};
  for (const [handlerKey, event] of Object.entries(storeElementEvent)) {
    if (handlerKey.includes(namespace)) {
      removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
    }
  }
}
function getTypeEvent(event) {
  event = event.replace(stripNameRegex, "");
  return customEvents[event] || event;
}
var EventHandler = {
  on(element, event, handler, delegationFunction) {
    addHandler(element, event, handler, delegationFunction, false);
  },
  one(element, event, handler, delegationFunction) {
    addHandler(element, event, handler, delegationFunction, true);
  },
  off(element, originalTypeEvent, handler, delegationFunction) {
    if (typeof originalTypeEvent !== "string" || !element) {
      return;
    }
    const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
    const inNamespace = typeEvent !== originalTypeEvent;
    const events = getElementEvents(element);
    const storeElementEvent = events[typeEvent] || {};
    const isNamespace = originalTypeEvent.startsWith(".");
    if (typeof callable !== "undefined") {
      if (!Object.keys(storeElementEvent).length) {
        return;
      }
      removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
      return;
    }
    if (isNamespace) {
      for (const elementEvent of Object.keys(events)) {
        removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
      }
    }
    for (const [keyHandlers, event] of Object.entries(storeElementEvent)) {
      const handlerKey = keyHandlers.replace(stripUidRegex, "");
      if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
        removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
      }
    }
  },
  trigger(element, event, args) {
    if (typeof event !== "string" || !element) {
      return null;
    }
    const $ = getjQuery();
    const typeEvent = getTypeEvent(event);
    const inNamespace = event !== typeEvent;
    let jQueryEvent = null;
    let bubbles = true;
    let nativeDispatch = true;
    let defaultPrevented = false;
    if (inNamespace && $) {
      jQueryEvent = $.Event(event, args);
      $(element).trigger(jQueryEvent);
      bubbles = !jQueryEvent.isPropagationStopped();
      nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
      defaultPrevented = jQueryEvent.isDefaultPrevented();
    }
    const evt = hydrateObj(new Event(event, { bubbles, cancelable: true }), args);
    if (defaultPrevented) {
      evt.preventDefault();
    }
    if (nativeDispatch) {
      element.dispatchEvent(evt);
    }
    if (evt.defaultPrevented && jQueryEvent) {
      jQueryEvent.preventDefault();
    }
    return evt;
  }
};
function hydrateObj(obj, meta = {}) {
  for (const [key, value] of Object.entries(meta)) {
    try {
      obj[key] = value;
    } catch {
      Object.defineProperty(obj, key, {
        configurable: true,
        get() {
          return value;
        }
      });
    }
  }
  return obj;
}
var event_handler_default = EventHandler;

// src/dom/manipulator.js
function normalizeData(value) {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (value === Number(value).toString()) {
    return Number(value);
  }
  if (value === "" || value === "null") {
    return null;
  }
  if (typeof value !== "string") {
    return value;
  }
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return value;
  }
}
function normalizeDataKey(key) {
  return key.replace(/[A-Z]/g, (chr) => `-${chr.toLowerCase()}`);
}
var Manipulator = {
  setDataAttribute(element, key, value) {
    element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
  },
  removeDataAttribute(element, key) {
    element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
  },
  getDataAttributes(element) {
    if (!element) {
      return {};
    }
    const attributes = {};
    const bsKeys = Object.keys(element.dataset).filter((key) => key.startsWith("bs") && !key.startsWith("bsConfig"));
    for (const key of bsKeys) {
      let pureKey = key.replace(/^bs/, "");
      pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1);
      attributes[pureKey] = normalizeData(element.dataset[key]);
    }
    return attributes;
  },
  getDataAttribute(element, key) {
    return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
  }
};
var manipulator_default = Manipulator;

// src/util/config.js
var Config = class {
  // Getters
  static get Default() {
    return {};
  }
  static get DefaultType() {
    return {};
  }
  static get NAME() {
    throw new Error('You have to implement the static method "NAME", for each component!');
  }
  _getConfig(config) {
    config = this._mergeConfigObj(config);
    config = this._configAfterMerge(config);
    this._typeCheckConfig(config);
    return config;
  }
  _configAfterMerge(config) {
    return config;
  }
  _mergeConfigObj(config, element) {
    const jsonConfig = isElement(element) ? manipulator_default.getDataAttribute(element, "config") : {};
    return {
      ...this.constructor.Default,
      ...typeof jsonConfig === "object" ? jsonConfig : {},
      ...isElement(element) ? manipulator_default.getDataAttributes(element) : {},
      ...typeof config === "object" ? config : {}
    };
  }
  _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
    for (const [property, expectedTypes] of Object.entries(configTypes)) {
      const value = config[property];
      const valueType = isElement(value) ? "element" : toType(value);
      if (!new RegExp(expectedTypes).test(valueType)) {
        throw new TypeError(
          `${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`
        );
      }
    }
  }
};
var config_default = Config;

// src/base-component.js
var VERSION = "5.3.8";
var BaseComponent = class extends config_default {
  constructor(element, config) {
    super();
    element = getElement(element);
    if (!element) {
      return;
    }
    this._element = element;
    this._config = this._getConfig(config);
    data_default.set(this._element, this.constructor.DATA_KEY, this);
  }
  // Public
  dispose() {
    data_default.remove(this._element, this.constructor.DATA_KEY);
    event_handler_default.off(this._element, this.constructor.EVENT_KEY);
    for (const propertyName of Object.getOwnPropertyNames(this)) {
      this[propertyName] = null;
    }
  }
  // Private
  _queueCallback(callback, element, isAnimated = true) {
    executeAfterTransition(callback, element, isAnimated);
  }
  _getConfig(config) {
    config = this._mergeConfigObj(config, this._element);
    config = this._configAfterMerge(config);
    this._typeCheckConfig(config);
    return config;
  }
  // Static
  static getInstance(element) {
    return data_default.get(getElement(element), this.DATA_KEY);
  }
  static getOrCreateInstance(element, config = {}) {
    return this.getInstance(element) || new this(element, typeof config === "object" ? config : null);
  }
  static get VERSION() {
    return VERSION;
  }
  static get DATA_KEY() {
    return `bs.${this.NAME}`;
  }
  static get EVENT_KEY() {
    return `.${this.DATA_KEY}`;
  }
  static eventName(name) {
    return `${name}${this.EVENT_KEY}`;
  }
};
var base_component_default = BaseComponent;

// src/dom/selector-engine.js
var getSelector = (element) => {
  let selector = element.getAttribute("data-bs-target");
  if (!selector || selector === "#") {
    let hrefAttribute = element.getAttribute("href");
    if (!hrefAttribute || !hrefAttribute.includes("#") && !hrefAttribute.startsWith(".")) {
      return null;
    }
    if (hrefAttribute.includes("#") && !hrefAttribute.startsWith("#")) {
      hrefAttribute = `#${hrefAttribute.split("#")[1]}`;
    }
    selector = hrefAttribute && hrefAttribute !== "#" ? hrefAttribute.trim() : null;
  }
  return selector ? selector.split(",").map((sel) => parseSelector(sel)).join(",") : null;
};
var SelectorEngine = {
  find(selector, element = document.documentElement) {
    return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
  },
  findOne(selector, element = document.documentElement) {
    return Element.prototype.querySelector.call(element, selector);
  },
  children(element, selector) {
    return [].concat(...element.children).filter((child) => child.matches(selector));
  },
  parents(element, selector) {
    const parents = [];
    let ancestor = element.parentNode.closest(selector);
    while (ancestor) {
      parents.push(ancestor);
      ancestor = ancestor.parentNode.closest(selector);
    }
    return parents;
  },
  prev(element, selector) {
    let previous = element.previousElementSibling;
    while (previous) {
      if (previous.matches(selector)) {
        return [previous];
      }
      previous = previous.previousElementSibling;
    }
    return [];
  },
  // TODO: this is now unused; remove later along with prev()
  next(element, selector) {
    let next = element.nextElementSibling;
    while (next) {
      if (next.matches(selector)) {
        return [next];
      }
      next = next.nextElementSibling;
    }
    return [];
  },
  focusableChildren(element) {
    const focusables = [
      "a",
      "button",
      "input",
      "textarea",
      "select",
      "details",
      "[tabindex]",
      '[contenteditable="true"]'
    ].map((selector) => `${selector}:not([tabindex^="-"])`).join(",");
    return this.find(focusables, element).filter((el) => !isDisabled(el) && isVisible(el));
  },
  getSelectorFromElement(element) {
    const selector = getSelector(element);
    if (selector) {
      return SelectorEngine.findOne(selector) ? selector : null;
    }
    return null;
  },
  getElementFromSelector(element) {
    const selector = getSelector(element);
    return selector ? SelectorEngine.findOne(selector) : null;
  },
  getMultipleElementsFromSelector(element) {
    const selector = getSelector(element);
    return selector ? SelectorEngine.find(selector) : [];
  }
};
var selector_engine_default = SelectorEngine;

// src/util/component-functions.js
var enableDismissTrigger = (component, method = "hide") => {
  const clickEvent = `click.dismiss${component.EVENT_KEY}`;
  const name = component.NAME;
  event_handler_default.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function(event) {
    if (["A", "AREA"].includes(this.tagName)) {
      event.preventDefault();
    }
    if (isDisabled(this)) {
      return;
    }
    const target = selector_engine_default.getElementFromSelector(this) || this.closest(`.${name}`);
    const instance = component.getOrCreateInstance(target);
    instance[method]();
  });
};

// src/alert.js
var NAME = "alert";
var DATA_KEY = "bs.alert";
var EVENT_KEY = `.${DATA_KEY}`;
var EVENT_CLOSE = `close${EVENT_KEY}`;
var EVENT_CLOSED = `closed${EVENT_KEY}`;
var CLASS_NAME_FADE = "fade";
var CLASS_NAME_SHOW = "show";
var Alert = class _Alert extends base_component_default {
  // Getters
  static get NAME() {
    return NAME;
  }
  // Public
  close() {
    const closeEvent = event_handler_default.trigger(this._element, EVENT_CLOSE);
    if (closeEvent.defaultPrevented) {
      return;
    }
    this._element.classList.remove(CLASS_NAME_SHOW);
    const isAnimated = this._element.classList.contains(CLASS_NAME_FADE);
    this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
  }
  // Private
  _destroyElement() {
    this._element.remove();
    event_handler_default.trigger(this._element, EVENT_CLOSED);
    this.dispose();
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Alert.getOrCreateInstance(this);
      if (typeof config !== "string") {
        return;
      }
      if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config](this);
    });
  }
};
enableDismissTrigger(Alert, "close");
defineJQueryPlugin(Alert);
var alert_default = Alert;

// src/button.js
var NAME2 = "button";
var DATA_KEY2 = "bs.button";
var EVENT_KEY2 = `.${DATA_KEY2}`;
var DATA_API_KEY = ".data-api";
var CLASS_NAME_ACTIVE = "active";
var SELECTOR_DATA_TOGGLE = '[data-bs-toggle="button"]';
var EVENT_CLICK_DATA_API = `click${EVENT_KEY2}${DATA_API_KEY}`;
var Button = class _Button extends base_component_default {
  // Getters
  static get NAME() {
    return NAME2;
  }
  // Public
  toggle() {
    this._element.setAttribute("aria-pressed", this._element.classList.toggle(CLASS_NAME_ACTIVE));
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Button.getOrCreateInstance(this);
      if (config === "toggle") {
        data[config]();
      }
    });
  }
};
event_handler_default.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, (event) => {
  event.preventDefault();
  const button = event.target.closest(SELECTOR_DATA_TOGGLE);
  const data = Button.getOrCreateInstance(button);
  data.toggle();
});
defineJQueryPlugin(Button);
var button_default = Button;

// src/util/swipe.js
var NAME3 = "swipe";
var EVENT_KEY3 = ".bs.swipe";
var EVENT_TOUCHSTART = `touchstart${EVENT_KEY3}`;
var EVENT_TOUCHMOVE = `touchmove${EVENT_KEY3}`;
var EVENT_TOUCHEND = `touchend${EVENT_KEY3}`;
var EVENT_POINTERDOWN = `pointerdown${EVENT_KEY3}`;
var EVENT_POINTERUP = `pointerup${EVENT_KEY3}`;
var POINTER_TYPE_TOUCH = "touch";
var POINTER_TYPE_PEN = "pen";
var CLASS_NAME_POINTER_EVENT = "pointer-event";
var SWIPE_THRESHOLD = 40;
var Default = {
  endCallback: null,
  leftCallback: null,
  rightCallback: null
};
var DefaultType = {
  endCallback: "(function|null)",
  leftCallback: "(function|null)",
  rightCallback: "(function|null)"
};
var Swipe = class _Swipe extends config_default {
  constructor(element, config) {
    super();
    this._element = element;
    if (!element || !_Swipe.isSupported()) {
      return;
    }
    this._config = this._getConfig(config);
    this._deltaX = 0;
    this._supportPointerEvents = Boolean(window.PointerEvent);
    this._initEvents();
  }
  // Getters
  static get Default() {
    return Default;
  }
  static get DefaultType() {
    return DefaultType;
  }
  static get NAME() {
    return NAME3;
  }
  // Public
  dispose() {
    event_handler_default.off(this._element, EVENT_KEY3);
  }
  // Private
  _start(event) {
    if (!this._supportPointerEvents) {
      this._deltaX = event.touches[0].clientX;
      return;
    }
    if (this._eventIsPointerPenTouch(event)) {
      this._deltaX = event.clientX;
    }
  }
  _end(event) {
    if (this._eventIsPointerPenTouch(event)) {
      this._deltaX = event.clientX - this._deltaX;
    }
    this._handleSwipe();
    execute(this._config.endCallback);
  }
  _move(event) {
    this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
  }
  _handleSwipe() {
    const absDeltaX = Math.abs(this._deltaX);
    if (absDeltaX <= SWIPE_THRESHOLD) {
      return;
    }
    const direction = absDeltaX / this._deltaX;
    this._deltaX = 0;
    if (!direction) {
      return;
    }
    execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
  }
  _initEvents() {
    if (this._supportPointerEvents) {
      event_handler_default.on(this._element, EVENT_POINTERDOWN, (event) => this._start(event));
      event_handler_default.on(this._element, EVENT_POINTERUP, (event) => this._end(event));
      this._element.classList.add(CLASS_NAME_POINTER_EVENT);
    } else {
      event_handler_default.on(this._element, EVENT_TOUCHSTART, (event) => this._start(event));
      event_handler_default.on(this._element, EVENT_TOUCHMOVE, (event) => this._move(event));
      event_handler_default.on(this._element, EVENT_TOUCHEND, (event) => this._end(event));
    }
  }
  _eventIsPointerPenTouch(event) {
    return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
  }
  // Static
  static isSupported() {
    return "ontouchstart" in document.documentElement || navigator.maxTouchPoints > 0;
  }
};
var swipe_default = Swipe;

// src/carousel.js
var NAME4 = "carousel";
var DATA_KEY3 = "bs.carousel";
var EVENT_KEY4 = `.${DATA_KEY3}`;
var DATA_API_KEY2 = ".data-api";
var ARROW_LEFT_KEY = "ArrowLeft";
var ARROW_RIGHT_KEY = "ArrowRight";
var TOUCHEVENT_COMPAT_WAIT = 500;
var ORDER_NEXT = "next";
var ORDER_PREV = "prev";
var DIRECTION_LEFT = "left";
var DIRECTION_RIGHT = "right";
var EVENT_SLIDE = `slide${EVENT_KEY4}`;
var EVENT_SLID = `slid${EVENT_KEY4}`;
var EVENT_KEYDOWN = `keydown${EVENT_KEY4}`;
var EVENT_MOUSEENTER = `mouseenter${EVENT_KEY4}`;
var EVENT_MOUSELEAVE = `mouseleave${EVENT_KEY4}`;
var EVENT_DRAG_START = `dragstart${EVENT_KEY4}`;
var EVENT_LOAD_DATA_API = `load${EVENT_KEY4}${DATA_API_KEY2}`;
var EVENT_CLICK_DATA_API2 = `click${EVENT_KEY4}${DATA_API_KEY2}`;
var CLASS_NAME_CAROUSEL = "carousel";
var CLASS_NAME_ACTIVE2 = "active";
var CLASS_NAME_SLIDE = "slide";
var CLASS_NAME_END = "carousel-item-end";
var CLASS_NAME_START = "carousel-item-start";
var CLASS_NAME_NEXT = "carousel-item-next";
var CLASS_NAME_PREV = "carousel-item-prev";
var SELECTOR_ACTIVE = ".active";
var SELECTOR_ITEM = ".carousel-item";
var SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
var SELECTOR_ITEM_IMG = ".carousel-item img";
var SELECTOR_INDICATORS = ".carousel-indicators";
var SELECTOR_DATA_SLIDE = "[data-bs-slide], [data-bs-slide-to]";
var SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
var KEY_TO_DIRECTION = {
  [ARROW_LEFT_KEY]: DIRECTION_RIGHT,
  [ARROW_RIGHT_KEY]: DIRECTION_LEFT
};
var Default2 = {
  interval: 5e3,
  keyboard: true,
  pause: "hover",
  ride: false,
  touch: true,
  wrap: true
};
var DefaultType2 = {
  interval: "(number|boolean)",
  // TODO:v6 remove boolean support
  keyboard: "boolean",
  pause: "(string|boolean)",
  ride: "(boolean|string)",
  touch: "boolean",
  wrap: "boolean"
};
var Carousel = class _Carousel extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._interval = null;
    this._activeElement = null;
    this._isSliding = false;
    this.touchTimeout = null;
    this._swipeHelper = null;
    this._indicatorsElement = selector_engine_default.findOne(SELECTOR_INDICATORS, this._element);
    this._addEventListeners();
    if (this._config.ride === CLASS_NAME_CAROUSEL) {
      this.cycle();
    }
  }
  // Getters
  static get Default() {
    return Default2;
  }
  static get DefaultType() {
    return DefaultType2;
  }
  static get NAME() {
    return NAME4;
  }
  // Public
  next() {
    this._slide(ORDER_NEXT);
  }
  nextWhenVisible() {
    if (!document.hidden && isVisible(this._element)) {
      this.next();
    }
  }
  prev() {
    this._slide(ORDER_PREV);
  }
  pause() {
    if (this._isSliding) {
      triggerTransitionEnd(this._element);
    }
    this._clearInterval();
  }
  cycle() {
    this._clearInterval();
    this._updateInterval();
    this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
  }
  _maybeEnableCycle() {
    if (!this._config.ride) {
      return;
    }
    if (this._isSliding) {
      event_handler_default.one(this._element, EVENT_SLID, () => this.cycle());
      return;
    }
    this.cycle();
  }
  to(index) {
    const items = this._getItems();
    if (index > items.length - 1 || index < 0) {
      return;
    }
    if (this._isSliding) {
      event_handler_default.one(this._element, EVENT_SLID, () => this.to(index));
      return;
    }
    const activeIndex = this._getItemIndex(this._getActive());
    if (activeIndex === index) {
      return;
    }
    const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
    this._slide(order, items[index]);
  }
  dispose() {
    if (this._swipeHelper) {
      this._swipeHelper.dispose();
    }
    super.dispose();
  }
  // Private
  _configAfterMerge(config) {
    config.defaultInterval = config.interval;
    return config;
  }
  _addEventListeners() {
    if (this._config.keyboard) {
      event_handler_default.on(this._element, EVENT_KEYDOWN, (event) => this._keydown(event));
    }
    if (this._config.pause === "hover") {
      event_handler_default.on(this._element, EVENT_MOUSEENTER, () => this.pause());
      event_handler_default.on(this._element, EVENT_MOUSELEAVE, () => this._maybeEnableCycle());
    }
    if (this._config.touch && swipe_default.isSupported()) {
      this._addTouchEventListeners();
    }
  }
  _addTouchEventListeners() {
    for (const img of selector_engine_default.find(SELECTOR_ITEM_IMG, this._element)) {
      event_handler_default.on(img, EVENT_DRAG_START, (event) => event.preventDefault());
    }
    const endCallBack = () => {
      if (this._config.pause !== "hover") {
        return;
      }
      this.pause();
      if (this.touchTimeout) {
        clearTimeout(this.touchTimeout);
      }
      this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
    };
    const swipeConfig = {
      leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
      rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
      endCallback: endCallBack
    };
    this._swipeHelper = new swipe_default(this._element, swipeConfig);
  }
  _keydown(event) {
    if (/input|textarea/i.test(event.target.tagName)) {
      return;
    }
    const direction = KEY_TO_DIRECTION[event.key];
    if (direction) {
      event.preventDefault();
      this._slide(this._directionToOrder(direction));
    }
  }
  _getItemIndex(element) {
    return this._getItems().indexOf(element);
  }
  _setActiveIndicatorElement(index) {
    if (!this._indicatorsElement) {
      return;
    }
    const activeIndicator = selector_engine_default.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
    activeIndicator.classList.remove(CLASS_NAME_ACTIVE2);
    activeIndicator.removeAttribute("aria-current");
    const newActiveIndicator = selector_engine_default.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
    if (newActiveIndicator) {
      newActiveIndicator.classList.add(CLASS_NAME_ACTIVE2);
      newActiveIndicator.setAttribute("aria-current", "true");
    }
  }
  _updateInterval() {
    const element = this._activeElement || this._getActive();
    if (!element) {
      return;
    }
    const elementInterval = Number.parseInt(element.getAttribute("data-bs-interval"), 10);
    this._config.interval = elementInterval || this._config.defaultInterval;
  }
  _slide(order, element = null) {
    if (this._isSliding) {
      return;
    }
    const activeElement = this._getActive();
    const isNext = order === ORDER_NEXT;
    const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
    if (nextElement === activeElement) {
      return;
    }
    const nextElementIndex = this._getItemIndex(nextElement);
    const triggerEvent = (eventName) => {
      return event_handler_default.trigger(this._element, eventName, {
        relatedTarget: nextElement,
        direction: this._orderToDirection(order),
        from: this._getItemIndex(activeElement),
        to: nextElementIndex
      });
    };
    const slideEvent = triggerEvent(EVENT_SLIDE);
    if (slideEvent.defaultPrevented) {
      return;
    }
    if (!activeElement || !nextElement) {
      return;
    }
    const isCycling = Boolean(this._interval);
    this.pause();
    this._isSliding = true;
    this._setActiveIndicatorElement(nextElementIndex);
    this._activeElement = nextElement;
    const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
    const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
    nextElement.classList.add(orderClassName);
    reflow(nextElement);
    activeElement.classList.add(directionalClassName);
    nextElement.classList.add(directionalClassName);
    const completeCallBack = () => {
      nextElement.classList.remove(directionalClassName, orderClassName);
      nextElement.classList.add(CLASS_NAME_ACTIVE2);
      activeElement.classList.remove(CLASS_NAME_ACTIVE2, orderClassName, directionalClassName);
      this._isSliding = false;
      triggerEvent(EVENT_SLID);
    };
    this._queueCallback(completeCallBack, activeElement, this._isAnimated());
    if (isCycling) {
      this.cycle();
    }
  }
  _isAnimated() {
    return this._element.classList.contains(CLASS_NAME_SLIDE);
  }
  _getActive() {
    return selector_engine_default.findOne(SELECTOR_ACTIVE_ITEM, this._element);
  }
  _getItems() {
    return selector_engine_default.find(SELECTOR_ITEM, this._element);
  }
  _clearInterval() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  _directionToOrder(direction) {
    if (isRTL()) {
      return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
    }
    return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
  }
  _orderToDirection(order) {
    if (isRTL()) {
      return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Carousel.getOrCreateInstance(this, config);
      if (typeof config === "number") {
        data.to(config);
        return;
      }
      if (typeof config === "string") {
        if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    });
  }
};
event_handler_default.on(document, EVENT_CLICK_DATA_API2, SELECTOR_DATA_SLIDE, function(event) {
  const target = selector_engine_default.getElementFromSelector(this);
  if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
    return;
  }
  event.preventDefault();
  const carousel = Carousel.getOrCreateInstance(target);
  const slideIndex = this.getAttribute("data-bs-slide-to");
  if (slideIndex) {
    carousel.to(slideIndex);
    carousel._maybeEnableCycle();
    return;
  }
  if (manipulator_default.getDataAttribute(this, "slide") === "next") {
    carousel.next();
    carousel._maybeEnableCycle();
    return;
  }
  carousel.prev();
  carousel._maybeEnableCycle();
});
event_handler_default.on(window, EVENT_LOAD_DATA_API, () => {
  const carousels = selector_engine_default.find(SELECTOR_DATA_RIDE);
  for (const carousel of carousels) {
    Carousel.getOrCreateInstance(carousel);
  }
});
defineJQueryPlugin(Carousel);
var carousel_default = Carousel;

// src/collapse.js
var NAME5 = "collapse";
var DATA_KEY4 = "bs.collapse";
var EVENT_KEY5 = `.${DATA_KEY4}`;
var DATA_API_KEY3 = ".data-api";
var EVENT_SHOW = `show${EVENT_KEY5}`;
var EVENT_SHOWN = `shown${EVENT_KEY5}`;
var EVENT_HIDE = `hide${EVENT_KEY5}`;
var EVENT_HIDDEN = `hidden${EVENT_KEY5}`;
var EVENT_CLICK_DATA_API3 = `click${EVENT_KEY5}${DATA_API_KEY3}`;
var CLASS_NAME_SHOW2 = "show";
var CLASS_NAME_COLLAPSE = "collapse";
var CLASS_NAME_COLLAPSING = "collapsing";
var CLASS_NAME_COLLAPSED = "collapsed";
var CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
var CLASS_NAME_HORIZONTAL = "collapse-horizontal";
var WIDTH = "width";
var HEIGHT = "height";
var SELECTOR_ACTIVES = ".collapse.show, .collapse.collapsing";
var SELECTOR_DATA_TOGGLE2 = '[data-bs-toggle="collapse"]';
var Default3 = {
  parent: null,
  toggle: true
};
var DefaultType3 = {
  parent: "(null|element)",
  toggle: "boolean"
};
var Collapse = class _Collapse extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._isTransitioning = false;
    this._triggerArray = [];
    const toggleList = selector_engine_default.find(SELECTOR_DATA_TOGGLE2);
    for (const elem of toggleList) {
      const selector = selector_engine_default.getSelectorFromElement(elem);
      const filterElement = selector_engine_default.find(selector).filter((foundElement) => foundElement === this._element);
      if (selector !== null && filterElement.length) {
        this._triggerArray.push(elem);
      }
    }
    this._initializeChildren();
    if (!this._config.parent) {
      this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
    }
    if (this._config.toggle) {
      this.toggle();
    }
  }
  // Getters
  static get Default() {
    return Default3;
  }
  static get DefaultType() {
    return DefaultType3;
  }
  static get NAME() {
    return NAME5;
  }
  // Public
  toggle() {
    if (this._isShown()) {
      this.hide();
    } else {
      this.show();
    }
  }
  show() {
    if (this._isTransitioning || this._isShown()) {
      return;
    }
    let activeChildren = [];
    if (this._config.parent) {
      activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter((element) => element !== this._element).map((element) => _Collapse.getOrCreateInstance(element, { toggle: false }));
    }
    if (activeChildren.length && activeChildren[0]._isTransitioning) {
      return;
    }
    const startEvent = event_handler_default.trigger(this._element, EVENT_SHOW);
    if (startEvent.defaultPrevented) {
      return;
    }
    for (const activeInstance of activeChildren) {
      activeInstance.hide();
    }
    const dimension = this._getDimension();
    this._element.classList.remove(CLASS_NAME_COLLAPSE);
    this._element.classList.add(CLASS_NAME_COLLAPSING);
    this._element.style[dimension] = 0;
    this._addAriaAndCollapsedClass(this._triggerArray, true);
    this._isTransitioning = true;
    const complete = () => {
      this._isTransitioning = false;
      this._element.classList.remove(CLASS_NAME_COLLAPSING);
      this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW2);
      this._element.style[dimension] = "";
      event_handler_default.trigger(this._element, EVENT_SHOWN);
    };
    const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
    const scrollSize = `scroll${capitalizedDimension}`;
    this._queueCallback(complete, this._element, true);
    this._element.style[dimension] = `${this._element[scrollSize]}px`;
  }
  hide() {
    if (this._isTransitioning || !this._isShown()) {
      return;
    }
    const startEvent = event_handler_default.trigger(this._element, EVENT_HIDE);
    if (startEvent.defaultPrevented) {
      return;
    }
    const dimension = this._getDimension();
    this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_COLLAPSING);
    this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW2);
    for (const trigger of this._triggerArray) {
      const element = selector_engine_default.getElementFromSelector(trigger);
      if (element && !this._isShown(element)) {
        this._addAriaAndCollapsedClass([trigger], false);
      }
    }
    this._isTransitioning = true;
    const complete = () => {
      this._isTransitioning = false;
      this._element.classList.remove(CLASS_NAME_COLLAPSING);
      this._element.classList.add(CLASS_NAME_COLLAPSE);
      event_handler_default.trigger(this._element, EVENT_HIDDEN);
    };
    this._element.style[dimension] = "";
    this._queueCallback(complete, this._element, true);
  }
  // Private
  _isShown(element = this._element) {
    return element.classList.contains(CLASS_NAME_SHOW2);
  }
  _configAfterMerge(config) {
    config.toggle = Boolean(config.toggle);
    config.parent = getElement(config.parent);
    return config;
  }
  _getDimension() {
    return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
  }
  _initializeChildren() {
    if (!this._config.parent) {
      return;
    }
    const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE2);
    for (const element of children) {
      const selected = selector_engine_default.getElementFromSelector(element);
      if (selected) {
        this._addAriaAndCollapsedClass([element], this._isShown(selected));
      }
    }
  }
  _getFirstLevelChildren(selector) {
    const children = selector_engine_default.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent);
    return selector_engine_default.find(selector, this._config.parent).filter((element) => !children.includes(element));
  }
  _addAriaAndCollapsedClass(triggerArray, isOpen) {
    if (!triggerArray.length) {
      return;
    }
    for (const element of triggerArray) {
      element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
      element.setAttribute("aria-expanded", isOpen);
    }
  }
  // Static
  static jQueryInterface(config) {
    const _config = {};
    if (typeof config === "string" && /show|hide/.test(config)) {
      _config.toggle = false;
    }
    return this.each(function() {
      const data = _Collapse.getOrCreateInstance(this, _config);
      if (typeof config === "string") {
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config]();
      }
    });
  }
};
event_handler_default.on(document, EVENT_CLICK_DATA_API3, SELECTOR_DATA_TOGGLE2, function(event) {
  if (event.target.tagName === "A" || event.delegateTarget && event.delegateTarget.tagName === "A") {
    event.preventDefault();
  }
  for (const element of selector_engine_default.getMultipleElementsFromSelector(this)) {
    Collapse.getOrCreateInstance(element, { toggle: false }).toggle();
  }
});
defineJQueryPlugin(Collapse);
var collapse_default = Collapse;

// src/dropdown.js
import * as Popper from "@popperjs/core";
var NAME6 = "dropdown";
var DATA_KEY5 = "bs.dropdown";
var EVENT_KEY6 = `.${DATA_KEY5}`;
var DATA_API_KEY4 = ".data-api";
var ESCAPE_KEY = "Escape";
var TAB_KEY = "Tab";
var ARROW_UP_KEY = "ArrowUp";
var ARROW_DOWN_KEY = "ArrowDown";
var RIGHT_MOUSE_BUTTON = 2;
var EVENT_HIDE2 = `hide${EVENT_KEY6}`;
var EVENT_HIDDEN2 = `hidden${EVENT_KEY6}`;
var EVENT_SHOW2 = `show${EVENT_KEY6}`;
var EVENT_SHOWN2 = `shown${EVENT_KEY6}`;
var EVENT_CLICK_DATA_API4 = `click${EVENT_KEY6}${DATA_API_KEY4}`;
var EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY6}${DATA_API_KEY4}`;
var EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY6}${DATA_API_KEY4}`;
var CLASS_NAME_SHOW3 = "show";
var CLASS_NAME_DROPUP = "dropup";
var CLASS_NAME_DROPEND = "dropend";
var CLASS_NAME_DROPSTART = "dropstart";
var CLASS_NAME_DROPUP_CENTER = "dropup-center";
var CLASS_NAME_DROPDOWN_CENTER = "dropdown-center";
var SELECTOR_DATA_TOGGLE3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
var SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE3}.${CLASS_NAME_SHOW3}`;
var SELECTOR_MENU = ".dropdown-menu";
var SELECTOR_NAVBAR = ".navbar";
var SELECTOR_NAVBAR_NAV = ".navbar-nav";
var SELECTOR_VISIBLE_ITEMS = ".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)";
var PLACEMENT_TOP = isRTL() ? "top-end" : "top-start";
var PLACEMENT_TOPEND = isRTL() ? "top-start" : "top-end";
var PLACEMENT_BOTTOM = isRTL() ? "bottom-end" : "bottom-start";
var PLACEMENT_BOTTOMEND = isRTL() ? "bottom-start" : "bottom-end";
var PLACEMENT_RIGHT = isRTL() ? "left-start" : "right-start";
var PLACEMENT_LEFT = isRTL() ? "right-start" : "left-start";
var PLACEMENT_TOPCENTER = "top";
var PLACEMENT_BOTTOMCENTER = "bottom";
var Default4 = {
  autoClose: true,
  boundary: "clippingParents",
  display: "dynamic",
  offset: [0, 2],
  popperConfig: null,
  reference: "toggle"
};
var DefaultType4 = {
  autoClose: "(boolean|string)",
  boundary: "(string|element)",
  display: "string",
  offset: "(array|string|function)",
  popperConfig: "(null|object|function)",
  reference: "(string|element|object)"
};
var Dropdown = class _Dropdown extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._popper = null;
    this._parent = this._element.parentNode;
    this._menu = selector_engine_default.next(this._element, SELECTOR_MENU)[0] || selector_engine_default.prev(this._element, SELECTOR_MENU)[0] || selector_engine_default.findOne(SELECTOR_MENU, this._parent);
    this._inNavbar = this._detectNavbar();
  }
  // Getters
  static get Default() {
    return Default4;
  }
  static get DefaultType() {
    return DefaultType4;
  }
  static get NAME() {
    return NAME6;
  }
  // Public
  toggle() {
    return this._isShown() ? this.hide() : this.show();
  }
  show() {
    if (isDisabled(this._element) || this._isShown()) {
      return;
    }
    const relatedTarget = {
      relatedTarget: this._element
    };
    const showEvent = event_handler_default.trigger(this._element, EVENT_SHOW2, relatedTarget);
    if (showEvent.defaultPrevented) {
      return;
    }
    this._createPopper();
    if ("ontouchstart" in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
      for (const element of [].concat(...document.body.children)) {
        event_handler_default.on(element, "mouseover", noop);
      }
    }
    this._element.focus();
    this._element.setAttribute("aria-expanded", true);
    this._menu.classList.add(CLASS_NAME_SHOW3);
    this._element.classList.add(CLASS_NAME_SHOW3);
    event_handler_default.trigger(this._element, EVENT_SHOWN2, relatedTarget);
  }
  hide() {
    if (isDisabled(this._element) || !this._isShown()) {
      return;
    }
    const relatedTarget = {
      relatedTarget: this._element
    };
    this._completeHide(relatedTarget);
  }
  dispose() {
    if (this._popper) {
      this._popper.destroy();
    }
    super.dispose();
  }
  update() {
    this._inNavbar = this._detectNavbar();
    if (this._popper) {
      this._popper.update();
    }
  }
  // Private
  _completeHide(relatedTarget) {
    const hideEvent = event_handler_default.trigger(this._element, EVENT_HIDE2, relatedTarget);
    if (hideEvent.defaultPrevented) {
      return;
    }
    if ("ontouchstart" in document.documentElement) {
      for (const element of [].concat(...document.body.children)) {
        event_handler_default.off(element, "mouseover", noop);
      }
    }
    if (this._popper) {
      this._popper.destroy();
    }
    this._menu.classList.remove(CLASS_NAME_SHOW3);
    this._element.classList.remove(CLASS_NAME_SHOW3);
    this._element.setAttribute("aria-expanded", "false");
    manipulator_default.removeDataAttribute(this._menu, "popper");
    event_handler_default.trigger(this._element, EVENT_HIDDEN2, relatedTarget);
  }
  _getConfig(config) {
    config = super._getConfig(config);
    if (typeof config.reference === "object" && !isElement(config.reference) && typeof config.reference.getBoundingClientRect !== "function") {
      throw new TypeError(`${NAME6.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
    }
    return config;
  }
  _createPopper() {
    if (typeof Popper === "undefined") {
      throw new TypeError("Bootstrap's dropdowns require Popper (https://popper.js.org/docs/v2/)");
    }
    let referenceElement = this._element;
    if (this._config.reference === "parent") {
      referenceElement = this._parent;
    } else if (isElement(this._config.reference)) {
      referenceElement = getElement(this._config.reference);
    } else if (typeof this._config.reference === "object") {
      referenceElement = this._config.reference;
    }
    const popperConfig = this._getPopperConfig();
    this._popper = Popper.createPopper(referenceElement, this._menu, popperConfig);
  }
  _isShown() {
    return this._menu.classList.contains(CLASS_NAME_SHOW3);
  }
  _getPlacement() {
    const parentDropdown = this._parent;
    if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
      return PLACEMENT_RIGHT;
    }
    if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
      return PLACEMENT_LEFT;
    }
    if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
      return PLACEMENT_TOPCENTER;
    }
    if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
      return PLACEMENT_BOTTOMCENTER;
    }
    const isEnd = getComputedStyle(this._menu).getPropertyValue("--bs-position").trim() === "end";
    if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
      return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
    }
    return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
  }
  _detectNavbar() {
    return this._element.closest(SELECTOR_NAVBAR) !== null;
  }
  _getOffset() {
    const { offset } = this._config;
    if (typeof offset === "string") {
      return offset.split(",").map((value) => Number.parseInt(value, 10));
    }
    if (typeof offset === "function") {
      return (popperData) => offset(popperData, this._element);
    }
    return offset;
  }
  _getPopperConfig() {
    const defaultBsPopperConfig = {
      placement: this._getPlacement(),
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            boundary: this._config.boundary
          }
        },
        {
          name: "offset",
          options: {
            offset: this._getOffset()
          }
        }
      ]
    };
    if (this._inNavbar || this._config.display === "static") {
      manipulator_default.setDataAttribute(this._menu, "popper", "static");
      defaultBsPopperConfig.modifiers = [{
        name: "applyStyles",
        enabled: false
      }];
    }
    return {
      ...defaultBsPopperConfig,
      ...execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
    };
  }
  _selectMenuItem({ key, target }) {
    const items = selector_engine_default.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter((element) => isVisible(element));
    if (!items.length) {
      return;
    }
    getNextActiveElement(items, target, key === ARROW_DOWN_KEY, !items.includes(target)).focus();
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Dropdown.getOrCreateInstance(this, config);
      if (typeof config !== "string") {
        return;
      }
      if (typeof data[config] === "undefined") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config]();
    });
  }
  static clearMenus(event) {
    if (event.button === RIGHT_MOUSE_BUTTON || event.type === "keyup" && event.key !== TAB_KEY) {
      return;
    }
    const openToggles = selector_engine_default.find(SELECTOR_DATA_TOGGLE_SHOWN);
    for (const toggle of openToggles) {
      const context = _Dropdown.getInstance(toggle);
      if (!context || context._config.autoClose === false) {
        continue;
      }
      const composedPath = event.composedPath();
      const isMenuTarget = composedPath.includes(context._menu);
      if (composedPath.includes(context._element) || context._config.autoClose === "inside" && !isMenuTarget || context._config.autoClose === "outside" && isMenuTarget) {
        continue;
      }
      if (context._menu.contains(event.target) && (event.type === "keyup" && event.key === TAB_KEY || /input|select|option|textarea|form/i.test(event.target.tagName))) {
        continue;
      }
      const relatedTarget = { relatedTarget: context._element };
      if (event.type === "click") {
        relatedTarget.clickEvent = event;
      }
      context._completeHide(relatedTarget);
    }
  }
  static dataApiKeydownHandler(event) {
    const isInput = /input|textarea/i.test(event.target.tagName);
    const isEscapeEvent = event.key === ESCAPE_KEY;
    const isUpOrDownEvent = [ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key);
    if (!isUpOrDownEvent && !isEscapeEvent) {
      return;
    }
    if (isInput && !isEscapeEvent) {
      return;
    }
    event.preventDefault();
    const getToggleButton = this.matches(SELECTOR_DATA_TOGGLE3) ? this : selector_engine_default.prev(this, SELECTOR_DATA_TOGGLE3)[0] || selector_engine_default.next(this, SELECTOR_DATA_TOGGLE3)[0] || selector_engine_default.findOne(SELECTOR_DATA_TOGGLE3, event.delegateTarget.parentNode);
    const instance = _Dropdown.getOrCreateInstance(getToggleButton);
    if (isUpOrDownEvent) {
      event.stopPropagation();
      instance.show();
      instance._selectMenuItem(event);
      return;
    }
    if (instance._isShown()) {
      event.stopPropagation();
      instance.hide();
      getToggleButton.focus();
    }
  }
};
event_handler_default.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE3, Dropdown.dataApiKeydownHandler);
event_handler_default.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
event_handler_default.on(document, EVENT_CLICK_DATA_API4, Dropdown.clearMenus);
event_handler_default.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
event_handler_default.on(document, EVENT_CLICK_DATA_API4, SELECTOR_DATA_TOGGLE3, function(event) {
  event.preventDefault();
  Dropdown.getOrCreateInstance(this).toggle();
});
defineJQueryPlugin(Dropdown);
var dropdown_default = Dropdown;

// src/util/backdrop.js
var NAME7 = "backdrop";
var CLASS_NAME_FADE2 = "fade";
var CLASS_NAME_SHOW4 = "show";
var EVENT_MOUSEDOWN = `mousedown.bs.${NAME7}`;
var Default5 = {
  className: "modal-backdrop",
  clickCallback: null,
  isAnimated: false,
  isVisible: true,
  // if false, we use the backdrop helper without adding any element to the dom
  rootElement: "body"
  // give the choice to place backdrop under different elements
};
var DefaultType5 = {
  className: "string",
  clickCallback: "(function|null)",
  isAnimated: "boolean",
  isVisible: "boolean",
  rootElement: "(element|string)"
};
var Backdrop = class extends config_default {
  constructor(config) {
    super();
    this._config = this._getConfig(config);
    this._isAppended = false;
    this._element = null;
  }
  // Getters
  static get Default() {
    return Default5;
  }
  static get DefaultType() {
    return DefaultType5;
  }
  static get NAME() {
    return NAME7;
  }
  // Public
  show(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }
    this._append();
    const element = this._getElement();
    if (this._config.isAnimated) {
      reflow(element);
    }
    element.classList.add(CLASS_NAME_SHOW4);
    this._emulateAnimation(() => {
      execute(callback);
    });
  }
  hide(callback) {
    if (!this._config.isVisible) {
      execute(callback);
      return;
    }
    this._getElement().classList.remove(CLASS_NAME_SHOW4);
    this._emulateAnimation(() => {
      this.dispose();
      execute(callback);
    });
  }
  dispose() {
    if (!this._isAppended) {
      return;
    }
    event_handler_default.off(this._element, EVENT_MOUSEDOWN);
    this._element.remove();
    this._isAppended = false;
  }
  // Private
  _getElement() {
    if (!this._element) {
      const backdrop = document.createElement("div");
      backdrop.className = this._config.className;
      if (this._config.isAnimated) {
        backdrop.classList.add(CLASS_NAME_FADE2);
      }
      this._element = backdrop;
    }
    return this._element;
  }
  _configAfterMerge(config) {
    config.rootElement = getElement(config.rootElement);
    return config;
  }
  _append() {
    if (this._isAppended) {
      return;
    }
    const element = this._getElement();
    this._config.rootElement.append(element);
    event_handler_default.on(element, EVENT_MOUSEDOWN, () => {
      execute(this._config.clickCallback);
    });
    this._isAppended = true;
  }
  _emulateAnimation(callback) {
    executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
  }
};
var backdrop_default = Backdrop;

// src/util/focustrap.js
var NAME8 = "focustrap";
var DATA_KEY6 = "bs.focustrap";
var EVENT_KEY7 = `.${DATA_KEY6}`;
var EVENT_FOCUSIN = `focusin${EVENT_KEY7}`;
var EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY7}`;
var TAB_KEY2 = "Tab";
var TAB_NAV_FORWARD = "forward";
var TAB_NAV_BACKWARD = "backward";
var Default6 = {
  autofocus: true,
  trapElement: null
  // The element to trap focus inside of
};
var DefaultType6 = {
  autofocus: "boolean",
  trapElement: "element"
};
var FocusTrap = class extends config_default {
  constructor(config) {
    super();
    this._config = this._getConfig(config);
    this._isActive = false;
    this._lastTabNavDirection = null;
  }
  // Getters
  static get Default() {
    return Default6;
  }
  static get DefaultType() {
    return DefaultType6;
  }
  static get NAME() {
    return NAME8;
  }
  // Public
  activate() {
    if (this._isActive) {
      return;
    }
    if (this._config.autofocus) {
      this._config.trapElement.focus();
    }
    event_handler_default.off(document, EVENT_KEY7);
    event_handler_default.on(document, EVENT_FOCUSIN, (event) => this._handleFocusin(event));
    event_handler_default.on(document, EVENT_KEYDOWN_TAB, (event) => this._handleKeydown(event));
    this._isActive = true;
  }
  deactivate() {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    event_handler_default.off(document, EVENT_KEY7);
  }
  // Private
  _handleFocusin(event) {
    const { trapElement } = this._config;
    if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
      return;
    }
    const elements = selector_engine_default.focusableChildren(trapElement);
    if (elements.length === 0) {
      trapElement.focus();
    } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
      elements[elements.length - 1].focus();
    } else {
      elements[0].focus();
    }
  }
  _handleKeydown(event) {
    if (event.key !== TAB_KEY2) {
      return;
    }
    this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
  }
};
var focustrap_default = FocusTrap;

// src/util/scrollbar.js
var SELECTOR_FIXED_CONTENT = ".fixed-top, .fixed-bottom, .is-fixed, .sticky-top";
var SELECTOR_STICKY_CONTENT = ".sticky-top";
var PROPERTY_PADDING = "padding-right";
var PROPERTY_MARGIN = "margin-right";
var ScrollBarHelper = class {
  constructor() {
    this._element = document.body;
  }
  // Public
  getWidth() {
    const documentWidth = document.documentElement.clientWidth;
    return Math.abs(window.innerWidth - documentWidth);
  }
  hide() {
    const width = this.getWidth();
    this._disableOverFlow();
    this._setElementAttributes(this._element, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
    this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, (calculatedValue) => calculatedValue + width);
    this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, (calculatedValue) => calculatedValue - width);
  }
  reset() {
    this._resetElementAttributes(this._element, "overflow");
    this._resetElementAttributes(this._element, PROPERTY_PADDING);
    this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
    this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
  }
  isOverflowing() {
    return this.getWidth() > 0;
  }
  // Private
  _disableOverFlow() {
    this._saveInitialAttribute(this._element, "overflow");
    this._element.style.overflow = "hidden";
  }
  _setElementAttributes(selector, styleProperty, callback) {
    const scrollbarWidth = this.getWidth();
    const manipulationCallBack = (element) => {
      if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
        return;
      }
      this._saveInitialAttribute(element, styleProperty);
      const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
      element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
    };
    this._applyManipulationCallback(selector, manipulationCallBack);
  }
  _saveInitialAttribute(element, styleProperty) {
    const actualValue = element.style.getPropertyValue(styleProperty);
    if (actualValue) {
      manipulator_default.setDataAttribute(element, styleProperty, actualValue);
    }
  }
  _resetElementAttributes(selector, styleProperty) {
    const manipulationCallBack = (element) => {
      const value = manipulator_default.getDataAttribute(element, styleProperty);
      if (value === null) {
        element.style.removeProperty(styleProperty);
        return;
      }
      manipulator_default.removeDataAttribute(element, styleProperty);
      element.style.setProperty(styleProperty, value);
    };
    this._applyManipulationCallback(selector, manipulationCallBack);
  }
  _applyManipulationCallback(selector, callBack) {
    if (isElement(selector)) {
      callBack(selector);
      return;
    }
    for (const sel of selector_engine_default.find(selector, this._element)) {
      callBack(sel);
    }
  }
};
var scrollbar_default = ScrollBarHelper;

// src/modal.js
var NAME9 = "modal";
var DATA_KEY7 = "bs.modal";
var EVENT_KEY8 = `.${DATA_KEY7}`;
var DATA_API_KEY5 = ".data-api";
var ESCAPE_KEY2 = "Escape";
var EVENT_HIDE3 = `hide${EVENT_KEY8}`;
var EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY8}`;
var EVENT_HIDDEN3 = `hidden${EVENT_KEY8}`;
var EVENT_SHOW3 = `show${EVENT_KEY8}`;
var EVENT_SHOWN3 = `shown${EVENT_KEY8}`;
var EVENT_RESIZE = `resize${EVENT_KEY8}`;
var EVENT_CLICK_DISMISS = `click.dismiss${EVENT_KEY8}`;
var EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY8}`;
var EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY8}`;
var EVENT_CLICK_DATA_API5 = `click${EVENT_KEY8}${DATA_API_KEY5}`;
var CLASS_NAME_OPEN = "modal-open";
var CLASS_NAME_FADE3 = "fade";
var CLASS_NAME_SHOW5 = "show";
var CLASS_NAME_STATIC = "modal-static";
var OPEN_SELECTOR = ".modal.show";
var SELECTOR_DIALOG = ".modal-dialog";
var SELECTOR_MODAL_BODY = ".modal-body";
var SELECTOR_DATA_TOGGLE4 = '[data-bs-toggle="modal"]';
var Default7 = {
  backdrop: true,
  focus: true,
  keyboard: true
};
var DefaultType7 = {
  backdrop: "(boolean|string)",
  focus: "boolean",
  keyboard: "boolean"
};
var Modal = class _Modal extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._dialog = selector_engine_default.findOne(SELECTOR_DIALOG, this._element);
    this._backdrop = this._initializeBackDrop();
    this._focustrap = this._initializeFocusTrap();
    this._isShown = false;
    this._isTransitioning = false;
    this._scrollBar = new scrollbar_default();
    this._addEventListeners();
  }
  // Getters
  static get Default() {
    return Default7;
  }
  static get DefaultType() {
    return DefaultType7;
  }
  static get NAME() {
    return NAME9;
  }
  // Public
  toggle(relatedTarget) {
    return this._isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget) {
    if (this._isShown || this._isTransitioning) {
      return;
    }
    const showEvent = event_handler_default.trigger(this._element, EVENT_SHOW3, {
      relatedTarget
    });
    if (showEvent.defaultPrevented) {
      return;
    }
    this._isShown = true;
    this._isTransitioning = true;
    this._scrollBar.hide();
    document.body.classList.add(CLASS_NAME_OPEN);
    this._adjustDialog();
    this._backdrop.show(() => this._showElement(relatedTarget));
  }
  hide() {
    if (!this._isShown || this._isTransitioning) {
      return;
    }
    const hideEvent = event_handler_default.trigger(this._element, EVENT_HIDE3);
    if (hideEvent.defaultPrevented) {
      return;
    }
    this._isShown = false;
    this._isTransitioning = true;
    this._focustrap.deactivate();
    this._element.classList.remove(CLASS_NAME_SHOW5);
    this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
  }
  dispose() {
    event_handler_default.off(window, EVENT_KEY8);
    event_handler_default.off(this._dialog, EVENT_KEY8);
    this._backdrop.dispose();
    this._focustrap.deactivate();
    super.dispose();
  }
  handleUpdate() {
    this._adjustDialog();
  }
  // Private
  _initializeBackDrop() {
    return new backdrop_default({
      isVisible: Boolean(this._config.backdrop),
      // 'static' option will be translated to true, and booleans will keep their value,
      isAnimated: this._isAnimated()
    });
  }
  _initializeFocusTrap() {
    return new focustrap_default({
      trapElement: this._element
    });
  }
  _showElement(relatedTarget) {
    if (!document.body.contains(this._element)) {
      document.body.append(this._element);
    }
    this._element.style.display = "block";
    this._element.removeAttribute("aria-hidden");
    this._element.setAttribute("aria-modal", true);
    this._element.setAttribute("role", "dialog");
    this._element.scrollTop = 0;
    const modalBody = selector_engine_default.findOne(SELECTOR_MODAL_BODY, this._dialog);
    if (modalBody) {
      modalBody.scrollTop = 0;
    }
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_SHOW5);
    const transitionComplete = () => {
      if (this._config.focus) {
        this._focustrap.activate();
      }
      this._isTransitioning = false;
      event_handler_default.trigger(this._element, EVENT_SHOWN3, {
        relatedTarget
      });
    };
    this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
  }
  _addEventListeners() {
    event_handler_default.on(this._element, EVENT_KEYDOWN_DISMISS, (event) => {
      if (event.key !== ESCAPE_KEY2) {
        return;
      }
      if (this._config.keyboard) {
        this.hide();
        return;
      }
      this._triggerBackdropTransition();
    });
    event_handler_default.on(window, EVENT_RESIZE, () => {
      if (this._isShown && !this._isTransitioning) {
        this._adjustDialog();
      }
    });
    event_handler_default.on(this._element, EVENT_MOUSEDOWN_DISMISS, (event) => {
      event_handler_default.one(this._element, EVENT_CLICK_DISMISS, (event2) => {
        if (this._element !== event.target || this._element !== event2.target) {
          return;
        }
        if (this._config.backdrop === "static") {
          this._triggerBackdropTransition();
          return;
        }
        if (this._config.backdrop) {
          this.hide();
        }
      });
    });
  }
  _hideModal() {
    this._element.style.display = "none";
    this._element.setAttribute("aria-hidden", true);
    this._element.removeAttribute("aria-modal");
    this._element.removeAttribute("role");
    this._isTransitioning = false;
    this._backdrop.hide(() => {
      document.body.classList.remove(CLASS_NAME_OPEN);
      this._resetAdjustments();
      this._scrollBar.reset();
      event_handler_default.trigger(this._element, EVENT_HIDDEN3);
    });
  }
  _isAnimated() {
    return this._element.classList.contains(CLASS_NAME_FADE3);
  }
  _triggerBackdropTransition() {
    const hideEvent = event_handler_default.trigger(this._element, EVENT_HIDE_PREVENTED);
    if (hideEvent.defaultPrevented) {
      return;
    }
    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
    const initialOverflowY = this._element.style.overflowY;
    if (initialOverflowY === "hidden" || this._element.classList.contains(CLASS_NAME_STATIC)) {
      return;
    }
    if (!isModalOverflowing) {
      this._element.style.overflowY = "hidden";
    }
    this._element.classList.add(CLASS_NAME_STATIC);
    this._queueCallback(() => {
      this._element.classList.remove(CLASS_NAME_STATIC);
      this._queueCallback(() => {
        this._element.style.overflowY = initialOverflowY;
      }, this._dialog);
    }, this._dialog);
    this._element.focus();
  }
  /**
   * The following methods are used to handle overflowing modals
   */
  _adjustDialog() {
    const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
    const scrollbarWidth = this._scrollBar.getWidth();
    const isBodyOverflowing = scrollbarWidth > 0;
    if (isBodyOverflowing && !isModalOverflowing) {
      const property = isRTL() ? "paddingLeft" : "paddingRight";
      this._element.style[property] = `${scrollbarWidth}px`;
    }
    if (!isBodyOverflowing && isModalOverflowing) {
      const property = isRTL() ? "paddingRight" : "paddingLeft";
      this._element.style[property] = `${scrollbarWidth}px`;
    }
  }
  _resetAdjustments() {
    this._element.style.paddingLeft = "";
    this._element.style.paddingRight = "";
  }
  // Static
  static jQueryInterface(config, relatedTarget) {
    return this.each(function() {
      const data = _Modal.getOrCreateInstance(this, config);
      if (typeof config !== "string") {
        return;
      }
      if (typeof data[config] === "undefined") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config](relatedTarget);
    });
  }
};
event_handler_default.on(document, EVENT_CLICK_DATA_API5, SELECTOR_DATA_TOGGLE4, function(event) {
  const target = selector_engine_default.getElementFromSelector(this);
  if (["A", "AREA"].includes(this.tagName)) {
    event.preventDefault();
  }
  event_handler_default.one(target, EVENT_SHOW3, (showEvent) => {
    if (showEvent.defaultPrevented) {
      return;
    }
    event_handler_default.one(target, EVENT_HIDDEN3, () => {
      if (isVisible(this)) {
        this.focus();
      }
    });
  });
  const alreadyOpen = selector_engine_default.findOne(OPEN_SELECTOR);
  if (alreadyOpen) {
    Modal.getInstance(alreadyOpen).hide();
  }
  const data = Modal.getOrCreateInstance(target);
  data.toggle(this);
});
enableDismissTrigger(Modal);
defineJQueryPlugin(Modal);
var modal_default = Modal;

// src/offcanvas.js
var NAME10 = "offcanvas";
var DATA_KEY8 = "bs.offcanvas";
var EVENT_KEY9 = `.${DATA_KEY8}`;
var DATA_API_KEY6 = ".data-api";
var EVENT_LOAD_DATA_API2 = `load${EVENT_KEY9}${DATA_API_KEY6}`;
var ESCAPE_KEY3 = "Escape";
var CLASS_NAME_SHOW6 = "show";
var CLASS_NAME_SHOWING = "showing";
var CLASS_NAME_HIDING = "hiding";
var CLASS_NAME_BACKDROP = "offcanvas-backdrop";
var OPEN_SELECTOR2 = ".offcanvas.show";
var EVENT_SHOW4 = `show${EVENT_KEY9}`;
var EVENT_SHOWN4 = `shown${EVENT_KEY9}`;
var EVENT_HIDE4 = `hide${EVENT_KEY9}`;
var EVENT_HIDE_PREVENTED2 = `hidePrevented${EVENT_KEY9}`;
var EVENT_HIDDEN4 = `hidden${EVENT_KEY9}`;
var EVENT_RESIZE2 = `resize${EVENT_KEY9}`;
var EVENT_CLICK_DATA_API6 = `click${EVENT_KEY9}${DATA_API_KEY6}`;
var EVENT_KEYDOWN_DISMISS2 = `keydown.dismiss${EVENT_KEY9}`;
var SELECTOR_DATA_TOGGLE5 = '[data-bs-toggle="offcanvas"]';
var Default8 = {
  backdrop: true,
  keyboard: true,
  scroll: false
};
var DefaultType8 = {
  backdrop: "(boolean|string)",
  keyboard: "boolean",
  scroll: "boolean"
};
var Offcanvas = class _Offcanvas extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._isShown = false;
    this._backdrop = this._initializeBackDrop();
    this._focustrap = this._initializeFocusTrap();
    this._addEventListeners();
  }
  // Getters
  static get Default() {
    return Default8;
  }
  static get DefaultType() {
    return DefaultType8;
  }
  static get NAME() {
    return NAME10;
  }
  // Public
  toggle(relatedTarget) {
    return this._isShown ? this.hide() : this.show(relatedTarget);
  }
  show(relatedTarget) {
    if (this._isShown) {
      return;
    }
    const showEvent = event_handler_default.trigger(this._element, EVENT_SHOW4, { relatedTarget });
    if (showEvent.defaultPrevented) {
      return;
    }
    this._isShown = true;
    this._backdrop.show();
    if (!this._config.scroll) {
      new scrollbar_default().hide();
    }
    this._element.setAttribute("aria-modal", true);
    this._element.setAttribute("role", "dialog");
    this._element.classList.add(CLASS_NAME_SHOWING);
    const completeCallBack = () => {
      if (!this._config.scroll || this._config.backdrop) {
        this._focustrap.activate();
      }
      this._element.classList.add(CLASS_NAME_SHOW6);
      this._element.classList.remove(CLASS_NAME_SHOWING);
      event_handler_default.trigger(this._element, EVENT_SHOWN4, { relatedTarget });
    };
    this._queueCallback(completeCallBack, this._element, true);
  }
  hide() {
    if (!this._isShown) {
      return;
    }
    const hideEvent = event_handler_default.trigger(this._element, EVENT_HIDE4);
    if (hideEvent.defaultPrevented) {
      return;
    }
    this._focustrap.deactivate();
    this._element.blur();
    this._isShown = false;
    this._element.classList.add(CLASS_NAME_HIDING);
    this._backdrop.hide();
    const completeCallback = () => {
      this._element.classList.remove(CLASS_NAME_SHOW6, CLASS_NAME_HIDING);
      this._element.removeAttribute("aria-modal");
      this._element.removeAttribute("role");
      if (!this._config.scroll) {
        new scrollbar_default().reset();
      }
      event_handler_default.trigger(this._element, EVENT_HIDDEN4);
    };
    this._queueCallback(completeCallback, this._element, true);
  }
  dispose() {
    this._backdrop.dispose();
    this._focustrap.deactivate();
    super.dispose();
  }
  // Private
  _initializeBackDrop() {
    const clickCallback = () => {
      if (this._config.backdrop === "static") {
        event_handler_default.trigger(this._element, EVENT_HIDE_PREVENTED2);
        return;
      }
      this.hide();
    };
    const isVisible2 = Boolean(this._config.backdrop);
    return new backdrop_default({
      className: CLASS_NAME_BACKDROP,
      isVisible: isVisible2,
      isAnimated: true,
      rootElement: this._element.parentNode,
      clickCallback: isVisible2 ? clickCallback : null
    });
  }
  _initializeFocusTrap() {
    return new focustrap_default({
      trapElement: this._element
    });
  }
  _addEventListeners() {
    event_handler_default.on(this._element, EVENT_KEYDOWN_DISMISS2, (event) => {
      if (event.key !== ESCAPE_KEY3) {
        return;
      }
      if (this._config.keyboard) {
        this.hide();
        return;
      }
      event_handler_default.trigger(this._element, EVENT_HIDE_PREVENTED2);
    });
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Offcanvas.getOrCreateInstance(this, config);
      if (typeof config !== "string") {
        return;
      }
      if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config](this);
    });
  }
};
event_handler_default.on(document, EVENT_CLICK_DATA_API6, SELECTOR_DATA_TOGGLE5, function(event) {
  const target = selector_engine_default.getElementFromSelector(this);
  if (["A", "AREA"].includes(this.tagName)) {
    event.preventDefault();
  }
  if (isDisabled(this)) {
    return;
  }
  event_handler_default.one(target, EVENT_HIDDEN4, () => {
    if (isVisible(this)) {
      this.focus();
    }
  });
  const alreadyOpen = selector_engine_default.findOne(OPEN_SELECTOR2);
  if (alreadyOpen && alreadyOpen !== target) {
    Offcanvas.getInstance(alreadyOpen).hide();
  }
  const data = Offcanvas.getOrCreateInstance(target);
  data.toggle(this);
});
event_handler_default.on(window, EVENT_LOAD_DATA_API2, () => {
  for (const selector of selector_engine_default.find(OPEN_SELECTOR2)) {
    Offcanvas.getOrCreateInstance(selector).show();
  }
});
event_handler_default.on(window, EVENT_RESIZE2, () => {
  for (const element of selector_engine_default.find("[aria-modal][class*=show][class*=offcanvas-]")) {
    if (getComputedStyle(element).position !== "fixed") {
      Offcanvas.getOrCreateInstance(element).hide();
    }
  }
});
enableDismissTrigger(Offcanvas);
defineJQueryPlugin(Offcanvas);
var offcanvas_default = Offcanvas;

// src/tooltip.js
import * as Popper2 from "@popperjs/core";

// src/util/sanitizer.js
var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
var DefaultAllowlist = {
  // Global attributes allowed on any supplied element below.
  "*": ["class", "dir", "id", "lang", "role", ARIA_ATTRIBUTE_PATTERN],
  a: ["target", "href", "title", "rel"],
  area: [],
  b: [],
  br: [],
  col: [],
  code: [],
  dd: [],
  div: [],
  dl: [],
  dt: [],
  em: [],
  hr: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  h5: [],
  h6: [],
  i: [],
  img: ["src", "srcset", "alt", "title", "width", "height"],
  li: [],
  ol: [],
  p: [],
  pre: [],
  s: [],
  small: [],
  span: [],
  sub: [],
  sup: [],
  strong: [],
  u: [],
  ul: []
};
var uriAttributes = /* @__PURE__ */ new Set([
  "background",
  "cite",
  "href",
  "itemtype",
  "longdesc",
  "poster",
  "src",
  "xlink:href"
]);
var SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:/?#]*(?:[/?#]|$))/i;
var allowedAttribute = (attribute, allowedAttributeList) => {
  const attributeName = attribute.nodeName.toLowerCase();
  if (allowedAttributeList.includes(attributeName)) {
    if (uriAttributes.has(attributeName)) {
      return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue));
    }
    return true;
  }
  return allowedAttributeList.filter((attributeRegex) => attributeRegex instanceof RegExp).some((regex) => regex.test(attributeName));
};
function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
  if (!unsafeHtml.length) {
    return unsafeHtml;
  }
  if (sanitizeFunction && typeof sanitizeFunction === "function") {
    return sanitizeFunction(unsafeHtml);
  }
  const domParser = new window.DOMParser();
  const createdDocument = domParser.parseFromString(unsafeHtml, "text/html");
  const elements = [].concat(...createdDocument.body.querySelectorAll("*"));
  for (const element of elements) {
    const elementName = element.nodeName.toLowerCase();
    if (!Object.keys(allowList).includes(elementName)) {
      element.remove();
      continue;
    }
    const attributeList = [].concat(...element.attributes);
    const allowedAttributes = [].concat(allowList["*"] || [], allowList[elementName] || []);
    for (const attribute of attributeList) {
      if (!allowedAttribute(attribute, allowedAttributes)) {
        element.removeAttribute(attribute.nodeName);
      }
    }
  }
  return createdDocument.body.innerHTML;
}

// src/util/template-factory.js
var NAME11 = "TemplateFactory";
var Default9 = {
  allowList: DefaultAllowlist,
  content: {},
  // { selector : text ,  selector2 : text2 , }
  extraClass: "",
  html: false,
  sanitize: true,
  sanitizeFn: null,
  template: "<div></div>"
};
var DefaultType9 = {
  allowList: "object",
  content: "object",
  extraClass: "(string|function)",
  html: "boolean",
  sanitize: "boolean",
  sanitizeFn: "(null|function)",
  template: "string"
};
var DefaultContentType = {
  entry: "(string|element|function|null)",
  selector: "(string|element)"
};
var TemplateFactory = class extends config_default {
  constructor(config) {
    super();
    this._config = this._getConfig(config);
  }
  // Getters
  static get Default() {
    return Default9;
  }
  static get DefaultType() {
    return DefaultType9;
  }
  static get NAME() {
    return NAME11;
  }
  // Public
  getContent() {
    return Object.values(this._config.content).map((config) => this._resolvePossibleFunction(config)).filter(Boolean);
  }
  hasContent() {
    return this.getContent().length > 0;
  }
  changeContent(content) {
    this._checkContent(content);
    this._config.content = { ...this._config.content, ...content };
    return this;
  }
  toHtml() {
    const templateWrapper = document.createElement("div");
    templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
    for (const [selector, text] of Object.entries(this._config.content)) {
      this._setContent(templateWrapper, text, selector);
    }
    const template = templateWrapper.children[0];
    const extraClass = this._resolvePossibleFunction(this._config.extraClass);
    if (extraClass) {
      template.classList.add(...extraClass.split(" "));
    }
    return template;
  }
  // Private
  _typeCheckConfig(config) {
    super._typeCheckConfig(config);
    this._checkContent(config.content);
  }
  _checkContent(arg) {
    for (const [selector, content] of Object.entries(arg)) {
      super._typeCheckConfig({ selector, entry: content }, DefaultContentType);
    }
  }
  _setContent(template, content, selector) {
    const templateElement = selector_engine_default.findOne(selector, template);
    if (!templateElement) {
      return;
    }
    content = this._resolvePossibleFunction(content);
    if (!content) {
      templateElement.remove();
      return;
    }
    if (isElement(content)) {
      this._putElementInTemplate(getElement(content), templateElement);
      return;
    }
    if (this._config.html) {
      templateElement.innerHTML = this._maybeSanitize(content);
      return;
    }
    templateElement.textContent = content;
  }
  _maybeSanitize(arg) {
    return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
  }
  _resolvePossibleFunction(arg) {
    return execute(arg, [void 0, this]);
  }
  _putElementInTemplate(element, templateElement) {
    if (this._config.html) {
      templateElement.innerHTML = "";
      templateElement.append(element);
      return;
    }
    templateElement.textContent = element.textContent;
  }
};
var template_factory_default = TemplateFactory;

// src/tooltip.js
var NAME12 = "tooltip";
var DISALLOWED_ATTRIBUTES = /* @__PURE__ */ new Set(["sanitize", "allowList", "sanitizeFn"]);
var CLASS_NAME_FADE4 = "fade";
var CLASS_NAME_MODAL = "modal";
var CLASS_NAME_SHOW7 = "show";
var SELECTOR_TOOLTIP_INNER = ".tooltip-inner";
var SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
var EVENT_MODAL_HIDE = "hide.bs.modal";
var TRIGGER_HOVER = "hover";
var TRIGGER_FOCUS = "focus";
var TRIGGER_CLICK = "click";
var TRIGGER_MANUAL = "manual";
var EVENT_HIDE5 = "hide";
var EVENT_HIDDEN5 = "hidden";
var EVENT_SHOW5 = "show";
var EVENT_SHOWN5 = "shown";
var EVENT_INSERTED = "inserted";
var EVENT_CLICK = "click";
var EVENT_FOCUSIN2 = "focusin";
var EVENT_FOCUSOUT = "focusout";
var EVENT_MOUSEENTER2 = "mouseenter";
var EVENT_MOUSELEAVE2 = "mouseleave";
var AttachmentMap = {
  AUTO: "auto",
  TOP: "top",
  RIGHT: isRTL() ? "left" : "right",
  BOTTOM: "bottom",
  LEFT: isRTL() ? "right" : "left"
};
var Default10 = {
  allowList: DefaultAllowlist,
  animation: true,
  boundary: "clippingParents",
  container: false,
  customClass: "",
  delay: 0,
  fallbackPlacements: ["top", "right", "bottom", "left"],
  html: false,
  offset: [0, 6],
  placement: "top",
  popperConfig: null,
  sanitize: true,
  sanitizeFn: null,
  selector: false,
  template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
  title: "",
  trigger: "hover focus"
};
var DefaultType10 = {
  allowList: "object",
  animation: "boolean",
  boundary: "(string|element)",
  container: "(string|element|boolean)",
  customClass: "(string|function)",
  delay: "(number|object)",
  fallbackPlacements: "array",
  html: "boolean",
  offset: "(array|string|function)",
  placement: "(string|function)",
  popperConfig: "(null|object|function)",
  sanitize: "boolean",
  sanitizeFn: "(null|function)",
  selector: "(string|boolean)",
  template: "string",
  title: "(string|element|function)",
  trigger: "string"
};
var Tooltip = class _Tooltip extends base_component_default {
  constructor(element, config) {
    if (typeof Popper2 === "undefined") {
      throw new TypeError("Bootstrap's tooltips require Popper (https://popper.js.org/docs/v2/)");
    }
    super(element, config);
    this._isEnabled = true;
    this._timeout = 0;
    this._isHovered = null;
    this._activeTrigger = {};
    this._popper = null;
    this._templateFactory = null;
    this._newContent = null;
    this.tip = null;
    this._setListeners();
    if (!this._config.selector) {
      this._fixTitle();
    }
  }
  // Getters
  static get Default() {
    return Default10;
  }
  static get DefaultType() {
    return DefaultType10;
  }
  static get NAME() {
    return NAME12;
  }
  // Public
  enable() {
    this._isEnabled = true;
  }
  disable() {
    this._isEnabled = false;
  }
  toggleEnabled() {
    this._isEnabled = !this._isEnabled;
  }
  toggle() {
    if (!this._isEnabled) {
      return;
    }
    if (this._isShown()) {
      this._leave();
      return;
    }
    this._enter();
  }
  dispose() {
    clearTimeout(this._timeout);
    event_handler_default.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
    if (this._element.getAttribute("data-bs-original-title")) {
      this._element.setAttribute("title", this._element.getAttribute("data-bs-original-title"));
    }
    this._disposePopper();
    super.dispose();
  }
  show() {
    if (this._element.style.display === "none") {
      throw new Error("Please use show on visible elements");
    }
    if (!(this._isWithContent() && this._isEnabled)) {
      return;
    }
    const showEvent = event_handler_default.trigger(this._element, this.constructor.eventName(EVENT_SHOW5));
    const shadowRoot = findShadowRoot(this._element);
    const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
    if (showEvent.defaultPrevented || !isInTheDom) {
      return;
    }
    this._disposePopper();
    const tip = this._getTipElement();
    this._element.setAttribute("aria-describedby", tip.getAttribute("id"));
    const { container } = this._config;
    if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
      container.append(tip);
      event_handler_default.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
    }
    this._popper = this._createPopper(tip);
    tip.classList.add(CLASS_NAME_SHOW7);
    if ("ontouchstart" in document.documentElement) {
      for (const element of [].concat(...document.body.children)) {
        event_handler_default.on(element, "mouseover", noop);
      }
    }
    const complete = () => {
      event_handler_default.trigger(this._element, this.constructor.eventName(EVENT_SHOWN5));
      if (this._isHovered === false) {
        this._leave();
      }
      this._isHovered = false;
    };
    this._queueCallback(complete, this.tip, this._isAnimated());
  }
  hide() {
    if (!this._isShown()) {
      return;
    }
    const hideEvent = event_handler_default.trigger(this._element, this.constructor.eventName(EVENT_HIDE5));
    if (hideEvent.defaultPrevented) {
      return;
    }
    const tip = this._getTipElement();
    tip.classList.remove(CLASS_NAME_SHOW7);
    if ("ontouchstart" in document.documentElement) {
      for (const element of [].concat(...document.body.children)) {
        event_handler_default.off(element, "mouseover", noop);
      }
    }
    this._activeTrigger[TRIGGER_CLICK] = false;
    this._activeTrigger[TRIGGER_FOCUS] = false;
    this._activeTrigger[TRIGGER_HOVER] = false;
    this._isHovered = null;
    const complete = () => {
      if (this._isWithActiveTrigger()) {
        return;
      }
      if (!this._isHovered) {
        this._disposePopper();
      }
      this._element.removeAttribute("aria-describedby");
      event_handler_default.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN5));
    };
    this._queueCallback(complete, this.tip, this._isAnimated());
  }
  update() {
    if (this._popper) {
      this._popper.update();
    }
  }
  // Protected
  _isWithContent() {
    return Boolean(this._getTitle());
  }
  _getTipElement() {
    if (!this.tip) {
      this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
    }
    return this.tip;
  }
  _createTipElement(content) {
    const tip = this._getTemplateFactory(content).toHtml();
    if (!tip) {
      return null;
    }
    tip.classList.remove(CLASS_NAME_FADE4, CLASS_NAME_SHOW7);
    tip.classList.add(`bs-${this.constructor.NAME}-auto`);
    const tipId = getUID(this.constructor.NAME).toString();
    tip.setAttribute("id", tipId);
    if (this._isAnimated()) {
      tip.classList.add(CLASS_NAME_FADE4);
    }
    return tip;
  }
  setContent(content) {
    this._newContent = content;
    if (this._isShown()) {
      this._disposePopper();
      this.show();
    }
  }
  _getTemplateFactory(content) {
    if (this._templateFactory) {
      this._templateFactory.changeContent(content);
    } else {
      this._templateFactory = new template_factory_default({
        ...this._config,
        // the `content` var has to be after `this._config`
        // to override config.content in case of popover
        content,
        extraClass: this._resolvePossibleFunction(this._config.customClass)
      });
    }
    return this._templateFactory;
  }
  _getContentForTemplate() {
    return {
      [SELECTOR_TOOLTIP_INNER]: this._getTitle()
    };
  }
  _getTitle() {
    return this._resolvePossibleFunction(this._config.title) || this._element.getAttribute("data-bs-original-title");
  }
  // Private
  _initializeOnDelegatedTarget(event) {
    return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
  }
  _isAnimated() {
    return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE4);
  }
  _isShown() {
    return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW7);
  }
  _createPopper(tip) {
    const placement = execute(this._config.placement, [this, tip, this._element]);
    const attachment = AttachmentMap[placement.toUpperCase()];
    return Popper2.createPopper(this._element, tip, this._getPopperConfig(attachment));
  }
  _getOffset() {
    const { offset } = this._config;
    if (typeof offset === "string") {
      return offset.split(",").map((value) => Number.parseInt(value, 10));
    }
    if (typeof offset === "function") {
      return (popperData) => offset(popperData, this._element);
    }
    return offset;
  }
  _resolvePossibleFunction(arg) {
    return execute(arg, [this._element, this._element]);
  }
  _getPopperConfig(attachment) {
    const defaultBsPopperConfig = {
      placement: attachment,
      modifiers: [
        {
          name: "flip",
          options: {
            fallbackPlacements: this._config.fallbackPlacements
          }
        },
        {
          name: "offset",
          options: {
            offset: this._getOffset()
          }
        },
        {
          name: "preventOverflow",
          options: {
            boundary: this._config.boundary
          }
        },
        {
          name: "arrow",
          options: {
            element: `.${this.constructor.NAME}-arrow`
          }
        },
        {
          name: "preSetPlacement",
          enabled: true,
          phase: "beforeMain",
          fn: (data) => {
            this._getTipElement().setAttribute("data-popper-placement", data.state.placement);
          }
        }
      ]
    };
    return {
      ...defaultBsPopperConfig,
      ...execute(this._config.popperConfig, [void 0, defaultBsPopperConfig])
    };
  }
  _setListeners() {
    const triggers = this._config.trigger.split(" ");
    for (const trigger of triggers) {
      if (trigger === "click") {
        event_handler_default.on(this._element, this.constructor.eventName(EVENT_CLICK), this._config.selector, (event) => {
          const context = this._initializeOnDelegatedTarget(event);
          context._activeTrigger[TRIGGER_CLICK] = !(context._isShown() && context._activeTrigger[TRIGGER_CLICK]);
          context.toggle();
        });
      } else if (trigger !== TRIGGER_MANUAL) {
        const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER2) : this.constructor.eventName(EVENT_FOCUSIN2);
        const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE2) : this.constructor.eventName(EVENT_FOCUSOUT);
        event_handler_default.on(this._element, eventIn, this._config.selector, (event) => {
          const context = this._initializeOnDelegatedTarget(event);
          context._activeTrigger[event.type === "focusin" ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
          context._enter();
        });
        event_handler_default.on(this._element, eventOut, this._config.selector, (event) => {
          const context = this._initializeOnDelegatedTarget(event);
          context._activeTrigger[event.type === "focusout" ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
          context._leave();
        });
      }
    }
    this._hideModalHandler = () => {
      if (this._element) {
        this.hide();
      }
    };
    event_handler_default.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
  }
  _fixTitle() {
    const title = this._element.getAttribute("title");
    if (!title) {
      return;
    }
    if (!this._element.getAttribute("aria-label") && !this._element.textContent.trim()) {
      this._element.setAttribute("aria-label", title);
    }
    this._element.setAttribute("data-bs-original-title", title);
    this._element.removeAttribute("title");
  }
  _enter() {
    if (this._isShown() || this._isHovered) {
      this._isHovered = true;
      return;
    }
    this._isHovered = true;
    this._setTimeout(() => {
      if (this._isHovered) {
        this.show();
      }
    }, this._config.delay.show);
  }
  _leave() {
    if (this._isWithActiveTrigger()) {
      return;
    }
    this._isHovered = false;
    this._setTimeout(() => {
      if (!this._isHovered) {
        this.hide();
      }
    }, this._config.delay.hide);
  }
  _setTimeout(handler, timeout) {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(handler, timeout);
  }
  _isWithActiveTrigger() {
    return Object.values(this._activeTrigger).includes(true);
  }
  _getConfig(config) {
    const dataAttributes = manipulator_default.getDataAttributes(this._element);
    for (const dataAttribute of Object.keys(dataAttributes)) {
      if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
        delete dataAttributes[dataAttribute];
      }
    }
    config = {
      ...dataAttributes,
      ...typeof config === "object" && config ? config : {}
    };
    config = this._mergeConfigObj(config);
    config = this._configAfterMerge(config);
    this._typeCheckConfig(config);
    return config;
  }
  _configAfterMerge(config) {
    config.container = config.container === false ? document.body : getElement(config.container);
    if (typeof config.delay === "number") {
      config.delay = {
        show: config.delay,
        hide: config.delay
      };
    }
    if (typeof config.title === "number") {
      config.title = config.title.toString();
    }
    if (typeof config.content === "number") {
      config.content = config.content.toString();
    }
    return config;
  }
  _getDelegateConfig() {
    const config = {};
    for (const [key, value] of Object.entries(this._config)) {
      if (this.constructor.Default[key] !== value) {
        config[key] = value;
      }
    }
    config.selector = false;
    config.trigger = "manual";
    return config;
  }
  _disposePopper() {
    if (this._popper) {
      this._popper.destroy();
      this._popper = null;
    }
    if (this.tip) {
      this.tip.remove();
      this.tip = null;
    }
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Tooltip.getOrCreateInstance(this, config);
      if (typeof config !== "string") {
        return;
      }
      if (typeof data[config] === "undefined") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config]();
    });
  }
};
defineJQueryPlugin(Tooltip);
var tooltip_default = Tooltip;

// src/popover.js
var NAME13 = "popover";
var SELECTOR_TITLE = ".popover-header";
var SELECTOR_CONTENT = ".popover-body";
var Default11 = {
  ...tooltip_default.Default,
  content: "",
  offset: [0, 8],
  placement: "right",
  template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>',
  trigger: "click"
};
var DefaultType11 = {
  ...tooltip_default.DefaultType,
  content: "(null|string|element|function)"
};
var Popover = class _Popover extends tooltip_default {
  // Getters
  static get Default() {
    return Default11;
  }
  static get DefaultType() {
    return DefaultType11;
  }
  static get NAME() {
    return NAME13;
  }
  // Overrides
  _isWithContent() {
    return this._getTitle() || this._getContent();
  }
  // Private
  _getContentForTemplate() {
    return {
      [SELECTOR_TITLE]: this._getTitle(),
      [SELECTOR_CONTENT]: this._getContent()
    };
  }
  _getContent() {
    return this._resolvePossibleFunction(this._config.content);
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Popover.getOrCreateInstance(this, config);
      if (typeof config !== "string") {
        return;
      }
      if (typeof data[config] === "undefined") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config]();
    });
  }
};
defineJQueryPlugin(Popover);
var popover_default = Popover;

// src/scrollspy.js
var NAME14 = "scrollspy";
var DATA_KEY9 = "bs.scrollspy";
var EVENT_KEY10 = `.${DATA_KEY9}`;
var DATA_API_KEY7 = ".data-api";
var EVENT_ACTIVATE = `activate${EVENT_KEY10}`;
var EVENT_CLICK2 = `click${EVENT_KEY10}`;
var EVENT_LOAD_DATA_API3 = `load${EVENT_KEY10}${DATA_API_KEY7}`;
var CLASS_NAME_DROPDOWN_ITEM = "dropdown-item";
var CLASS_NAME_ACTIVE3 = "active";
var SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
var SELECTOR_TARGET_LINKS = "[href]";
var SELECTOR_NAV_LIST_GROUP = ".nav, .list-group";
var SELECTOR_NAV_LINKS = ".nav-link";
var SELECTOR_NAV_ITEMS = ".nav-item";
var SELECTOR_LIST_ITEMS = ".list-group-item";
var SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
var SELECTOR_DROPDOWN = ".dropdown";
var SELECTOR_DROPDOWN_TOGGLE = ".dropdown-toggle";
var Default12 = {
  offset: null,
  // TODO: v6 @deprecated, keep it for backwards compatibility reasons
  rootMargin: "0px 0px -25%",
  smoothScroll: false,
  target: null,
  threshold: [0.1, 0.5, 1]
};
var DefaultType12 = {
  offset: "(number|null)",
  // TODO v6 @deprecated, keep it for backwards compatibility reasons
  rootMargin: "string",
  smoothScroll: "boolean",
  target: "element",
  threshold: "array"
};
var ScrollSpy = class _ScrollSpy extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._targetLinks = /* @__PURE__ */ new Map();
    this._observableSections = /* @__PURE__ */ new Map();
    this._rootElement = getComputedStyle(this._element).overflowY === "visible" ? null : this._element;
    this._activeTarget = null;
    this._observer = null;
    this._previousScrollData = {
      visibleEntryTop: 0,
      parentScrollTop: 0
    };
    this.refresh();
  }
  // Getters
  static get Default() {
    return Default12;
  }
  static get DefaultType() {
    return DefaultType12;
  }
  static get NAME() {
    return NAME14;
  }
  // Public
  refresh() {
    this._initializeTargetsAndObservables();
    this._maybeEnableSmoothScroll();
    if (this._observer) {
      this._observer.disconnect();
    } else {
      this._observer = this._getNewObserver();
    }
    for (const section of this._observableSections.values()) {
      this._observer.observe(section);
    }
  }
  dispose() {
    this._observer.disconnect();
    super.dispose();
  }
  // Private
  _configAfterMerge(config) {
    config.target = getElement(config.target) || document.body;
    config.rootMargin = config.offset ? `${config.offset}px 0px -30%` : config.rootMargin;
    if (typeof config.threshold === "string") {
      config.threshold = config.threshold.split(",").map((value) => Number.parseFloat(value));
    }
    return config;
  }
  _maybeEnableSmoothScroll() {
    if (!this._config.smoothScroll) {
      return;
    }
    event_handler_default.off(this._config.target, EVENT_CLICK2);
    event_handler_default.on(this._config.target, EVENT_CLICK2, SELECTOR_TARGET_LINKS, (event) => {
      const observableSection = this._observableSections.get(event.target.hash);
      if (observableSection) {
        event.preventDefault();
        const root = this._rootElement || window;
        const height = observableSection.offsetTop - this._element.offsetTop;
        if (root.scrollTo) {
          root.scrollTo({ top: height, behavior: "smooth" });
          return;
        }
        root.scrollTop = height;
      }
    });
  }
  _getNewObserver() {
    const options = {
      root: this._rootElement,
      threshold: this._config.threshold,
      rootMargin: this._config.rootMargin
    };
    return new IntersectionObserver((entries) => this._observerCallback(entries), options);
  }
  // The logic of selection
  _observerCallback(entries) {
    const targetElement = (entry) => this._targetLinks.get(`#${entry.target.id}`);
    const activate = (entry) => {
      this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
      this._process(targetElement(entry));
    };
    const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
    const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
    this._previousScrollData.parentScrollTop = parentScrollTop;
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        this._activeTarget = null;
        this._clearActiveClass(targetElement(entry));
        continue;
      }
      const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop;
      if (userScrollsDown && entryIsLowerThanPrevious) {
        activate(entry);
        if (!parentScrollTop) {
          return;
        }
        continue;
      }
      if (!userScrollsDown && !entryIsLowerThanPrevious) {
        activate(entry);
      }
    }
  }
  _initializeTargetsAndObservables() {
    this._targetLinks = /* @__PURE__ */ new Map();
    this._observableSections = /* @__PURE__ */ new Map();
    const targetLinks = selector_engine_default.find(SELECTOR_TARGET_LINKS, this._config.target);
    for (const anchor of targetLinks) {
      if (!anchor.hash || isDisabled(anchor)) {
        continue;
      }
      const observableSection = selector_engine_default.findOne(decodeURI(anchor.hash), this._element);
      if (isVisible(observableSection)) {
        this._targetLinks.set(decodeURI(anchor.hash), anchor);
        this._observableSections.set(anchor.hash, observableSection);
      }
    }
  }
  _process(target) {
    if (this._activeTarget === target) {
      return;
    }
    this._clearActiveClass(this._config.target);
    this._activeTarget = target;
    target.classList.add(CLASS_NAME_ACTIVE3);
    this._activateParents(target);
    event_handler_default.trigger(this._element, EVENT_ACTIVATE, { relatedTarget: target });
  }
  _activateParents(target) {
    if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
      selector_engine_default.findOne(SELECTOR_DROPDOWN_TOGGLE, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE3);
      return;
    }
    for (const listGroup of selector_engine_default.parents(target, SELECTOR_NAV_LIST_GROUP)) {
      for (const item of selector_engine_default.prev(listGroup, SELECTOR_LINK_ITEMS)) {
        item.classList.add(CLASS_NAME_ACTIVE3);
      }
    }
  }
  _clearActiveClass(parent) {
    parent.classList.remove(CLASS_NAME_ACTIVE3);
    const activeNodes = selector_engine_default.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE3}`, parent);
    for (const node of activeNodes) {
      node.classList.remove(CLASS_NAME_ACTIVE3);
    }
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _ScrollSpy.getOrCreateInstance(this, config);
      if (typeof config !== "string") {
        return;
      }
      if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config]();
    });
  }
};
event_handler_default.on(window, EVENT_LOAD_DATA_API3, () => {
  for (const spy of selector_engine_default.find(SELECTOR_DATA_SPY)) {
    ScrollSpy.getOrCreateInstance(spy);
  }
});
defineJQueryPlugin(ScrollSpy);
var scrollspy_default = ScrollSpy;

// src/tab.js
var NAME15 = "tab";
var DATA_KEY10 = "bs.tab";
var EVENT_KEY11 = `.${DATA_KEY10}`;
var EVENT_HIDE6 = `hide${EVENT_KEY11}`;
var EVENT_HIDDEN6 = `hidden${EVENT_KEY11}`;
var EVENT_SHOW6 = `show${EVENT_KEY11}`;
var EVENT_SHOWN6 = `shown${EVENT_KEY11}`;
var EVENT_CLICK_DATA_API7 = `click${EVENT_KEY11}`;
var EVENT_KEYDOWN2 = `keydown${EVENT_KEY11}`;
var EVENT_LOAD_DATA_API4 = `load${EVENT_KEY11}`;
var ARROW_LEFT_KEY2 = "ArrowLeft";
var ARROW_RIGHT_KEY2 = "ArrowRight";
var ARROW_UP_KEY2 = "ArrowUp";
var ARROW_DOWN_KEY2 = "ArrowDown";
var HOME_KEY = "Home";
var END_KEY = "End";
var CLASS_NAME_ACTIVE4 = "active";
var CLASS_NAME_FADE5 = "fade";
var CLASS_NAME_SHOW8 = "show";
var CLASS_DROPDOWN = "dropdown";
var SELECTOR_DROPDOWN_TOGGLE2 = ".dropdown-toggle";
var SELECTOR_DROPDOWN_MENU = ".dropdown-menu";
var NOT_SELECTOR_DROPDOWN_TOGGLE = `:not(${SELECTOR_DROPDOWN_TOGGLE2})`;
var SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
var SELECTOR_OUTER = ".nav-item, .list-group-item";
var SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
var SELECTOR_DATA_TOGGLE6 = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
var SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE6}`;
var SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE4}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE4}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE4}[data-bs-toggle="list"]`;
var Tab = class _Tab extends base_component_default {
  constructor(element) {
    super(element);
    this._parent = this._element.closest(SELECTOR_TAB_PANEL);
    if (!this._parent) {
      return;
    }
    this._setInitialAttributes(this._parent, this._getChildren());
    event_handler_default.on(this._element, EVENT_KEYDOWN2, (event) => this._keydown(event));
  }
  // Getters
  static get NAME() {
    return NAME15;
  }
  // Public
  show() {
    const innerElem = this._element;
    if (this._elemIsActive(innerElem)) {
      return;
    }
    const active = this._getActiveElem();
    const hideEvent = active ? event_handler_default.trigger(active, EVENT_HIDE6, { relatedTarget: innerElem }) : null;
    const showEvent = event_handler_default.trigger(innerElem, EVENT_SHOW6, { relatedTarget: active });
    if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
      return;
    }
    this._deactivate(active, innerElem);
    this._activate(innerElem, active);
  }
  // Private
  _activate(element, relatedElem) {
    if (!element) {
      return;
    }
    element.classList.add(CLASS_NAME_ACTIVE4);
    this._activate(selector_engine_default.getElementFromSelector(element));
    const complete = () => {
      if (element.getAttribute("role") !== "tab") {
        element.classList.add(CLASS_NAME_SHOW8);
        return;
      }
      element.removeAttribute("tabindex");
      element.setAttribute("aria-selected", true);
      this._toggleDropDown(element, true);
      event_handler_default.trigger(element, EVENT_SHOWN6, {
        relatedTarget: relatedElem
      });
    };
    this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE5));
  }
  _deactivate(element, relatedElem) {
    if (!element) {
      return;
    }
    element.classList.remove(CLASS_NAME_ACTIVE4);
    element.blur();
    this._deactivate(selector_engine_default.getElementFromSelector(element));
    const complete = () => {
      if (element.getAttribute("role") !== "tab") {
        element.classList.remove(CLASS_NAME_SHOW8);
        return;
      }
      element.setAttribute("aria-selected", false);
      element.setAttribute("tabindex", "-1");
      this._toggleDropDown(element, false);
      event_handler_default.trigger(element, EVENT_HIDDEN6, { relatedTarget: relatedElem });
    };
    this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE5));
  }
  _keydown(event) {
    if (![ARROW_LEFT_KEY2, ARROW_RIGHT_KEY2, ARROW_UP_KEY2, ARROW_DOWN_KEY2, HOME_KEY, END_KEY].includes(event.key)) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    const children = this._getChildren().filter((element) => !isDisabled(element));
    let nextActiveElement;
    if ([HOME_KEY, END_KEY].includes(event.key)) {
      nextActiveElement = children[event.key === HOME_KEY ? 0 : children.length - 1];
    } else {
      const isNext = [ARROW_RIGHT_KEY2, ARROW_DOWN_KEY2].includes(event.key);
      nextActiveElement = getNextActiveElement(children, event.target, isNext, true);
    }
    if (nextActiveElement) {
      nextActiveElement.focus({ preventScroll: true });
      _Tab.getOrCreateInstance(nextActiveElement).show();
    }
  }
  _getChildren() {
    return selector_engine_default.find(SELECTOR_INNER_ELEM, this._parent);
  }
  _getActiveElem() {
    return this._getChildren().find((child) => this._elemIsActive(child)) || null;
  }
  _setInitialAttributes(parent, children) {
    this._setAttributeIfNotExists(parent, "role", "tablist");
    for (const child of children) {
      this._setInitialAttributesOnChild(child);
    }
  }
  _setInitialAttributesOnChild(child) {
    child = this._getInnerElement(child);
    const isActive = this._elemIsActive(child);
    const outerElem = this._getOuterElement(child);
    child.setAttribute("aria-selected", isActive);
    if (outerElem !== child) {
      this._setAttributeIfNotExists(outerElem, "role", "presentation");
    }
    if (!isActive) {
      child.setAttribute("tabindex", "-1");
    }
    this._setAttributeIfNotExists(child, "role", "tab");
    this._setInitialAttributesOnTargetPanel(child);
  }
  _setInitialAttributesOnTargetPanel(child) {
    const target = selector_engine_default.getElementFromSelector(child);
    if (!target) {
      return;
    }
    this._setAttributeIfNotExists(target, "role", "tabpanel");
    if (child.id) {
      this._setAttributeIfNotExists(target, "aria-labelledby", `${child.id}`);
    }
  }
  _toggleDropDown(element, open) {
    const outerElem = this._getOuterElement(element);
    if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
      return;
    }
    const toggle = (selector, className) => {
      const element2 = selector_engine_default.findOne(selector, outerElem);
      if (element2) {
        element2.classList.toggle(className, open);
      }
    };
    toggle(SELECTOR_DROPDOWN_TOGGLE2, CLASS_NAME_ACTIVE4);
    toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW8);
    outerElem.setAttribute("aria-expanded", open);
  }
  _setAttributeIfNotExists(element, attribute, value) {
    if (!element.hasAttribute(attribute)) {
      element.setAttribute(attribute, value);
    }
  }
  _elemIsActive(elem) {
    return elem.classList.contains(CLASS_NAME_ACTIVE4);
  }
  // Try to get the inner element (usually the .nav-link)
  _getInnerElement(elem) {
    return elem.matches(SELECTOR_INNER_ELEM) ? elem : selector_engine_default.findOne(SELECTOR_INNER_ELEM, elem);
  }
  // Try to get the outer element (usually the .nav-item)
  _getOuterElement(elem) {
    return elem.closest(SELECTOR_OUTER) || elem;
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Tab.getOrCreateInstance(this);
      if (typeof config !== "string") {
        return;
      }
      if (data[config] === void 0 || config.startsWith("_") || config === "constructor") {
        throw new TypeError(`No method named "${config}"`);
      }
      data[config]();
    });
  }
};
event_handler_default.on(document, EVENT_CLICK_DATA_API7, SELECTOR_DATA_TOGGLE6, function(event) {
  if (["A", "AREA"].includes(this.tagName)) {
    event.preventDefault();
  }
  if (isDisabled(this)) {
    return;
  }
  Tab.getOrCreateInstance(this).show();
});
event_handler_default.on(window, EVENT_LOAD_DATA_API4, () => {
  for (const element of selector_engine_default.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
    Tab.getOrCreateInstance(element);
  }
});
defineJQueryPlugin(Tab);
var tab_default = Tab;

// src/toast.js
var NAME16 = "toast";
var DATA_KEY11 = "bs.toast";
var EVENT_KEY12 = `.${DATA_KEY11}`;
var EVENT_MOUSEOVER = `mouseover${EVENT_KEY12}`;
var EVENT_MOUSEOUT = `mouseout${EVENT_KEY12}`;
var EVENT_FOCUSIN3 = `focusin${EVENT_KEY12}`;
var EVENT_FOCUSOUT2 = `focusout${EVENT_KEY12}`;
var EVENT_HIDE7 = `hide${EVENT_KEY12}`;
var EVENT_HIDDEN7 = `hidden${EVENT_KEY12}`;
var EVENT_SHOW7 = `show${EVENT_KEY12}`;
var EVENT_SHOWN7 = `shown${EVENT_KEY12}`;
var CLASS_NAME_FADE6 = "fade";
var CLASS_NAME_HIDE = "hide";
var CLASS_NAME_SHOW9 = "show";
var CLASS_NAME_SHOWING2 = "showing";
var DefaultType13 = {
  animation: "boolean",
  autohide: "boolean",
  delay: "number"
};
var Default13 = {
  animation: true,
  autohide: true,
  delay: 5e3
};
var Toast = class _Toast extends base_component_default {
  constructor(element, config) {
    super(element, config);
    this._timeout = null;
    this._hasMouseInteraction = false;
    this._hasKeyboardInteraction = false;
    this._setListeners();
  }
  // Getters
  static get Default() {
    return Default13;
  }
  static get DefaultType() {
    return DefaultType13;
  }
  static get NAME() {
    return NAME16;
  }
  // Public
  show() {
    const showEvent = event_handler_default.trigger(this._element, EVENT_SHOW7);
    if (showEvent.defaultPrevented) {
      return;
    }
    this._clearTimeout();
    if (this._config.animation) {
      this._element.classList.add(CLASS_NAME_FADE6);
    }
    const complete = () => {
      this._element.classList.remove(CLASS_NAME_SHOWING2);
      event_handler_default.trigger(this._element, EVENT_SHOWN7);
      this._maybeScheduleHide();
    };
    this._element.classList.remove(CLASS_NAME_HIDE);
    reflow(this._element);
    this._element.classList.add(CLASS_NAME_SHOW9, CLASS_NAME_SHOWING2);
    this._queueCallback(complete, this._element, this._config.animation);
  }
  hide() {
    if (!this.isShown()) {
      return;
    }
    const hideEvent = event_handler_default.trigger(this._element, EVENT_HIDE7);
    if (hideEvent.defaultPrevented) {
      return;
    }
    const complete = () => {
      this._element.classList.add(CLASS_NAME_HIDE);
      this._element.classList.remove(CLASS_NAME_SHOWING2, CLASS_NAME_SHOW9);
      event_handler_default.trigger(this._element, EVENT_HIDDEN7);
    };
    this._element.classList.add(CLASS_NAME_SHOWING2);
    this._queueCallback(complete, this._element, this._config.animation);
  }
  dispose() {
    this._clearTimeout();
    if (this.isShown()) {
      this._element.classList.remove(CLASS_NAME_SHOW9);
    }
    super.dispose();
  }
  isShown() {
    return this._element.classList.contains(CLASS_NAME_SHOW9);
  }
  // Private
  _maybeScheduleHide() {
    if (!this._config.autohide) {
      return;
    }
    if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
      return;
    }
    this._timeout = setTimeout(() => {
      this.hide();
    }, this._config.delay);
  }
  _onInteraction(event, isInteracting) {
    switch (event.type) {
      case "mouseover":
      case "mouseout": {
        this._hasMouseInteraction = isInteracting;
        break;
      }
      case "focusin":
      case "focusout": {
        this._hasKeyboardInteraction = isInteracting;
        break;
      }
      default: {
        break;
      }
    }
    if (isInteracting) {
      this._clearTimeout();
      return;
    }
    const nextElement = event.relatedTarget;
    if (this._element === nextElement || this._element.contains(nextElement)) {
      return;
    }
    this._maybeScheduleHide();
  }
  _setListeners() {
    event_handler_default.on(this._element, EVENT_MOUSEOVER, (event) => this._onInteraction(event, true));
    event_handler_default.on(this._element, EVENT_MOUSEOUT, (event) => this._onInteraction(event, false));
    event_handler_default.on(this._element, EVENT_FOCUSIN3, (event) => this._onInteraction(event, true));
    event_handler_default.on(this._element, EVENT_FOCUSOUT2, (event) => this._onInteraction(event, false));
  }
  _clearTimeout() {
    clearTimeout(this._timeout);
    this._timeout = null;
  }
  // Static
  static jQueryInterface(config) {
    return this.each(function() {
      const data = _Toast.getOrCreateInstance(this, config);
      if (typeof config === "string") {
        if (typeof data[config] === "undefined") {
          throw new TypeError(`No method named "${config}"`);
        }
        data[config](this);
      }
    });
  }
};
enableDismissTrigger(Toast);
defineJQueryPlugin(Toast);
var toast_default = Toast;
export {
  alert_default as Alert,
  button_default as Button,
  carousel_default as Carousel,
  collapse_default as Collapse,
  dropdown_default as Dropdown,
  modal_default as Modal,
  offcanvas_default as Offcanvas,
  popover_default as Popover,
  scrollspy_default as ScrollSpy,
  tab_default as Tab,
  toast_default as Toast,
  tooltip_default as Tooltip
};
