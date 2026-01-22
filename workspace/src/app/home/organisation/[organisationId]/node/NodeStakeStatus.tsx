import { Box, Typography, Chip, CircularProgress, Button, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { CMTSToken, NodeStakingLock } from '@cmts-dev/carmentis-sdk/client';
import { useState } from 'react';
import { NodeStatusResult } from '@/hooks/useNodeStatus';

interface NodeStakeStatusProps {
	nodeStatus: NodeStatusResult | undefined;
	loading: boolean;
	error: Error | undefined;
	onCancelStake?: (amount: string) => void;
	cancelling?: boolean;
	onStake?: (amount: string) => void;
	staking?: boolean;
}

export function NodeStakeStatus({
	nodeStatus,
	loading,
	error,
	onCancelStake,
	cancelling,
	onStake,
	staking,
}: NodeStakeStatusProps) {
	const [stakeAmount, setStakeAmount] = useState('');
	const [unstakeAmount, setUnstakeAmount] = useState('');
	const [showStakeConfirmation, setShowStakeConfirmation] = useState(false);
	const [showUnstakeConfirmation, setShowUnstakeConfirmation] = useState(false);

	if (loading) {
		return (
			<Box display="flex" alignItems="center" gap={1}>
				<Typography variant="body2" color="textSecondary">Loading stake status...</Typography>
				<CircularProgress size={16} />
			</Box>
		);
	}

	if (error) {
		/*
		return (
			<Box>
				<Typography variant="body2" color="error">Error loading stake: {error.message}</Typography>
			</Box>
		);

		 */
		console.error(error)
	}

	const handleStakeClick = () => {
		if (stakeAmount) {
			setShowStakeConfirmation(true);
		}
	};

	const handleStakeConfirm = () => {
		if (onStake) {
			onStake(stakeAmount);
			setStakeAmount('');
		}
		setShowStakeConfirmation(false);
	};

	const renderStakeForm = () => {
		if (!onStake) return null;

		return (
			<>
				<Box display="flex" flexDirection="column" gap={1} flex={1}>
					<Typography variant="subtitle2" color="textPrimary">Stake Node</Typography>
					<Typography variant="caption" color="textSecondary">
						Min: 1,000,000 CMTS | Max: 10,000,000 CMTS
					</Typography>
					<TextField
						label="Amount"
						type="text"
						size="small"
						fullWidth
						value={stakeAmount}
						onChange={(e) => setStakeAmount(e.target.value)}
						placeholder="e.g., 1000000"
						disabled={staking}
					/>
					<Button
						variant="contained"
						size="small"
						onClick={handleStakeClick}
						disabled={!stakeAmount || staking}
						sx={{ width: 'fit-content' }}
					>
						{staking ? 'Staking...' : 'Stake Node'}
					</Button>
				</Box>

				<Dialog
					open={showStakeConfirmation}
					onClose={() => setShowStakeConfirmation(false)}
				>
					<DialogTitle>Confirm Staking Operation</DialogTitle>
					<DialogContent>
						<DialogContentText>
							<strong>Warning: This operation cannot be cancelled once published.</strong>
							<br /><br />
							You are about to stake <strong>{stakeAmount} CMTS</strong> to this node.
							<br /><br />
							Please note:
							<ul style={{ marginTop: '8px', marginBottom: '0' }}>
								<li>Once published, this operation cannot be undone or cancelled</li>
								<li>The staked amount will be locked according to the network rules</li>
							</ul>
							<br />
							Are you sure you want to proceed?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setShowStakeConfirmation(false)} color="inherit">
							Cancel
						</Button>
						<Button onClick={handleStakeConfirm} variant="contained" color="primary" autoFocus>
							Confirm Stake
						</Button>
					</DialogActions>
				</Dialog>
			</>
		);
	};

	const handleUnstakeClick = () => {
		if (unstakeAmount) {
			setShowUnstakeConfirmation(true);
		}
	};

	const handleUnstakeConfirm = () => {
		if (onCancelStake) {
			onCancelStake(unstakeAmount);
			setUnstakeAmount('');
		}
		setShowUnstakeConfirmation(false);
	};

	const renderUnstakeForm = () => {
		if (!onCancelStake) return null;

		return (
			<>
				<Box display="flex" flexDirection="column" gap={1} flex={1}>
					<Typography variant="subtitle2" color="textPrimary">Unstake Node</Typography>
					<Typography variant="caption" color="textSecondary">
						Enter the amount to unstake
					</Typography>
					<TextField
						label="Amount"
						type="text"
						size="small"
						fullWidth
						value={unstakeAmount}
						onChange={(e) => setUnstakeAmount(e.target.value)}
						placeholder="e.g., 1000000"
						disabled={cancelling}
					/>
					<Button
						variant="outlined"
						size="small"
						color="warning"
						onClick={handleUnstakeClick}
						disabled={!unstakeAmount || cancelling}
						sx={{ width: 'fit-content' }}
					>
						{cancelling ? 'Cancelling...' : 'Cancel Stake'}
					</Button>
				</Box>

				<Dialog
					open={showUnstakeConfirmation}
					onClose={() => setShowUnstakeConfirmation(false)}
				>
					<DialogTitle>Confirm Unstaking Operation</DialogTitle>
					<DialogContent>
						<DialogContentText>
							<strong>Warning: This operation cannot be undone once registered.</strong>
							<br /><br />
							You are about to unstake <strong>{unstakeAmount} CMTS</strong> from this node.
							<br /><br />
							<strong>Important:</strong>
							<ul style={{ marginTop: '8px', marginBottom: '0' }}>
								<li><strong>Only one unstaking operation can be performed at a time</strong></li>
								<li>Once registered, this operation cannot be undone or cancelled</li>
								<li>The unstaked amount will follow the network's unlock schedule</li>
							</ul>
							<br />
							Are you absolutely sure you want to proceed?
						</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setShowUnstakeConfirmation(false)} color="inherit">
							Cancel
						</Button>
						<Button onClick={handleUnstakeConfirm} variant="contained" color="warning" autoFocus>
							Confirm Unstake
						</Button>
					</DialogActions>
				</Dialog>
			</>
		);
	};


	if (!nodeStatus?.isClaimed || !nodeStatus.stake) {
		return (
			<Box display="flex" gap={3}>
				<Box display="flex" flexDirection="column" gap={1.5} flex={1}>
					<Box display="flex" alignItems="center" gap={1}>
						<Typography variant="subtitle2" color="textPrimary">Stake Information</Typography>
						<Chip label="No Stake" color="warning" size="small" />
					</Box>
				</Box>

				{renderStakeForm()}
			</Box>
		);
	}

	if (!nodeStatus.isClaimed) {
		return (
			<Box display="flex" gap={3}>
				<Box display="flex" flexDirection="column" gap={1.5} flex={1}>
					<Box display="flex" alignItems="center" gap={1}>
						<Typography variant="subtitle2" color="textPrimary">Stake Information</Typography>
						<Chip label="Not Claimed" color="warning" size="small" />
					</Box>
				</Box>
			</Box>
		)
	}

	/*
	const parameters = stakeLock.parameters;
	const lockedAmount = CMTSToken.createAtomic(stakeLock.lockedAmountInAtomics).toString()
	const plannedSlashingAmount = CMTSToken.createAtomic(parameters.plannedSlashingAmountInAtomics).toString();
	const isSlashed = parameters.slashed;
	const plannedUnlockAmount = CMTSToken.createAtomic(parameters.plannedUnlockAmountInAtomics).toString();
	const plannedUnlockTimestamp = CMTSToken.createAtomic(parameters.plannedUnlockTimestamp).toString();
	const unlockDate = plannedUnlockTimestamp !== '0'
		? new Date(plannedUnlockTimestamp).toLocaleString()
		: 'N/A';

	 */

	const stake = nodeStatus.stake;
	return (
		<Box display="flex" gap={3}>
			{/* Stake Information */}
			<Box display="flex" flexDirection="column" gap={1.5} flex={1}>
				<Box display="flex" alignItems="center" gap={1}>
					<Typography variant="subtitle2" color="textPrimary">Stake Information</Typography>
					<Chip label="Staked" color="success" size="small" />
					{stake.isSlashed && <Chip label="Slashed" color="error" size="small" />}
				</Box>

				<Box display="flex" flexDirection="column" gap={0.5}>
					<Typography variant="body2" color="textSecondary">
						Amount: <strong>{stake.lockedAmount}</strong>
					</Typography>

					{stake.isSlashed && (
						<Typography variant="body2" color="error">
							Planned Slashing Amount: <strong>{stake.plannedSlashingAmount}</strong>
						</Typography>
					)}

					<Typography variant="body2" color="textSecondary">
						Planned Unlock Amount: <strong>{stake.plannedUnlockAmount}</strong>
					</Typography>
					<Typography variant="body2" color="textSecondary">
						Planned Unlock Timestamp: <strong>{stake.unlockDate}</strong>
					</Typography>
				</Box>
			</Box>

			{/* Stake Form */}
			{renderStakeForm()}

			{/* Unstake Form */}
			{renderUnstakeForm()}
		</Box>
	);
}
