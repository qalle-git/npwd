import React, { useEffect, useState } from 'react';
import { useSettings } from './apps/settings/hooks/useSettings';
import { usePhoneVisibility } from '@os/phone/hooks/usePhoneVisibility';
import { Slide } from '@mui/material';
import { adjustTextColor, useWallpaper } from './apps/settings/hooks/useWallpaper';
import { useLocation } from 'react-router-dom';
import getBackgroundPath from '@apps/settings/utils/getBackgroundPath';
import { isDefaultWallpaper } from '@apps/settings/utils/isDefaultWallpaper';
import { useSetRecoilState } from 'recoil';
import { wallpaperBrightnessState } from '@apps/settings/state/settings.state';

interface PhoneWrapperProps {
  children: React.ReactNode;
}

const PhoneWrapper: React.FC<PhoneWrapperProps> = ({ children }) => {
  const [settings] = useSettings();
  const { bottom, visibility } = usePhoneVisibility();

  const { pathname } = useLocation();

  const { wallpaper } = useWallpaper();

  const setBackgroundLightness = useSetRecoilState(wallpaperBrightnessState);

  useEffect(() => {
    const url = isDefaultWallpaper(settings.wallpaper.value)
      ? getBackgroundPath(settings.wallpaper.value)
      : settings.wallpaper.value;

    adjustTextColor(url).then((brightness) => {
      setBackgroundLightness(brightness);
    });
  }, [setBackgroundLightness, settings.wallpaper.value]);

  return (
    <Slide direction="up" timeout={{ enter: 500, exit: 500 }} in={visibility}>
      <div className="PhoneWrapper">
        <div
          className="Phone"
          style={{
            position: 'fixed',
            transformOrigin: 'right bottom',
            transform: `scale(${settings.zoom.value}`,
            bottom,
          }}
        >
          <div
            className="PhoneFrame"
            style={{
              backgroundImage: `url(media/frames/${settings.frame.value})`,
            }}
          />
          <div
            id="phone"
            className="PhoneScreen bg-neutral-100 dark:bg-neutral-900"
            style={{
              backgroundImage: pathname === '/' && wallpaper,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </Slide>
  );
};

export default PhoneWrapper;
