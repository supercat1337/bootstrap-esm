# Bootstrap ESM with Tree-Shaking

This package provides the [Bootstrap](https://getbootstrap.com/) UI library as **native ECMAScript modules** (ESM) with **proper tree-shaking support**. It is a derivative work based on the original Bootstrap v5.3.x source code, repackaged to enable efficient bundle optimization.

> **Important:** The source code is originally authored by the Bootstrap team (MIT license). This distribution includes modifications to the build system and packaging to achieve tree-shaking, but the core implementation remains unchanged. All credit for the library goes to the original Bootstrap authors.

## License & Copyright

- Original Bootstrap code is copyright (c) 2011-2024 The Bootstrap Authors, released under the MIT license.
- Modifications and packaging for this ESM distribution are copyright (c) 2026 Albert Bazaleev, also released under the MIT license.

See the [LICENSE](./LICENSE) file for full terms.

## Motivation

The original Bootstrap package (since v5) is published as both CommonJS and ESM, but due to its monolithic structure and side effects, **tree-shaking often fails**. Many bundlers cannot eliminate unused components because:

- The main entry point (`bootstrap.js`) imports and registers all components, creating dependencies that prevent removal.
- Side effects like event listeners and jQuery plugins are executed at import time, which forces bundlers to keep the entire module.

This package solves the problem by:

- **Providing a single ESM bundle** (`index.esm.js`) that exports only the public component classes (`Alert`, `Button`, etc.).
- **Removing all side-effectful registration code** from the main entry point (jQuery plugins, data API initialisation) – these are now opt-in via explicit imports if needed.
- **Allowing you to import only the components you actually use**, reducing bundle size significantly.

The code is taken directly from Bootstrap source (v5.3.x) with minimal modifications to ensure compatibility.

## Installation

```bash
npm install @supercat1337/bootstrap-esm @popperjs/core
```

> **Note:** `@popperjs/core` is a **peer dependency** – you must install it separately for tooltips and dropdowns.

## Usage

### Import individual components

```js
// Import only what you need
import { Alert, Button, Modal } from '@supercat1337/bootstrap-esm';

// Use it
const alert = Alert.getOrCreateInstance('#myAlert');
alert.close();

const modal = Modal.getOrCreateInstance('#myModal');
modal.show();
```

### Use with a bundler (Vite, Webpack, etc.)

```js
// main.js
import { Carousel, Dropdown, Tooltip } from '@supercat1337/bootstrap-esm';

// If you rely on data-api attributes, you need to explicitly initialise them:
// (This package does not auto-initialise on DOMContentLoaded)
document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
    Dropdown.getOrCreateInstance(el);
});
```

### Full list of exported components

- `Alert`
- `Button`
- `Carousel`
- `Collapse`
- `Dropdown`
- `Modal`
- `Offcanvas`
- `Popover`
- `ScrollSpy`
- `Tab`
- `Toast`
- `Tooltip`

### With CSS

You still need to include Bootstrap's CSS separately (e.g. via `bootstrap/dist/css/bootstrap.css` or a CDN). This package only provides JavaScript.

## Why not just use the official package?

The official `bootstrap` package **does not support tree-shaking** reliably. Even if you import only specific components, side effects keep the full library in your bundle. This package is built specifically to enable tree-shaking, so you can save bandwidth and improve load times.

## License

MIT © [Albert Bazaleev](https://github.com/supercat1337)

## Credits

This package is based on [Bootstrap](https://getbootstrap.com/) by the Bootstrap team, licensed under MIT.
