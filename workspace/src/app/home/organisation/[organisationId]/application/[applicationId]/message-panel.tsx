import { Button, IconButton } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { AppDataMessage } from '@/entities/application.entity';
import { useMessageEdition } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atom-logic';
import { useAtomValue } from 'jotai';
import { applicationMessagesAtom } from '@/app/home/organisation/[organisationId]/application/[applicationId]/atoms';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';

export default function MessagesPanel() {
	const messages = useAtomValue(applicationMessagesAtom);
	const edition = useMessageEdition();

	return <MessagesView
		messages={messages}
		addMessage={edition.add}
		editMessage={edition.edit}
		removeMessage={edition.remove}
	/>
}


type MessagesViewProps = {
	messages: AppDataMessage[]
	addMessage: (messageName: string) => void,
	editMessage: (messageId: string, messgae: AppDataMessage) => void,
	removeMessage: (messageId: string) => void,
}
function MessagesView( input: MessagesViewProps ) {
	const [name, setName] = useState('');

	return <>

		<Table  className={'w-full'}>
			<TableHead>
				<TableRow>
					<TableCell>Message Name</TableCell>
					<TableCell>Message Content</TableCell>
					<TableCell></TableCell>
				</TableRow>
			</TableHead>
			<TableBody className={'w-full'}>
				{
					input.messages.map((message, index) => {
						return <SingleMessageView
							key={message.id}
							message={message}
							{...input}
						/>
					})
				}
				<TableRow>
					<TableCell colSpan={4}>
						<div className={"flex flew-row gap-2"}>
							<TextField value={name} size={"small"} onChange={e => setName(e.target.value)}></TextField>
							<Button onClick={() => input.addMessage(name)}>Add Mask</Button>
						</div>
					</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	</>;
}


type SingleMessageViewProps = { message: AppDataMessage } & MessagesViewProps
function SingleMessageView(input: SingleMessageViewProps) {
	const [messageName, setMessageName] = useState(input.message.name);
	const [messageContent, setMessageContent] = useState(input.message.content);

	useEffect(() => {
		input.editMessage(input.message.id, {
			...input.message,
			name: messageName,
			content: messageContent,
		})
	}, [messageName, messageContent]);


	return <TableRow>
		<TableCell valign={"top"} sx={{height: '100%'}}>
			<div
				className={"flex items-start justify-start w-full h-full align-top"}>
				<TextField size={"small"} value={messageName} fullWidth={true} onChange={e => setMessageName(e.target.value)} />
			</div>
		</TableCell>
		<TableCell>
			<TextField size={"small"} value={messageContent} onChange={e => setMessageContent(e.target.value)} multiline={true} rows={4} fullWidth={true}/>
		</TableCell>
		<TableCell>
			<IconButton onClick={() => input.removeMessage(input.message.id)}>
				<i className={"bi bi-trash"}/>
			</IconButton>
		</TableCell>
	</TableRow>
}