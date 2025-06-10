'use client';

import { useState } from 'react';
import { useApplicationNavigationContext } from '@/contexts/application-navigation.context';
import { useToast } from '@/app/layout';
import AvatarOrganisation from '@/components/avatar-organisation';
import { 
  Box, 
  Button, 
  Card, 
  Container,
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Divider,
  Grid,
  InputAdornment,
  Paper,
  TextField, 
  Typography 
} from '@mui/material';
import { SearchInputForm } from '@/components/form/search-input.form';
import Skeleton from 'react-loading-skeleton';
import { useModal } from 'react-modal-hook';
import { useCreateOrganisationMutation, useGetOrganisationsQuery } from '@/generated/graphql';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [createOrganisationMutation, {loading: isCreatingOrganisation}] = useCreateOrganisationMutation();
  const navigation = useApplicationNavigationContext();
  const notify = useToast();

  function createOrganisation(name: string) {
    if (!name.trim()) {
      notify.error("Organisation name cannot be empty");
      return;
    }

    createOrganisationMutation({ variables: { name } })
      .then(({data}) => {
        if (data && data.createOrganisation) {
          notify.success("Organisation created successfully");
          navigation.navigateToOrganisation(data.createOrganisation.id);
        }
      }).catch(notify.error);
  }

  const [showModal, hideModal] = useModal(() => (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Organisation</DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <TextField 
            size="small" 
            fullWidth 
            autoFocus 
            label="Organisation Name"
            placeholder="Enter organisation name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={() => hideModal()} 
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => { createOrganisation(name); hideModal(); }} 
          variant="contained"
          disabled={isCreatingOrganisation || !name.trim()}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  ), [name, isCreatingOrganisation]);

  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="500" color="primary">
            Organisations
          </Typography>
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
                placeholder="Search organisations..."
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
              onClick={showModal} 
              disabled={isCreatingOrganisation}
              startIcon={<AddIcon />}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 2
              }}
            >
              New Organisation
            </Button>
          </Box>
        </Box>
        <Divider />
      </Box>
      <ListOfOrganisations search={search} />
    </Container>
  );
}

function ListOfOrganisations(props: {search: string}) {
  const {data, loading} = useGetOrganisationsQuery();
  const navigation = useApplicationNavigationContext();

  function onClick(organisationId: number) {
    navigation.navigateToOrganisation(organisationId);
  }

  function renderOrganisation(organisation: { id: number; name: string; publicSignatureKey: string }) {
    return (
      <Grid item xs={12} sm={6} md={4} key={organisation.id}>
        <Card 
          elevation={0}
          sx={{ 
            p: 2, 
            height: '100%',
            border: '1px solid #eaeaea',
            borderRadius: 2,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer'
            }
          }}
          onClick={() => onClick(organisation.id)}
        >
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <AvatarOrganisation organisationId={organisation.id} width={48} height={48} />
            <Typography variant="h6" fontWeight="500">
              {organisation.name}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {organisation.publicSignatureKey}
          </Typography>
        </Card>
      </Grid>
    );
  }

  function renderLoadingState() {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton height={120} />
          </Grid>
        ))}
      </Grid>
    );
  }

  let content;
  if (loading || !data) {
    content = renderLoadingState();
  } else {
    const organisations = data.organisations;
    const searchLowercase = props.search.toLowerCase();
    const filteredOrgs = organisations
      .filter(org => searchLowercase === '' || org.name.toLowerCase().includes(searchLowercase));

    if (filteredOrgs.length === 0) {
      content = (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No organisations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {props.search ? 
              `No results matching "${props.search}"` : 
              "Create your first organisation to get started"}
          </Typography>
        </Box>
      );
    } else {
      content = (
        <Grid container spacing={3}>
          {filteredOrgs.map(org => renderOrganisation(org))}
        </Grid>
      );
    }
  }

  return content;
}
