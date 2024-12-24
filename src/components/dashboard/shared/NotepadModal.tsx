import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Input,
  Textarea,
  Box,
  Text,
  Flex,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit, Plus, GripVertical } from 'lucide-react';
import { useNoteHook } from '@/hooks/useNoteHook';
import { INote } from '@/types/note';

interface Note {
  id: string; // Firestore document ID
  sortOrder: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SortableNote: React.FC<{
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}> = ({ note, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: note.sortOrder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      p={3}
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      boxShadow="sm"
      bg="white"
      mb={2}
    >
      <Flex justifyContent="space-between" alignItems="center">
        {/* Drag Handle */}
        <Box
          {...attributes}
          {...listeners}
          mr={3}
          cursor="grab"
          display="flex"
          alignItems="center"
        >
          <GripVertical size={20} color="#A0AEC0" />
        </Box>

        {/* Note Content */}
        <Box flex="1">
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">{note.title}</Text>
            <Text>{note.content}</Text>
            <Text fontSize="sm" color="gray.500">
              Updated: {formatDate(note.updatedAt)}
            </Text>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <Flex>
          <IconButton
            aria-label="Edit note"
            icon={<Edit size={16} />}
            size="sm"
            colorScheme="blue"
            mr={2}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit note');
              onEdit(note);
            }}
          />
          <IconButton
            aria-label="Delete note"
            icon={<Trash2 size={16} />}
            size="sm"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete note');
              onDelete(note.sortOrder);
            }}
          />
        </Flex>
      </Flex>
    </Box>
  );
};

const NotepadModal: React.FC<NotepadModalProps> = ({ isOpen, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const {
    createNoteFunction,
    getAllNotesFunction,
    updateNoteFunction,
    deleteNoteFunction,
    persistSortOrder,
    serverNotes,
    fetched,
  } = useNoteHook();
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchNotes = async () => {
      await getAllNotesFunction();
    };
    fetchNotes();
    if (serverNotes) setNotes(serverNotes);
  }, [isOpen, fetched]);

  const createNote = async () => {
    if (newNoteTitle.trim() === '') {
      toast({
        title: 'Error',
        description: 'Note title cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newNote = {
      sortOrder: notes.length.toString(),
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const createdNoteId = await createNoteFunction(newNote);
      setNotes((prevNotes) => [
        ...prevNotes,
        { id: createdNoteId, ...newNote },
      ]);

      setNewNoteTitle('');
      setNewNoteContent('');
      setIsEditing(false);

      toast({
        title: 'Success',
        description: 'Note created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error',
        description: 'Failed to create note',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateNote = async () => {
    if (!selectedNote) return;
    if (newNoteTitle.trim() === '') {
      toast({
        title: 'Error',
        description: 'Note title cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setNotes((prevNotes) =>
      prevNotes.map((note) => {
        if (note.id === selectedNote.id) {
          const updatedNote = {
            ...note,
            title: newNoteTitle,
            content: newNoteContent,
            updatedAt: new Date().toISOString(),
          };
          updateNoteFunction(updatedNote as INote);
          return updatedNote;
        }
        return note;
      }),
    );
    setSelectedNote(null);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsEditing(false);
    toast({
      title: 'Success',
      description: 'Note updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const deleteNote = async (sortOrder: string) => {
    setNotes((prevNotes) =>
      prevNotes.filter((note) => {
        if (note.sortOrder === sortOrder) {
          deleteNoteFunction(note.id);
          return false;
        }
        return true;
      }),
    );
    if (selectedNote && selectedNote.sortOrder === sortOrder) {
      setSelectedNote(null);
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsEditing(false);
    }
    toast({
      title: 'Success',
      description: 'Note deleted successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setIsEditing(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setNotes((items) => {
        const oldIndex = items.findIndex(
          (item) => item.sortOrder === active.id,
        );
        const newIndex = items.findIndex((item) => item.sortOrder === over?.id);
        const updatedNotes = arrayMove(items, oldIndex, newIndex);

        const reOrderedNotes = updatedNotes.map((note, index) => ({
          ...note,
          sortOrder: index.toString(),
        }));

        persistSortOrder(reOrderedNotes as INote[]);

        return reOrderedNotes;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Notepad</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {isEditing ? (
              <>
                <Input
                  placeholder="Note title"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Note content"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={5}
                />
                <Flex justifyContent="space-between" width="100%">
                  <Button
                    colorScheme="purple"
                    onClick={async () => {
                      if (selectedNote) {
                        updateNote();
                      } else {
                        await createNote();
                      }
                    }}
                  >
                    {selectedNote ? 'Update Note' : 'Create Note'}
                  </Button>
                  <Button
                    colorScheme="gray"
                    onClick={() => {
                      setSelectedNote(null);
                      setNewNoteTitle('');
                      setNewNoteContent('');
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </Flex>
              </>
            ) : (
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="purple"
                onClick={() => setIsEditing(true)}
              >
                Add Note
              </Button>
            )}
            <Box maxHeight="350px" overflowY="auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={notes.map((note) => note.sortOrder)}
                  strategy={verticalListSortingStrategy}
                >
                  {notes.map((note) => (
                    <SortableNote
                      key={note.id}
                      note={note}
                      onEdit={selectNote}
                      onDelete={(id) => deleteNote(id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NotepadModal;
