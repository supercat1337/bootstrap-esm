import Alert from '../alert.js';
import { enableDismissTrigger } from '../util/component-functions.js';
import { defineJQueryPlugin } from '../util/index.js';

enableDismissTrigger(Alert, 'close');
defineJQueryPlugin(Alert);
