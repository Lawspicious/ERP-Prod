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
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AddREForm from './add-RE-form';
import AddServiceForm from './add-service-form';
import { useTeam } from '@/hooks/useTeamHook';
import { IUser } from '@/types/user';
import SelectSearch from 'react-select';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';

//Add Invoices as needed
export const serviceList = ['Service A', 'Service B', 'Service C'];
export const serviceList2 = [
  { label: 'Affidavit Preparation', value: 'affidavit_preparation' },
  { label: 'Appearance Dated', value: 'appearance_dated' },
  { label: 'Arbitration Representation', value: 'arbitration_representation' },
  { label: 'Consolidated Charges', value: 'consolidated_charges' },
  {
    label: 'Drafting & Preparation of Legal Notices',
    value: 'drafting_preparation_legal_notices',
  },
  { label: 'Power of Attorney', value: 'power_of_attorney' },
  { label: 'Professional Charges', value: 'professional_charges' },
  {
    label: 'Reimbursements (exclusive of GST)',
    value: 'reimbursements_exclusive_gst',
  },
  { label: 'Retainership Charges', value: 'retainership_charges' },
];

const AddInvoiceForm = ({
  allClients,
}: {
  allClients: (IClient | IClientProspect)[];
}) => {
  const [invoiceType, setInvoiceType] = useState<
    'abhradip' | 'lawspicious' | null
  >('lawspicious');
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
  const [billTo, setBillTo] = useState('organization');
  const [gstNote, setGstNote] = useState('');
  const [panNo, setPanNo] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<
    { name: string; id: string }[]
  >([]);

  const [state, newToast] = useToastHook();

  // Handle hash route changes
  useEffect(() => {
    const handleHashChange = () => {
      setLoading(true);
      const hash = window.location.hash.replace('#', '') || '';

      if (hash === 'client') {
        setInvoiceType(null);
        setBillTo('client');
      }
      setLoading(false);
    };

    // Set the active tab based on initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup the event listener on unmount
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

    if (!selectedTasks.length && billTo === 'organization') {
      newToast({
        message: 'Task is required',
        status: 'error',
      });

      return;
    }

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
              id: client.id,
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
        invoiceType,
        paymentStatus: paymentStatus,
        billTo: billTo as 'client' | 'organization',
        totalAmount: services.reduce((accumulator, service) => {
          return accumulator + parseInt(service.amount as unknown as string);
        }, 0),
        panNo,
        gstNote,
        paymentDate,
        tasks: selectedTasks,
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

  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('taskStatus', '==', 'COMPLETED'),
        );
        const snapshot = await getDocs(q);

        const filtered = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (task: any) =>
              Array.isArray(task.lawyerDetails) &&
              task.lawyerDetails.some(
                (lawyer: any) => lawyer.id === selectedTeamMemberId,
              ),
          );

        setCompletedTasks(filtered);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompletedTasks();
  }, [selectedTeamMemberId]);

  const taskOptions = completedTasks.map((task: any) => ({
    value: task.id,
    label: `${task.taskName} (${task?.startDate})`,
  }));

  const groupedTeamOptions = [
    {
      label: 'Lawyers',
      options: allTeam
        .filter((user) => user.role === 'LAWYER')
        .map((t) => ({
          value: t.id,
          label: t.name,
        })),
    },
    {
      label: 'Admins',
      options: allTeam
        .filter((user) => user.role === 'ADMIN')
        .map((t) => ({
          value: t.id,
          label: t.name,
        })),
    },
    {
      label: 'HRs',
      options: allTeam
        .filter((user) => user.role === 'HR')
        .map((t) => ({
          value: t.id,
          label: t.name,
        })),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-6">
        <h1 className="heading-primary mb-4">Add New Invoice</h1>
        <Button
          isLoading={loading}
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() => window.history.back()} // Use the browser's history API
        >
          Back
        </Button>
      </div>

      <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="col-span-2 flex justify-between gap-4">
          <FormControl className="col-span-2">
            <FormLabel>Invoice Type</FormLabel>
            <Stack direction="row">
              <Checkbox
                isChecked={invoiceType === 'abhradip'}
                onChange={() =>
                  setInvoiceType(invoiceType === 'abhradip' ? null : 'abhradip')
                }
              >
                Abhradip Jha
              </Checkbox>
              <Checkbox
                isChecked={invoiceType === 'lawspicious'}
                onChange={() =>
                  setInvoiceType(
                    invoiceType === 'lawspicious' ? null : 'lawspicious',
                  )
                }
              >
                Lawspicious
              </Checkbox>
            </Stack>
          </FormControl>
        </div>
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

              <SelectSearch
                name="lawyerId"
                placeholder="Add team member"
                options={groupedTeamOptions}
                value={groupedTeamOptions
                  .flatMap((group) => group.options)
                  .find((opt) => opt.value === selectedTeamMemberId)}
                onChange={(option) =>
                  setSelectedTeamMemberId(option?.value || '')
                }
              />
            </FormControl>
          )}
        </div>
        <div className="col-span-2 flex justify-between gap-4">
          <FormControl></FormControl>

          {billTo === 'organization' && (
            <FormControl>
              <FormLabel>Task</FormLabel>

              <SelectSearch
                placeholder="Select"
                options={taskOptions}
                onChange={(option) => {
                  const selected = option as { value: string; label: string };
                  const taskId = selected?.value;
                  const taskName = selected?.label;
                  const alreadySelected = selectedTasks.some(
                    (task) => task.id === taskId,
                  );
                  if (!alreadySelected) {
                    const updatedTasks = [
                      ...selectedTasks,
                      { id: taskId, name: taskName },
                    ];
                    setSelectedTasks(updatedTasks);
                  }
                }}
              />

              <VStack align="start" mt={2}>
                {selectedTasks.map((task) => (
                  <Tag
                    size="md"
                    key={task.id}
                    borderRadius="full"
                    variant="solid"
                    colorScheme="purple"
                  >
                    <TagLabel>{task.name}</TagLabel>
                    <TagCloseButton
                      onClick={() => {
                        const updatedTasks = selectedTasks.filter(
                          (t) => t.id !== task.id,
                        );
                        setSelectedTasks(updatedTasks);
                      }}
                    />
                  </Tag>
                ))}
              </VStack>
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
