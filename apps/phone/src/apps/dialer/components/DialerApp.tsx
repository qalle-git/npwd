import React from 'react';
import { AppWrapper } from '@ui/components';
import { AppContent } from '@ui/components/AppContent';
import { DialerHistory } from './views/DialerHistory';
import { Switch, Route } from 'react-router-dom';
import DialPage from './views/DialPage';
import { ServicesList } from './views/ServicesList';
import DialerNavBar from './DialerNavBar';
import { ContactList } from '../../contacts/components/List/ContactList';
import { DialerThemeProvider } from '../providers/DialerThemeProvider';
import { LoadingSpinner } from '@ui/components/LoadingSpinner';
import InjectDebugData from '@os/debug/InjectDebugData';
import { MessageEvents } from '@typings/messages';

export const DialerApp: React.FC = () => {
  return (
    <DialerThemeProvider>
      <AppWrapper>
        <AppContent>
          <Switch>
            <Route path="/phone/dial">
              <DialPage />
            </Route>
            <Route path="/phone/services" component={ServicesList} />
            <Route exact path="/phone">
              <React.Suspense fallback={<LoadingSpinner />}>
                <DialerHistory />
              </React.Suspense>
            </Route>
            <React.Suspense fallback={<LoadingSpinner />}>
              <Route path="/phone/contacts" component={ContactList} />
            </React.Suspense>
          </Switch>
        </AppContent>
        <DialerNavBar />
      </AppWrapper>
    </DialerThemeProvider>
  );
};

InjectDebugData([
  {
    app: 'MESSAGES',
    method: MessageEvents.CREATE_MESSAGE_BROADCAST,
    data: {
      conversationName: '704-1549',
      conversation_id: 1,
      message: 'Hej snygging, du har glömt att skicka min veckopeng för att jag umgås med dig...',
      is_embed: false,
    },
  },
]);
