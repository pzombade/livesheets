import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import ErrorIcon from '@material-ui/icons/ErrorOutline';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import JSG from '@cedalo/jsg-ui';
import store from '../../store';
import { graphManager } from '../../GraphManager';
import gatewayClient from '../../helper/GatewayClient';


const getMachineId = () => {
	const machine = store.getState().monitor.machine;
	return machine && machine.id;
};
const getSheetId = () => {
	const sheetView = graphManager.getActiveSheetView();
	const streamsheet = sheetView.getItem();
	const streamsheetContainer = streamsheet && streamsheet.getStreamSheetContainer();
	return streamsheetContainer && streamsheetContainer instanceof JSG.StreamSheetContainer
		? streamsheetContainer.getStreamSheetContainerAttributes().getSheetId().getValue()
		: undefined;
};
const getCellReference = () => {
	const sheetView = graphManager.getActiveSheetView();
	const selection = sheetView.getOwnSelection();
	const selectedRange = selection && selection.getRanges()[0];
	if (selectedRange) {
		const range = selectedRange.copy();
		range.shiftToSheet();
		return range.toString();
	}
	return undefined;
};
const handleResponse = ({ machineserver } = {}) => {
	if (!machineserver || machineserver.error) {
		throw new Error('Failed to fetch cell payload data!');
	}
	return JSON.parse(machineserver.rawvalue);
};
const fetchPayload = async () =>  {
	const machineId = getMachineId();
	const streamsheetId = getSheetId();
	const reference = getCellReference();
	if (machineId && streamsheetId && reference) {
		const response = await gatewayClient.getCellRawValue(machineId, streamsheetId, reference);
		return handleResponse(response);
	}
	throw new Error(
		`Required data missing! machineId: ${machineId}, streamsheetId: ${streamsheetId}, reference: ${reference}`
	);
};

const prettyPrint = (json) => (
	<div>
		<pre>{JSON.stringify(json, null, 2)}</pre>
	</div>
);

const showError = (error) => (
	<div
		style={{
			width: '100%',
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		}}
	>
		<ErrorIcon style={{ color: 'red', width: '36px', height: '36px', paddingRight: '5px' }} />
		{error}
	</div>
);

const payloadContent = (payload) => (payload.error ? showError(payload.error) : prettyPrint(payload.json));

const getContent = (payload) =>
	payload ? (
		// <DialogContentText style={{ maxHeight: '400px' }}>{payloadContent(payload)}</DialogContentText>
		<div style={{ maxHeight: '400px' }}>{payloadContent(payload)}</div>
	) : (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<CircularProgress />
		</div>
	);


const CellPayloadDialog = (props) => {
	const { open, onClose } = props;
	const [ payload, setPayload ] = useState(null);

	useEffect(() => {
		const getPayload = async () => {
			try {
				const pl = await fetchPayload();
				setPayload({ json: pl });
			} catch(error) {
				setPayload({ error: error.message });
			}
		};
		if (open) {
			getPayload();
			setPayload(null);
		}
	}, [open]);

	return (
		<Dialog fullWidth mode="indeterminate" size={50} open={open}>
			<DialogContent>{getContent(payload)}</DialogContent>
			<DialogActions style={{ justifyContent: 'center' }}>
				<Button color="primary" onClick={onClose}>
					<FormattedMessage id="OK" defaultMessage="Ok" />
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CellPayloadDialog;