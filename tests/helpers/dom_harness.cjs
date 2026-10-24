/**
 * Lightweight, zero-dependency DOM & Browser Environment Harness
 * Provides opaque-box simulation of index.html, DOM tree, events, AudioContext,
 * and localStorage for automated Node.js testing.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

class DOMClassList {
  constructor(element) {
    this._element = element;
    this._classes = new Set();
    this._syncFromAttr();
  }

  _syncFromAttr() {
    this._classes.clear();
    const classAttr = this._element.getAttribute('class') || '';
    classAttr.trim().split(/\s+/).forEach(c => {
      if (c) this._classes.add(c);
    });
  }

  _syncToAttr() {
    const val = Array.from(this._classes).join(' ');
    if (val) {
      this._element.setAttribute('class', val);
    } else {
      this._element.removeAttribute('class');
    }
  }

  add(...classes) {
    classes.forEach(c => { if (c) this._classes.add(c); });
    this._syncToAttr();
  }

  remove(...classes) {
    classes.forEach(c => { if (c) this._classes.delete(c); });
    this._syncToAttr();
  }

  toggle(cls, force) {
    if (typeof force === 'boolean') {
      if (force) this.add(cls);
      else this.remove(cls);
      return force;
    }
    const has = this._classes.has(cls);
    if (has) this.remove(cls);
    else this.add(cls);
    return !has;
  }

  contains(cls) {
    return this._classes.has(cls);
  }

  toString() {
    return Array.from(this._classes).join(' ');
  }
}

class DOMElement {
  constructor(tagName, attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
    this.children = [];
    this.parentNode = null;
    this._listeners = {};
    this.classList = new DOMClassList(this);
    this.style = {};
    this.value = this.attributes.value || '';
    this.checked = 'checked' in this.attributes;
    this._textContent = null;

    // dataset proxy
    this.dataset = {};
    for (const [k, v] of Object.entries(this.attributes)) {
      if (k.startsWith('data-')) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
        this.dataset[camel] = v;
      }
    }
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(val) {
    this.setAttribute('id', val);
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(val) {
    this.setAttribute('class', val);
    this.classList._syncFromAttr();
  }

  get parentElement() {
    return this.parentNode instanceof DOMElement ? this.parentNode : null;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  get lastChild() {
    return this.children[this.children.length - 1] || null;
  }

  get previousElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    const idx = siblings.indexOf(this);
    return idx > 0 ? siblings[idx - 1] : null;
  }

  get nextElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    const idx = siblings.indexOf(this);
    return (idx >= 0 && idx < siblings.length - 1) ? siblings[idx + 1] : null;
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
    if (name === 'class') this.classList._syncFromAttr();
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      this.dataset[camel] = String(value);
    }
  }

  removeAttribute(name) {
    delete this.attributes[name];
    if (name === 'class') this.classList._syncFromAttr();
    if (name.startsWith('data-')) {
      const camel = name.slice(5).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
      delete this.dataset[camel];
    }
  }

  hasAttribute(name) {
    return this.attributes[name] !== undefined;
  }

  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  remove() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  get textContent() {
    if (this._textContent !== null && this.children.length === 0) {
      return this._textContent;
    }
    return this.children.map(c => c.textContent).join('');
  }

  set textContent(text) {
    this.children = [];
    this._textContent = String(text);
  }

  get innerHTML() {
    return this.children.map(c => c.outerHTML).join('');
  }

  set innerHTML(htmlString) {
    this.children = [];
    this._textContent = null;
    const fragment = parseHTMLFragment(htmlString);
    fragment.forEach(c => this.appendChild(c));
  }

  get outerHTML() {
    const tag = this.tagName.toLowerCase();
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`)
      .join('');
    if (VOID_ELEMENTS.has(tag)) {
      return `<${tag}${attrs} />`;
    }
    return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
  }

  addEventListener(type, handler, options) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push({ handler, options });
  }

  removeEventListener(type, handler) {
    if (!this._listeners[type]) return;
    this._listeners[type] = this._listeners[type].filter(l => l.handler !== handler);
  }

  dispatchEvent(event) {
    event.target = this;
    event.currentTarget = this;
    let cancelled = false;

    // Trigger local listeners
    const listeners = this._listeners[event.type] || [];
    for (const { handler } of listeners) {
      try {
        const res = handler.call(this, event);
        if (res === false) cancelled = true;
      } catch (err) {
        console.error('Error in event handler:', err);
      }
    }

    // Bubbling
    if (event.bubbles && this.parentNode && !event._propagationStopped) {
      this.parentNode.dispatchEvent(event);
    }

    return !cancelled && !event.defaultPrevented;
  }

  click() {
    const ev = new DOMCustomEvent('click', { bubbles: true, cancelable: true });
    this.dispatchEvent(ev);
  }

  focus() {}
  blur() {}

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      width: 800,
      height: 600,
      x: 0,
      y: 0
    };
  }

  scrollIntoView() {}

  getContext(type) {
    if (type === '2d') {
      return {
        canvas: this,
        clearRect: () => {},
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        drawImage: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        translate: () => {},
        rotate: () => {},
        measureText: (txt) => ({ width: (txt || '').length * 8 }),
        createLinearGradient: () => ({ addColorStop: () => {} })
      };
    }
    return null;
  }

  // --- Selector Querying ---
  querySelector(selector) {
    const res = this.querySelectorAll(selector);
    return res.length > 0 ? res[0] : null;
  }

  querySelectorAll(selector) {
    const groups = selector.split(',').map(s => s.trim()).filter(Boolean);
    const results = new Set();
    for (const group of groups) {
      const matched = querySelectorGroup(this, group);
      matched.forEach(el => results.add(el));
    }
    return Array.from(results);
  }

  getElementById(id) {
    return this.querySelector(`#${id}`);
  }

  getElementsByClassName(className) {
    return this.querySelectorAll(`.${className}`);
  }

  getElementsByTagName(tagName) {
    return this.querySelectorAll(tagName);
  }
}

class DOMCustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.bubbles = !!init.bubbles;
    this.cancelable = !!init.cancelable;
    this.detail = init.detail || null;
    this.defaultPrevented = false;
    this._propagationStopped = false;
    this.target = null;
    this.currentTarget = null;
    Object.assign(this, init);
  }

  preventDefault() {
    if (this.cancelable) this.defaultPrevented = true;
  }

  stopPropagation() {
    this._propagationStopped = true;
  }
}

// Minimal CSS Selector Engine
function matchesSimpleSelector(el, sel) {
  if (!(el instanceof DOMElement)) return false;
  sel = sel.trim();

  // Pseudo-classes
  if (sel.includes(':first-child')) {
    const base = sel.replace(':first-child', '');
    if (base && !matchesSimpleSelector(el, base)) return false;
    return el.parentNode && el.parentNode.children[0] === el;
  }
  if (sel.includes(':last-child')) {
    const base = sel.replace(':last-child', '');
    if (base && !matchesSimpleSelector(el, base)) return false;
    return el.parentNode && el.parentNode.children[el.parentNode.children.length - 1] === el;
  }
  if (sel.includes(':not(')) {
    const match = sel.match(/^(.*?):not\((.*?)\)$/);
    if (match) {
      const base = match[1];
      const neg = match[2];
      if (base && !matchesSimpleSelector(el, base)) return false;
      return !matchesSimpleSelector(el, neg);
    }
  }

  // Attribute selector [attr] or [attr="val"] or [attr^="val"]
  const attrMatch = sel.match(/^([a-zA-Z0-9_-]*)\[([a-zA-Z0-9_-]+)(?:([*^$]?=)(?:"([^"]*)"|'([^']*)'|([^\]]+)))?\]$/);
  if (attrMatch) {
    const [, tag, attrName, op, val1, val2, val3] = attrMatch;
    if (tag && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    const expected = val1 ?? val2 ?? val3;
    const actual = el.getAttribute(attrName);
    if (actual === null) return false;
    if (expected === undefined) return true;
    if (!op || op === '=') return actual === expected;
    if (op === '^=') return actual.startsWith(expected);
    if (op === '$=') return actual.endsWith(expected);
    if (op === '*=') return actual.includes(expected);
    return false;
  }

  // ID selector #id
  if (sel.startsWith('#')) {
    return el.id === sel.slice(1);
  }

  // Class combinations .c1.c2
  if (sel.startsWith('.')) {
    const classes = sel.slice(1).split('.');
    return classes.every(c => el.classList.contains(c));
  }

  // Tag + Class / ID: tag.class or tag#id
  if (sel.includes('.')) {
    const parts = sel.split('.');
    const tag = parts[0];
    const classes = parts.slice(1);
    if (tag && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    return classes.every(c => el.classList.contains(c));
  }
  if (sel.includes('#')) {
    const [tag, id] = sel.split('#');
    if (tag && el.tagName.toLowerCase() !== tag.toLowerCase()) return false;
    return el.id === id;
  }

  // Universal
  if (sel === '*') return true;

  // Pure Tag
  return el.tagName.toLowerCase() === sel.toLowerCase();
}

function querySelectorGroup(root, selector) {
  // Protect whitespace inside attribute brackets [ ... ]
  let protectedSel = '';
  let inBracket = false;
  let inQuote = false;
  let quoteChar = '';
  for (let i = 0; i < selector.length; i++) {
    const ch = selector[i];
    if ((ch === '"' || ch === "'") && inBracket) {
      if (!inQuote) {
        inQuote = true;
        quoteChar = ch;
      } else if (quoteChar === ch) {
        inQuote = false;
      }
    } else if (ch === '[' && !inQuote) {
      inBracket = true;
    } else if (ch === ']' && !inQuote) {
      inBracket = false;
    }
    if ((inBracket || inQuote) && /\s/.test(ch)) {
      protectedSel += '\u0001';
    } else {
      protectedSel += ch;
    }
  }

  const tokens = [];
  const parts = protectedSel.trim().split(/(\s*>\s*|\s+)/);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (!p) continue;
    if (p.trim() === '>') {
      tokens.push('>');
    } else if (p.trim() === '') {
      tokens.push(' ');
    } else {
      tokens.push(p.trim().replace(/\u0001/g, ' '));
    }
  }

  function collectAllDescendants(node) {
    const list = [];
    for (const ch of node.children) {
      list.push(ch);
      list.push(...collectAllDescendants(ch));
    }
    return list;
  }

  let currentSet = [root];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === ' ') {
      // Descendant combinator
      const nextSel = tokens[++i];
      const nextSet = new Set();
      for (const node of currentSet) {
        const descendants = collectAllDescendants(node);
        for (const d of descendants) {
          if (matchesSimpleSelector(d, nextSel)) {
            nextSet.add(d);
          }
        }
      }
      currentSet = Array.from(nextSet);
    } else if (token === '>') {
      // Direct child combinator
      const nextSel = tokens[++i];
      const nextSet = new Set();
      for (const node of currentSet) {
        for (const child of node.children) {
          if (matchesSimpleSelector(child, nextSel)) {
            nextSet.add(child);
          }
        }
      }
      currentSet = Array.from(nextSet);
    } else {
      // Initial selector
      const nextSet = new Set();
      for (const node of currentSet) {
        const descendants = collectAllDescendants(node);
        for (const d of descendants) {
          if (matchesSimpleSelector(d, token)) {
            nextSet.add(d);
          }
        }
      }
      currentSet = Array.from(nextSet);
    }
  }

  return currentSet;
}

// HTML Parser
function parseHTMLFragment(html) {
  const root = new DOMElement('div');
  const stack = [root];

  // Regex for HTML tokens
  const tagRegex = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9_-]+)>|<([a-zA-Z0-9_-]+)([^>]*?)(\/?)>|([^<]+)/g;

  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const [full, closeTag, openTag, attrString, selfClose, textContent] = match;

    if (full.startsWith('<!--')) {
      // Comment - ignore
      continue;
    }

    if (closeTag) {
      const top = stack[stack.length - 1];
      if (top && top.tagName.toLowerCase() === closeTag.toLowerCase()) {
        stack.pop();
      }
    } else if (openTag) {
      const attrs = {};
      if (attrString) {
        const attrRegex = /([a-zA-Z0-9_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
        let aMatch;
        while ((aMatch = attrRegex.exec(attrString)) !== null) {
          const name = aMatch[1];
          const val = aMatch[2] !== undefined ? aMatch[2] : (aMatch[3] !== undefined ? aMatch[3] : (aMatch[4] !== undefined ? aMatch[4] : ''));
          attrs[name] = val;
        }
      }

      const element = new DOMElement(openTag, attrs);
      const currentParent = stack[stack.length - 1];
      currentParent.appendChild(element);

      const isVoid = VOID_ELEMENTS.has(openTag.toLowerCase()) || !!selfClose;
      if (!isVoid) {
        stack.push(element);
      }
    } else if (textContent) {
      const trimmed = textContent.trim();
      if (trimmed) {
        const textNode = new DOMElement('#text');
        textNode.textContent = textContent;
        stack[stack.length - 1].appendChild(textNode);
      }
    }
  }

  return [...root.children];
}

class MockLocalStorage {
  constructor(options = {}) {
    this._store = {};
    this.shouldThrow = !!options.throwOnSet;
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._store, key) ? this._store[key] : null;
  }

  setItem(key, value) {
    if (this.shouldThrow) {
      const err = new Error('The quota has been exceeded or access denied in sandbox');
      err.name = 'DOMException';
      throw err;
    }
    this._store[key] = String(value);
  }

  removeItem(key) {
    delete this._store[key];
  }

  clear() {
    this._store = {};
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    this.createdOscillators = [];
    this.createdGains = [];
  }

  createOscillator() {
    const osc = {
      type: 'sine',
      frequency: {
        setValueAtTime: (val) => { osc._freq = val; },
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {}
      },
      connect: () => {},
      start: () => { osc._started = true; },
      stop: () => { osc._stopped = true; }
    };
    this.createdOscillators.push(osc);
    return osc;
  }

  createGain() {
    const gain = {
      gain: {
        value: 1,
        setValueAtTime: (val) => { gain.gain.value = val; },
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {}
      },
      connect: () => {}
    };
    this.createdGains.push(gain);
    return gain;
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
}

/**
 * Creates a sandbox environment with index.html loaded
 */
function createEnvironment(projectRoot, options = {}) {
  const htmlPath = path.join(projectRoot, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Strip scripts for manual evaluation
  const elements = parseHTMLFragment(htmlContent);

  const document = new DOMElement('#document');
  elements.forEach(el => document.appendChild(el));

  const windowListeners = {};
  const windowObj = {
    document,
    innerWidth: options.innerWidth || 1440,
    innerHeight: options.innerHeight || 900,
    scrollX: 0,
    scrollY: 0,
    scrollTo: (x, y) => {
      if (typeof x === 'object') {
        windowObj.scrollX = x.left !== undefined ? x.left : windowObj.scrollX;
        windowObj.scrollY = x.top !== undefined ? x.top : windowObj.scrollY;
      } else {
        windowObj.scrollX = x || 0;
        windowObj.scrollY = y || 0;
      }
      const ev = new DOMCustomEvent('scroll');
      windowObj.dispatchEvent(ev);
    },
    addEventListener: (type, handler, opts) => {
      if (!windowListeners[type]) windowListeners[type] = [];
      windowListeners[type].push({ handler, opts });
    },
    removeEventListener: (type, handler) => {
      if (!windowListeners[type]) return;
      windowListeners[type] = windowListeners[type].filter(l => l.handler !== handler);
    },
    dispatchEvent: (event) => {
      event.target = windowObj;
      event.currentTarget = windowObj;
      const list = windowListeners[event.type] || [];
      for (const { handler } of list) {
        handler.call(windowObj, event);
      }
    },
    localStorage: new MockLocalStorage(options),
    AudioContext: MockAudioContext,
    requestAnimationFrame: (cb) => {
      if (options.runAnimationFrameOnce) {
        cb(Date.now());
      }
      return 1;
    },
    cancelAnimationFrame: () => {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    console,
    Event: DOMCustomEvent,
    CustomEvent: DOMCustomEvent,
    KeyboardEvent: class extends DOMCustomEvent {
      constructor(type, init = {}) {
        super(type, init);
        this.key = init.key || '';
        this.code = init.code || '';
      }
    },
    MouseEvent: class extends DOMCustomEvent {
      constructor(type, init = {}) {
        super(type, init);
        this.clientX = init.clientX || 0;
        this.clientY = init.clientY || 0;
      }
    },
    TouchEvent: class extends DOMCustomEvent {
      constructor(type, init = {}) {
        super(type, init);
        this.touches = init.touches || [];
        this.changedTouches = init.changedTouches || [];
      }
    },
    IntersectionObserver: class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    ResizeObserver: class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    getComputedStyle: (el) => {
      return {
        display: el.style.display || 'block',
        width: el.style.width || '100px',
        height: el.style.height || '100px',
        overflow: el.style.overflow || 'visible',
        opacity: el.style.opacity || '1'
      };
    }
  };

  document.defaultView = windowObj;
  document.documentElement = document.querySelector('html') || document;
  document.body = document.querySelector('body') || document;
  document.createElement = (tag) => new DOMElement(tag);
  document.getElementById = (id) => document.querySelector(`#${id}`);
  document.readyState = 'complete';

  // Context for evaluation
  const context = vm.createContext(windowObj);
  windowObj.window = windowObj;

  return {
    window: windowObj,
    document,
    loadScripts: () => {
      // 1. site_data.js
      const dataCode = fs.readFileSync(path.join(projectRoot, 'assets', 'site_data.js'), 'utf8');
      vm.runInContext(dataCode, context);

      // 2. site_audio.js
      const audioCode = fs.readFileSync(path.join(projectRoot, 'assets', 'site_audio.js'), 'utf8');
      vm.runInContext(audioCode, context);

      // 3. interactive_engine.js
      const engineCode = fs.readFileSync(path.join(projectRoot, 'assets', 'interactive_engine.js'), 'utf8');
      vm.runInContext(engineCode, context);

      return {
        SiteAudio: windowObj.SiteAudio,
        TOURS_DATA: windowObj.TOURS_DATA,
        HOTSPOTS_DATA: windowObj.HOTSPOTS_DATA,
        CAMPAIGN_CHAPTERS: windowObj.CAMPAIGN_CHAPTERS,
        STEAM_LAB_DATA: windowObj.STEAM_LAB_DATA
      };
    }
  };
}

module.exports = {
  DOMElement,
  DOMCustomEvent,
  MockLocalStorage,
  MockAudioContext,
  parseHTMLFragment,
  createEnvironment
};
