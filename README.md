# Bootstrap ESM with Tree‑Shaking

This package provides [Bootstrap](https://getbootstrap.com/) v5.3.8 as **native ECMAScript modules** (ESM) with **optimal tree‑shaking support**. It is a drop‑in replacement for the official Bootstrap package, but designed to work seamlessly with modern bundlers (Vite, Webpack, Rollup, etc.) that rely on static analysis to eliminate unused code.

Unlike the official Bootstrap package, which often forces the entire library into your bundle due to side‑effects and monolithic entry points, this package **exports each component as a separate module**. You import only what you actually use, and the rest is left out – saving bandwidth and improving load times.

---

## Motivation

The original Bootstrap package (since v5) is published as both CommonJS and ESM, but tree‑shaking is rarely effective because:

- The main entry point (`bootstrap.js`) imports and registers all components, creating dependencies that prevent removal.
- Side‑effects like event listeners and jQuery plugins run at import time, forcing bundlers to keep the entire module.

This package solves the problem by:

- **Exporting every component as an independent module** – no monolithic bundle.
- **Removing all automatic initialisation (data‑api and jQuery plugins) from the component modules** – they are pure classes without side‑effects.
- **Providing optional initialisation files** that you can import separately if you need the original Bootstrap behaviour (data attributes and jQuery plugins).

As a result, if you import only `Alert`, only the code for `Alert` and its direct dependencies (like `BaseComponent`) will end up in your final bundle – everything else stays out.

---

## Installation

```bash
npm install @supercat1337/bootstrap-esm @popperjs/core
```

> **Note:** `@popperjs/core` is a peer dependency – you must install it separately because `Dropdown`, `Tooltip`, and `Popover` rely on Popper.

If you use Bootstrap's CSS, you still need to include it (e.g. via `bootstrap/dist/css/bootstrap.css` or a CDN). This package provides **JavaScript only**.

---

## Usage

### Import only the class (no data‑api, no jQuery)

This is the recommended way – it gives you the smallest bundle size.

```js
// Import a single component
import Alert from '@supercat1337/bootstrap-esm/alert';

// Or import multiple from the main entry
import { Alert, Modal } from '@supercat1337/bootstrap-esm';

// Use the class
const alert = Alert.getOrCreateInstance('#myAlert');
alert.close();
```

### Enable automatic initialisation (data‑api & jQuery)

If you rely on Bootstrap's **data attributes** (e.g., `data-bs-toggle="modal"`) or the **jQuery plugins**, import the corresponding init file **in addition** to the component class:

```js
import Alert from '@supercat1337/bootstrap-esm/alert';
import '@supercat1337/bootstrap-esm/init/alert';
```

Now any element with `data-bs-dismiss="alert"` will automatically close the alert, and the jQuery plugin `$.fn.alert` will be available.

You can import multiple init files for different components:

```js
import { Modal, Dropdown } from '@supercat1337/bootstrap-esm';
import '@supercat1337/bootstrap-esm/init/modal';
import '@supercat1337/bootstrap-esm/init/dropdown';
```

> **Important:** The init files **are optional** and **only need to be imported once** (e.g., in your main entry file). They register global event listeners and jQuery plugins, so importing them multiple times has no extra effect.

---

## Available Exports

| Component | Class Import                            | Init Import (data‑api + jQuery)              |
| --------- | --------------------------------------- | -------------------------------------------- |
| Alert     | `@supercat1337/bootstrap-esm/alert`     | `@supercat1337/bootstrap-esm/init/alert`     |
| Button    | `@supercat1337/bootstrap-esm/button`    | `@supercat1337/bootstrap-esm/init/button`    |
| Carousel  | `@supercat1337/bootstrap-esm/carousel`  | `@supercat1337/bootstrap-esm/init/carousel`  |
| Collapse  | `@supercat1337/bootstrap-esm/collapse`  | `@supercat1337/bootstrap-esm/init/collapse`  |
| Dropdown  | `@supercat1337/bootstrap-esm/dropdown`  | `@supercat1337/bootstrap-esm/init/dropdown`  |
| Modal     | `@supercat1337/bootstrap-esm/modal`     | `@supercat1337/bootstrap-esm/init/modal`     |
| Offcanvas | `@supercat1337/bootstrap-esm/offcanvas` | `@supercat1337/bootstrap-esm/init/offcanvas` |
| Popover   | `@supercat1337/bootstrap-esm/popover`   | `@supercat1337/bootstrap-esm/init/popover`   |
| ScrollSpy | `@supercat1337/bootstrap-esm/scrollspy` | `@supercat1337/bootstrap-esm/init/scrollspy` |
| Tab       | `@supercat1337/bootstrap-esm/tab`       | `@supercat1337/bootstrap-esm/init/tab`       |
| Toast     | `@supercat1337/bootstrap-esm/toast`     | `@supercat1337/bootstrap-esm/init/toast`     |
| Tooltip   | `@supercat1337/bootstrap-esm/tooltip`   | `@supercat1337/bootstrap-esm/init/tooltip`   |

You can also import all components from the root entry:

```js
import { Alert, Button, Modal, … } from '@supercat1337/bootstrap-esm';
```

But remember: **importing from the root entry imports all component modules**, which defeats tree‑shaking. For optimal bundle size, use the per‑component imports.

---

## Why not use the official package?

The official Bootstrap package is excellent, but **tree‑shaking rarely works** in practice. Even if you import only specific components, the monolithic structure and side‑effects keep the full library in your bundle. This package is **purpose‑built** to enable efficient tree‑shaking, giving you significant savings in bundle size.

## License & Credits

- Original Bootstrap code is copyright (c) 2011–2024 The Bootstrap Authors, released under the MIT license.
- Modifications and packaging for this ESM distribution are copyright (c) 2026 Albert Bazaleev, also released under the MIT license.

See the [LICENSE](./LICENSE) file for full terms.

---

## Contributing

Issues and pull requests are welcome at the [GitHub repository](https://github.com/supercat1337/bootstrap-esm).
