// Stable entry point for UI components. Implementation lives in feature modules.
import { authApi } from './auth';
import { companionsApi } from './companions';
import { chatApi } from './chat';
import { memoryApi } from './memory';
import { mediaApi } from './media';
import { billingApi } from './billing';
import { lettersApi } from './letters';
import { activitiesApi } from './activities';

export const api = {
  ...authApi,
  ...companionsApi,
  ...chatApi,
  ...memoryApi,
  ...mediaApi,
  ...billingApi,
  ...lettersApi,
  ...activitiesApi,
};
