// components/StarRating.tsx
import { useState } from 'react';
import { Box, IconButton, HStack } from '@chakra-ui/react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  maxStars?: number;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ maxStars = 5, onChange }) => {
  const [rating, setRating] = useState<number>(0);

  const handleClick = (newRating: number) => {
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <HStack>
      {Array.from({ length: maxStars }, (_, index) => (
        <IconButton
          key={index}
          aria-label={`Rate ${index + 1}`}
          icon={<Star />}
          color={index < rating ? 'yellow.400' : 'gray.300'}
          onClick={() => handleClick(index + 1)}
          variant="unstyled"
          _hover={{ color: 'yellow.500' }}
        />
      ))}
    </HStack>
  );
};

export default StarRating;
