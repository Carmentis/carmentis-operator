'use client';

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
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Skeleton from 'react-loading-skeleton';
import React, { useEffect, useState } from 'react';
import { useToast } from '@/app/layout';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useOrganisationMutationContext } from '@/contexts/organisation-mutation.context';
import WelcomeCards from '@/components/welcome-cards.component';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import AvatarOrganisation from '@/components/avatar-organisation';
import {
  useChangeOrganisationKeyMutation, 
  GetOrganisationQuery,
  useGetOrganisationStatisticsQuery,
  usePublishOrganisationMutation,
  useUpdateOrganisationMutation,
} from '@/generated/graphql';
import { useModal } from 'react-modal-hook';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as sdk from '@cmts-dev/carmentis-sdk/client';
import SaveIcon from '@mui/icons-material/Save';
import PublishIcon from '@mui/icons-material/Publish';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

/**
 * Component to display organisation status chips
 */
function OrganisationStatus({ organisation }) {
  if (!organisation) return null;

  return (
    <Box display="flex" gap={1}>
      {organisation.isDraft && (
        <Chip
          label="Draft"
          variant="outlined"
          color="primary"
          size="small"
        />
      )}
      {organisation.published && (
        <Chip
          label={`Published ${new Date(organisation.publishedAt).toLocaleDateString()}`}
          color="primary"
          size="small"
          icon={<PublishIcon />}
        />
      )}
    </Box>
  );
}

/**
 * The WelcomeCards function fetches organisation statistics and displays them in a set of styled cards.
 * Each card represents key metrics such as Balance, Applications, and Users.
 */
function OverviewOrganisationWelcomeCards() {
  const organisation = useOrganisation();
  const { data: statistics, loading, error } = useGetOrganisationStatisticsQuery({
    variables: {
      id: organisation.id
    }
  });

  if (loading) return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 3,
        mb: 4
      }}
    >
      {[1, 2, 3].map(i => (
        <Skeleton key={i} height={140} />
      ))}
    </Box>
  );

  if (!statistics || error) return (
    <Typography color="error">
      {error?.message || "Failed to load statistics"}
    </Typography>
  );

  const welcomeCardData = [
    { 
      icon: 'bi-wallet2', 
      title: 'Account Balance', 
      value: <OrganisationAccountBalance /> 
    },
    { 
      icon: 'bi-app', 
      title: 'Applications', 
      value: statistics.getOrganisationStatistics.numberOfApplications.toString() 
    },
    { 
      icon: 'bi-person-badge', 
      title: 'Team Members', 
      value: statistics.getOrganisationStatistics.numberOfUsers.toString() 
    },
  ];

  return (
    <Box mb={4}>
      <Typography variant="h5" fontWeight="500" mb={3}>
        Organisation Overview
      </Typography>
      <WelcomeCards items={welcomeCardData} />
    </Box>
  );
}

function PrivateKeyModal(props: { close: () => void }) {
  const organisation = useOrganisation();
  const [publicKey, setPublicKey] = useState<string>('');
  const notify = useToast();
  const [changePrivateKey, { loading: isChanging }] = useChangeOrganisationKeyMutation({
    refetchQueries: [
      { query: GetOrganisationQuery }
    ]
  });

  const privateKeySchema = z.object({
    privateKey: z
      .string()
      .min(64, { message: 'Private key must be at least 64 characters long' })
      .max(64, { message: 'Private key must be 64 characters long' })
      .regex(/^[a-fA-F0-9]+$/, { message: 'Private key must be in hexadecimal format' }),
  });
  type FormData = z.infer<typeof privateKeySchema>;

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(privateKeySchema),
    disabled: isChanging
  });

  function handleSubmission(data: FormData) {
    changePrivateKey({
      variables: { organisationId: organisation.id, privateKey: data.privateKey },
    }).then(result => {
      const { errors } = result;
      if (errors) {
        notify.error(errors);
      } else {
        notify.success("Key pair changed successfully");
        props.close();
      }
    }).catch(notify.error);
  }

  // Update the public key when the private key is modified
  const privateKey = watch("privateKey");
  useEffect(() => {
    try {
      const sk = privateKey;
      const pk = sdk.crypto.secp256k1.publicKeyFromPrivateKey(sk);
      setPublicKey(pk);
    } catch {
      setPublicKey('');
    }
  }, [privateKey]);

  return (
    <Dialog open={true} onClose={() => props.close()} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <VpnKeyIcon color="primary" />
          <Typography variant="h6">Change Key Pair</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box component="form" display="flex" flexDirection="column" gap={3} mt={2} onSubmit={handleSubmit(handleSubmission)}>
          <Typography variant="body2" color="text.secondary">
            Provide the private signature key (in hex format) of your choice.
          </Typography>
          <TextField 
            size="small" 
            label="Private key" 
            type="password" 
            error={!!errors.privateKey} 
            helperText={errors.privateKey?.message} 
            {...register('privateKey')} 
          />
          <TextField 
            size="small" 
            label="Public key" 
            disabled={true} 
            value={publicKey} 
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={() => props.close()} 
          variant="outlined"
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit(handleSubmission)} 
          variant="contained" 
          disabled={isChanging}
          startIcon={<SaveIcon />}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Home() {
  const organisation = useOrganisation();
  const [showPrivateKeyModal, hidePrivateKeyModal] = useModal(
    () => <PrivateKeyModal close={hidePrivateKeyModal} />
  );

  function changePrivateKey() {
    showPrivateKeyModal();
  }

  if (!organisation) {
    return (
      <Container maxWidth={false} disableGutters>
        <Box py={4}>
          <Skeleton height={40} width={300} />
          <Box mt={2}>
            <Skeleton height={24} width={200} />
          </Box>
          <Box mt={4}>
            <Skeleton height={100} count={3} />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      {/* Organisation Header with Status on the right */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <AvatarOrganisation 
            organisationId={organisation.publicSignatureKey || organisation.id}
            width={56} 
            height={56} 
          />
          <Typography variant="h4" fontWeight="500" color="primary">
            {organisation.name}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <OrganisationStatus organisation={organisation} />
          <OrganisationMenu changePrivateKey={changePrivateKey} />
        </Box>
      </Box>

      {/* Public Key Display */}
      <Box mb={4} px={2}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Organisation Identity on Chain
        </Typography>
        <Typography 
          variant="body1" 
          fontFamily="monospace"
          sx={{
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: 1,
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {organisation.publicSignatureKey}
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Statistics Cards */}
      <OverviewOrganisationWelcomeCards />

      {/* Organisation Details */}
      <OrganisationEdition />
    </Container>
  );
}

type OrganisationMenuProps = {
  changePrivateKey: () => void
}

function OrganisationMenu(props: OrganisationMenuProps) {
  const organisation = useOrganisation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  function changeKey() {
    handleClose();
    props.changePrivateKey();
  }

  return (
    <div>
      <Tooltip title="Organisation options">
        <IconButton
          id="organisation-menu-button"
          aria-controls={open ? 'organisation-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="organisation-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'organisation-menu-button',
        }}
      >
        <MenuItem onClick={() => window.open(organisation.website, '_blank')}>
          <Box display="flex" alignItems="center" gap={1}>
            <OpenInNewIcon fontSize="small" />
            <Typography>Visit website</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={changeKey}>
          <Box display="flex" alignItems="center" gap={1}>
            <VpnKeyIcon fontSize="small" />
            <Typography>Change key</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </div>
  );
}

function OrganisationEdition() {
  const organisation = useOrganisation();
  const [name, setName] = useState(organisation.name);
  const [city, setCity] = useState(organisation.city);
  const [countryCode, setCountryCode] = useState(organisation.countryCode);
  const [website, setWebsite] = useState(organisation.website);
  const [isModified, setIsModified] = useState(false);
  const refreshOrganisation = useOrganisationMutationContext();
  const notify = useToast();

  const [callOrganisationUpdate, { loading: isUpdating }] = useUpdateOrganisationMutation({
    refetchQueries: ['organisation'],
  });

  const [callOrganisationPublication, { loading: isPublishing }] = usePublishOrganisationMutation({
    refetchQueries: ['organisation'],
  });

  useEffect(() => {
    if (organisation) {
      setName(organisation.name);
      setCity(organisation.city);
      setCountryCode(organisation.countryCode);
      setWebsite(organisation.website);
    }
  }, [organisation]);

  function save() {
    callOrganisationUpdate({
      variables: {
        id: organisation.id,
        name: name,
        city: city,
        countryCode,
        website
      }
    }).then(() => {
      refreshOrganisation.mutate();
      setIsModified(false);
      notify.success("Organisation updated successfully");
    }).catch(e => {
      notify.error(e);
    });
  }

  function publish() {
    callOrganisationPublication({
      variables: { organisationId: organisation.id }
    })
      .then(() => notify.success("Organisation published successfully"))
      .catch(notify.error);
  }

  if (!organisation) return <Skeleton count={1} height={200} />;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #eaeaea' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="500">
          Organisation Details
        </Typography>
        <Box>
          {isModified && (
            <Button
              variant="contained"
              onClick={save}
              disabled={isUpdating}
              startIcon={<SaveIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Save Changes
            </Button>
          )}
          {!isModified && organisation.isDraft && (
            <Button
              variant="contained"
              onClick={publish}
              disabled={isPublishing}
              startIcon={<PublishIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Publish
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            value={name}
            label="Name"
            onChange={e => {
              setIsModified(true);
              setName(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            value={website}
            label="Website"
            onChange={e => {
              setIsModified(true);
              setWebsite(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            value={countryCode}
            label="Country code"
            onChange={e => {
              setIsModified(true);
              setCountryCode(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            value={city}
            label="City"
            onChange={e => {
              setIsModified(true);
              setCity(e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            value={organisation.virtualBlockchainId || ''}
            label="Virtual blockchain ID"
            disabled
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
