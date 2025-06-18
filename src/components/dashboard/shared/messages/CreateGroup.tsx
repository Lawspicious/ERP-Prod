import { db } from '@/lib/config/firebase.config';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';

interface CreateGroupProps {
  groupModal: {
    isOpen: boolean;
    onClose: () => void;
  };
  mode: 'create' | 'edit';
  handleCreateOrEditGroup: () => void;
  groupName: string;
  setGroupName: (val: string) => void;
  selectedMembers: string[];
  setSelectedMembers: (val: string[]) => void;
  groupData?: {
    name: string;
    members: string[];
    id: string;
  };
}

const CreateGroup = ({
  groupModal,
  mode,
  handleCreateOrEditGroup,
  groupName,
  setGroupName,
  selectedMembers,
  setSelectedMembers,
  groupData,
}: CreateGroupProps) => {
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!groupModal.isOpen) return;

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, [groupModal.isOpen]);

  // Populate fields for edit
  useEffect(() => {
    if (!groupModal.isOpen) return;

    // Reset form fields on open
    if (mode === 'edit' && groupData) {
      setGroupName(groupData.name || '');
      setSelectedMembers(groupData.members || []);
    } else {
      setGroupName('');
      setSelectedMembers([]);
    }
  }, [groupModal.isOpen]);

  return (
    <Modal isOpen={groupModal.isOpen} onClose={groupModal.onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {mode === 'edit' ? 'Edit Group' : 'Create New Group'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            mb={4}
          />
          <Text mb={2}>Select members:</Text>
          <CheckboxGroup
            value={selectedMembers}
            onChange={(values) => setSelectedMembers(values as string[])}
          >
            <Stack spacing={2} maxH="200px" overflowY="auto">
              {users.map((u) => (
                <Checkbox key={u.id} value={u.id}>
                  {u.name}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleCreateOrEditGroup} colorScheme="blue">
            {mode === 'edit' ? 'Update Group' : 'Create Group'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateGroup;
