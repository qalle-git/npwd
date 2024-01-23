import { CallEvents, ActiveCall } from '@typings/call';
import { useNuiEvent } from 'fivem-nui-react-lib';
import { useCallNotification } from '@os/new-notifications/useCallNotification';
import { useSetRecoilState } from 'recoil';
import { callerState } from './state';
import { useCall } from './useCall';
import useTimer from './useTimer';

export const useCallService = () => {
  const { call, endCall, acceptCall, rejectCall } = useCall();
  const setCall = useSetRecoilState(callerState.currentCall);

  const { enqueueCallNotification, removeNotification } = useCallNotification();

  const { resetTimer, startTimer } = useTimer();

  useNuiEvent<ActiveCall | null>('CALL', CallEvents.SET_CALL_INFO, (callData) => {
    if (!callData) {
      return removeNotification();
    }

    setCall(callData);
    enqueueCallNotification(callData);
  });

  useNuiEvent('CALL', CallEvents.END_CALL, endCall);

  useNuiEvent('CALL', CallEvents.ACCEPT_CALL, () => {
    if (call !== null) {
      if (!call.is_accepted) {
        acceptCall();

        resetTimer();
        startTimer();
      }
    }
  });

  useNuiEvent('CALL', CallEvents.HANGUP_CALL, () => {
    if (call !== null) {
      if (!call.is_accepted && !call.isTransmitter) {
        rejectCall();
      } else {
        endCall();
      }

      resetTimer();
    }
  });
};
