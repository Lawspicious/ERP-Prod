'use client';

import { auth, db, functions } from '@/lib/config/firebase.config';
import FirebaseAuth, {
  ApplicationVerifier,
  MultiFactorError,
  MultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  getMultiFactorResolver,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';
import { Loader } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';

interface UserContextValue {
  authUser: FirebaseAuth.User | null;
  getRole: (userId: string) => Promise<void>;
  role: string | undefined;
  signin: (
    username: string,
    password: string,
    recaptcha: FirebaseAuth.ApplicationVerifier,
  ) => Promise<void>;
  logout: () => Promise<void>;
  resolverState: MultiFactorResolver | undefined;
  verificationIdState: string | undefined;
  verifyOTPcode(code: string): Promise<void>;
  isAuthLoading: boolean;
}

const defaultValues = {
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

export const UserProvider = ({ children }: any) => {
  const [authUser, setAuthUser] = useState<FirebaseAuth.User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationIdState, setVerificationIdState] = useState<string>();
  const [resolverState, setResolverState] = useState<MultiFactorResolver>();
  const [role, setRole] = useState<string | undefined>();
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const router = useRouter();
  const toast = useToast();

  const fetchUser = useCallback(
    async (userId: string) => {
      console.log('fetching admin user');
      try {
        const docRef = doc(db, `users/${userId}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('Admin User Exists');
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.log(error);
      }
    },
    [authUser],
  );

  const signin = async (
    email: string,
    password: string,
    recaptcha: FirebaseAuth.ApplicationVerifier | undefined,
  ) => {
    try {
      await signInWithEmailAndPassword(auth, email, password).then(
        async (value: FirebaseAuth.UserCredential) => {
          const userID = value.user.uid;
          await fetchUser(userID);
        },
      );

      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });
    } catch (e: any) {
      console.error(e);
      await handleMFA(e, recaptcha);
      if (e.code === 'auth/invalid-credential') {
        toast({
          title: 'Invalid Credential',
          status: 'error',
          duration: 3000,
          position: 'top',
          isClosable: true,
        });
      }
      if (e.code === 'auth/invalid-email') {
        toast({
          title: 'Invalid Email',
          status: 'error',
          duration: 3000,
          position: 'top',
          isClosable: true,
        });
      }
    }
  };

  async function handleMFA(
    response: any,
    recaptcha: ApplicationVerifier | undefined,
  ) {
    if (!recaptcha) {
      console.log('Recaptcha not initialized');
      return;
    }

    if (response.code === 'auth/multi-factor-auth-required' && recaptcha) {
      const data = await verifyUserMfa(response, recaptcha, 0);
      if (!data) {
        console.log('Something went wrong.');
      } else {
        const { verificationId, resolver } = data;
        setVerificationIdState(verificationId);
        setResolverState(resolver);
      }
    } else {
      console.log('Something went wrong');
    }
  }

  const verifyUserMfa = useCallback(
    async (
      error: MultiFactorError,
      recaptchaVerifier: ApplicationVerifier,
      selectedIndex: number,
    ) => {
      const resolver = getMultiFactorResolver(auth, error);
      // console.log('Resolver:', resolver);
      if (
        resolver.hints[selectedIndex].factorId ===
        PhoneMultiFactorGenerator.FACTOR_ID
      ) {
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints[selectedIndex],
          session: resolver.session,
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        try {
          const verificationId = await phoneAuthProvider.verifyPhoneNumber(
            phoneInfoOptions,
            recaptchaVerifier,
          );
          return { verificationId, resolver };
        } catch (e: any) {
          if (e.code === 'auth/user-token-expired') {
            toast({
              title: 'Authentication Expired',
              status: 'error',
              duration: 3000,
              position: 'top',
              isClosable: true,
            });
          }
          if (e.code === 'auth/second-factor-already-in-use') {
            toast({
              title: 'Second Factor Already In Use',
              status: 'error',
              duration: 3000,
              position: 'top',
              isClosable: true,
            });
          }
          if (e.code === 'auth/too-many-requests') {
            toast({
              title: 'Too Many Requests',
              status: 'error',
              duration: 3000,
              position: 'top',
              isClosable: true,
            });
          }

          console.error(e);
          return false;
        }
      }
    },
    [],
  );

  // This Function is used inside the verifyOTP Function
  async function verifyUserEnrolled(
    verificationMFA: { verificationId: string; resolver: MultiFactorResolver },
    verificationCode: string,
  ) {
    const { verificationId, resolver } = verificationMFA;
    const credentials = PhoneAuthProvider.credential(
      verificationId,
      verificationCode,
    );
    const multiFactorAssertion =
      PhoneMultiFactorGenerator.assertion(credentials);
    // console.log(multiFactorAssertion);
    try {
      await resolver.resolveSignIn(multiFactorAssertion);
      return true;
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/invalid-verification-code') {
        toast({
          title: 'Invalid Verification Code',
          status: 'error',
          duration: 3000,
          position: 'top',
          isClosable: true,
        });
      }
      return false;
    }
  }

  const verifyOTPcode = async (code: string) => {
    setIsLoading(true);
    const response = await verifyUserEnrolled(
      {
        verificationId: verificationIdState!,
        resolver: resolverState!,
      },
      code,
    );

    if (response) {
      setIsLoading(false);
      router.push('/dashboard');
    } else {
      console.log('Something went wrong.');
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
    setResolverState(undefined);
    setVerificationIdState(undefined);
    router.push('/');
  };

  // useEffect(() => {
  //   const res = auth.onAuthStateChanged((user) => {
  //     if (user) {
  //       setAuthUser(user);
  //       getRole(user.uid);
  //     }
  //     setIsLoading(false);
  //   });
  //   return res;
  // }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Assuming you fetch the role from somewhere (e.g., Firestore)

        setAuthUser(user);
        getRole(user.uid); // Or fetch the user's role
      } else {
        setAuthUser(null);
        setRole('');
      }
      setIsAuthLoading(false); // Finished initializing
    });

    return () => unsubscribe();
  }, []);

  const value: UserContextValue = {
    authUser,
    signin,
    getRole,
    role,
    logout,
    verificationIdState,
    resolverState,
    verifyOTPcode,
    isAuthLoading,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuth = () => useContext(UserContext);
