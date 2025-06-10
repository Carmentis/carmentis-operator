'use client';

import * as sdk from '@cmts-dev/carmentis-sdk/client';
import OrganisationAccountBalance from '@/components/organisation-account-balance.component';
import { useOrganisation, useOrganisationContext } from '@/contexts/organisation-store.context';
import { 
  Box, 
  Button, 
  Container, 
  Divider, 
  Paper, 
  TextField, 
  Typography 
} from '@mui/material';
import FullSpaceSpinner from '@/components/full-page-spinner.component';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import GenericTableComponent from '@/components/generic-table.component';
import { useGetTransactionsOfOrganisationQuery } from '@/generated/graphql';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import KeyIcon from '@mui/icons-material/Key';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export default function TransactionsHistoryPage() {
  const organisation = useOrganisation();
  const [limit, setLimit] = useState(10);
  const { data, loading: isLoading, error } = useGetTransactionsOfOrganisationQuery({
    variables: {
      organisationId: organisation.id,
      limit
    }
  });

  if (isLoading || !data) {
    return (
      <Container maxWidth={false} disableGutters>
        <Box mb={4}>
          <Skeleton height={40} width={300} />
          <Box mt={4}>
            <Skeleton height={100} />
            <Skeleton height={60} />
            <Skeleton count={5} height={50} />
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} disableGutters>
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <ReceiptLongIcon color="primary" fontSize="large" />
            <Typography variant="h4" fontWeight="500" color="primary">
              Transactions
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      {data.organisation.hasTokenAccount ? (
        <TransactionsContent 
          transactions={data.organisation.transactions} 
          limit={limit} 
          setLimit={setLimit} 
        />
      ) : (
        <NoAccountFound />
      )}
    </Container>
  );
}

function TransactionsContent({ transactions, limit, setLimit }) {
  if (!transactions || transactions.length === 0) {
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
          No transactions found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your account doesn't have any transactions yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <OrganisationBalance />

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #eaeaea' }}>
        <GenericTableComponent
          data={transactions}
          extractor={(v, i) => [
            { 
              head: 'Date', 
              value: <Typography variant="body2">{new Date(v.timestamp).toLocaleString()}</Typography> 
            },
            { 
              head: 'Type', 
              value: <Typography variant="body2" fontWeight="500">{v.name}</Typography> 
            },
            { 
              head: 'Linked account', 
              value: (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    maxWidth: 200, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace'
                  }}
                >
                  {v.linkedAccount}
                </Typography>
              )
            },
            { 
              head: 'Amount', 
              value: (
                <Typography 
                  variant="body2" 
                  fontWeight="500"
                  sx={{ 
                    color: v.amount >= 0 ? 'success.main' : 'error.main'
                  }}
                >
                  {`${v.amount / sdk.constants.ECO.TOKEN} CMTS`}
                </Typography>
              )
            }
          ]}
        />
      </Paper>

      <Box display="flex" justifyContent="center" mt={2}>
        <Button 
          variant="outlined" 
          onClick={() => setLimit(l => l * 2)}
          startIcon={<MoreHorizIcon />}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Load more transactions
        </Button>
      </Box>
    </Box>
  );
}

function NoAccountFound() {
  const organisation = useOrganisationContext();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 4, 
        borderRadius: 2, 
        border: '1px solid #eaeaea'
      }}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        <Typography variant="h6" color="primary" gutterBottom>
          No Token Account Found
        </Typography>

        <Typography variant="body1">
          We have not found a token account associated with your organisation.
          Go to the Carmentis exchange page to create your token account and add tokens.
        </Typography>

        <Typography variant="body1">
          During the token account creation and token delivery, a public key will be required.
          Please use the public key shown below:
        </Typography>

        <Box mt={2}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <KeyIcon color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight="500">
              Public key of your organisation
            </Typography>
          </Box>

          <TextField 
            size="small" 
            fullWidth 
            value={organisation.organisation.publicSignatureKey} 
            disabled={true}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace' }
            }}
          />
        </Box>
      </Box>
    </Paper>
  );
}

function OrganisationBalance() {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        border: '1px solid #eaeaea'
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <AccountBalanceIcon color="primary" />
        <Box>
          <Typography variant="subtitle1" fontWeight="500" gutterBottom>
            Current Balance
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            <OrganisationAccountBalance />
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
