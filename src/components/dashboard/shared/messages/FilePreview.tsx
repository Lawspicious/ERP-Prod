import { Box, Image, Text, CloseButton, Flex } from '@chakra-ui/react';
import { FileText } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

  return (
    <Box
      position="absolute"
      bottom="100%"
      left={0}
      bg="white"
      borderWidth={1}
      borderRadius="md"
      p={2}
      mb={2}
      boxShadow="md"
      maxWidth="300px"
      width="fit-content"
    >
      <Flex alignItems="center">
        {isImage ? (
          <Image
            src={URL.createObjectURL(file)}
            alt="Preview"
            maxH="100px"
            maxW="100%"
            objectFit="contain"
          />
        ) : isPDF ? (
          <Flex alignItems="center">
            <FileText size={24} />
            <Text ml={2} fontSize="sm" noOfLines={1}>
              {file.name}
            </Text>
          </Flex>
        ) : null}
        <CloseButton size="sm" onClick={onRemove} ml={2} />
      </Flex>
    </Box>
  );
};
