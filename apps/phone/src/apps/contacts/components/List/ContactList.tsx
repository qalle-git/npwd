import React from 'react';
import { SearchContacts } from './SearchContacts';
import { Link, useHistory } from 'react-router-dom';
import { useFilteredContacts } from '../../hooks/state';
import { Contact } from '@typings/contact';
import { classNames } from '@utils/css';
import { useCall } from '@os/call/hooks/useCall';
import useMessages from '@apps/messages/hooks/useMessages';
import LogDebugEvent from '@os/debug/LogDebugEvents';
import { useContactActions } from '@apps/contacts/hooks/useContactActions';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { Phone, MessageSquare, Plus } from 'lucide-react';
import { List, ListItem, NPWDButton } from '@npwd/keyos';
import { initials } from '@utils/misc';

export interface ContactProps {
  contacts?: Contact[];

  viewOnly?: boolean;
}

export interface ContactItemProps extends Contact {
  viewOnly?: boolean;
}

export const ContactList: React.FC<ContactProps> = (props) => {
  const filteredContacts = props.contacts ?? useFilteredContacts();
  const history = useHistory();

  // FIXME: This should be reduced before being passed to the component
  const groupedContacts = filteredContacts.reduce((r, e) => {
    const group = e.display.charAt(0).toUpperCase();
    if (!r[group]) r[group] = { group, contacts: [e] };
    else r[group].contacts.push(e);

    return r;
  }, []);

  return (
    <div className="relative">
      <div className="sticky top-0 z-50">
        <div className="flex items-center space-x-2 bg-neutral-100 px-4 dark:bg-neutral-900">
          <SearchContacts />
          {!props.viewOnly && (
            <NPWDButton
              size="icon"
              className="rounded-full p-2 text-neutral-900"
              variant="ghost"
              onClick={() => history.push('/contacts/-1')}
            >
              <Plus className="h-6 w-6" />
            </NPWDButton>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-y-auto px-4">
        <nav className="space-y-2 overflow-y-auto" aria-label="Directory">
          {Object.keys(groupedContacts)
            .sort()
            .map((letter) => (
              <div key={letter} className="relative">
                <div className="sticky top-0 z-10 rounded-xl border-b border-t border-gray-200 bg-neutral-50 px-6 py-1 text-sm font-medium text-gray-500 dark:border-none dark:bg-neutral-800">
                  <h3>{letter}</h3>
                </div>
                <List>
                  {groupedContacts[letter].contacts.map((contact: Contact) => (
                    <ContactItem key={contact.id} {...contact} viewOnly={props.viewOnly} />
                  ))}
                </List>
              </div>
            ))}
        </nav>
      </div>
    </div>
  );
};

const ContactItem = (contact: ContactItemProps) => {
  const { initializeCall } = useCall();
  const { goToConversation } = useMessages();
  const { findExistingConversation } = useContactActions();
  const myPhoneNumber = useMyPhoneNumber();
  const history = useHistory();

  const startCall = (e) => {
    e.stopPropagation();
    e.preventDefault();
    LogDebugEvent({
      action: 'Emitting `Start Call` to Scripts',
      level: 2,
      data: true,
    });
    initializeCall(contact.number.toString());
  };

  const handleMessage = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const phoneNumber = contact.number.toString();
    LogDebugEvent({
      action: 'Routing to Message',
      level: 1,
      data: { phoneNumber },
    });
    const conversation = findExistingConversation(myPhoneNumber, phoneNumber);
    if (conversation) {
      return goToConversation(conversation);
    }

    history.push(`/messages/new?phoneNumber=${phoneNumber}`);
  };

  return (
    <ListItem>
      <div className="min-w-0 flex-1">
        <Link
          to={`${contact.viewOnly ? '#' : `/contacts/${contact.id}`}`}
          className="flex items-center justify-between focus:outline-none"
        >
          <div className="flex items-center space-x-2">
            {contact.avatar && contact.avatar.length > 0 ? (
              <img
                src={contact.avatar}
                className="inline-block h-10 w-10 rounded-full"
                alt={'avatar'}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full">
                <span className="text-gray-600 dark:text-gray-300">
                  {initials(contact.display)}
                </span>
              </div>
            )}
            <div>
              <p className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                {contact.display}
              </p>
              <p className="text-sm text-neutral-400">{contact.number}</p>
            </div>
          </div>
          <div className="space-x-3">
            <button
              onClick={startCall}
              className="rounded-full bg-green-100 p-3 text-green-500 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-neutral-700"
            >
              <Phone size={20} />
            </button>
            <button
              onClick={handleMessage}
              className="rounded-full bg-blue-100 p-3 text-blue-400 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-neutral-700"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </Link>
      </div>
    </ListItem>
  );
};
