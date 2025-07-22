'use client';

import { 
  Box, 
  Checkbox, 
  Container, 
  Divider, 
  FormControlLabel, 
  Grid, 
  Pagination, 
  Paper, 
  Switch, 
  Table, 
  TableBody,
  TableCell, 
  TableContainer, 
  TableHead,
  TableRow, 
  Tooltip, 
  Typography 
} from '@mui/material';
import GenericTableComponent from '@/components/GenericTableComponent';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import useApiKeyStatusFormatter from '@/hooks/useApiKeyStatusFormatter';
import { useToast } from '@/app/layout';
import {
  ApiKeyUsageFragment,
  useGetApiKeyQuery, 
  useGetApiKeyUsageQuery,
  useUpdateKeyMutation,
} from '@/generated/graphql';
import Skeleton from 'react-loading-skeleton';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCustomRouter } from '@/contexts/application-navigation.context';

export default function Page() {
  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <VpnKeyIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="500" color="primary">
              API Key Usage
            </Typography>
          </Box>
          <BackToKeysButton />
        </Box>
        <Divider />
      </Box>
      <Box display="flex" flexDirection="column" gap={4}>
        <Header />
        <TableOfKeyUsage />
      </Box>
    </Container>
  );
}

function BackToKeysButton() {
  const router = useCustomRouter();
  const { organisationId } = useParams<{ organisationId: string }>();

  return (
    <Typography 
      variant="body2" 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 0.5, 
        cursor: 'pointer',
        color: 'primary.main',
        '&:hover': { textDecoration: 'underline' }
      }}
      onClick={() => router.push(`/home/organisation/${organisationId}/apiKeys`)}
    >
      <ArrowBackIcon fontSize="small" />
      Back to API Keys
    </Typography>
  );
}

function Header() {
  const notify = useToast();
  const { keyId } = useParams<{ keyId: string }>();
  const { data, loading: isLoading, refetch: mutate } = useGetApiKeyQuery({
    variables: { id: parseInt(keyId) },
  });
  const [updateKey] = useUpdateKeyMutation();
  const toast = useToast();
  const apiKeyFormatter = useApiKeyStatusFormatter();

  function switchKeyStatus() {
    const key = data?.getApiKey;
    updateKey({
      variables: {
        id: parseInt(keyId),
        name: key?.name,
        isActive: !key.isActive
      }
    })
      .then(result => {
        const { errors } = result;
        if (errors) {
          notify.error(errors);
        } else {
          notify.success("Key status updated successfully");
          mutate();
        }
      })
      .catch(toast.error);
  }

  if (isLoading) {
    return (
      <Box mb={4}>
        <Skeleton height={40} width={300} />
        <Box mt={2}>
          <Skeleton height={24} width={200} />
        </Box>
        <Box mt={4}>
          <Skeleton height={100} />
        </Box>
      </Box>
    );
  }

  if (!data || !data.getApiKey) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        py={8}
        textAlign="center"
      >
        <Typography variant="h6" color="error" gutterBottom>
          API Key not found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The requested API key could not be found
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #eaeaea' }}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" fontWeight="500">
              Key: {data.getApiKey.name}
            </Typography>
            {apiKeyFormatter(data.getApiKey)}
          </Box>
          <Tooltip title={data.getApiKey.isActive ? "Disable API key" : "Enable API key"}>
            <FormControlLabel
              control={
                <Switch 
                  checked={data.getApiKey.isActive} 
                  onChange={switchKeyStatus}
                  color="primary"
                />
              }
              label={data.getApiKey.isActive ? "Enabled" : "Disabled"}
              labelPlacement="start"
            />
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableBody>
              {[
                { head: 'Created at', value: new Date(data.getApiKey.createdAt).toLocaleString() },
                { head: 'Key name', value: data.getApiKey.name },
                { head: 'Last digits', value: data.getApiKey.partialKey },
                { head: 'Active until', value: new Date(data.getApiKey.activeUntil).toLocaleString() },
              ].map((v, i) => (
                <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500, width: '30%' }}>
                    {v.head}
                  </TableCell>
                  <TableCell>{v.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}

function TableOfKeyUsage() {
  const { keyId } = useParams<{ keyId: string }>();
  const [state, setState] = useState<{ offset: number, limit: number, filterByUnauthorized: boolean }>({
    offset: 0,
    limit: 10,
    filterByUnauthorized: false
  });

  const { data, loading, error } = useGetApiKeyUsageQuery({
    variables: {
      id: parseInt(keyId),
      offset: state.offset,
      limit: state.limit,
      filterByUnauthorised: state.filterByUnauthorized
    },
  });

  function unauthorizedOnly(value: boolean) {
    setState({ offset: 0, limit: 10, filterByUnauthorized: value });
  }

  if (loading) {
    return (
      <Box mt={4}>
        <Skeleton height={60} />
        <Skeleton count={5} height={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        py={8}
        textAlign="center"
      >
        <Typography variant="h6" color="error" gutterBottom>
          Error loading API key usage
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || "An unexpected error occurred"}
        </Typography>
      </Box>
    );
  }

  if (!data || !data.getApiKey.usages || data.getApiKey.usages.length === 0) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2, 
          border: '1px solid #eaeaea',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No usage data found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This API key has not been used yet or no records match your filter
        </Typography>
      </Paper>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h5" fontWeight="500">
        Usage History
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
        <GenericTableComponent
          data={data.getApiKey.usages}
          error={error}
          extractor={(row: ApiKeyUsageFragment) => {
            return [
              { head: 'ID', value: <Typography variant="body2">{row.id}</Typography> },
              { head: 'Execution date', value: <Typography variant="body2">{new Date(row.usedAt).toLocaleString()}</Typography> },
              { head: 'IP', value: <Typography variant="body2">{row.ip}</Typography> },
              { head: 'Method', value: <Typography variant="body2" fontWeight="500">{row.requestMethod}</Typography> },
              { head: 'URL', value: <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.requestUrl}</Typography> },
              { 
                head: 'Response Status', 
                value: <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: row.responseStatus >= 400 ? 'error.main' : (row.responseStatus >= 300 ? 'warning.main' : 'success.main')
                  }}
                >
                  {row.responseStatus}
                </Typography> 
              },
            ];
          }}
        />
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Pagination
          count={Math.max(1, Math.round((data.getApiKey.countUsages / state.limit) + 0.5))}
          page={Math.floor(state.offset / state.limit) + 1}
          onChange={(e, page) => setState(s => {
            return { ...s, offset: (page - 1) * state.limit };
          })}
          color="primary"
          size="medium"
          showFirstButton
          showLastButton
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={state.filterByUnauthorized} 
              onChange={(e) => unauthorizedOnly(e.target.checked)}
              color="primary"
            />
          }
          label="Show unauthorized requests only"
        />
      </Box>
    </Box>
  );
}
