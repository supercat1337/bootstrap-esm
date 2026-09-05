import Carousel from '../carousel.js';
import EventHandler from '../dom/event-handler.js';
import Manipulator from '../dom/manipulator.js';
import SelectorEngine from '../dom/selector-engine.js';
import { defineJQueryPlugin } from '../util/index.js';

const EVENT_KEY_CAROUSEL = '.bs.carousel';
const DATA_API_KEY_CAROUSEL = '.data-api';
const EVENT_CLICK_DATA_API_CAROUSEL = `click${EVENT_KEY_CAROUSEL}${DATA_API_KEY_CAROUSEL}`;
const EVENT_LOAD_DATA_API_CAROUSEL = `load${EVENT_KEY_CAROUSEL}${DATA_API_KEY_CAROUSEL}`;
const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
const CLASS_NAME_CAROUSEL = 'carousel';
EventHandler.on(document, EVENT_CLICK_DATA_API_CAROUSEL, SELECTOR_DATA_SLIDE, function (event) {
    const target = SelectorEngine.getElementFromSelector(this);
    if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) return;
    event.preventDefault();
    const carousel = Carousel.getOrCreateInstance(target);
    const slideIndex = this.getAttribute('data-bs-slide-to');
    if (slideIndex) {
        carousel.to(slideIndex);
        carousel._maybeEnableCycle();
        return;
    }
    if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
        carousel.next();
        carousel._maybeEnableCycle();
        return;
    }
    carousel.prev();
    carousel._maybeEnableCycle();
});
EventHandler.on(window, EVENT_LOAD_DATA_API_CAROUSEL, () => {
    const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
    for (const carousel of carousels) {
        Carousel.getOrCreateInstance(carousel);
    }
});
defineJQueryPlugin(Carousel);
