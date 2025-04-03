import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { userService, organizationService } from "@/services/api";
import DataTable, { Column } from "@/components/DataTable";
import { OrganizationSelect } from "@/components/OrganizationSelect";
import { User, Organization } from "@/types";

export const Users = () => {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", page, selectedOrg?.id],
    queryFn: () => userService.getUsers(page, 10, undefined, selectedOrg?.id),
  });

  const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationService.getOrganizations,
  });

  const columns: Column<User>[] = [
    {
      field: "name",
      headerName: "Name",
      getValue: (user) => `${user.firstName} ${user.lastName}`,
    },
    {
      field: "email",
      headerName: "Email",
      getValue: (user) => user.email,
    },
    {
      field: "organization",
      headerName: "Organization",
      getValue: (user) => user.organization?.name || "",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            flex: 1,
            fontSize: { xs: "1.5rem", sm: "2.125rem" },
          }}
        >
          Users
        </Typography>
        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
          <OrganizationSelect
            organizations={organizations}
            selectedOrganization={selectedOrg}
            onSelect={setSelectedOrg}
            isLoading={isLoadingOrgs}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DataTable
          columns={columns}
          data={usersResponse?.users || []}
          isLoading={isLoadingUsers}
          getRowId={(user: User) => user.id}
          defaultSortBy="name"
          emptyMessage={
            selectedOrg
              ? `No users found in ${selectedOrg.name}`
              : "No users found"
          }
          pagination={{
            page,
            totalPages: usersResponse?.pagination.totalPages || 0,
            onPageChange: setPage,
          }}
        />
      </Box>
    </Box>
  );
};
