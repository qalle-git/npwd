import React from 'react';
import { AppWrapper } from '@ui/components';
import { Box } from '@mui/material';
import { GridMenu } from '@ui/components/GridMenu';
import { useApps } from '@os/apps/hooks/useApps';
import { useExternalApps } from '@common/hooks/useExternalApps';

export const HomeApp: React.FC = () => {
  const { apps } = useApps();
  const externalApps = useExternalApps();

  const currentDate = new Date().toLocaleDateString();

  const currentTime = new Date();
  const currentHour = currentTime.getHours().toString().padStart(2, '0');
  const currentMinute = currentTime.getMinutes().toString().padStart(2, '0');

  return (
    <>
      <AppWrapper>
        <div className=" mb-2 pt-16 text-center text-7xl text-black ">
          {currentHour}:{currentMinute}
        </div>
        <div className="text-center text-sm text-black">{currentDate}</div>

        <Box component="div" mt={6} px={1}>
          {apps && <GridMenu xs={3} items={[...apps.slice(4), ...externalApps]} />}
        </Box>

        <div className="absolute bottom-5 left-8 right-8">
          <div className="h-20 w-full rounded-2xl bg-gray-200/30 backdrop-blur">
            {apps && <GridMenu xs={3} items={[...apps.slice(0, 4)]} />}
          </div>
        </div>
      </AppWrapper>
    </>
  );
};
