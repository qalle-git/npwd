import React from 'react';
import { AppWrapper } from '@ui/components';
import { Box } from '@mui/material';
import { GridMenu } from '@ui/components/GridMenu';
import { useApps } from '@os/apps/hooks/useApps';
import { useExternalApps } from '@common/hooks/useExternalApps';
import { useRecoilValue } from 'recoil';
import { wallpaperBrightnessState } from '@apps/settings/state/settings.state';

export const HomeApp: React.FC = () => {
  const { apps } = useApps();
  const externalApps = useExternalApps();

  const brightness = useRecoilValue(wallpaperBrightnessState);

  const currentDate = new Date().toLocaleDateString();

  const currentTime = new Date();
  const currentHour = currentTime.getHours().toString().padStart(2, '0');
  const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');

  const textColor = brightness > 128 ? 'black' : 'white';

  return (
    <>
      <AppWrapper>
        <div
          style={{
            fontFamily: 'Poppins',
            color: textColor,
          }}
          className=" mb-2 pt-16 text-center text-7xl"
        >
          {currentHour}:{currentMinute}
        </div>
        <div
          style={{
            fontFamily: 'Poppins',
            color: textColor,
          }}
          className="font text-center text-sm"
        >
          {currentDate}
        </div>

        <Box component="div" mt={6} px={1}>
          {apps && <GridMenu xs={3} items={[...apps, ...externalApps]} />}
        </Box>

        {/* <div className="absolute bottom-5 left-8 right-8">
          <div className="h-20 w-full rounded-2xl bg-gray-200/30 backdrop-blur">
            {apps && <GridMenu xs={3} items={[...apps.slice(0, 4)]} />}
          </div>
        </div> */}
      </AppWrapper>
    </>
  );
};
