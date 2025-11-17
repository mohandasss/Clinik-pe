import React from 'react';
import { Select, TextInput, Button } from '@mantine/core';

interface FilterBarProps {
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  onCategoryChange: (val: string | null) => void;
  query: string;
  onQueryChange: (val: string) => void;
  onAddNew: () => void;
  disabled?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  query,
  onQueryChange,
  onAddNew,
  disabled = false,
}) => {
  const selectData = [{ value: '', label: 'All' }, ...categories.map(c => ({ value: c.id, label: c.name }))];

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex items-center gap-4 flex-1">
        <Select
          data={selectData}
          value={selectedCategory ?? ''}
          onChange={(v) => onCategoryChange(v || null)}
          placeholder="Filter by category"
          className="w-64"
        />

        <TextInput
          placeholder="Search in page"
          value={query}
          onChange={(e) => onQueryChange(e.currentTarget.value)}
          className="w-64"
        />
      </div>

      <div className="ml-auto">
        <Button onClick={onAddNew} variant="filled" color="blue" disabled={disabled}>
          + Add new
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
