import React, { useEffect } from 'react';
import {
  Typography,
  Grid,
  IconButton,
  Slide,
  Paper,
  Box,
  List,
  Divider,
  GridProps,
  Button,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import SignalIcon from '@mui/icons-material/SignalCellular3Bar';
import Battery90Icon from '@mui/icons-material/Battery90';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Default from '../../../config/default.json';
import { NotificationItem } from './NotificationItem';
import usePhoneTime from '../../phone/hooks/usePhoneTime';
import { NoNotificationText } from './NoNotificationText';
import {
  notifications,
  useNavbarUncollapsed,
  useUnreadNotificationIds,
  useUnreadNotifications,
} from '@os/new-notifications/state';
import { useRecoilValue } from 'recoil';
import { useApp } from '@os/apps/hooks/useApps';
import { UnreadNotificationBarProps } from '@typings/notifications';
import { useNotification } from '../useNotification';
import { BatteryFull, SignalMedium } from 'lucide-react';
import { cn } from '@utils/css';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '30px',
    width: '100%',
    color: theme.palette.text.primary,
    zIndex: 99,
    paddingLeft: '15px',
    paddingRight: '15px',
    position: 'relative',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  item: {
    margin: '0 6px',
  },
  text: {
    position: 'relative',
    lineHeight: '30px',
    color: theme.palette.text.primary,
  },
  icon: {
    padding: '4px',
    color: theme.palette.text.primary,
  },
  drawer: {
    paddingTop: '30px',
    width: '100%',
    position: 'absolute',
    zIndex: 98,
  },
  closeNotifBtn: {
    position: 'absolute',
    right: '8px',
    top: '8px',
  },
  notificationItem: {
    position: 'relative',
  },
  collapseBtn: {
    margin: '0 auto',
  },
}));

interface WrapperGridProps extends GridProps {
  tgtNoti?: UnreadNotificationBarProps;
  key: string | number;
}

const IconUnreadGrid: React.FC<WrapperGridProps> = ({ tgtNoti }) => {
  const notificationTgtApp = useApp(tgtNoti.appId);

  return (
    <Grid
      item
      key={tgtNoti.id}
      component={IconButton}
      sx={{
        color: 'text.primary',
        fontSize: 'small',
      }}
    >
      {notificationTgtApp.notificationIcon}
    </Grid>
  );
};

interface UnreadNotificationListItemProps {
  tgtNotiId: string;
  key: string | number;
}

const UnreadNotificationListItem: React.FC<UnreadNotificationListItemProps> = ({ tgtNotiId }) => {
  const notiContents = useRecoilValue(notifications(tgtNotiId));

  return <NotificationItem key={tgtNotiId} {...notiContents} />;
};

export const NotificationBar = () => {
  const classes = useStyles();
  const time = usePhoneTime();
  const [barCollapsed, setBarUncollapsed] = useNavbarUncollapsed();

  const unreadNotificationIds = useUnreadNotificationIds();

  const unreadNotifications = useUnreadNotifications();

  const { markAllAsRead } = useNotification();

  const handleClearNotis = async () => {
    setBarUncollapsed(false);
    await markAllAsRead();
  };

  useEffect(() => {
    if (unreadNotificationIds.length === 0) {
      setBarUncollapsed(false);
    }
  }, [unreadNotificationIds, setBarUncollapsed]);

  return (
    <>
      <div
        className={cn(classes.root, 'flex flex-nowrap items-center justify-between')}
        onClick={() => {
          setBarUncollapsed((curr) => !curr);
        }}
      >
        <Grid container item wrap="nowrap">
          {unreadNotifications &&
            unreadNotifications
              .filter((val, idx, self) => idx === self.findIndex((t) => t.appId === val.appId))
              .map((notification, idx) => {
                return <IconUnreadGrid tgtNoti={notification} key={idx} />;
              })}
        </Grid>
        {/* {time && (
          <Grid item className={classes.item}>
            <Typography className={classes.text} variant="button">
              {time}
            </Typography>
          </Grid>
        )} */}
        <div className="flex items-center justify-end">
          <div>
            <SignalMedium />
          </div>
          <div className="mt-1.5 text-green-300">
            <BatteryFull />
          </div>
        </div>
      </div>
      <Slide direction="down" in={barCollapsed} mountOnEnter unmountOnExit>
        <Paper square className={cn(classes.drawer, 'rounded-2xl bg-gray-200/30 backdrop-blur')}>
          <Box py={1}>
            {unreadNotificationIds?.length !== 0 && (
              <Box pl={2}>
                <Button color="success" size="small" onClick={handleClearNotis}>
                  Rensa
                </Button>
              </Box>
            )}
            <List>
              <Divider />
              {unreadNotificationIds &&
                unreadNotificationIds
                  .filter((val, idx, self) => idx === self.findIndex((t: string) => t === val))
                  .map((notification, idx) => (
                    <UnreadNotificationListItem key={idx} tgtNotiId={notification} />
                  ))}
            </List>
          </Box>
          <Box display="flex" flexDirection="column">
            {!unreadNotificationIds.length && <NoNotificationText />}
            <IconButton
              className={classes.collapseBtn}
              size="small"
              onClick={() => setBarUncollapsed(false)}
            >
              <ArrowDropUpIcon />
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};
