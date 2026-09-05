
import EventHandler from '../dom/event-handler.js';
import Dropdown from '../dropdown.js';
import { defineJQueryPlugin } from '../util/index.js';

const EVENT_KEY_DROPDOWN = '.bs.dropdown';
const DATA_API_KEY_DROPDOWN = '.data-api';
const EVENT_KEYDOWN_DATA_API_DROPDOWN = `keydown${EVENT_KEY_DROPDOWN}${DATA_API_KEY_DROPDOWN}`;
const EVENT_CLICK_DATA_API_DROPDOWN = `click${EVENT_KEY_DROPDOWN}${DATA_API_KEY_DROPDOWN}`;
const EVENT_KEYUP_DATA_API_DROPDOWN = `keyup${EVENT_KEY_DROPDOWN}${DATA_API_KEY_DROPDOWN}`;
const SELECTOR_DATA_TOGGLE_DROPDOWN = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
const SELECTOR_MENU_DROPDOWN = '.dropdown-menu';
EventHandler.on(
    document,
    EVENT_KEYDOWN_DATA_API_DROPDOWN,
    SELECTOR_DATA_TOGGLE_DROPDOWN,
    Dropdown.dataApiKeydownHandler
);
EventHandler.on(
    document,
    EVENT_KEYDOWN_DATA_API_DROPDOWN,
    SELECTOR_MENU_DROPDOWN,
    Dropdown.dataApiKeydownHandler
);
EventHandler.on(document, EVENT_CLICK_DATA_API_DROPDOWN, Dropdown.clearMenus);
EventHandler.on(document, EVENT_KEYUP_DATA_API_DROPDOWN, Dropdown.clearMenus);
EventHandler.on(
    document,
    EVENT_CLICK_DATA_API_DROPDOWN,
    SELECTOR_DATA_TOGGLE_DROPDOWN,
    function (event) {
        event.preventDefault();
        Dropdown.getOrCreateInstance(this).toggle();
    }
);
defineJQueryPlugin(Dropdown);
