import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { organizationSchema, OrganizationFormData } from "@/schemas/validation";
import { organizationService } from "@/services/api";
import { Organization } from "@/types";

export const Organizations = () => {
  const [open, setOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationService.getOrganizations,
  });

  const createMutation = useMutation({
    mutationFn: (data: Pick<Organization, "name">) =>
      organizationService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Pick<Organization, "name">;
    }) => organizationService.updateOrganization(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setOpen(false);
      setEditingOrg(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: organizationService.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
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
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            flex: 1,
            fontSize: { xs: "1.5rem", sm: "2.125rem" },
          }}
        >
          Organizations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingOrg(null);
            setOpen(true);
          }}
          size="small"
          sx={{
            minWidth: { xs: "auto", sm: 200 },
            px: { xs: 2, sm: 3 },
          }}
        >
          Add Organization
        </Button>
      </Box>

      <Grid container spacing={2}>
        {organizations?.map((org) => (
          <Grid item xs={12} md={6} key={org.id}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                        mb: 1,
                      }}
                    >
                      {org.name}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {org._count?.users || 0} users
                      </Typography>
                      <Chip
                        size="small"
                        label={new Date(org.createdAt).toLocaleDateString()}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => {
                        setEditingOrg(org);
                        setOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => deleteMutation.mutate(org.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingOrg ? "Edit Organization" : "Add Organization"}
        </DialogTitle>
        <Formik<OrganizationFormData>
          initialValues={
            editingOrg || {
              name: "",
            }
          }
          validationSchema={toFormikValidationSchema(organizationSchema)}
          onSubmit={(values) => {
            if (editingOrg) {
              updateMutation.mutate({ id: editingOrg.id, data: values });
            } else {
              createMutation.mutate(values);
            }
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  name="name"
                  label="Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  margin="normal"
                  variant="outlined"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingOrg ? "Update" : "Create"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};
