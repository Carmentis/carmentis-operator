'use client';
import React, { useState } from 'react';
import { UserSummary } from '@/entities/user.entity';
import Skeleton from 'react-loading-skeleton';
import { useToast } from '@/app/layout';
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useModal } from 'react-modal-hook';
import GenericTableComponent from '@/components/GenericTableComponent';
import { useCreateUserMutation, useDeleteUserMutation, useGetAllUsersQuery, useUpdateUserAdminMutation } from '@/generated/graphql';
import { useAuthenticationContext } from '@/contexts/user-authentication.context';
import { useConfirmationModal } from '@/contexts/popup-modal.component';

export default function UserPage() {
  const notify = useToast();
  const [publicKey, setPublicKey] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [formErrors, setFormErrors] = useState({
    publicKey: '',
    firstname: '',
    lastname: ''
  });

  const { data, loading } = useGetAllUsersQuery();
  const [callUserCreation, { loading: isCreating }] = useCreateUserMutation({
    refetchQueries: ['getAllUsers'],
  });
  const [callUserDeletion, { loading: isDeleting }] = useDeleteUserMutation({
    refetchQueries: ['getAllUsers'],
  });

  const [updateUserAdmin, { loading: isUpdatingAdmin }] = useUpdateUserAdminMutation({
    refetchQueries: ['getAllUsers'],
  });

  const openConfirmation = useConfirmationModal();

  function validateForm() {
    const errors = {
      publicKey: '',
      firstname: '',
      lastname: ''
    };

    if (!publicKey.trim()) {
      errors.publicKey = 'Public key is required';
    }

    if (!firstname.trim()) {
      errors.firstname = 'First name is required';
    }

    if (!lastname.trim()) {
      errors.lastname = 'Last name is required';
    }

    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  }

  function resetForm() {
    setPublicKey('');
    setFirstname('');
    setLastname('');
    setFormErrors({
      publicKey: '',
      firstname: '',
      lastname: ''
    });
  }

  function addUser() {
    if (!validateForm()) return;

    callUserCreation({
      variables: {
        publicKey,
        firstname,
        lastname,
        isAdmin: false
      }
    })
    .then(() => {
      notify.success(`User ${firstname} ${lastname} created successfully`);
      resetForm();
    })
    .catch(e => notify.error(e));
  }

  function confirmRemoveUser(publicKey: string, name: string) {
    openConfirmation(
      "Delete User",
      `Are you sure you want to delete user ${name}?`,
      "Delete",
      "Cancel",
      () => removeUser(publicKey)
    );
  }

  function removeUser(publicKey: string) {
    callUserDeletion({
      variables: { publicKey }
    })
    .then(() => {
      notify.success("User deleted successfully");
    })
    .catch(e => notify.error(e));
  }

  function toggleUserAdmin(publicKey: string, isAdmin: boolean, name: string) {
    updateUserAdmin({
      variables: { publicKey, isAdmin }
    })
    .then(() => {
      notify.success(`${name} is ${isAdmin ? 'now' : 'no longer'} an admin`);
    })
    .catch(e => notify.error(e));
  }

  const [showModal, hideModal] = useModal(() => (
    <Dialog open={true} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonAddIcon color="primary" />
          <Typography variant="h6">Create New User</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box display="flex" flexDirection="column" gap={3} mt={1}>
          <TextField 
            label="Public Key"
            size="small" 
            fullWidth 
            autoFocus 
            value={publicKey} 
            onChange={(e) => setPublicKey(e.target.value)}
            error={!!formErrors.publicKey}
            helperText={formErrors.publicKey}
            required
          />
          <TextField 
            label="First Name"
            size="small" 
            fullWidth 
            value={firstname} 
            onChange={(e) => setFirstname(e.target.value)}
            error={!!formErrors.firstname}
            helperText={formErrors.firstname}
            required
          />
          <TextField 
            label="Last Name"
            size="small" 
            fullWidth 
            value={lastname} 
            onChange={(e) => setLastname(e.target.value)}
            error={!!formErrors.lastname}
            helperText={formErrors.lastname}
            required
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
          onClick={() => { 
            if (validateForm()) {
              addUser(); 
              hideModal(); 
            }
          }} 
          variant="contained"
          disabled={isCreating}
          startIcon={<PersonAddIcon />}
        >
          Create User
        </Button>
      </DialogActions>
    </Dialog>
  ), [publicKey, firstname, lastname, formErrors, isCreating]);

  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="500" color="primary">
            Users
          </Typography>
          <Button 
            variant="contained" 
            onClick={showModal}
            startIcon={<PersonAddIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 2
            }}
          >
            New User
          </Button>
        </Box>
        <Divider />
      </Box>

      {loading || !data ? (
        <Box mt={4}>
          <Skeleton height={60} />
          <Skeleton count={5} height={50} />
        </Box>
      ) : (
        data.getAllUsers.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            py={8}
            textAlign="center"
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first user to get started
            </Typography>
          </Box>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
            <TableOfUsers 
              users={data.getAllUsers} 
              onDelete={confirmRemoveUser} 
              onToggleAdmin={toggleUserAdmin}
            />
          </Paper>
        )
      )}
    </Container>
  );
}

function TableOfUsers({ users, onDelete, onToggleAdmin }: { 
  users: UserSummary[], 
  onDelete: (pk: string, name: string) => void,
  onToggleAdmin?: (pk: string, isAdmin: boolean, name: string) => void 
}) {
  const auth = useAuthenticationContext();
  const currentUser = auth.getAuthenticatedUser();
  const isCurrentUserAdmin = currentUser.isAdmin;

  return GenericTableComponent({
    data: users,
    extractor(row: UserSummary, index: number): { head: string; value: React.ReactNode }[] {
      return [
        { head: "Public Key", value: (
          <Typography 
            variant="body2" 
            sx={{ 
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {row.publicKey}
          </Typography>
        )},
        { head: "Name", value: (
          <Typography variant="body2" fontWeight="500">
            {`${row.firstname} ${row.lastname}`}
          </Typography>
        )},
        { head: "Role", value: (
          <Box display="flex" alignItems="center" gap={1}>
            {row.isAdmin && (
              <Chip 
                label="Admin" 
                size="small" 
                color="primary" 
                sx={{ borderRadius: 1 }}
              />
            )}
            {isCurrentUserAdmin && onToggleAdmin && (
              <Tooltip title={row.isAdmin ? "Remove admin privileges" : "Make admin"}>
                <Switch
                  size="small"
                  checked={row.isAdmin}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleAdmin(row.publicKey, e.target.checked, `${row.firstname} ${row.lastname}`);
                  }}
                  disabled={row.publicKey === currentUser.publicKey} // Can't change own admin status
                />
              </Tooltip>
            )}
          </Box>
        )},
        {
          head: '',
          value: (
            <Tooltip title="Delete user">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(row.publicKey, `${row.firstname} ${row.lastname}`);
                }}
                size="small"
                color="error"
                disabled={row.publicKey === currentUser.publicKey} // Can't delete yourself
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
      ];
    },
  });
}
