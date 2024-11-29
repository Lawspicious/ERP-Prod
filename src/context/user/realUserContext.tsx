'use client';

import { app, auth } from '@/lib/config/firebase.config';
import FirebaseAuth, {
  ApplicationVerifier,
  MultiFactorError,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface UserContextValue {
  authUser: FirebaseAuth.User | null;
  getRole: (userId: string) => Promise<void>;
  role: string | undefined;
  signin: (
    email: string,
    password: string,
    recaptcha: FirebaseAuth.ApplicationVerifier,
  ) => Promise<void>;
  logout: () => Promise<void>;
  resolverState: MultiFactorResolver | undefined;
  verificationIdState: string | undefined;
  verifyOTPcode(code: string): Promise<void>;
  isAuthLoading: boolean;
}

const defaultValues: UserContextValue = {
  authUser: null,
  signin: async () => {},
  role: undefined,
  getRole: async () => {},
  logout: async () => {},
  resolverState: undefined,
  verificationIdState: undefined,
  verifyOTPcode: async () => {},
  isAuthLoading: true,
};

const UserContext = createContext<UserContextValue>(defaultValues);

export const UserProviderSSS = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [authUser, setAuthUser] = useState<FirebaseAuth.User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [verificationIdState, setVerificationIdState] = useState<string>();
  const [resolverState, setResolverState] = useState<MultiFactorResolver>();
  const [role, setRole] = useState<string | undefined>();
  const router = useRouter();
  const toast = useToast();
  const functions = getFunctions(app, 'asia-south1');
  const generateAuthStateToken = httpsCallable(
    functions,
    'createSessionCookie',
  );

  const signin = async (
    email: string,
    password: string,
    recaptcha: FirebaseAuth.ApplicationVerifier | undefined,
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Generate a session cookie
      const idToken = await userCredential.user.getIdToken();
      const sessionResponse: any = await generateAuthStateToken({ idToken });
      const { sessionCookie, expiresAt } = sessionResponse.data;

      // Store session data in sessionStorage
      sessionStorage.setItem('sessionCookie', sessionCookie);
      sessionStorage.setItem('sessionCookieExp', expiresAt.toString());

      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });

      // setAuthUser(userCredential.user);
      // getRole(userCredential.user.uid);
    } catch (e: any) {
      console.error(e);
      await handleMFA(e, recaptcha);

      const errorMessage =
        e.code === 'auth/invalid-credential'
          ? 'Invalid Credential'
          : e.code === 'auth/invalid-email'
            ? 'Invalid Email'
            : 'Login Failed';

      toast({
        title: errorMessage,
        status: 'error',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });
    }
  };

  const handleMFA = async (
    response: MultiFactorError,
    recaptcha: ApplicationVerifier | undefined,
  ) => {
    if (!recaptcha) {
      console.log('Recaptcha not initialized');
      return;
    }

    if (response.code === 'auth/multi-factor-auth-required') {
      const resolver = getMultiFactorResolver(auth, response);
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session,
      };

      try {
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(
          phoneInfoOptions,
          recaptcha,
        );
        setVerificationIdState(verificationId);
        setResolverState(resolver);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const verifyOTPcode = async (code: string) => {
    if (resolverState && verificationIdState) {
      try {
        const phoneAuthCredential = PhoneAuthProvider.credential(
          verificationIdState,
          code,
        );
        const assertion =
          PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
        await resolverState.resolveSignIn(assertion);

        toast({
          title: 'MFA Verification Successful',
          status: 'success',
          duration: 3000,
          position: 'top',
          isClosable: true,
        });

        router.push('/dashboard');
      } catch (e) {
        console.error(e);
        toast({
          title: 'MFA Verification Failed',
          status: 'error',
          duration: 3000,
          position: 'top',
          isClosable: true,
        });
      }
    }
  };

  const getRole = async (userId: string) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const role = idTokenResult.claims.role as string;
          setRole(role);
          return role;
        } catch (error: any) {
          console.error('Error verifying custom claims:', error.message);
        }
      }
    });
  };

  const logout = async () => {
    await auth.signOut();
    sessionStorage.removeItem('sessionCookie');
    sessionStorage.removeItem('sessionCookieExp');
    setAuthUser(null);
    setRole('');
    router.push('/');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const expiresAt = sessionStorage.getItem('sessionCookieExp');
        const currentTime = Date.now();

        if (expiresAt && currentTime >= parseInt(expiresAt)) {
          logout();
          toast({
            title: 'Session Expired',
            description: 'Please log in again.',
            status: 'warning',
            duration: 3000,
            position: 'top',
            isClosable: true,
          });
        } else {
          setAuthUser(user);
          await getRole(user.uid);

          if (expiresAt) {
            const timeout = setTimeout(
              () => {
                logout();
                toast({
                  title: 'Session Expired',
                  description: 'Please log in again.',
                  status: 'warning',
                  duration: 3000,
                  position: 'top',
                  isClosable: true,
                });
              },
              parseInt(expiresAt) - currentTime,
            );

            return () => clearTimeout(timeout);
          }
        }
      } else {
        setAuthUser(null);
        setRole('');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: UserContextValue = {
    authUser,
    signin,
    getRole,
    role,
    logout,
    resolverState,
    verificationIdState,
    verifyOTPcode,
    isAuthLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuth = () => useContext(UserContext);
