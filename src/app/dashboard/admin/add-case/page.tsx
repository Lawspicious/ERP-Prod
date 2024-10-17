'use client';
import AddCaseForm from '@/components/case/add-case/add-case-form';
import ClientForm from '@/components/client/client-form';
import ClientProspectForm from '@/components/client/prospect-client-form';
import withAuth from '@/components/shared/hoc-middlware';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useTeam } from '@/hooks/useTeamHook';
import {
  Box,
  Button,
  Checkbox,
  Progress,
  Step,
  StepIcon,
  StepIndicator,
  Stepper,
  StepStatus,
  useSteps,
} from '@chakra-ui/react';
import { ArrowLeft, ArrowRight, MoveRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const steps = [
  { title: 'First', description: 'Contact Info' },
  { title: 'First', description: 'Contact Info' },
];

const AddCasepage = () => {
  const [isProspect, setIsProspect] = useState(false);
  const { allTeam, getAllTeam } = useTeam();
  const { loading, setLoading } = useLoading();
  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: steps.length,
  });

  const max = steps.length - 1;
  const progressPercent = (activeStep / max) * 100;

  const handleFetchLawyer = async () => {
    setLoading(true);
    await getAllTeam();
    setLoading(false);
  };

  useEffect(() => {
    handleFetchLawyer();
  }, []);

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : allTeam.length > 0 ? (
        <>
          <Box position="relative">
            <Stepper size="sm" index={activeStep} gap="0">
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator bg="white">
                    <StepStatus complete={<StepIcon />} />
                  </StepIndicator>
                </Step>
              ))}
            </Stepper>
            <Progress
              value={progressPercent}
              position="absolute"
              height="3px"
              width="full"
              top="10px"
              zIndex={-1}
            />
          </Box>
          {activeStep == 1 && (
            <div className="mt-6 lg:mt-8">
              <section className="flex w-full items-center justify-between gap-6">
                <h1 className="heading-primary mb-4">Add New Client</h1>
                <section className="flex flex-col gap-4 md:flex-row">
                  <Button
                    rightIcon={<ArrowLeft />}
                    colorScheme="blue"
                    onClick={() =>
                      (window.location.href =
                        '/dashboard/admin/workspace-admin#case')
                    }
                  >
                    Back
                  </Button>
                  <Button
                    rightIcon={<ArrowRight />}
                    colorScheme="purple"
                    onClick={() => setActiveStep(2)}
                  >
                    Next
                  </Button>
                </section>
              </section>
              <p className="mb-4 flex gap-2 text-black/60">
                Already Client Exist? Go to{' '}
                <span
                  className="flex cursor-pointer items-center justify-start gap-2 underline"
                  onClick={() => setActiveStep(2)}
                >
                  Next <MoveRight />
                </span>
              </p>
              <Checkbox
                isChecked={isProspect}
                onChange={(e) => setIsProspect(e.target.checked)}
                mb={4}
              >
                Is Prospect Client?
              </Checkbox>

              {isProspect ? <ClientProspectForm /> : <ClientForm />}
            </div>
          )}
          {activeStep == 2 && (
            <div className="mt-6 lg:mt-8">
              <AddCaseForm
                lawyers={allTeam}
                backHref="/dashboard/admin/workspace-admin#case"
                setActiveStep={setActiveStep}
              />
            </div>
          )}
        </>
      ) : (
        <div className="heading-secondary flex h-screen items-center justify-center">
          No Team Member Found!
        </div>
      )}
    </PageLayout>
  );
};

export default withAuth(AddCasepage, ['ADMIN', 'SUPERADMIN']);

{
  /* <AddCaseForm lawyers={allTeam} /> */
}
