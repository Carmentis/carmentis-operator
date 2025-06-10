'use client';

import { 
  Box, 
  Button, 
  Chip, 
  Container, 
  Divider, 
  IconButton, 
  InputAdornment,
  Paper, 
  TextField, 
  Tooltip, 
  Typography 
} from '@mui/material';
import { useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import Skeleton from 'react-loading-skeleton';
import GenericTableComponent from '@/components/generic-table.component';
import { useApplicationNavigationContext, useCustomRouter } from '@/contexts/application-navigation.context';
import useTextFieldFormModal from '@/components/modals/text-form-moda';
import useConfirmationModal from '@/components/modals/confirmation-modal';
import {
  ApplicationSummaryTypeFragment, 
  useCreateApplicationMutation,
  useDeleteApplicationMutation,
  useGetAllApplicationsInOrganisationQuery,
} from '@/generated/graphql';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AppsIcon from '@mui/icons-material/Apps';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';

/**
 * Main page component that manages the list of applications.
 */
export default function ListOfApplicationsPage() {
  const [search, setSearch] = useState('');
  const organisation = useOrganisation();
  const organisationId = organisation.id;
  const notify = useToast();
  const router = useCustomRouter();
  const [createApplication, { loading: isCreating }] = useCreateApplicationMutation();
  const [deleteApplication, { loading: isDeleting }] = useDeleteApplicationMutation();

  const [showDeletionConfirmationModal, setDeletionModalState] = useConfirmationModal<number>({
    title: "Delete Application",
    message: "Are you sure you want to delete this application? This action cannot be undone.",
    yes: 'Delete',
    no: 'Cancel',
    onYes: applicationId => {
      if (isDeleting) return;
      deleteApplication({
        variables: { applicationId }
      }).then(() => {
        notify.success('Application deleted successfully');
        mutate();
      }).catch(notify.error);
    }
  });

  const showApplicationCreationModal = useTextFieldFormModal({
    title: "Create New Application",
    placeholder: "Application Name",
    onSubmit: applicationName => {
      if (isCreating || !applicationName.trim()) return;
      createApplication({
        variables: { organisationId, applicationName },
      }).then(application => {
        const { data } = application;
        notify.success(`Application "${applicationName}" created successfully`);
        router.push(`/home/organisation/${organisationId}/application/${data?.createApplicationInOrganisation.id}`);
      }).catch(notify.error);
    }
  });

  const { data, loading: isLoading, refetch: mutate } = useGetAllApplicationsInOrganisationQuery({
    variables: {
      organisationId: organisation.id,
    },
  });

  if (isLoading) {
    return (
      <Container maxWidth={false} disableGutters>
        <Box mb={4}>
          <Skeleton height={40} width={300} />
          <Box mt={4}>
            <Skeleton height={60} />
            <Skeleton count={5} height={50} />
          </Box>
        </Box>
      </Container>
    );
  }

  const filteredApplications = data?.getAllApplicationsInOrganisation.filter(
    app => search === '' || app.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <AppsIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="500" color="primary">
              Applications
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Paper 
              elevation={0} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                px: 2, 
                py: 0.5, 
                borderRadius: 2,
                border: '1px solid #e0e0e0'
              }}
            >
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
              <TextField
                variant="standard"
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{ ml: 1 }}
              />
            </Paper>
            <Button 
              variant="contained" 
              onClick={showApplicationCreationModal}
              disabled={isCreating}
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 2
              }}
            >
              New Application
            </Button>
          </Box>
        </Box>
        <Divider />
      </Box>

      {filteredApplications.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No applications found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? 
              `No results matching "${search}"` : 
              "Create your first application to get started"}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
          <ListOfApplicationsComponent
            data={filteredApplications}
            organisationId={organisationId}
            deleteApplication={applicationId => {
              setDeletionModalState(applicationId);
              showDeletionConfirmationModal();
            }}
          />
        </Paper>
      )}
    </Container>
  );
}

/**
 * Component that displays a list of application cards with links.
 */
function ListOfApplicationsComponent({ 
  organisationId, 
  data, 
  deleteApplication 
}: {
  organisationId: number;
  data: ApplicationSummaryTypeFragment[];
  deleteApplication: (applicationId: number) => void;
}) {
  const navigation = useApplicationNavigationContext();
  const router = useCustomRouter();

  function visitApplication(appId: number) {
    navigation.navigateToApplication(organisationId, appId);
    router.push(`/home/organisation/${organisationId}/application/${appId}`);
  }

  return (
    <GenericTableComponent
      data={data}
      onRowClicked={(app) => visitApplication(app.id)}
      extractor={(v, i) => [
        { 
          head: 'ID', 
          value: <Typography variant="body2">{v.id}</Typography> 
        },
        { 
          head: 'Name', 
          value: <Typography variant="body2" fontWeight="500">{v.name}</Typography> 
        },
        { 
          head: 'Status', 
          value: (
            <Box>
              {v.isDraft && (
                <Chip 
                  icon={<DraftsIcon />}
                  label="Draft" 
                  size="small" 
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: 1 }}
                />
              )}
              {v.published && (
                <Chip 
                  icon={<PublishIcon />}
                  label="Published" 
                  size="small" 
                  color="primary"
                  sx={{ borderRadius: 1 }}
                />
              )}
            </Box>
          )
        },
        { 
          head: 'Published at', 
          value: v.publishedAt ? (
            <Typography variant="body2">
              {new Date(v.publishedAt).toLocaleString()}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Not published
            </Typography>
          )
        },
        { 
          head: 'Version', 
          value: <Typography variant="body2">{v.version}</Typography> 
        },
        { 
          head: '', 
          value: (
            <Tooltip title="Delete application">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation(); 
                  deleteApplication(v.id);
                }}
                size="small"
                color="error"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(211, 47, 47, 0.04)' 
                  } 
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        }
      ]}
    />
  );
}
