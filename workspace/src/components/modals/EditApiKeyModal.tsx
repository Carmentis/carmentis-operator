import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiKeyDescriptionFragment } from '@/generated/graphql';

// Type for the API key edit form
export type EditApiKeyFormData = {
  name: string;
  activeUntil: string;
  isActive: boolean;
};

// Edit API key modal component props
interface EditApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  apiKey: ApiKeyDescriptionFragment;
  onSave: (data: EditApiKeyFormData) => void;
  isLoading: boolean;
}

export default function EditApiKeyModal({ open, onClose, apiKey, onSave, isLoading }: EditApiKeyModalProps) {
  const editFormSchema = z.object({
    name: z.string().min(1, "The name is required"),
    activeUntil: z.string().min(1, "The date is required"),
    isActive: z.boolean()
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<EditApiKeyFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: apiKey?.name || '',
      activeUntil: apiKey?.activeUntil ? new Date(apiKey.activeUntil).toISOString().split('T')[0] : '',
      isActive: apiKey?.isActive
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit API Key</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Name"
            fullWidth
            size="small"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="Valid until"
            type="date"
            fullWidth
            size="small"
            error={!!errors.activeUntil}
            helperText={errors.activeUntil?.message}
            {...register('activeUntil')}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={watch('isActive')}
                onChange={(e) => setValue('isActive', e.target.checked)}
                color="primary"
              />
            }
            label="Active"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit(onSave)}
          disabled={isLoading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}