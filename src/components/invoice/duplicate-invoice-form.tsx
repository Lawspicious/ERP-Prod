//updated for types and deployment

import { useLoading } from '@/context/loading/loadingContext';
import { useToastHook } from '@/hooks/shared/useToastHook';
import { useCases } from '@/hooks/useCasesHook';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { sendInvoiceEmailToLawyerNodeMailer } from '@/lib/utils/emailInvoiceToClient';
import { today } from '@/lib/utils/todayDate';
import { IClient, IClientProspect } from '@/types/client';
import { IInvoice, IRE, IService } from '@/types/invoice';
import {
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  RadioGroup,
  Select,
  Stack,
  Textarea,
  Radio,
  FormHelperText,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AddREForm from './add-RE-form';
import AddServiceForm from './add-service-form';
import { useTeam } from '@/hooks/useTeamHook';
import { IUser } from '@/types/user';

interface DuplicateInvoiceFormProps {
  allClients: (IClient | IClientProspect)[];
  initialInvoiceData: IInvoice;
}

const DuplicateInvoiceForm = ({
  allClients,
  initialInvoiceData,
}: DuplicateInvoiceFormProps) => {
  const [selectedClientId, setSelectedClientId] = useState(
    initialInvoiceData?.clientDetails?.id || '',
  );
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState(
    initialInvoiceData.dueDate || '',
  );
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(
    initialInvoiceData.paymentStatus || 'unpaid',
  );
  const [services, setServices] = useState<IService[]>(
    initialInvoiceData.services || [
      {
        description: '',
        name: '',
        amount: 0,
      },
    ],
  );
  const [REData, setREData] = useState<IRE[]>(
    initialInvoiceData.RE || [{ caseId: '' }],
  );
  const [toggleOtherInput, setToggleOtherInput] = useState<boolean>(false);
  const { createInvoice } = useInvoice();
  const { loading, setLoading } = useLoading();
  const { fetchCasesByClientId, allCases } = useCases();
  const { getAllTeam, allTeam } = useTeam();
  const [billTo, setBillTo] = useState<'client' | 'organization'>(
    initialInvoiceData.billTo || 'client',
  );
  const [gstNote, setGstNote] = useState(initialInvoiceData.gstNote || '');
  const [panNo, setPanNo] = useState(initialInvoiceData.panNo || '');
  const [paymentDate, setPaymentDate] = useState(
    initialInvoiceData.paymentDate || '',
  );

  const sendInvoiceEmail = async (invoice: IInvoice) => {
    const message = {
      heading: 'Invoice Notification',
      body: 'You have received a new invoice for the services provided. Please find the details below and process the payment as soon as possible.',
    };
    try {
      const response = await sendInvoiceEmailToLawyerNodeMailer(
        invoice,
        message,
      );
      console.log('Email sent successfully:', response);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleCreateInvoice = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedClientId) {
        const client = allClients.find(
          (client) => client.id === selectedClientId,
        );
        let teamMember: IUser | undefined = undefined;
        if (billTo === 'organization' && selectedTeamMemberId !== '') {
          teamMember = allTeam.find(
            (member) => member.id === selectedTeamMemberId,
          );
        }

        if (client) {
          const invoiceData: IInvoice = {
            clientDetails: {
              name: client.name,
              email: client.email,
              mobile: client.mobile,
              location:
                client.clientType === 'normal' ? client.city : client.location,
            },
            teamMember:
              billTo === 'organization' && teamMember
                ? [
                    {
                      id: teamMember.id as string,
                      name: teamMember.name,
                      email: teamMember.email,
                      phoneNumber: teamMember.phoneNumber,
                    },
                  ]
                : null,
            services: services,
            RE: REData,
            createdAt: today,
            dueDate: invoiceDueDate,
            paymentStatus: paymentStatus,
            billTo: billTo as 'client' | 'organization',
            totalAmount: services.reduce((accumulator, service) => {
              return (
                accumulator + parseInt(service.amount as unknown as string)
              );
            }, 0),
            panNo,
            gstNote,
            paymentDate,
          };
          createInvoice(invoiceData);
          sendInvoiceEmail(invoiceData);
          setServices([
            {
              description: '',
              name: '',
              amount: 0,
            },
          ]);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedClientId !== '') {
      fetchCasesByClientId(selectedClientId);
    }
    if (billTo === 'organization') {
      getAllTeam();
    }
  }, [selectedClientId, billTo]);

  return (
    <div>
      <div className="flex items-center justify-between gap-6">
        <h1 className="heading-primary mb-4">Duplicate Invoice</h1>
        <Button
          isLoading={loading}
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() =>
            (window.location.href =
              '/dashboard/admin/workspace-admin#client-invoices')
          }
        >
          Back
        </Button>
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-2 flex justify-between gap-4">
          <FormControl>
            <FormLabel>Invoice For</FormLabel>
            {/* @ts-ignore */}
            <RadioGroup onChange={setBillTo} value={billTo}>
              <Stack direction="row">
                <Radio value="client">Client</Radio>
                <Radio value="organization">Organization</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          {billTo === 'organization' && (
            <FormControl>
              <FormLabel>Team Member</FormLabel>
              <Select
                name="Team Member Id"
                placeholder="Add Team Member"
                value={selectedTeamMemberId}
                onChange={(e) => setSelectedTeamMemberId(e.target.value)}
              >
                {allTeam.map((team: IUser) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        <AddREForm
          allCases={allCases}
          allClients={allClients}
          REData={REData}
          setREData={setREData}
          invoiceDueDate={invoiceDueDate}
          setInvoiceDueDate={setInvoiceDueDate}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
        />

        <AddServiceForm
          services={services}
          setServices={setServices}
          toggleOtherInput={toggleOtherInput}
          setToggleOtherInput={setToggleOtherInput}
        />

        <FormControl>
          <FormLabel>Payment Status</FormLabel>
          <Select
            name="Payment Status"
            placeholder="Payment Status"
            value={paymentStatus}
            onChange={(e) =>
              setPaymentStatus(e.target.value as 'paid' | 'unpaid')
            }
          >
            <option value={'unpaid'}>Unpaid</option>
            <option value={'paid'}>Paid</option>
          </Select>
        </FormControl>
        {paymentStatus === 'paid' ? (
          <FormControl>
            <FormLabel>Payment Date</FormLabel>
            <Input
              type="date"
              name="paymentDate"
              placeholder="Enter Payment Date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <FormHelperText>Add Date when Payment was done</FormHelperText>
          </FormControl>
        ) : (
          <div />
        )}

        <FormControl>
          <FormLabel>GST Note</FormLabel>
          <Input
            type="text"
            name="gstNote"
            placeholder="Enter GST Note"
            value={gstNote}
            onChange={(e) => setGstNote(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Pan Number</FormLabel>
          <Input
            type="text"
            name="panNo"
            placeholder="Enter Pan Number"
            value={panNo}
            onChange={(e) => setPanNo(e.target.value)}
          />
        </FormControl>

        <div className="col-span-2 flex justify-end">
          <Button
            colorScheme="purple"
            isLoading={loading}
            onClick={handleCreateInvoice}
          >
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DuplicateInvoiceForm;
