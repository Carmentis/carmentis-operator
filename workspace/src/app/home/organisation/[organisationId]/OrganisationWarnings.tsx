import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import WarningCard from '@/components/WarningCard';
import { useOrganisation } from '@/contexts/organisation-store.context';
import { useGetOrganisationChainStatusQuery } from '@/generated/graphql';
import { useCustomRouter } from '@/contexts/application-navigation.context';

/**
 * OrganisationWarnings component displays warnings based on the organization's status.
 * It shows warnings for:
 * 1. Token account (an account is required to publish)
 * 2. Organization publication status on blockchain (required to claim nodes and publish applications)
 * 3. Organization edition status (website, country code, and city are required)
 */
export default function OrganisationWarnings() {
  const organisation = useOrganisation();
  const router = useCustomRouter();
  const { data, loading } = useGetOrganisationChainStatusQuery({
    variables: {
      organisationId: organisation.id,
    },
  });

  if (loading || !data) {
    return null;
  }

  const { hasTokenAccount, isPublishedOnChain, hasEditedOrganization } = data.organisation.chainStatus;
  
  // Check if organization details are complete
  const isWebsiteEmpty = !organisation.website;
  const isCountryCodeEmpty = !organisation.countryCode;
  const isCityEmpty = !organisation.city;
  const hasIncompleteDetails = isWebsiteEmpty || isCountryCodeEmpty || isCityEmpty;

  // If all conditions are met, don't show any warnings
  if (hasTokenAccount && isPublishedOnChain && !hasIncompleteDetails) {
    return null;
  }

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {!hasTokenAccount && (
        <WarningCard
          title="Token Account Required"
          message="Your organization needs a token account to publish applications and interact with the blockchain."
          severity="warning"
        />
      )}

      {!isPublishedOnChain && (
        <WarningCard
          title="Organization Not Published"
          message="Your organization is not published on the blockchain. Publishing is required to claim nodes and publish applications."
          severity="warning"
        />
      )}

      {hasIncompleteDetails && (
        <WarningCard
          title="Organization Details Incomplete"
          message={`Please complete your organization details. ${isWebsiteEmpty ? 'Website, ' : ''}${isCountryCodeEmpty ? 'Country code, ' : ''}${isCityEmpty ? 'City' : ''} ${hasIncompleteDetails ? (isWebsiteEmpty || isCountryCodeEmpty || isCityEmpty ? 'are' : 'is') : ''} required.`}
          severity="warning"
        />
      )}
    </Stack>
  );
}