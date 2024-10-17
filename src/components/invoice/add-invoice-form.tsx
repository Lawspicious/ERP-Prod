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

//Add Invoices as needed
export const serviceList = ['Service A', 'Service B', 'Service C'];

const AddInvoiceForm = ({
  allClients,
}: {
  allClients: (IClient | IClientProspect)[];
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>(
    'unpaid',
  );
  const [services, setServices] = useState<IService[]>([
    {
      description: '',
      name: '',
      amount: 0,
    },
  ]);
  const [REData, setREData] = useState([
    {
      caseId: '',
    },
  ]);
  const [toggleOtherInput, setToggleOtherInput] = useState<boolean>(false);
  const { createInvoice } = useInvoice();
  const { loading, setLoading } = useLoading();
  const { fetchCasesByClientId, allCases } = useCases();
  const { getAllTeam, allTeam } = useTeam();
  const [billTo, setBillTo] = useState('client');
  const [gstNote, setGstNote] = useState('');
  const [panNo, setPanNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

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
                ? {
                    id: teamMember.id as string,
                    name: teamMember.name,
                    email: teamMember.email,
                    phoneNumber: teamMember.phoneNumber,
                  }
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
        <h1 className="heading-primary mb-4">Add New Invoice</h1>
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
            {/* <option value={'pending'}>Pending</option> */}
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

        <div className="col-span-2 mt-4 flex items-center gap-4">
          <Button
            colorScheme="purple"
            isLoading={loading}
            onClick={handleCreateInvoice}
            className="col-span-2 w-fit"
          >
            Generate Invoice
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddInvoiceForm;
