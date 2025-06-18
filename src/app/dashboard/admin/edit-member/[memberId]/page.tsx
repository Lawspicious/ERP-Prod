'use client';
import withAuth from '@/components/shared/hoc-middlware';
import PageLayout from '@/components/ui/page-layout';
import { useAuth } from '@/context/user/userContext';
import { typesOfLawyers } from '@/db/typesOfLawyer';
import { useTeam } from '@/hooks/useTeamHook';
import { useUser } from '@/hooks/useUserHook';
import { IUser } from '@/types/user';

import {
  FormControl,
  FormLabel,
  Select,
  Button,
  Input,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const initialData: IUser = {
  name: '',
  email: '',
  phoneNumber: '',
  address: '',
  zipcode: '',
  country: '',
  state: '',
  city: '',
  role: 'LAWYER',
  typeOfLawyer: '',
};

const EditMemberPage = ({ params }: { params: { memberId: string } }) => {
  const [formInputs, setFormInputs] = useState<IUser>({ ...initialData });
  const { updateUser } = useUser();
  const { role } = useAuth();
  const [loading, setLoading] = useState(false);
  const { getUserById, user } = useTeam();

  useEffect(() => {
    getUserById(params.memberId as string);
  }, []);

  useEffect(() => {
    if (user) {
      setFormInputs({
        ...initialData,
        ...user,
        phoneNumber: user.phoneNumber?.replace(/^\+91/, '') || '',
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormInputs({
      ...formInputs,
      [name]: value,
    });
  };
  const handleEditMember = async (e: any) => {
    setLoading(true);
    e.preventDefault();
    try {
      let _createMemberData = formInputs;
      formInputs.phoneNumber = `+91${formInputs.phoneNumber}`;
      const res = await updateUser({
        ..._createMemberData,
        id: params.memberId as string,
      });
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <PageLayout screen="margined">
      <div>
        <div className="flex items-center justify-between gap-6">
          <h1 className="heading-primary mb-6">Edit Member</h1>
          <Button
            isLoading={loading}
            colorScheme="blue"
            leftIcon={<ArrowLeft />}
            onClick={() =>
              (window.location.href = '/dashboard/admin/workspace-admin#team')
            }
          >
            Back
          </Button>
        </div>
        <hr className="mb-6 h-[0.5px] border-white/30" />
        <form className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formInputs.name}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formInputs.email}
                readOnly={true}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Mobile Number</FormLabel>
              <Input
                type="tel"
                name="phoneNumber"
                placeholder="Enter mobile number"
                value={formInputs.phoneNumber}
                onChange={handleInputChange}
              />
            </FormControl>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormControl isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                type="text"
                name="address"
                placeholder="Enter address"
                value={formInputs.address}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Country</FormLabel>
              <Input
                type="text"
                name="country"
                placeholder="Enter Country"
                value={formInputs.country}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>State</FormLabel>
              <Input
                type="text"
                name="state"
                placeholder="Enter state"
                value={formInputs.state}
                onChange={handleInputChange}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>City</FormLabel>
              <Input
                type="text"
                name="city"
                placeholder="Enter city"
                value={formInputs.city}
                onChange={handleInputChange}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Zipcode</FormLabel>
              <Input
                type="text"
                name="zipcode"
                placeholder="Enter zipcode"
                value={formInputs.zipcode}
                onChange={handleInputChange}
              />
            </FormControl>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                name="role"
                value={formInputs.role}
                onChange={handleInputChange}
              >
                <option value="ADMIN">Admin</option>
                <option value="LAWYER">Lawyer</option>
                <option value="HR">HR</option>
                {role === 'SUPERADMIN' && (
                  <option value="SUPERADMIN">SuperAdmin</option>
                )}
              </Select>
            </FormControl>

            {formInputs.role === 'LAWYER' && (
              <FormControl>
                <FormLabel>Type of Lawyer</FormLabel>
                <Select
                  name="typeOfLawyer"
                  value={formInputs.typeOfLawyer || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select type of lawyer</option>
                  {typesOfLawyers.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Button
              colorScheme="purple"
              isLoading={loading}
              onClick={handleEditMember}
            >
              Update Member
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

// Specify allowed roles for this page
const allowedRoles = ['ADMIN', 'HR', 'SUPERADMIN']; // Add roles that should have access

export default withAuth(EditMemberPage, allowedRoles);
