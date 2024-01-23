import { useEffect, useState } from 'react';
import { Slide, Paper, Typography, Button, Box, CircularProgress, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import useMessages from '../../hooks/useMessages';
import Conversation, { CONVERSATION_ELEMENT_ID } from './Conversation';
import MessageSkeletonList from './MessageSkeletonList';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContactActions } from '../../../contacts/hooks/useContactActions';
import { useMessagesState } from '../../hooks/state';
import { makeStyles } from '@mui/styles';
import { useMessageAPI } from '../../hooks/useMessageAPI';
import { useCall } from '@os/call/hooks/useCall';
import { useMessageActions } from '../../hooks/useMessageActions';
import GroupDetailsModal from './GroupDetailsModal';
import Backdrop from '@ui/components/Backdrop';
import { useMyPhoneNumber } from '@os/simcard/hooks/useMyPhoneNumber';
import { usePhone } from '@os/phone/hooks';
import { Phone, ArrowLeft } from 'lucide-react';
import MessageInput from '../form/MessageInput';
import AudioContextMenu from './AudioContextMenu';
import MessageContextMenu from './MessageContextMenu';
import { useQueryParams } from '@common/hooks/useQueryParams';

const LARGE_HEADER_CHARS = 30;
const MAX_HEADER_CHARS = 80;
const MINIMUM_LOAD_TIME = 600;

const useStyles = makeStyles({
  tooltip: {
    fontSize: 12,
  },
  modalHide: {
    display: 'none',
  },
  groupdisplay: {
    width: '300px',
    fontSize: '24px',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  largeGroupDisplay: {
    width: '300px',
    fontSize: '20px',
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
});

// abandon all hope ye who enter here
export const MessageModal = () => {
  const [t] = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { pathname } = useLocation();
  const { groupId } = useParams<{ groupId: string }>();
  const { activeMessageConversation, setActiveMessageConversation } = useMessages();
  const { fetchMessages } = useMessageAPI();
  const { getLabelOrContact, getConversationParticipant } = useMessageActions();
  const { initializeCall } = useCall();

  const { getContactByNumber } = useContactActions();
  const [messages, setMessages] = useMessagesState();

  const [isLoaded, setLoaded] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [audioContextMenuOpen, setAudioContextMenuOpen] = useState(false);

  const query = useQueryParams();
  const referalImage = query?.image || null;
  const referalNote = query?.note || null;

  const { ResourceConfig } = usePhone();

  const myPhoneNumber = useMyPhoneNumber();

  useEffect(() => {
    if (groupId) {
      fetchMessages(groupId, 0);
    }
  }, [groupId, fetchMessages]);

  useEffect(() => {
    let timeout;
    if (activeMessageConversation && messages) {
      timeout = setTimeout(() => {
        setLoaded(true);
      }, MINIMUM_LOAD_TIME);
      return;
    }
    setLoaded(false);
  }, [activeMessageConversation, messages]);

  const closeModal = () => {
    setMessages(null);
    history.push('/messages');
  };

  const openGroupModal = () => {
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
  };

  useEffect(() => {
    if (!groupId) return;
    setActiveMessageConversation(parseInt(groupId, 10));
  }, [groupId, setActiveMessageConversation]);

  useEffect(() => {
    if (isLoaded) {
      const element = document.getElementById(CONVERSATION_ELEMENT_ID);
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }, [isLoaded]);

  // We need to wait for the active conversation to be set.
  if (!activeMessageConversation) {
    return (
      <div>
        <CircularProgress />
      </div>
    );
  }

  let header = getLabelOrContact(activeMessageConversation);
  // don't allow too many characters, it takes too much room
  const truncatedHeader = `${header.slice(0, MAX_HEADER_CHARS).trim()}...`;
  header = header.length > MAX_HEADER_CHARS ? truncatedHeader : header;

  const headerClass =
    header.length > LARGE_HEADER_CHARS ? classes.largeGroupDisplay : classes.groupdisplay;

  const handleAddContact = (number: string) => {
    const exists = getContactByNumber(number);
    const referal = encodeURIComponent(pathname);
    if (exists) {
      return history.push(`/contacts/${exists.id}/?referal=${referal}`);
    }
    return history.push(`/contacts/-1/?addNumber=${number}&referal=${referal}`);
  };

  // This only gets used for 1 on 1 conversations
  let conversationList = activeMessageConversation.conversationList.split('+');
  conversationList = conversationList.filter((targetNumber) => targetNumber !== myPhoneNumber);
  // Add optionals here out of abundancy of caution for phone number being null
  // Participant is not participant ots the local phone number
  let targetNumber: string =
    conversationList.length > 0 ? conversationList[0] : activeMessageConversation.participant;

  const doesContactExist = getConversationParticipant(activeMessageConversation.conversationList);
  return (
    <Slide direction="left" in={!!activeMessageConversation}>
      <div className="space-between flex h-full w-full flex-col">
        <Box
          display="flex"
          paddingX={1}
          justifyContent="space-between"
          alignItems="center"
          component={Paper}
          sx={{ borderRadius: 0 }}
        >
          <button
            onClick={closeModal}
            className="mb-1 rounded-full bg-transparent p-2 hover:bg-neutral-100 hover:dark:bg-neutral-800"
          >
            <ArrowLeft size={26} />
          </button>
          <Typography sx={{ paddingLeft: 2 }} variant="h5" className={headerClass}>
            {header}
          </Typography>
          {!activeMessageConversation.isGroupChat && (
            <Tooltip
              classes={{ tooltip: classes.tooltip }}
              title={`${t('GENERIC.CALL')} ${targetNumber}`}
              placement="bottom"
            >
              <button
                onClick={() => initializeCall(targetNumber)}
                className="rounded-full bg-transparent p-3 hover:bg-neutral-100 hover:dark:bg-neutral-800"
              >
                <Phone size={18} />
              </button>
            </Tooltip>
          )}
          {activeMessageConversation.isGroupChat ? (
            <Button>
              <GroupIcon onClick={openGroupModal} fontSize="large" />
            </Button>
          ) : !activeMessageConversation.isGroupChat && !doesContactExist ? (
            <Button>
              <PersonAddIcon onClick={() => handleAddContact(targetNumber)} fontSize="large" />
            </Button>
          ) : !activeMessageConversation.isGroupChat && doesContactExist ? null : null}
        </Box>
        <div className="h-full">
          {isLoaded && activeMessageConversation && ResourceConfig ? (
            <Conversation
              isVoiceEnabled={ResourceConfig.voiceMessage.enabled}
              messages={messages}
              activeMessageGroup={activeMessageConversation}
            />
          ) : (
            <MessageSkeletonList />
          )}
        </div>
        <div>
          <div>
            {audioContextMenuOpen ? (
              <AudioContextMenu onClose={() => setAudioContextMenuOpen(false)} />
            ) : (
              <MessageInput
                messageGroupName={activeMessageConversation.participant}
                messageConversation={activeMessageConversation}
                onAddImageClick={() => setContextMenuOpen(true)}
                onVoiceClick={() => setAudioContextMenuOpen(true)}
                voiceEnabled={ResourceConfig.voiceMessage.enabled}
              />
            )}
          </div>
          <MessageContextMenu
            messageGroup={activeMessageConversation}
            isOpen={contextMenuOpen}
            onClose={() => setContextMenuOpen(false)}
            image={referalImage}
            note={referalNote}
          />
        </div>

        <GroupDetailsModal
          open={isGroupModalOpen}
          onClose={closeGroupModal}
          conversationList={activeMessageConversation.conversationList}
          addContact={handleAddContact}
        />
      </div>
    </Slide>
  );
};
