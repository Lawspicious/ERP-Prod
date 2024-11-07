import { useAuth } from '@/context/user/userContext';
import { ICase } from '@/types/case';
import {
  Stack,
  SimpleGrid,
  Flex,
  Divider,
  Heading,
  Box,
  Link,
  Container,
  Text,
  Button,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const CaseDetail = ({ caseData }: { caseData: ICase }) => {
  const router = useRouter();
  const { role } = useAuth();

  const handleCopyToClipboard = (event: any) => {
    event.preventDefault(); // Prevent the default link behavior

    // Copy CNR number to clipboard
    navigator.clipboard
      .writeText(caseData.CNRNo)
      .then(() => {
        console.log('CNR No copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy CNR No: ', err);
      });

    // Open the external link in a new tab
    window.open(
      'https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index&app_token=cfa876e1349cb89fb280212b984b05d6e63caec868601977110b147cd36105f1',
      '_blank',
    );
  };
  return (
    <div>
      <h1 className="heading-primary mb-4">Case #{caseData.caseNo}</h1>

      <Stack spacing={6} className="margin-bottom-content">
        {/* Case Details Section */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <h1 className="heading-secondary mb-4">Case Details</h1>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Case No:</strong>
                </Text>
                <Text>{caseData.caseNo}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Case Type:</strong>
                </Text>
                <Text>{caseData.caseType || 'NA'}</Text>
              </Flex>

              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Registration Date:</strong>
                </Text>
                <Text>{caseData.regDate || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>CNR No:</strong>
                </Text>
                <Text
                  onClick={handleCopyToClipboard}
                  className="cursor-pointer text-purple-600 hover:underline"
                >
                  {caseData?.CNRNo || 'NA'}
                </Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Lawyer Action Status:</strong>
                </Text>
                <Text>{caseData.lawyerActionStatus || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Reference:</strong>
                </Text>
                <Text>{caseData.reference || 'NA'}</Text>
              </Flex>
            </Box>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Next Hearing:</strong>
                </Text>
                <Text>{caseData.nextHearing || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Decision:</strong>
                </Text>
                <Text>{caseData.decision ? caseData.decision : 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Case Status:</strong>
                </Text>
                <Text>{caseData.caseStatus || 'NA'}</Text>
              </Flex>

              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Court Name:</strong>
                </Text>
                <Text>{caseData.courtName || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Priority:</strong>
                </Text>
                <Text>{caseData.priority || 'NA'}</Text>
              </Flex>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider />
        {/* Lawyer Section */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <h1 className="heading-secondary mb-4">Lawyer Details</h1>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Name</strong>
                </Text>
                <Text>{caseData.lawyer.name || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Email</strong>
                </Text>
                <Text>{caseData.lawyer.email || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>phone Number</strong>
                </Text>
                <Text>{caseData.lawyer.phoneNumber || 'NA'}</Text>
              </Flex>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider />
        {/* Petitioner and Advocate Section */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <h1 className="heading-secondary mb-4">Petitioner and Respondent</h1>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Petitioner:</strong>
                </Text>
                <Text>{caseData.petition.petitioner || 'NA'}</Text>
              </Flex>
            </Box>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Respondent:</strong>
                </Text>
                <Text>{caseData.respondent.respondentee || 'NA'}</Text>
              </Flex>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider />
        {/* Lawyer Section */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <h1 className="heading-secondary mb-4">Client Details</h1>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Name</strong>
                </Text>
                <Text>{caseData?.clientDetails?.name || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>Email</strong>
                </Text>
                <Text>{caseData?.clientDetails?.email || 'NA'}</Text>
              </Flex>
              <Flex justify="space-between" mb={2}>
                <Text>
                  <strong>phone Number</strong>
                </Text>
                <Text>{caseData?.clientDetails?.mobile || 'NA'}</Text>
              </Flex>
            </Box>
          </SimpleGrid>
        </Box>

        <Divider />

        {/* Case Files Section */}
        <Box p={4} borderWidth={1} borderRadius="md">
          <h1 className="heading-secondary mb-4">Case Files</h1>
          <Link href={caseData.caseFiles || 'NA'} color="teal.500" isExternal>
            View Case Files
          </Link>
        </Box>
      </Stack>

      <Flex align={'center'} gap={4} justify={'center'}>
        <Button
          colorScheme="purple"
          onClick={() =>
            router.push(
              `/dashboard/${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}/edit-case/${caseData.caseId}`,
            )
          }
        >
          Edit
        </Button>
      </Flex>
    </div>
  );
};

export default CaseDetail;
