// components/DashboardCard.tsx
import { Spinner } from '@chakra-ui/react';
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: number | string;
  description: string;
  Icon: React.FC<any>; // Allow more flexibility for the Icon prop
  iconProps?: object; // Optional iconProps for dynamic usage
  isloading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  description,
  Icon,
  iconProps,
  isloading,
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-8 rounded-md border-2 p-4">
      <section className="flex flex-col gap-3">
        <h1 className="heading-primary text-4xl font-bold">
          {isloading ? <Spinner /> : value}
        </h1>
        <h2 className="heading-secondary text-lg">{title}</h2>
        <p>{description}</p>
      </section>
      <Icon {...iconProps} /> {/* Pass iconProps dynamically */}
    </div>
  );
};

export default DashboardCard;
