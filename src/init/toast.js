
import Toast from '../toast.js';
import { enableDismissTrigger } from '../util/component-functions.js';
import { defineJQueryPlugin } from '../util/index.js';

enableDismissTrigger(Toast);
defineJQueryPlugin(Toast);
