'use client';

import { useMessageHook } from '@/hooks/useMessageHook';
import { useEffect, useState, useRef, SetStateAction } from 'react';
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
} from '@chakra-ui/react';
import {
  Send,
  Edit2,
  Trash2,
  Check,
  CopyCheck,
  MessageCircle,
  Paperclip,
} from 'lucide-react';
import AdminNavbar from '../../admin/tabs/navbar';
import LawyerNavbar from '../../lawyer/tabs/navbar';
import LoaderComponent from '@/components/ui/loader';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { storage } from '@/lib/config/firebase.config';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FilePreview } from './FilePreview';
import Image from 'next/image';

interface MessagesTabProps {
  user: 'admin' | 'lawyer';
}

const MessagesTab = ({ user }: MessagesTabProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<DocumentData[] | undefined>([]);
  const [selectedUser, setSelectedUser] = useState<DocumentData | null>(null);
  const [messages, setMessages] = useState<DocumentData[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { authUser } = useAuth();
  const {
    sendMessage,
    deleteMessage,
    editMessage,
    markMessagesAsSeen,
    subscribeToMessages,
    subscribeToUserUpdates,
  } = useMessageHook();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const storageRef = ref(storage, 'chatFiles');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchQuery]);

  useEffect(() => {
    if (authUser) {
      const userId = searchParams.get('userId');
      if (userId) {
        const user = users?.find((u) => u.id === userId);
        if (user) {
          setSelectedUser(user);
        } else {
          setSelectedUser(null);
        }
      }
      if (selectedUser) {
        markMessagesAsSeen(selectedUser.id, authUser.uid);
      }
    }
  }, [searchParams, authUser, users]);

  useEffect(() => {
    if (authUser) {
      const unsubscribe = subscribeToUserUpdates(
        authUser.uid,
        (updatedUsers: SetStateAction<DocumentData[] | undefined>) => {
          setUsers(updatedUsers);
        },
      );

      return () => unsubscribe();
    }
  }, [authUser]);

  useEffect(() => {
    if (authUser && selectedUser) {
      const unsubscribe = subscribeToMessages(
        authUser.uid,
        selectedUser.id,
        (fetchedMessages: SetStateAction<DocumentData[]>) => {
          setMessages(fetchedMessages);
        },
      );

      markMessagesAsSeen(selectedUser.id, authUser.uid);

      return () => unsubscribe();
    }
  }, [authUser, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type.startsWith('image/') || file.type === 'application/pdf')
    ) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() || selectedFile) && authUser && selectedUser) {
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

        if (newMessage.trim() || selectedFile) {
          await sendMessage(authUser.uid, selectedUser.id, {
            ...fileMessage,
            content: newMessage.trim()
              ? newMessage
              : selectedFile
                ? selectedFile.name
                : '',
          });
        }

        setNewMessage('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        toast({
          title: 'Failed to send message',
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

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

  const handleSelectUser = (user: DocumentData) => {
    setSelectedUser(user);
    const params = new URLSearchParams(searchParams);
    params.set('userId', user.id);
    router.push(`${pathname}?${params.toString()}#messages`);
  };

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (users && users.length === 0) {
    return (
      <div className="h-[80vh]">
        {user === 'admin' ? <AdminNavbar /> : <LawyerNavbar />}
        <Flex justify="center" align="center" h="100%">
          <LoaderComponent />
        </Flex>
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <Input
          ref={inputRef}
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
      </Box>
      <VStack spacing={2} align="stretch" p={4} flex={1} overflowY="auto">
        {filteredUsers?.map((user) => (
          <Box
            key={user.id}
            p={2}
            style={{ cursor: 'pointer' }}
            bg={selectedUser?.id === user.id ? 'gray.100' : 'white'}
            onClick={() => {
              handleSelectUser(user);
              if (authUser?.uid) {
                markMessagesAsSeen(user.id, authUser.uid);
              }
              if (isMobile) {
                onClose();
              }
            }}
            borderRadius="md"
            _hover={{ bg: 'gray.50' }}
          >
            <Flex align="center" justify="space-between">
              <Flex align="center">
                <Avatar size="sm" name={user.name} src={user.photoURL} mr={2} />
                <Box>
                  <Text fontWeight="bold">{user.name}</Text>
                  {user.lastMessage && (
                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                      {!user.lastMessage.isDeleted
                        ? user.lastMessage.content
                        : `Message deleted by ${user.lastMessage.senderId === authUser?.uid ? 'you' : user.name}`}
                    </Text>
                  )}
                </Box>
              </Flex>
              {user.unseenCount > 0 && (
                <Badge colorScheme="red" borderRadius="full" px="2">
                  {user.unseenCount}
                </Badge>
              )}
            </Flex>
          </Box>
        ))}
      </VStack>
    </>
  );

  return (
    <div>
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
              <DrawerHeader borderBottomWidth="1px">Users</DrawerHeader>
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
          {selectedUser ? (
            <>
              <Box flex="1" overflowY="auto" mb={4}>
                <VStack spacing={4} align="stretch">
                  {messages.map((message) => (
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
                            : selectedUser.name}{' '}
                          deleted this message
                        </Text>
                      ) : (
                        <>
                          {editingMessage === message.id ? (
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
                                  handleEditMessage(
                                    message.id,
                                    message.content,
                                  );
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <>
                              {message.fileURL && (
                                <>
                                  {message.fileType.startsWith('image/') ? (
                                    <Image
                                      src={message.fileURL}
                                      alt={message.fileName}
                                      style={{
                                        cursor: 'pointer',
                                        width: '200px',
                                      }}
                                      height={200}
                                      width={200}
                                      onClick={() =>
                                        window.open(
                                          message.fileURL,
                                          '_blank',
                                          'noopener,noreferrer',
                                        )
                                      }
                                      priority
                                    />
                                  ) : message.fileType === 'application/pdf' ? (
                                    <Button
                                      variant="link"
                                      colorScheme="blue"
                                      onClick={() =>
                                        window.open(
                                          message.fileURL,
                                          '_blank',
                                          'noopener,noreferrer',
                                        )
                                      }
                                    >
                                      View PDF: {message.fileName}
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="link"
                                      colorScheme="blue"
                                      as="a"
                                      href={message.fileURL}
                                      download={message.fileName}
                                    >
                                      Download: {message.fileName}
                                    </Button>
                                  )}
                                </>
                              )}
                              <Text>{message.content}</Text>
                            </>
                          )}
                          {message.isEdited && (
                            <Text fontSize="xs">Edited</Text>
                          )}
                          <Flex justify="flex-end" align="center" mt={1}>
                            {message.senderId === authUser?.uid && (
                              <>
                                {editingMessage === message.id ? (
                                  <Button
                                    size="xs"
                                    mr={1}
                                    onClick={() => setEditingMessage(null)}
                                  >
                                    Cancel
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
                                {message.isSeen ? (
                                  <CopyCheck size={16} color="blue" />
                                ) : (
                                  <Check size={16} color="gray" />
                                )}
                              </>
                            )}
                          </Flex>
                        </>
                      )}
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </VStack>
              </Box>
              <Box>
                <Box position="relative">
                  {selectedFile && (
                    <FilePreview
                      file={selectedFile}
                      onRemove={handleRemoveFile}
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
                      isDisabled={loading} // Disable during loading
                    />
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      mr={2}
                      isDisabled={loading} // Disable during loading
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      leftIcon={loading ? undefined : <Send size={16} />}
                      isLoading={loading} // Show loading spinner
                      loadingText="Sending" // Text during loading
                      isDisabled={loading} // Disable during loading
                    >
                      {loading ? 'Sending' : 'Send'}
                    </Button>
                  </Flex>
                </Box>
              </Box>
            </>
          ) : (
            <Flex direction="column" justify="center" align="center" h="100%">
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
                Select a conversation or start a new one
              </Text>
            </Flex>
          )}
        </Box>
      </Flex>
    </div>
  );
};

export default MessagesTab;
