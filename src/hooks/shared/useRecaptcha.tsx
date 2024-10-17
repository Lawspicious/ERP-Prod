'use client';

import { useEffect, useState } from 'react';
import { ApplicationVerifier, RecaptchaVerifier } from '@firebase/auth';
import { auth } from '@/lib/config/firebase.config';

export function useRecaptcha(componentId: string) {
  const [recaptcha, setRecaptcha] = useState<ApplicationVerifier>();

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, componentId, {
      size: 'invisible',
      callback: () => {
        console.log('Recaptcha verified:', recaptchaVerifier);
      },
    });

    setRecaptcha(recaptchaVerifier);

    return () => {
      recaptchaVerifier.clear();
    };
  }, [componentId]);

  return recaptcha;
}
