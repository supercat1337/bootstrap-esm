
import EventHandler from '../dom/event-handler.js';
import SelectorEngine from '../dom/selector-engine.js';
import Tab from '../tab.js';
import { defineJQueryPlugin, isDisabled } from '../util/index.js';

const EVENT_KEY_TAB = '.bs.tab';
const EVENT_CLICK_DATA_API_TAB = `click${EVENT_KEY_TAB}`;
const EVENT_LOAD_DATA_API_TAB = `load${EVENT_KEY_TAB}`;
const SELECTOR_DATA_TOGGLE_TAB =
    '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]';
const SELECTOR_DATA_TOGGLE_ACTIVE_TAB = `.active[data-bs-toggle="tab"], .active[data-bs-toggle="pill"], .active[data-bs-toggle="list"]`;
EventHandler.on(document, EVENT_CLICK_DATA_API_TAB, SELECTOR_DATA_TOGGLE_TAB, function (event) {
    if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
    }
    if (isDisabled(this)) return;
    Tab.getOrCreateInstance(this).show();
});
EventHandler.on(window, EVENT_LOAD_DATA_API_TAB, () => {
    for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE_TAB)) {
        Tab.getOrCreateInstance(element);
    }
});
defineJQueryPlugin(Tab);
