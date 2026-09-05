
import EventHandler from '../dom/event-handler.js';
import SelectorEngine from '../dom/selector-engine.js';
import ScrollSpy from '../scrollspy.js';
import { defineJQueryPlugin } from '../util/index.js';

const EVENT_KEY_SCROLLSPY = '.bs.scrollspy';
const DATA_API_KEY_SCROLLSPY = '.data-api';
const EVENT_LOAD_DATA_API_SCROLLSPY = `load${EVENT_KEY_SCROLLSPY}${DATA_API_KEY_SCROLLSPY}`;
const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
EventHandler.on(window, EVENT_LOAD_DATA_API_SCROLLSPY, () => {
    for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
        ScrollSpy.getOrCreateInstance(spy);
    }
});
defineJQueryPlugin(ScrollSpy);
