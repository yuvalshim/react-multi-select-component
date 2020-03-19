/**
 * This component represents the entire panel which gets dropped down when the
 * user selects the component.  It encapsulates the search filter, the
 * Select-all item, and the list of options.
 */
import styled from "@emotion/styled";
import React, { useState } from "react";

import { filterOptions } from "../lib/fuzzy-match-utils";
import getString from "../lib/get-string";
import { Option } from "../lib/interfaces";
import SelectItem from "./select-item";
import SelectList from "./select-list";

interface ISelectPanelProps {
  ItemRenderer?: Function;
  options: Option[];
  value: Option[];
  focusSearchOnOpen: boolean;
  selectAllLabel?: string;
  onChange: (selected: Option[]) => void;
  disabled?: boolean;
  disableSearch?: boolean;
  hasSelectAll: boolean;
  filterOptions?: (options: Option[], filter: string) => Option[];
  overrideStrings?: { [key: string]: string };
}

enum FocusType {
  SEARCH = -1,
  NONE,
}

const SelectSearchContainer = styled.div`
  width: 100%;
  border-bottom: 1px solid ${(props: any) => props.theme.border};
  input {
    height: ${(props: any) => props.theme.height};
    padding: 0 10px;
    width: 100%;
    outline: none;
    border: 0;
  }
`;

export const SelectPanel = (props: ISelectPanelProps) => {
  const {
    onChange,
    options,
    value,
    filterOptions: customFilterOptions,
    selectAllLabel,
    ItemRenderer,
    disabled,
    disableSearch,
    focusSearchOnOpen,
    hasSelectAll,
    overrideStrings
  } = props;
  const [searchText, setSearchText] = useState("");
  const [focusIndex, setFocusIndex] = useState(focusSearchOnOpen ? FocusType.SEARCH : FocusType.NONE);

  const selectAllOption = {
    label: selectAllLabel || getString("selectAll", overrideStrings),
    value: ""
  };

  const selectAll = () => onChange(options);

  const selectNone = () => onChange([]);

  const selectAllChanged = (checked: boolean) =>
    checked ? selectAll() : selectNone();

  const handleSearchChange = e => {
    setSearchText(e.target.value);
    setFocusIndex(FocusType.SEARCH);
  };

  const handleItemClicked = (index: number) => setFocusIndex(index);

  const handleKeyDown = e => {
    switch (e.which) {
      case 38: // Up Arrow
        if (e.altKey) {
          return;
        }
        updateFocus(FocusType.SEARCH);
        break;
      case 40: // Down Arrow
        if (e.altKey) {
          return;
        }
        updateFocus(1);
        break;
      default:
        return;
    }
    e.stopPropagation();
    e.preventDefault();
  };

  const handleSearchFocus = () => {
    setFocusIndex(FocusType.SEARCH);
  };

  const allAreSelected = () => options.length === value.length;

  const filteredOptions = () =>
    customFilterOptions
      ? customFilterOptions(options, searchText)
      : filterOptions(options, searchText);

  const updateFocus = (offset: number) => {
    let newFocus = focusIndex + offset;
    newFocus = Math.max(0, newFocus);
    newFocus = Math.min(newFocus, options.length);
    setFocusIndex(newFocus);
  };

  return (
    <div className="select-panel" role="listbox" onKeyDown={handleKeyDown}>
      {!disableSearch && (
        <SelectSearchContainer>
          <input
            autoFocus={focusSearchOnOpen}
            placeholder={getString("search", overrideStrings)}
            type="text"
            aria-describedby={getString("search", overrideStrings)}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchFocus}
          />
        </SelectSearchContainer>
      )}

      {hasSelectAll && (
        <SelectItem
          focused={focusIndex === 0}
          checked={allAreSelected()}
          option={selectAllOption}
          onSelectionChanged={selectAllChanged}
          onClick={() => handleItemClicked(0)}
          itemRenderer={ItemRenderer}
          disabled={disabled}
        />
      )}

      <SelectList
        {...props}
        options={filteredOptions()}
        focusIndex={focusIndex - 1}
        onClick={(_e, index) => handleItemClicked(index + 1)}
        ItemRenderer={ItemRenderer}
        disabled={disabled}
      />
    </div>
  );
};

export default SelectPanel;
