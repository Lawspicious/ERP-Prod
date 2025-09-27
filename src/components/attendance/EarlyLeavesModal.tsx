import { IconButton } from '@chakra-ui/react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EarlyLeavesModalProps {
  userId: string;
}

const EarlyLeavesModal = ({ userId }: EarlyLeavesModalProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/early-leaves/${userId}`);
  };

  return (
    <IconButton
      aria-label="View early leaves"
      icon={<ExternalLink className="w-4" />}
      size="xs"
      onClick={handleClick}
      variant="ghost"
    />
  );
};

export default EarlyLeavesModal;
