import { Button, IconButton, Typography } from '@material-tailwind/react';
import { useAtomValue } from 'jotai';
import { oracleServicesAtom } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atoms';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	TextField,
} from '@mui/material';
import { OracleDataService } from '@/entities/oracle.entity';
import { useServiceEdition } from '@/app/home/organisation/[organisationId]/oracle/[oracleId]/atom-logic';
import { PropsWithChildren, useEffect, useState } from 'react';
import {
	FieldEditionComponent,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/field-edition-component';
import { AppDataField } from '@/entities/application.entity';

export default function ServicesPanel() {
	const services = useAtomValue(oracleServicesAtom);
	const edition = useServiceEdition();

	return <ServicesView
		services={services}
		{...edition}
	/>
}


type ServicesViewProps = {
	services: OracleDataService[],
	add: (name: string) => void;
	edit: (serviceId: string, service: OracleDataService) => void;
	remove: (serviceId: string) => void;
	addInput: (serviceId: string, fieldName: string) => void;
	addOutput: (serviceId: string, fieldName: string) => void;
	editInput: (serviceId: string, fieldId: string, field: AppDataField) => void;
	editOutput: (serviceId: string, fieldId: string, field: AppDataField) => void;
	removeInput: (serviceId: string, fieldId: string) => void;
	removeOutput: (serviceId: string, fieldId: string) => void;
}
function ServicesView(input: ServicesViewProps ) {
	const [name, setName] = useState('');

	const content = input.services.map(
		s => <SingleServiceView key={s.id} service={s} {...input}/>
	)

	return <>
		<Box display={"flex"} mb={2} gap={2}>
			<TextField size={"small"} label={"Service name"} value={name} onChange={(e) => setName(e.target.value)} />
			<Button onClick={() => input.add(name)}>Add service</Button>
		</Box>
		{content}
	</>
}


type SingleServiceViewProps = {
	service: OracleDataService
} & ServicesViewProps
function SingleServiceView(
	input: SingleServiceViewProps
) {
	const service = input.service;
	const [name, setName] = useState(service.name);

	useEffect(() => {
		input.edit(service.id, {
			...service,
			name
		})
	}, [name]);

	const inputsFields = service.request.map(
		field => <FieldEditionComponent
			disableMask={true}
			defaultIsPublic={true}
			key={field.id}
			field={field}
			onUpdateField={f => input.editInput(service.id, f.id, f)}
			onRemoveField={() => input.removeInput(service.id, field.id)}/>
	)

	const outputsFields = service.answer.map(
		field => <FieldEditionComponent
			disableMask={true}
			key={field.id}
			field={field}
			onUpdateField={f => input.editOutput(service.id, f.id, f)}
			onRemoveField={() => input.removeOutput(service.id, field.id)}/>
	)



	return <Accordion>
		<AccordionSummary>
			Service {service.name}
		</AccordionSummary>
		<AccordionDetails>
			<Box display={"flex"} flexDirection={"column"} gap={2}>
				<Box display={"flex"} justifyContent={"space-between"}>

					<TextField size={"small"} label={"Service name"} value={name} onChange={(e) => setName(e.target.value)} />
					<IconButton variant={'filled'} className={"bg-white"} size={'sm'} onClick={() => input.remove(service.id)}>
						<i className="bi bi-trash text-black" />
					</IconButton>
				</Box>

				<div>
					<Typography variant={"h6"}>Service Inputs</Typography>
					<ServiceFieldsTable addField={fieldName => input.addInput(service.id, fieldName)}>
						{inputsFields}
					</ServiceFieldsTable>
				</div>

				<div>
					<Typography variant={"h6"}>Service Outputs</Typography>
					<ServiceFieldsTable addField={fieldName => input.addOutput(service.id, fieldName)}>
						{outputsFields}
					</ServiceFieldsTable>
				</div>
			</Box>
		</AccordionDetails>
	</Accordion>
}


function ServiceFieldsTable({children, addField}: PropsWithChildren<{addField: (fieldName: string) => void}>) {
	const [fieldName, setFieldName] = useState('');

	function addFieldInternal() {
		addField(fieldName)
		setFieldName('')
	}

	return <Table id="fields" className={'w-full'}>
		<TableHead>
			<TableRow>
				<TableCell>Name</TableCell>
				<TableCell>Kind</TableCell>
				<TableCell>Type</TableCell>
				<TableCell>Array</TableCell>
				<TableCell>Required</TableCell>
				<TableCell>Public</TableCell>
				<TableCell>Hashable</TableCell>
				<TableCell></TableCell>
			</TableRow>
		</TableHead>
		<TableBody className={'w-full'}>
			{children}
			<TableRow>
				<TableCell colSpan={8}>
					<div className={"w-[500px] flex gap-2"}>
						<TextField size={'small'} value={fieldName} onChange={e => setFieldName(e.target.value)}
								   className={""}/>
						<Button size={'md'} className={"w-[150px]"} onClick={addFieldInternal}>Add field</Button>
					</div>
				</TableCell>
			</TableRow>
		</TableBody>

	</Table>
}

