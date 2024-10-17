'use client';
import { useState } from 'react'; // adjust the import according to your folder structure

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { ApplicationVerifier } from 'firebase/auth';
import { useRecaptcha } from '@/hooks/shared/useRecaptcha';
import { VerifyOTP } from './mfa/VerifyOTP';
import Image from 'next/image';
import { useAuth } from '@/context/user/userContext';

export function AuthUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { signin, resolverState, verificationIdState } = useAuth();
  const recaptcha = useRecaptcha('sign-in');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    console.log('clicked');
    setLoading(true);
    try {
      await signin(email, password, recaptcha as ApplicationVerifier);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <>
      <div id="sign-in"></div>
      <div className="max-h-screen w-full gap-8 lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
        {!verificationIdState && !resolverState && (
          <div className="flex items-center justify-center">
            <div className="mx-6 grid gap-6 rounded-xl border-2 bg-white p-4 lg:mx-auto lg:p-24">
              <div className="grid gap-2 text-center">
                <h1 className="heading-primary mb-3">Sign In</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your email below to Sign In to your account
                </p>
              </div>
              <form className="flex flex-col gap-4">
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter email id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputRightElement cursor={'pointer'}>
                      {show ? (
                        <Eye color="black" onClick={handleClick} />
                      ) : (
                        <EyeOff color="black" onClick={handleClick} />
                      )}
                    </InputRightElement>
                    <Input
                      type={show ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>
                <Button
                  colorScheme="purple"
                  isLoading={loading}
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </form>
            </div>
          </div>
        )}
        {verificationIdState && resolverState && (
          <VerifyOTP
            resolver={resolverState}
            verificationId={verificationIdState}
          />
        )}

        <div className="hidden lg:block">
          <Image
            src="/images/auth/auth.jpeg"
            alt="auth image component"
            width={500}
            height={500}
            className="h-full w-full object-fill"
          />
        </div>
      </div>
    </>
  );
}
