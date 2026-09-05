
import EventHandler from '../dom/event-handler.js';
import SelectorEngine from '../dom/selector-engine.js';
import Modal from '../modal.js';
import { enableDismissTrigger } from '../util/component-functions.js';
import { defineJQueryPlugin, isVisible } from '../util/index.js';

const EVENT_KEY_MODAL = '.bs.modal';
const DATA_API_KEY_MODAL = '.data-api';
const EVENT_CLICK_DATA_API_MODAL = `click${EVENT_KEY_MODAL}${DATA_API_KEY_MODAL}`;
const SELECTOR_DATA_TOGGLE_MODAL = '[data-bs-toggle="modal"]';
const OPEN_SELECTOR_MODAL = '.modal.show';
EventHandler.on(document, EVENT_CLICK_DATA_API_MODAL, SELECTOR_DATA_TOGGLE_MODAL, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
    }
    EventHandler.one(target, 'show.bs.modal', showEvent => {
        if (showEvent.defaultPrevented) return;
        EventHandler.one(target, 'hidden.bs.modal', () => {
            if (isVisible(this)) this.focus();
        });
    });
    const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR_MODAL);
    if (alreadyOpen) {
        Modal.getInstance(alreadyOpen).hide();
    }
    const data = Modal.getOrCreateInstance(target);
    data.toggle(this);
});
enableDismissTrigger(Modal);
defineJQueryPlugin(Modal);
