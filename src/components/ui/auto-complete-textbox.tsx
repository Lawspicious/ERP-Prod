'use client';

import { Input } from '@chakra-ui/react';
import React, { useState, useRef, useEffect } from 'react';

interface Option {
  label: string;
  value: string;
}

interface AutocompleteProps {
  options: Option[];
  placeholder?: string;
  onChange?: (value: string) => void;
  handleChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => void;
  index?: number;
  className?: string;
}

const AutocompleteTextbox: React.FC<AutocompleteProps> = ({
  options,
  placeholder = 'Select or type an option',
  onChange,
  handleChange,
  index = 0,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedOption(null);
    onChange?.(value);
    handleChange?.(e, index);

    const filtered = value
      ? options.filter((option) =>
          option.label.toLowerCase().includes(value.toLowerCase()),
        )
      : options;

    setFilteredOptions(filtered);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: Option) => {
    setInputValue(option.label);
    setSelectedOption(option);
    onChange?.(option.label);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative w-full ${className}`}>
      <Input
        ref={inputRef}
        type="text"
        name="name"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="w-full rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />

      {isOpen && (
        <ul
          ref={dropdownRef}
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded border bg-white shadow-lg"
        >
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionSelect(option)}
              className="cursor-pointer p-2 hover:bg-gray-100"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteTextbox;
