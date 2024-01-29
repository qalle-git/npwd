import { config } from '../server';
import { DbInterface } from '@npwd/database';
import { playerLogger } from '../players/player.utils';

const exp = global.exports;

const genNumber = (length: number): string => {
  const addAmount = 1;
  let localMax = 11;

  if (length > localMax) {
    return genNumber(localMax) + genNumber(length - localMax);
  }

  localMax = Math.pow(10, length + addAmount);
  const min = localMax / 10;
  const number = Math.floor(Math.random() * (localMax - min + 1)) + min;

  const strNumber = '' + number;

  return strNumber.substr(addAmount);
};

const generateUsNumber = (): string => {
  const randomAreaCode = ['070', '072', '073', '076'][Math.floor(Math.random() * 4)];

  const rawNumber = `${randomAreaCode}${genNumber(7)}}`;

  return rawNumber;
};

/**/
export async function generateUniquePhoneNumber(): Promise<string> {
  if (config.customPhoneNumber.enabled) {
    try {
      const { exportResource, exportFunction } = config.customPhoneNumber;
      return await exp[exportResource][exportFunction]();
    } catch (e) {
      playerLogger.error(e.message);
      playerLogger.error('Please check your config for custom number generation');
    }
  }

  const query = `SELECT EXISTS(SELECT * FROM ${config.database.playerTable} WHERE ${config.database.phoneNumberColumn} = ?)`;
  const dashNumber = generateUsNumber();

  const [results] = await DbInterface._rawExec(query, [dashNumber]);

  if (!results) return generateUniquePhoneNumber();

  return dashNumber;
}
