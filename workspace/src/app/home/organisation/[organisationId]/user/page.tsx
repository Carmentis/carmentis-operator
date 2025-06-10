'use client';

import { useState } from 'react';
import { UserSearchResult } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { 
  Box, 
  Button, 
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Divider, 
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Paper, 
  TextField, 
  Typography 
} from '@mui/material';
import { SearchInputForm } from '@/components/form/search-input.form';
import { SearchUserInputComponent } from '@/components/form/search-user-form';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useModal } from 'react-modal-hook';
import TableOfUsers from '@/components/table/table-of-users';
import {
  useAddExistingUserInOrganisationMutation,
  useGetUsersInOrganisationQuery,
  useRemoveUserInOrganisationMutation,
  UserEntityFragment,
} from '@/generated/graphql';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import { useConfirmationModal } from '@/contexts/popup-modal.component';

function InsertExistingUserPanel(
  input: { onClick: (user: UserSearchResult) => void },
) {
  return (
    <Box>
      <Typography variant="h6" fontWeight="500" mb={2}>
        Add Existing User
      </Typography>
      <SearchUserInputComponent
        formatUserSearchResult={(user: UserSearchResult) => (
          <ListItem 
            button
            sx={{ 
              borderBottom: '1px solid #f0f0f0',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight="500">
                  {user.firstname} {user.lastname}
                </Typography>
              }
              secondary={
                <Typography 
                  variant="body2" 
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem'
                  }}
                >
                  {user.publicKey}
                </Typography>
              }
            />
          </ListItem>
        )}
        onSelectedUser={(user) => input.onClick(user)} 
      />
    </Box>
  );
}

export default function UserPage() {
  const [removeUserFromOrganisation, { loading: isRemoving }] = useRemoveUserInOrganisationMutation();
  const [insertUserInOrganisation, { loading: isInserting }] = useAddExistingUserInOrganisationMutation();
  const organisation = useOrganisation();
  const organisationId = organisation.id;
  const { data, loading: isLoading, error, refetch: mutate } = useGetUsersInOrganisationQuery({
    variables: { id: organisationId },
  });

  const [search, setSearch] = useState('');
  const notify = useToast();

  const openConfirmation = useConfirmationModal();

  const [showAddExistingUserModal, hideAddExistingUserModal] = useModal(() => {
    return (
      <Dialog open={true} maxWidth="sm" fullWidth>
        <DialogContent>
          <InsertExistingUserPanel onClick={insertExistingUser} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={hideAddExistingUserModal}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  });

  /**
   * Handles the user insertion in which a user is selected to be inserted into the application
   * @param user
   */
  function insertExistingUser(user: UserSearchResult) {
    if (isInserting) return;
    insertUserInOrganisation({
      variables: { organisationId, userPublicKey: user.publicKey }
    }).then(result => {
      const { data, errors } = result;
      if (data) {
        notify.success(`User ${user.firstname} ${user.lastname} added to organisation`);
        mutate();
        hideAddExistingUserModal();
      } else if (errors) {
        notify.error(errors);
      }
    }).catch(notify.error);
  }

  function confirmRemoveUser(pk: string, name: string) {
    openConfirmation(
      "Remove User",
      `Are you sure you want to remove ${name} from this organisation?`,
      "Remove",
      "Cancel",
      () => {
        removeUserFromOrganisation({
          variables: { organisationId, userPublicKey: pk }
        }).then(result => {
          const { errors } = result;
          if (errors) {
            notify.error(errors);
          } else {
            notify.success("User successfully removed from organisation");
            mutate();
          }
        }).catch(notify.error);
      }
    );
  }

  function match(user: UserEntityFragment, search: string) {
    const searchLower = search.toLowerCase();
    return search === '' ||
      user.publicKey.toLowerCase().includes(searchLower) ||
      user.firstname.toLowerCase().includes(searchLower) ||
      user.lastname.toLowerCase().includes(searchLower);
  }

  if (isLoading || !data) {
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

  const users = data.organisation.users;
  const filteredUsers = users.filter(u => match(u, search));

  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <PeopleIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="500" color="primary">
              Team Members
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
                placeholder="Search members..."
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
              onClick={showAddExistingUserModal}
              startIcon={<PersonAddIcon />}
              disabled={isInserting}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                px: 2
              }}
            >
              Add Member
            </Button>
          </Box>
        </Box>
        <Divider />
      </Box>

      {filteredUsers.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No team members found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {search ? 
              `No results matching "${search}"` : 
              "Add team members to collaborate on this organisation"}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
          <TableOfUsers
            users={filteredUsers}
            onClick={user => console.log(user)}
            onDelete={(pk, name) => confirmRemoveUser(pk, name)}
          />
        </Paper>
      )}
    </Container>
  );
}
