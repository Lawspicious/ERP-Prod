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
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
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
import { useAnnouncementHook } from '@/hooks/useAnnouncementHook';

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
  tokenExpiration?: Date | null;
  logAttendance: (
    userId: string,
    username: string,
    email: string,
    type: 'login' | 'logout',
  ) => Promise<void>;
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
  logAttendance: async () => {},
  tokenExpiration: null,
};

const UserContext = createContext<UserContextValue>(defaultValues);

interface AttendanceRecord {
  userId: string;
  userEmail: string;
  loginTime: Date;
  logoutTime?: Date;
  duration?: number; // in minutes
  logoutType: 'manual' | 'automatic' | 'browser_closed';
}

export const UserProvider = ({ children }: any) => {
  const [authUser, setAuthUser] = useState<FirebaseAuth.User | null>(null);
  const { createDefaultAnnouncementForUserOnFirstLogin } =
    useAnnouncementHook();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [verificationIdState, setVerificationIdState] = useState<string>();
  const [resolverState, setResolverState] = useState<MultiFactorResolver>();
  const [role, setRole] = useState<string | undefined>();
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [tokenExpiration, setTokenExpiration] = useState<Date | null>(null);
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

  const logAttendance = async (
    userId: string,
    username: string,
    email: string,
    type: 'login' | 'logout',
  ) => {
    try {
      const attendanceCollection = collection(db, 'attendance');

      await addDoc(attendanceCollection, {
        userId,
        userEmail: email,
        username,
        eventType: type,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging attendance:', error);
    }
  };

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
      const firebaseExpirationTime = (
        await userCredential.user.getIdTokenResult()
      ).expirationTime;

      // Set expiration to 8 hours from Firebase token expiration
      const expirationDate = new Date(firebaseExpirationTime);
      expirationDate.setHours(expirationDate.getHours() + 8);
      const expirationTime = expirationDate.toISOString();

      setTokenExpiration(new Date(expirationTime));
      if (window !== undefined && window.localStorage !== undefined) {
        window.localStorage.setItem('tokenExpiration', expirationTime);
      }
      const userID = userCredential.user.uid;

      const userRef = doc(db, 'users', userID);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const username = userData?.name;
      // Log attendance on successful login
      await logAttendance(userID, username || '', email, 'login');

      await fetchUser(userID);
      await createDefaultAnnouncementForUserOnFirstLogin(userID);

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
    if (authUser) {
      // Log attendance before signing out
      console.log('Logging out');
      const userRef = doc(db, 'users', authUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const username = userData?.name;
      await logAttendance(
        authUser.uid,
        username || '',
        authUser.email!,
        'logout',
      );
    }
    await auth.signOut();
    setResolverState(undefined);
    setVerificationIdState(undefined);
    setTokenExpiration(null);
    if (window !== undefined && window.localStorage !== undefined) {
      window.localStorage.removeItem('tokenExpiration');
    }
    router.push('/');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        getRole(user.uid);
      } else {
        setAuthUser(null);
        setRole('');
      }
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [authUser]);

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
    logAttendance,
    tokenExpiration,
  };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuth = () => useContext(UserContext);
