import { sendMessage } from '../utils/messages';
import { PhoneEvents } from '@typings/phone';
import { config } from './cl_config';
import { animationService } from './animations/animation.controller';
import { RegisterNuiCB } from './cl_utils';

// All main globals that are set and used across files
global.isPhoneOpen = false;
global.isPhoneDisabled = false;
global.isPlayerLoaded = false;
global.clientPhoneNumber = null;
global.phoneProp = null;

const exps = global.exports;

/* * * * * * * * * * * * *
 *
 *  Phone initialize data
 *
 * * * * * * * * * * * * */

onNet(PhoneEvents.SET_PLAYER_LOADED, (state: boolean) => {
  global.isPlayerLoaded = state;
  // Whenever a player is unloaded, we need to communicate this to the NUI layer.
  // resetting the global state.
  if (!state) {
    sendMessage('PHONE', PhoneEvents.UNLOAD_CHARACTER, {});
  }
});

RegisterKeyMapping(
  config.general.toggleCommand,
  'Toggle Phone',
  'keyboard',
  config.general.toggleKey,
);

setTimeout(() => {
  emit(
    'chat:addSuggestion',
    `/${config.general.toggleCommand}`,
    'Toggle displaying your cellphone',
  );
}, 1000);

const getCurrentGameTime = () => {
  const [year, month, day, hour, minute, second] = GetPosixTime();

  let hourUI = hour.toString();
  let minuteUI = minute.toString();

  // Format time if need be
  if (hour < 10) hourUI = `0${hour}`;
  if (minute < 10) minuteUI = `0${minute}`;

  return `${hourUI}:${minuteUI}`;
};

/* * * * * * * * * * * * *
 *
 *  Phone Visibility Handling
 *
 * * * * * * * * * * * * */

export const showPhone = async (): Promise<void> => {
  global.isPhoneOpen = true;
  const time = getCurrentGameTime();
  await animationService.openPhone(); // Animation starts before the phone is open
  emitNet(PhoneEvents.FETCH_CREDENTIALS);
  SetCursorLocation(0.9, 0.922); //Experimental
  sendMessage('PHONE', PhoneEvents.SET_VISIBILITY, true);
  sendMessage('PHONE', PhoneEvents.SET_TIME, time);
  SetNuiFocus(true, true);
  SetNuiFocusKeepInput(true);
  emit('npwd:disableControlActions', true);

  SetCurrentPedWeapon(PlayerPedId(), GetHashKey('WEAPON_UNARMED'), true);
};

export const hidePhone = async (): Promise<void> => {
  global.isPhoneOpen = false;
  sendMessage('PHONE', PhoneEvents.SET_VISIBILITY, false);
  await animationService.closePhone();
  SetNuiFocus(false, false);
  SetNuiFocusKeepInput(false);
  emit('npwd:disableControlActions', false);
};

/* * * * * * * * * * * * *
 *
 *  Register Command and Keybinding
 *
 * * * * * * * * * * * * */
RegisterCommand(
  config.general.toggleCommand,
  async () => {
    //-- Toggles Phone
    // Check to see if the phone is marked as disabled
    if (!global.isPhoneDisabled && !IsPauseMenuActive()) await togglePhone();
  },
  false,
);

RegisterCommand(
  'phone:restart',
  async () => {
    await hidePhone();
    sendMessage('PHONE', 'phoneRestart', {});
  },
  false,
);

/* * * * * * * * * * * * *
 *
 *  Misc. Helper Functions
 *
 * * * * * * * * * * * * */

export const checkHasPhone = async (): Promise<boolean> => {
  if (!config.PhoneAsItem.enabled) return true;
  const exportResp = await Promise.resolve(
    exps[config.PhoneAsItem.exportResource][config.PhoneAsItem.exportFunction](),
  );
  if (typeof exportResp !== 'number' && typeof exportResp !== 'boolean') {
    throw new Error('You must return either a boolean or number from your export function');
  }

  return !!exportResp;
};

async function togglePhone(): Promise<void> {
  const canAccess = await checkHasPhone();
  if (!canAccess) return;
  if (global.isPhoneOpen) return await hidePhone();
  await showPhone();
}

onNet(
  PhoneEvents.SEND_CREDENTIALS,
  (number: string, playerSource: number, playerIdentifier: string) => {
    global.clientPhoneNumber = number;
    sendMessage('SIMCARD', PhoneEvents.SET_NUMBER, number);
    sendMessage('PHONE', PhoneEvents.SEND_PLAYER_SOURCE, playerSource);
    sendMessage('PHONE', PhoneEvents.SEND_PLAYER_IDENTIFIER, playerIdentifier);
  },
);

on('onResourceStop', (resource: string) => {
  if (resource === GetCurrentResourceName()) {
    sendMessage('PHONE', PhoneEvents.SET_VISIBILITY, false);
    SetNuiFocus(false, false);
    animationService.endPhoneCall();
    animationService.closePhone();
    ClearPedTasks(PlayerPedId()); //Leave here until launch as it'll fix any stuck animations.
  }
});

/* * * * * * * * * * * * *
 *
 *  NUI Service Callback Registration
 *
 * * * * * * * * * * * * */
RegisterNuiCB<void>(PhoneEvents.CLOSE_PHONE, async (_, cb) => {
  await hidePhone();
  cb();
});

// NOTE: This probably has an edge case when phone is closed for some reason
// and we need to toggle keep input off
RegisterNuiCB<{ keepGameFocus: boolean }>(
  PhoneEvents.TOGGLE_KEYS,
  async ({ keepGameFocus }, cb) => {
    // We will only
    if (global.isPhoneOpen) SetNuiFocusKeepInput(keepGameFocus);
    cb({});
  },
);

// If you want to remove controls from a external application this is the way to do it.
// chip - commenting this out because it crashed the phone for some reason, even though it's not used anywhere??? like...we dont emit it
on(PhoneEvents.SET_GAME_FOCUS, (keepGameFocus: boolean) => {
  if (global.isPhoneOpen) SetNuiFocusKeepInput(keepGameFocus);
});

/* * * * * * * * * * * * *
 *
 *  PhoneAsItem Export Checker
 *
 * * * * * * * * * * * * */
if (config.PhoneAsItem.enabled) {
  setTimeout(() => {
    let doesExportExist = false;

    const { exportResource, exportFunction } = config.PhoneAsItem;
    emit(`__cfx_export_${exportResource}_${exportFunction}`, () => {
      doesExportExist = true;
    });

    if (!doesExportExist) {
      console.log('\n^1Incorrect PhoneAsItem configuration detected. Export does not exist.^0\n');
    }
  }, 100);
}

// Will update the phone's time even while its open
setInterval(() => {
  const time = getCurrentGameTime() as string;
  sendMessage('PHONE', PhoneEvents.SET_TIME, time);
}, 2000);
