import Button from '../button.js';
import EventHandler from '../dom/event-handler.js';
import { defineJQueryPlugin } from '../util/index.js';

const DATA_API_KEY_BUTTON = '.data-api';
const EVENT_KEY_BUTTON = '.bs.button';
const EVENT_CLICK_DATA_API_BUTTON = `click${EVENT_KEY_BUTTON}${DATA_API_KEY_BUTTON}`;
const SELECTOR_DATA_TOGGLE_BUTTON = '[data-bs-toggle="button"]';
EventHandler.on(document, EVENT_CLICK_DATA_API_BUTTON, SELECTOR_DATA_TOGGLE_BUTTON, event => {
    event.preventDefault();
    const button = event.target.closest(SELECTOR_DATA_TOGGLE_BUTTON);
    const data = Button.getOrCreateInstance(button);
    data.toggle();
});
defineJQueryPlugin(Button);
