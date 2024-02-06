import { CallHistoryItem } from '@typings/call';
import { DbInterface } from '@npwd/database';
import { FetchDefaultLimits } from '../utils/ServerConstants';

export class _CallsRepo {
  async saveCall(call: CallHistoryItem): Promise<void> {
    const query =
      'INSERT INTO npwd_calls (identifier, transmitter, receiver, isAnonymous, `start`) VALUES (?, ?, ?, ?, ?)';
    await DbInterface._rawExec(query, [
      call.identifier,
      call.transmitter,
      call.receiver,
      call.isAnonymous ?? false,
      call.start,
    ]);
  }

  async updateCall(call: CallHistoryItem, isAccepted: boolean, end: number): Promise<void> {
    if (!call || !call.identifier) return;

    const query = 'UPDATE npwd_calls SET is_accepted=?, end=? WHERE identifier = ?';
    await DbInterface._rawExec(query, [isAccepted, end, call.identifier]);
  }

  async fetchCalls(
    phoneNumber: string,
    limit = FetchDefaultLimits.CALLS_FETCH_LIMIT,
  ): Promise<CallHistoryItem[]> {
    const query =
      'SELECT * FROM npwd_calls WHERE receiver = ? OR transmitter = ? ORDER BY id DESC LIMIT ?';
    const [result] = await DbInterface._rawExec(query, [
      phoneNumber,
      phoneNumber,
      limit.toString(),
    ]);

    return <CallHistoryItem[]>result;
  }
}

export const CallsRepo = new _CallsRepo();
