import React from 'react';
import { ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import { useApp } from '@os/apps/hooks/useApps';
import { useRecoilValue } from 'recoil';
import { notifications, useSetNavbarUncollapsed } from '@os/new-notifications/state';
import { useNotification } from '@os/new-notifications/useNotification';
import { useHistory, useLocation } from 'react-router-dom';
import { wallpaperBrightnessState } from '@apps/settings/state/settings.state';

interface NotificationItemProps {
  id: string;
  key: string | number;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ id, key }) => {
  const { appId, content, path } = useRecoilValue(notifications(id));
  const { markAsRead } = useNotification();
  const { icon, color } = useApp(appId);
  const history = useHistory();
  const closeBar = useSetNavbarUncollapsed();

  const handleOnClose = () => {
    markAsRead(id);
    closeBar(false); // set's to be to collapsed - wording is weird
    history.push(path);
  };

  const { pathname } = useLocation();

  const brightness = useRecoilValue(wallpaperBrightnessState);

  const textColor = brightness > 128 && pathname === '/' ? 'black' : 'white';

  return (
    <ListItem
      divider
      button
      onClick={handleOnClose}
      sx={{ pr: '28px', position: 'relative' }}
      key={key}
    >
      {icon && <ListItemAvatar className={`text-${textColor}`}>{icon}</ListItemAvatar>}
      <span className={`text-sm text-${textColor}`}>{content}</span>
    </ListItem>
  );
};
