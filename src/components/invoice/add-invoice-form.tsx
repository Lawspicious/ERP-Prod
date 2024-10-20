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
  const {
    fetchCasesByClientId,
    allCases,
    fetchCasesByLawyerId,
    allCasesLawyer,
  } = useCases();
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
      let clientDetails = null;
      let teamMember: IUser | undefined = undefined;

      if (selectedClientId) {
        const client = allClients.find(
          (client) => client.id === selectedClientId,
        );
        clientDetails = client
          ? {
              name: client.name,
              email: client.email,
              mobile: client.mobile,
              location:
                client.clientType === 'normal' ? client.city : client.location,
            }
          : null;
      }

      if (billTo === 'organization' && selectedTeamMemberId !== '') {
        teamMember = allTeam.find(
          (member) => member.id === selectedTeamMemberId,
        );
      }

      const invoiceData: IInvoice = {
        clientDetails: clientDetails,
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
          return accumulator + parseInt(service.amount as unknown as string);
        }, 0),
        panNo,
        gstNote,
        paymentDate,
      };

      // Only create and send invoice if clientDetails or selectedClientId is not null
      createInvoice(invoiceData);
      // sendInvoiceEmail(invoiceData);
      setServices([
        {
          description: '',
          name: '',
          amount: 0,
        },
      ]);
      setREData([
        {
          caseId: '',
        },
      ]);
      setSelectedTeamMemberId('');
      setSelectedClientId('');
      setGstNote('');
      setPanNo('');
      setPaymentStatus('unpaid');
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
      if (selectedTeamMemberId !== '') {
        fetchCasesByLawyerId(selectedTeamMemberId);
      }
    }
  }, [selectedClientId, billTo, selectedTeamMemberId]);

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
                {/* Group for Lawyers */}
                <optgroup label="Lawyers">
                  {allTeam
                    .filter((team: IUser) => team.role === 'LAWYER')
                    .map((lawyer: IUser) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name}
                      </option>
                    ))}
                </optgroup>

                {/* Group for Admins */}
                <optgroup label="Admins">
                  {allTeam
                    .filter((team: IUser) => team.role === 'ADMIN')
                    .map((admin: IUser) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                </optgroup>
              </Select>
            </FormControl>
          )}
        </div>

        <AddREForm
          allCases={billTo === 'organization' ? allCasesLawyer : allCases}
          allClients={allClients}
          REData={REData}
          setREData={setREData}
          invoiceDueDate={invoiceDueDate}
          setInvoiceDueDate={setInvoiceDueDate}
          selectedClientId={selectedClientId}
          setSelectedClientId={setSelectedClientId}
          billTo={billTo}
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
