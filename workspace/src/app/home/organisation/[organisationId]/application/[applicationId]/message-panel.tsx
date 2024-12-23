import InputButtonForm from '@/components/form/input-button.form';
import {
	 useApplicationMessages,
	useSetEditionStatus, useUpdateApplication,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/page';
import {
	AppDataMask, AppDataMessage,
} from '@/app/home/organisation/[organisationId]/application/[applicationId]/application-editor';
import {
	Card,
	CardBody,
	CardHeader,
	Checkbox,
	IconButton,
	Input,
	Option, Radio,
	Select,
	Typography,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';

function MessageEditionCard(
	input: {
		message: AppDataMessage
	}
) {
	const message = input.message;
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();



	const [name, setName] = useState<string>(message.name);
	const [content, setContent] = useState<string>(message.message);

	useEffect(() => {
		setApplication((application, editor) => {
			editor.updateMessage(message.name, {
				name: name,
				message: content,
			})
		})
	}, [name, content]);

	function removeMessage() {
		setApplication((application, editor) => {
			editor.removeMessageByName(message.name)
		})
		setIsModified(true);
	}

	function updateName( name: string ) {
		setIsModified(true);
		setName(name);
	}

	function updateContent( content: string ) {
		setIsModified(true);
		setContent(content);
	}


	return <Card className={' w-72 shadow-lg'}>
		<CardHeader floated={false}
					shadow={false}
					color="transparent"
					className="m-0 rounded-none rounded-t-md bg-gray-800 p-2 flex justify-between items-center">

			<Typography variant={'h6'} color={'white'}>{message.name}</Typography>

			{/* Icons */}
			<div id="icons" className={'flex gap-2'}>
				<IconButton variant={'filled'} color={'white'} size={'sm'}
							onClick={() => removeMessage()}>
					<i className="bi bi-trash" />
				</IconButton>
			</div>
		</CardHeader>
		<CardBody className={'flex flex-col space-y-3'}>
			<Input variant={'outlined'} size={'md'} label={'Name'}
				   value={name} onChange={(e) => updateName(e.target.value)} />
			<Input variant={'outlined'} size={'md'} label={'Message'}
				   value={content} onChange={(e) => updateContent(e.target.value)} />
		</CardBody>
	</Card>
}
export default function MessagePanel() {

	const messages = useApplicationMessages();
	const setApplication = useUpdateApplication();
	const setIsModified = useSetEditionStatus();

	function createMessage( name: string ) {
		setApplication((application, editor) => {
			editor.createMessageByName(name)
		})
		setIsModified(true);
	}


	return <>
		{/* enum creation */}
		<InputButtonForm
			inputLabel={"Name"}
			buttonLabel={"Add Message"}
			onConfirm={(value) => createMessage(value)}
		/>

		<div className="flex flex-wrap gap-4">
			{
				messages.map((msg, index) => {
					return <MessageEditionCard
						message={msg}
						key={index}
					/>
				})
			}
		</div>
	</>;
}
