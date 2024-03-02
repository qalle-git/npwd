import React, { Fragment } from 'react';
import { AppIcon } from './AppIcon';
import { Box, Grid, GridSize } from '@mui/material';
import { Link } from 'react-router-dom';
import { IApp } from '@os/apps/config/apps';
import { Tooltip } from './Tooltip';
import { useTranslation } from 'react-i18next';

interface GridMenuProps {
  items: IApp[];
  Component?: React.ElementType;
  xs?: GridSize;
}

export const GridMenu: React.FC<GridMenuProps> = ({ items, Component = AppIcon, xs }) => {
  const { t } = useTranslation();

  return (
    <Grid
      container
      sx={{
        height: '100%',
      }}
      alignItems="center"
      direction="row"
    >
      {items &&
        items.length &&
        items.map((item) => (
          <Fragment key={item.id}>
            {!item.isDisabled && (
              // <Tooltip
              //   title={t(item.nameLocale)}
              //   PopperProps={{
              //     popperOptions: {
              //       modifiers: [
              //         {
              //           name: 'offset',
              //           options: {
              //             offset: [0, -8],
              //           },
              //         },
              //       ],
              //     },
              //   }}
              // >
              //   <Link to={item.path} className="float-left w-1/4 p-2" key={item.id}>
              //     <div className="flex w-full items-center justify-center">
              //       <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-200/50 backdrop-blur transition-all hover:bg-gray-100/50">
              //         {item.icon}
              //       </div>
              //     </div>
              //   </Link>
              // </Tooltip>

              <Tooltip title={t(item.nameLocale)} PopperProps={{
                popperOptions: {
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: [0, -8],
                      },
                    },
                  ],
                },
              }}>

                <Grid item xs={xs} key={item.id}>
                  <Box textAlign="center">
                    <Link to={item.path}>
                      <Component {...item} />
                    </Link>
                  </Box>
                </Grid>
              </Tooltip>
            )}
          </Fragment>
        ))}
    </Grid>
  );
};
