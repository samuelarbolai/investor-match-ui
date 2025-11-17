import { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { CampaignStatus } from '../../types/campaign.types';

interface CampaignActionBarProps {
  disabled?: boolean;
  selectedCount: number;
  onAddToCampaign: () => Promise<void>;
  onRemoveFromCampaign: () => Promise<void>;
  onChangeStage: (stage: CampaignStatus) => Promise<void>;
  stageOptions: CampaignStatus[];
}

export const CampaignActionBar = ({
  disabled = false,
  selectedCount,
  onAddToCampaign,
  onRemoveFromCampaign,
  onChangeStage,
  stageOptions,
}: CampaignActionBarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasSelection = selectedCount > 0;

  const handleAction = async (action: () => Promise<void>) => {
    try {
      setIsProcessing(true);
      await action();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStageMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleStageSelect = async (stage: CampaignStatus) => {
    setAnchorEl(null);
    await handleAction(() => onChangeStage(stage));
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="body2" color="text.secondary">
          {hasSelection
            ? `${selectedCount} contact${selectedCount > 1 ? 's' : ''} selected`
            : 'Select contacts to enable bulk actions'}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant="outlined"
            disabled={!hasSelection || disabled || isProcessing}
            onClick={() => handleAction(onAddToCampaign)}
          >
            Add to Campaign
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={!hasSelection || disabled || isProcessing}
            onClick={() => handleAction(onRemoveFromCampaign)}
          >
            Remove from Campaign
          </Button>

          <Button
            variant="contained"
            endIcon={<ArrowDropDownIcon />}
            disabled={!hasSelection || disabled || isProcessing}
            onClick={handleStageMenuOpen}
          >
            Change Stage
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {stageOptions.map((stage) => (
              <MenuItem key={stage} onClick={() => handleStageSelect(stage)}>
                {stage.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>
    </Box>
  );
};
