import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

export type Column<T> = {
  field: string;
  headerName: string;
  align?: "left" | "right" | "center";
  minWidth?: number;
  getValue?: (item: T) => string | number;
  renderCell?: (row: T) => ReactNode;
};

type Order = "asc" | "desc";

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId: (item: T) => string | number;
  defaultSortBy?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available",
  getRowId,
  defaultSortBy,
  pagination,
}: DataTableProps<T>) {
  const [orderBy, setOrderBy] = useState<string>(
    defaultSortBy || columns[0].field
  );
  const [order, setOrder] = useState<Order>("asc");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortData = (data: T[]): T[] => {
    const column = columns.find((col) => col.field === orderBy);
    if (!column?.getValue) return data;

    return [...data].sort((a, b) => {
      const aValue = column.getValue!(a);
      const bValue = column.getValue!(b);
      if (order === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  };

  const sortedData = sortData(data);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              backgroundColor: "transparent",
            }}
          >
            <Table stickyHeader size="medium">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.align || "left"}
                      sx={{
                        whiteSpace: "nowrap",
                        backgroundColor: (theme) =>
                          theme.palette.background.paper,
                        minWidth: isMobile ? column.minWidth || 100 : "auto",
                        cursor: "pointer",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                      }}
                      onClick={() => handleSort(column.field)}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        {column.headerName}
                        {orderBy === column.field &&
                          (order === "asc" ? (
                            <ArrowUpward fontSize="small" />
                          ) : (
                            <ArrowDownward fontSize="small" />
                          ))}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow
                    key={getRowId(row)}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || "left"}
                        sx={{
                          whiteSpace: "nowrap",
                          minWidth: isMobile ? column.minWidth || 100 : "auto",
                          py: 1.5,
                        }}
                      >
                        {column.renderCell
                          ? column.renderCell(row)
                          : column.getValue
                          ? column.getValue(row)
                          : row[column.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(_, value) => pagination.onPageChange(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
