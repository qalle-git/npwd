import CallEnd from '@mui/icons-material/CallEnd';
import { Avatar, Grow } from '@mui/material';
import { SnackbarContent, CustomContentProps } from 'notistack';
import React, { forwardRef, useMemo } from 'react';
import { useCurrentCallValue } from '@os/call/hooks/state';
import { useCall } from '@os/call/hooks/useCall';
import useTimer from '@os/call/hooks/useTimer';
import { useTranslation } from 'react-i18next';
import { useContactActions } from '@apps/contacts/hooks/useContactActions';
import { NPWDButton, cn } from '@npwd/keyos';
import { Phone } from 'lucide-react';
import { calculateBgColor, hex2rgb } from '../NotificationBase';
import { useApp } from '@os/apps/hooks/useApps';
import { NotificationIcon } from '@os/notifications/components/NotificationIcon';

interface CallNotificationBaseProps extends CustomContentProps {
  title: string;
  transmitter: string;
  receiver: string;
}

export type CallNotificationBaseComponent = React.FC<CallNotificationBaseProps>;

const formatTime = (time: number) => (time < 10 ? `0${time}` : time);

export const CallNotificationBase = forwardRef<HTMLDivElement, CallNotificationBaseProps>(
  (props, ref) => {
    const { endCall, acceptCall, rejectCall } = useCall();
    const { transmitter, receiver } = props;
    const call = useCurrentCallValue();
    const { minutes, seconds, startTimer, resetTimer } = useTimer();

    const { getPictureByNumber } = useContactActions();

    const { t } = useTranslation();

    const app = useApp('DIALER');

    const rgbColor = hex2rgb(app.backgroundColor);
    const bgColor = calculateBgColor(rgbColor);

    const RECEIVER_TEXT = useMemo(
      () =>
        call?.is_accepted
          ? call.label ?? receiver
          : `${t('DIALER.MESSAGES.CALLING', {
              transmitter: call.label ?? receiver,
            })}`,
      [call.is_accepted, receiver],
    );

    const handleAcceptCall = () => {
      acceptCall();

      resetTimer();
      startTimer();
    };

    const handleEndOrRejectCall = () => {
      if (!call.is_accepted && !call.isTransmitter) {
        rejectCall();
      } else {
        endCall();
      }
      resetTimer();
    };

    if (!call) {
      return null;
    }

    const getDisplayAvatar = () => {
      if (call.isAnonymous) return '$';
      if (call.label) return call.label;

      return call.isTransmitter
        ? getPictureByNumber(call.receiver)
        : getPictureByNumber(call?.transmitter);
    };

    return (
      <SnackbarContent
        ref={ref}
        style={{ minWidth: '370px', backgroundColor: bgColor }}
        className="flex w-auto items-center justify-between rounded-md border-2 border-neutral-200 bg-neutral-50 px-4 py-3.5 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div className="flex items-center space-x-2 text-neutral-900 dark:text-neutral-50">
          <div className="flex items-center justify-center rounded-xl">
            <Avatar
              src={getDisplayAvatar()}
              sx={{ width: 40, height: 40, bgcolor: app.backgroundColor, color: 'white' }}
              className="rounded-2xl"
              variant="rounded"
            />
          </div>
          <div className="pl-1">
            {call?.isTransmitter ? (
              <p className="text-sm text-neutral-900 dark:text-neutral-50">{RECEIVER_TEXT}</p>
            ) : (
              <p className="text-sm text-neutral-900 dark:text-neutral-50">{transmitter}</p>
            )}
            <Grow in={call?.is_accepted} mountOnEnter unmountOnExit>
              <p
                style={{
                  fontWeight: 200,
                  fontSize: '0.6rem',
                  opacity: 0.5,
                }}
                className="text-neutral-900 dark:text-gray-50"
              >
                {`${formatTime(minutes)}:${formatTime(seconds)}`}
              </p>
            </Grow>
          </div>
        </div>
        <div className="flex space-x-4">
          {!call?.isTransmitter && !call?.is_accepted && (
            <NPWDButton
              onClick={handleAcceptCall}
              size="icon"
              className="rounded-full bg-green-600 hover:bg-green-700"
            >
              <Phone size={18} />
            </NPWDButton>
          )}
          <NPWDButton
            onClick={handleEndOrRejectCall}
            size="icon"
            className="rounded-full bg-red-600 hover:bg-red-700"
          >
            <CallEnd sx={{ fontSize: 18 }} />
          </NPWDButton>
        </div>
      </SnackbarContent>
    );
  },
);
