'use client';
import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  VStack,
  Container,
  Textarea,
} from '@chakra-ui/react';
import { useUser } from '@/hooks/useUserHook';
import { useLoading } from '@/context/loading/loadingContext';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const { resetUserPassword } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const result = await resetUserPassword(
      email,
      'User',
      'This is your password reset link',
    );
    setLoading(false);
  };

  return (
    <Container maxW="lg" centerContent>
      <VStack spacing={4} mt={10} w="full" boxShadow="md" p={8} rounded="md">
        <h1 className="heading-primary mb-6">Reset Password</h1>
        <FormControl isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <Button
          colorScheme="purple"
          onClick={handleSubmit}
          w="full"
          isLoading={loading}
        >
          Send Reset Link
        </Button>
      </VStack>
    </Container>
  );
};

export default ResetPasswordPage;
