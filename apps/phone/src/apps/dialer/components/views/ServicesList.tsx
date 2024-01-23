import React, { useEffect, useState } from 'react';

import { ContactList } from '@apps/contacts/components/List/ContactList';
import { Contact } from '@typings/contact';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';

export const ServicesList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const serviceContacts = await fetchNui<ServerPromiseResp<Contact[]>>('npwd:getServices');

      if (serviceContacts.status === 'ok') setContacts(serviceContacts.data);
    };

    fetchContacts().catch((e) => console.error(e));
  }, []);

  return (
    <div>
      <ContactList contacts={contacts} viewOnly />
    </div>
  );
};
