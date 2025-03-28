import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { Formik, Form } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { settingsSchema, SettingsFormData } from "@/schemas/validation";
import { settingsService } from "@/services/api";
import { ApiSettings } from "@/types";

export const Settings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.getApiSettings,
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.updateApiSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        API Integration Settings
      </Typography>
      <Card>
        <CardContent>
          <Formik<SettingsFormData>
            initialValues={
              settings || {
                baseUrl: "",
                apiKey: "",
                apiSecret: "",
              }
            }
            validationSchema={toFormikValidationSchema(settingsSchema)}
            onSubmit={(values) => updateMutation.mutate(values)}
          >
            {({ values, handleChange, handleBlur, errors, touched }) => (
              <Form>
                <TextField
                  fullWidth
                  name="baseUrl"
                  label="Base URL"
                  value={values.baseUrl}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.baseUrl && Boolean(errors.baseUrl)}
                  helperText={touched.baseUrl && errors.baseUrl}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="apiKey"
                  label="API Key"
                  value={values.apiKey}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.apiKey && Boolean(errors.apiKey)}
                  helperText={touched.apiKey && errors.apiKey}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="apiSecret"
                  label="API Secret"
                  type="password"
                  value={values.apiSecret}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.apiSecret && Boolean(errors.apiSecret)}
                  helperText={touched.apiSecret && errors.apiSecret}
                  margin="normal"
                />
                <Box mt={3}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateMutation.isPending}
                  >
                    Save Settings
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};
