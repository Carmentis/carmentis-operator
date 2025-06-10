'use client';

import { Box, Button, Container, Divider, Paper, Typography } from '@mui/material';
import { useOrganisation } from '@/contexts/organisation-store.context';
import GenericTableComponent from '@/components/generic-table.component';
import { useCustomRouter } from '@/contexts/application-navigation.context';
import getApiKeyStatus from '@/hooks/api-key-status.hook';
import { ApiKeyDescriptionFragment, useGetApiKeysQuery } from '@/generated/graphql';
import Skeleton from 'react-loading-skeleton';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

export default function Page() {
  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <VpnKeyIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="500" color="primary">
              API Keys
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>
      <TableOfKeys />
    </Container>
  );
}

function renderLinkToApplication(application: {id: number, name: string}) {
  const organisation = useOrganisation();
  const router = useCustomRouter();
  return (
    <Typography 
      variant="body2" 
      sx={{ 
        cursor: 'pointer', 
        color: 'primary.main',
        '&:hover': { textDecoration: 'underline' }
      }}
      onClick={() => router.navigateToApplication(organisation.id, application.id)}
    >
      {application.name}
    </Typography>
  );
}

function TableOfKeys() {
  const organisation = useOrganisation();
  const router = useCustomRouter();
  const {data: keys, loading: isLoading, error} = useGetApiKeysQuery({
    variables: { id: organisation.id }
  });

  if (isLoading) {
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
          Error loading API keys
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error.message || "An unexpected error occurred"}
        </Typography>
      </Box>
    );
  }

  if (!keys || keys.getAllApiKeysOfOrganisation.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        py={8}
        textAlign="center"
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No API keys found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create your first API key to get started
        </Typography>
      </Box>
    );
  }

  function extractDataFromKey(row: ApiKeyDescriptionFragment) {
    const applicationValue = row.application ? renderLinkToApplication(row.application) : '--';
    const status = getApiKeyStatus(row);
    return [
      { head: 'ID', value: <Typography variant="body2">{row.id}</Typography> },
      { head: 'Name', value: <Typography variant="body2" fontWeight="500">{row.name}</Typography> },
      { head: 'Key', value: <Typography variant="body2" fontFamily="monospace">{row.partialKey}</Typography> },
      { head: 'Status', value: status },
      { head: 'Created at', value: <Typography variant="body2">{new Date(row.createdAt).toLocaleString()}</Typography> },
      { head: 'Application', value: applicationValue },
    ];
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
      <GenericTableComponent 
        data={keys.getAllApiKeysOfOrganisation} 
        extractor={extractDataFromKey} 
        onRowClicked={key => router.push(`apiKeys/${key.id}/usage`)}
      />
    </Paper>
  );
}
