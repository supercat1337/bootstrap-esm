
import EventHandler from '../dom/event-handler.js';
import SelectorEngine from '../dom/selector-engine.js';
import Offcanvas from '../offcanvas.js';
import { enableDismissTrigger } from '../util/component-functions.js';
import { defineJQueryPlugin, isDisabled, isVisible } from '../util/index.js';

const EVENT_KEY_OFFCANVAS = '.bs.offcanvas';
const DATA_API_KEY_OFFCANVAS = '.data-api';
const EVENT_CLICK_DATA_API_OFFCANVAS = `click${EVENT_KEY_OFFCANVAS}${DATA_API_KEY_OFFCANVAS}`;
const EVENT_LOAD_DATA_API_OFFCANVAS = `load${EVENT_KEY_OFFCANVAS}${DATA_API_KEY_OFFCANVAS}`;
const EVENT_RESIZE_OFFCANVAS = `resize${EVENT_KEY_OFFCANVAS}`;
const SELECTOR_DATA_TOGGLE_OFFCANVAS = '[data-bs-toggle="offcanvas"]';
const OPEN_SELECTOR_OFFCANVAS = '.offcanvas.show';
EventHandler.on(
    document,
    EVENT_CLICK_DATA_API_OFFCANVAS,
    SELECTOR_DATA_TOGGLE_OFFCANVAS,
    function (event) {
        const target = SelectorEngine.getElementFromSelector(this);
        if (['A', 'AREA'].includes(this.tagName)) {
            event.preventDefault();
        }
        if (isDisabled(this)) return;
        EventHandler.one(target, 'hidden.bs.offcanvas', () => {
            if (isVisible(this)) this.focus();
        });
        const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR_OFFCANVAS);
        if (alreadyOpen && alreadyOpen !== target) {
            Offcanvas.getInstance(alreadyOpen).hide();
        }
        const data = Offcanvas.getOrCreateInstance(target);
        data.toggle(this);
    }
);
EventHandler.on(window, EVENT_LOAD_DATA_API_OFFCANVAS, () => {
    for (const selector of SelectorEngine.find(OPEN_SELECTOR_OFFCANVAS)) {
        Offcanvas.getOrCreateInstance(selector).show();
    }
});
EventHandler.on(window, EVENT_RESIZE_OFFCANVAS, () => {
    for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
        if (getComputedStyle(element).position !== 'fixed') {
            Offcanvas.getOrCreateInstance(element).hide();
        }
    }
});
enableDismissTrigger(Offcanvas);
defineJQueryPlugin(Offcanvas);
