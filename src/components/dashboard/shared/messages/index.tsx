// Full updated component with group chat support added

'use client';

import { useMessageHook } from '@/hooks/useMessageHook';
import {
  useEffect,
  useState,
  useRef,
  SetStateAction,
  useCallback,
} from 'react';
import { DocumentData } from 'firebase/firestore';
import { useAuth } from '@/context/user/userContext';
import {
  Box,
  Flex,
  VStack,
  Text,
  Input,
  Button,
  Avatar,
  IconButton,
  useToast,
  Badge,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  Send,
  Edit2,
  Trash2,
  MessageCircle,
  Paperclip,
  Users,
  Plus,
  MoreVertical,
  Pen,
} from 'lucide-react';
import AdminNavbar from '../../admin/tabs/navbar';
import LawyerNavbar from '../../lawyer/tabs/navbar';
import LoaderComponent from '@/components/ui/loader';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { storage } from '@/lib/config/firebase.config';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FilePreview } from './FilePreview';
import Image from 'next/image';
import CreateGroup from './CreateGroup';
import { DialogButton } from '@/components/ui/alert-dialog';

const MessagesTab = ({ user }: { user: 'admin' | 'lawyer' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [groups, setGroups] = useState<DocumentData[]>([]);
  const [selectedUser, setSelectedUser] = useState<DocumentData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<DocumentData | null>(null);
  const [chatType, setChatType] = useState<'user' | 'group'>('user');
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { authUser, role } = useAuth();
  const {
    sendMessage,
    sendGroupMessage,
    deleteMessage,
    editMessage,
    markMessagesAsSeen,
    subscribeToMessages,
    subscribeToGroupMessages,
    subscribeToUserUpdates,
    getGroupsForUser,
    createGroup,
    deleteGroup,
    editGroup: editGroupHooks,
    markGroupMessagesAsSeen,
    countUnseenMessagesForGroup,
  } = useMessageHook();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const groupModal = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const storageRef = ref(storage, 'chatFiles');
  const inputRef = useRef<HTMLInputElement>(null);

  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!authUser) return;

    const unsubscribe = subscribeToUserUpdates(authUser.uid, setUsers);

    getGroupsForUser(authUser.uid).then(setGroups);

    return () => unsubscribe();
  }, [authUser]);

  useEffect(() => {
    if (authUser && chatType === 'user' && selectedUser) {
      const unsubscribe = subscribeToMessages(
        authUser.uid,
        selectedUser.id,
        setMessages,
      );
      markMessagesAsSeen(selectedUser.id, authUser.uid);
      return () => unsubscribe();
    }
    if (authUser && chatType === 'group' && selectedGroup) {
      const unsubscribe = subscribeToGroupMessages(
        selectedGroup.id,
        setMessages,
      );

      markGroupMessagesAsSeen(selectedGroup.id, authUser.uid);
      return () => unsubscribe();
    }
  }, [authUser, chatType, selectedUser, selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type.startsWith('image/') || file.type === 'application/pdf')
    ) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() || selectedFile) && authUser) {
      setLoading(true);
      try {
        let fileMessage = {};
        if (selectedFile) {
          const fileRef = ref(
            storageRef,
            `${authUser.uid}/${selectedFile.name}`,
          );
          await uploadBytes(fileRef, selectedFile);
          const downloadURL = await getDownloadURL(fileRef);
          fileMessage = {
            fileName: selectedFile.name,
            fileURL: downloadURL,
            fileType: selectedFile.type,
          };
        }
        const content = newMessage.trim() || selectedFile?.name || '';

        if (chatType === 'user' && selectedUser) {
          await sendMessage(authUser.uid, selectedUser.id, {
            ...fileMessage,
            content,
          });
        } else if (chatType === 'group' && selectedGroup) {
          await sendGroupMessage(authUser.uid, selectedGroup.id, {
            content: newMessage.trim() || selectedFile?.name || '',
            ...fileMessage,
          });
        }

        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        toast({ title: 'Failed to send message', status: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectUser = (user: DocumentData) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setChatType('user');
  };

  const handleSelectGroup = (group: DocumentData) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setChatType('group');
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0 || !authUser) return;
    try {
      await createGroup(groupName.trim(), selectedMembers, authUser.uid);
      setGroupName('');
      setSelectedMembers([]);
      groupModal.onClose();
      toast({ title: 'Group created successfully', status: 'success' });
      const updatedGroups = await getGroupsForUser(authUser.uid);
      setGroups(updatedGroups);
    } catch (err) {
      toast({ title: 'Failed to create group', status: 'error' });
    }
  };
  const handleEditGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0 || !authUser) return;
    try {
      await editGroupHooks(editGroup?.id as string, {
        name: groupName,
        members: selectedMembers,
      });
      setGroupName('');
      setSelectedMembers([]);
      groupModal.onClose();
      toast({ title: 'Group edited successfully', status: 'success' });
      const updatedGroups = await getGroupsForUser(authUser.uid);
      setGroups(updatedGroups);
    } catch (err) {
      toast({ title: 'Failed to create group', status: 'error' });
    }
  };

  const [editGroup, setEditGroup] = useState<{
    name: string;
    members: string[];
    id: string;
  }>();
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredGroups = groups?.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const SidebarContent = () => (
    <>
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <Input
          ref={inputRef}
          placeholder={`Search ${chatType === 'user' ? 'users' : 'groups'}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <HStack mt={2} spacing={2}>
          <Button
            size="sm"
            onClick={() => setChatType('user')}
            colorScheme={chatType === 'user' ? 'blue' : 'gray'}
          >
            Users
          </Button>
          <Button
            size="sm"
            onClick={() => setChatType('group')}
            colorScheme={chatType === 'group' ? 'blue' : 'gray'}
          >
            Groups
          </Button>
        </HStack>
      </Box>
      <VStack spacing={2} align="stretch" p={4} flex={1} overflowY="auto">
        {(chatType === 'user' ? filteredUsers : filteredGroups)?.map((item) => {
          // let groupUnseen = 0
          // if(chatType === groupName) {
          //  groupUnseen =    await countUnseenMessagesForGroup(item.id, authUser?.uid as string)
          // }

          return (
            <Box
              key={item.id}
              p={2}
              cursor="pointer"
              bg={
                chatType === 'user'
                  ? selectedUser?.id === item.id
                    ? 'gray.100'
                    : 'white'
                  : selectedGroup?.id === item.id
                    ? 'gray.100'
                    : 'white'
              }
              onClick={() =>
                chatType === 'user'
                  ? handleSelectUser(item)
                  : handleSelectGroup(item)
              }
              borderRadius="md"
              _hover={{ bg: 'gray.50' }}
            >
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Avatar
                    size="sm"
                    name={item.name}
                    src={item.photoURL || ''}
                    icon={chatType === 'group' ? <Users /> : undefined}
                    mr={2}
                  />
                  <Box>
                    <Text fontWeight="bold">{item.name}</Text>
                    {chatType === 'user' && item.lastMessage && (
                      <Text fontSize="sm" color="gray.500" noOfLines={1}>
                        {!item.lastMessage.isDeleted
                          ? item.lastMessage.content
                          : `Message deleted`}
                      </Text>
                    )}
                  </Box>
                </Flex>
                {chatType === 'group' &&
                  (role === 'SUPERADMIN' ||
                    role === 'ADMIN' ||
                    role === 'HR') && (
                    <Box>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<MoreVertical />}
                          variant="outline"
                        />

                        <MenuList zIndex={50} maxWidth={100}>
                          <MenuItem>
                            <Button
                              onClick={() => {
                                groupModal.onOpen();
                                setMode('edit');
                                setEditGroup({
                                  members: item.members,
                                  name: item.name,
                                  id: item.id,
                                });
                              }}
                              w="100%"
                            >
                              <Pen /> Edit
                            </Button>
                          </MenuItem>

                          <MenuItem>
                            <DialogButton
                              title="Delete"
                              message="Do you want to Delete?"
                              onConfirm={async () => {
                                await deleteGroup(item.id);
                                setGroups((prev) =>
                                  prev.filter((g) => g.id !== item.id),
                                );
                              }}
                              confirmButtonColorScheme="red"
                            >
                              <Trash2 /> Delete
                            </DialogButton>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Box>
                  )}
                {chatType === 'user' && item.unseenCount > 0 && (
                  <Badge colorScheme="red" borderRadius="full" px="2">
                    {item.unseenCount}
                  </Badge>
                )}

                {/* {
                chatType === 'group' && groupUnseen > 0 && (
                <Badge colorScheme="red" borderRadius="full" px="2">
                  {groupUnseen}
                </Badge>)
              } */}
              </Flex>
            </Box>
          );
        })}

        {(role === 'HR' || role === 'SUPERADMIN' || role === 'ADMIN') &&
          chatType === 'group' && (
            <IconButton
              size="sm"
              aria-label="Create Group"
              icon={<Plus size={18} />}
              onClick={() => {
                groupModal.onOpen();
                setMode('create');
              }}
            />
          )}
      </VStack>
    </>
  );

  // Renders message list + input UI exactly the same
  // You can reuse your message rendering component logic from your original file

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    toast({
      title: 'Message deleted',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await editMessage(messageId, content);
      setEditingMessage(null);
      toast({
        title: 'Message edited',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to edit message',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <CreateGroup
        handleCreateOrEditGroup={
          mode === 'create' ? handleCreateGroup : handleEditGroup
        }
        groupModal={groupModal}
        groupName={groupName}
        setGroupName={setGroupName}
        selectedMembers={selectedMembers}
        setSelectedMembers={setSelectedMembers}
        mode={mode}
        groupData={editGroup}
      />

      {user === 'admin' ? <AdminNavbar /> : <LawyerNavbar />}
      <Flex h="calc(100vh - 64px)" overflow="hidden">
        {!isMobile ? (
          <Box
            w={{ base: '100%', md: '30%' }}
            borderRight="1px"
            borderColor="gray.200"
            display="flex"
            flexDirection="column"
          >
            <SidebarContent />
          </Box>
        ) : (
          <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader borderBottomWidth="1px">Chats</DrawerHeader>
              <DrawerBody p={0}>
                <SidebarContent />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )}

        <Box
          w={{ base: '100%', md: '70%' }}
          p={4}
          display="flex"
          flexDirection="column"
        >
          {isMobile && (
            <Button
              onClick={onOpen}
              mb={4}
              size="md"
              variant="outline"
              borderRadius="full"
              bg="white"
              color="gray.600"
              _hover={{ bg: 'gray.100' }}
              boxShadow="md"
              fontWeight="medium"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text mr={2}>Open Chats</Text>
              <MessageCircle size={20} />
            </Button>
          )}
          {selectedUser || selectedGroup ? (
            <>
              <Box flex="1" overflowY="auto" mb={4}>
                <VStack spacing={4} align="stretch">
                  {messages.map((message) => {
                    const messageTime = message.timestamp
                      ? new Date(message.timestamp.toMillis()).toLocaleString()
                      : '';

                    const isEditable =
                      message.senderId === authUser?.uid &&
                      new Date().getTime() -
                        new Date(message.timestamp?.toMillis()).getTime() <=
                        15 * 60 * 1000;

                    const senderName =
                      users.find((u) => u.id === message.senderId)?.name ||
                      'Unknown';

                    return (
                      <Box
                        key={message.id}
                        alignSelf={
                          message.senderId === authUser?.uid
                            ? 'flex-end'
                            : 'flex-start'
                        }
                        bg={
                          message.senderId === authUser?.uid
                            ? 'blue.100'
                            : 'gray.100'
                        }
                        p={2}
                        borderRadius="md"
                        maxW="70%"
                      >
                        {message.isDeleted ? (
                          <Text fontStyle="italic">
                            {message.senderId === authUser?.uid
                              ? 'You'
                              : senderName}{' '}
                            deleted this message
                          </Text>
                        ) : editingMessage === message.id ? (
                          <Input
                            value={message.content}
                            onChange={(e) => {
                              // Update the message content locally
                              const updatedMessages = messages.map((m) =>
                                m.id === message.id
                                  ? { ...m, content: e.target.value }
                                  : m,
                              );
                              setMessages(updatedMessages);
                            }}
                            onBlur={() =>
                              handleEditMessage(message.id, message.content)
                            }
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleEditMessage(message.id, message.content);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <>
                            {selectedGroup &&
                              message.senderId !== authUser?.uid && (
                                <Text fontWeight="bold" fontSize="sm" mb={1}>
                                  {senderName}
                                </Text>
                              )}
                            {message.fileURL && (
                              <Box mb={2}>
                                {message.fileType.startsWith('image/') ? (
                                  <Image
                                    src={message.fileURL}
                                    alt={message.fileName}
                                    width={200}
                                    height={200}
                                    style={{
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() =>
                                      window.open(message.fileURL, '_blank')
                                    }
                                  />
                                ) : message.fileType === 'application/pdf' ? (
                                  <Button
                                    variant="link"
                                    onClick={() =>
                                      window.open(message.fileURL, '_blank')
                                    }
                                  >
                                    View PDF: {message.fileName}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="link"
                                    as="a"
                                    href={message.fileURL}
                                    download
                                  >
                                    Download: {message.fileName}
                                  </Button>
                                )}
                              </Box>
                            )}
                            <Text>{message.content}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {messageTime}
                            </Text>
                            {message.isEdited && (
                              <Text fontSize="xs" color="gray.400" mt={1}>
                                Edited
                              </Text>
                            )}
                            <Flex justify="flex-end" align="center" mt={1}>
                              {message.senderId === authUser?.uid &&
                                isEditable && (
                                  <>
                                    {editingMessage === message.id ? (
                                      <Button
                                        size="xs"
                                        mr={1}
                                        onClick={() => setEditingMessage(null)}
                                      >
                                        Done
                                      </Button>
                                    ) : (
                                      <IconButton
                                        aria-label="Edit message"
                                        icon={<Edit2 size={16} />}
                                        size="xs"
                                        mr={1}
                                        onClick={() =>
                                          setEditingMessage(message.id)
                                        }
                                      />
                                    )}
                                    <IconButton
                                      aria-label="Delete message"
                                      icon={<Trash2 size={16} />}
                                      size="xs"
                                      mr={1}
                                      onClick={() =>
                                        handleDeleteMessage(message.id)
                                      }
                                    />
                                  </>
                                )}
                              {message.senderId === authUser?.uid &&
                                !isEditable && (
                                  <Text fontSize="xs" color="gray.400"></Text>
                                )}
                            </Flex>
                          </>
                        )}
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>

              <Box position="relative">
                {selectedFile && (
                  <FilePreview
                    file={selectedFile}
                    onRemove={() => setSelectedFile(null)}
                  />
                )}
                <Flex>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    display="none"
                  />
                  <IconButton
                    aria-label="Attach file"
                    icon={<Paperclip size={20} />}
                    onClick={() => fileInputRef.current?.click()}
                    mr={2}
                    isDisabled={loading}
                  />
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    mr={2}
                    isDisabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    leftIcon={<Send size={16} />}
                    isLoading={loading}
                    isDisabled={loading}
                  >
                    Send
                  </Button>
                </Flex>
              </Box>
            </>
          ) : (
            <Flex direction="column" align="center" justify="center" h="100%">
              <Avatar
                size="xl"
                icon={<Send size={32} />}
                bg="blue.500"
                mb={4}
              />
              <Text fontSize="xl" fontWeight="bold">
                Welcome to Your Messages
              </Text>
              <Text color="gray.500" textAlign="center" mt={2}>
                Select a user or group to start chatting.
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </div>
  );
};

export default MessagesTab;
