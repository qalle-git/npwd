import { IApp } from '@os/apps/config/apps';
import { SnackbarContent, CustomContentProps } from 'notistack';
import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { useNotification } from '../useNotification';
import { cn } from '@npwd/keyos';

interface NotificationBaseProps extends CustomContentProps {
  app: IApp;
  secondaryTitle?: string;
  path?: string;
  onClick?: () => void;
}

export type NotificationBaseComponent = React.FC<NotificationBaseProps>;

export const hex2rgb = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  let a = parseInt(hex.slice(7, 9), 16);

  return { r, g, b, a };
};

export const calculateBgColor = (rgbColor) => {
  const factor = 0.15;
  let { r, g, b } = rgbColor;
  r = Math.max(0, r * factor);
  g = Math.max(0, g * factor);
  b = Math.max(0, b * factor);

  return `rgba(${r}, ${g}, ${b}, 0.95)`;
};

const NotificationBase = forwardRef<HTMLDivElement, NotificationBaseProps>((props, ref) => {
  const { markAsRead } = useNotification();
  const { app, message, secondaryTitle, path, onClick } = props;
  const [t] = useTranslation();
  const history = useHistory();

  const handleNotisClick = () => {
    path && !onClick ? history.push(path) : onClick();
    markAsRead(props.id.toString());
  };

  if (!app) {
    console.error('App was not found. Could not render notification.');
    console.error(
      'If you are using an external app, make sure it is started before NPWD and that you pass the correct app id to the notification.',
    );
    return null;
  }

  if (!app.NotificationIcon) {
    console.warn('App does not have a notification icon');
  }

  const rgbColor = hex2rgb(app.backgroundColor);
  const bgColor = calculateBgColor(rgbColor);

  return (
    <SnackbarContent
      onClick={handleNotisClick}
      ref={ref}
      style={{ minWidth: '370px', backgroundColor: bgColor }}
      className="flex rounded-md border-2 border-neutral-200 bg-neutral-50 px-4 py-3.5 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="mb-2 flex w-full items-center text-neutral-900 dark:text-neutral-50">
        <div
          className={cn('flex items-center justify-center rounded-xl p-2')}
          style={{ backgroundColor: app.backgroundColor }}
        >
          {app.NotificationIcon && <app.NotificationIcon fontSize="inherit" />}
        </div>
        <div className="grow pl-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {t(app.nameLocale)}
        </div>
        <div>
          <p className="text-sm text-neutral-900 dark:text-neutral-50">{secondaryTitle}</p>
        </div>
      </div>
      <div className="line-clamp-2 overflow-hidden text-base text-neutral-900 dark:text-neutral-50">
        <p>{message}</p>
      </div>
    </SnackbarContent>
  );
});

export default NotificationBase;
