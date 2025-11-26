import { Box, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup } from '@mui/material';

interface TableSortControlProps<T extends string = string> {
  options: Array<{ value: T; label: string }>;
  value: T;
  direction: 'asc' | 'desc';
  onChange: (field: T, direction: 'asc' | 'desc') => void;
}

export const TableSortControl = <T extends string = string>({
  options,
  value,
  direction,
  onChange,
}: TableSortControlProps<T>) => (
  <Box display="flex" gap={2} alignItems="center">
    <FormControl size="small">
      <InputLabel id="table-sort-field">Sort by</InputLabel>
      <Select
        labelId="table-sort-field"
        label="Sort by"
        value={value}
        onChange={(event) => onChange(event.target.value as T, direction)}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <ToggleButtonGroup
      size="small"
      exclusive
      value={direction}
      onChange={(_evt, next) => next && onChange(value, next)}
    >
      <ToggleButton value="asc">Asc</ToggleButton>
      <ToggleButton value="desc">Desc</ToggleButton>
    </ToggleButtonGroup>
  </Box>
);
