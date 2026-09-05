import Collapse from '../collapse.js';
import EventHandler from '../dom/event-handler.js';
import SelectorEngine from '../dom/selector-engine.js';
import { defineJQueryPlugin } from '../util/index.js';

const EVENT_KEY_COLLAPSE = '.bs.collapse';
const DATA_API_KEY_COLLAPSE = '.data-api';
const EVENT_CLICK_DATA_API_COLLAPSE = `click${EVENT_KEY_COLLAPSE}${DATA_API_KEY_COLLAPSE}`;
const SELECTOR_DATA_TOGGLE_COLLAPSE = '[data-bs-toggle="collapse"]';
EventHandler.on(
    document,
    EVENT_CLICK_DATA_API_COLLAPSE,
    SELECTOR_DATA_TOGGLE_COLLAPSE,
    function (event) {
        if (
            event.target.tagName === 'A' ||
            (event.delegateTarget && event.delegateTarget.tagName === 'A')
        ) {
            event.preventDefault();
        }
        for (const element of SelectorEngine.getMultipleElementsFromSelector(this)) {
            Collapse.getOrCreateInstance(element, { toggle: false }).toggle();
        }
    }
);
defineJQueryPlugin(Collapse);
