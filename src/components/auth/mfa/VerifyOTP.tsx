import { MultiFactorResolver } from '@firebase/auth';
import { useState } from 'react';
import { useAuth } from '@/context/user/userContext';
import { useRouter } from 'next/navigation';
import OTPInput from './OTPInput';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@chakra-ui/react';

type PropsCode = {
  verificationId: string;
  resolver: MultiFactorResolver;
};

export function VerifyOTP({ resolver }: PropsCode) {
  const [isLoading, setIsLoading] = useState(false);
  const { verifyOTPcode } = useAuth();
  let otpFinal: any;

  function Code({ getCode }: any) {
    const router = useRouter();

    async function handleClick() {
      setIsLoading(true);
      await getCode(otpFinal);
      setIsLoading(false);
    }
    //@ts-ignore
    const phoneNumber = resolver?.hints[0].phoneNumber;

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white p-5">
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              <h1 className="mb-4 text-center text-xl font-bold md:text-2xl">
                Verify your number
              </h1>
              <div>
                <span className="mt-2 text-base text-slate-500">
                  We sent you an SMS code to
                </span>
                <span className="text-skin-primary font-bold">
                  {' ' + phoneNumber}
                </span>
              </div>
            </div>
            <OTPInput
              length={6}
              className="otpContainer my-5"
              inputClassName="otpInput"
              isNumberInput={true}
              autoFocus
              onChangeOTP={(otp) => {
                otpFinal = otp;
              }}
            />
          </div>

          <div className="mt-4 flex gap-x-4">
            <Button
              onClick={() => void router.push('/')}
              className="btn-outline"
            >
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={async () => await handleClick()}
              className="btn-primary flex items-center justify-center"
            >
              {isLoading ? (
                <span>
                  <LoaderCircle />{' '}
                </span>
              ) : (
                <span>Submit</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <Code getCode={verifyOTPcode} />;
}
