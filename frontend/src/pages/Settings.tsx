import { Box, Typography } from "@mui/material";

export const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography>
        API credentials are managed securely on the backend. Please contact your
        administrator for any changes.
      </Typography>
    </Box>
  );
};
