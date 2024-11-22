'use client';
import AutocompleteTextbox from '@/components/ui/auto-complete-textbox';

const MyComponent = () => {
  const fruitOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'tormaa', value: 'ki chuth' },
  ];

  return (
    <AutocompleteTextbox
      options={fruitOptions}
      onChange={(value) => console.log(value)}
      placeholder="Select a fruit"
    />
  );
};

export default MyComponent;
