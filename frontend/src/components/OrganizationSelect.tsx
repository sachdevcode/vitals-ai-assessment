import {
  Autocomplete,
  TextField,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Organization } from "@/types";

interface OrganizationSelectProps {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onSelect: (org: Organization | null) => void;
  isLoading?: boolean;
}

export const OrganizationSelect = ({
  organizations,
  selectedOrganization,
  onSelect,
  isLoading = false,
}: OrganizationSelectProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Autocomplete
      options={organizations}
      getOptionLabel={(option) => option.name}
      value={selectedOrganization}
      onChange={(_, newValue) => onSelect(newValue)}
      loading={isLoading}
      size={isMobile ? "small" : "medium"}
      sx={{
        width: { xs: 200, sm: 300 },
        "& .MuiInputBase-root": {
          height: isMobile ? "40px" : "56px",
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Organization"
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
