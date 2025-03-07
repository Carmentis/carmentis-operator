import { Button, Chip, IconButton, Spinner, Typography } from '@material-tailwind/react';
import { ArrowDownOnSquareIcon, ArrowUpOnSquareIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';


export type EntityStatusHeaderProps = {
	name: string,
	version: number,
	logoUrl?: string,
	published: boolean,
	isDraft: boolean,
	isModified: boolean,
	isSaving: boolean,
	save: () => void
	delete: () => void
	publish: () => void
	download: () => void,
}
export default function EntityStatusHeader(
	input: EntityStatusHeaderProps
) {

	const BORDER_CLASSES = 'border-r-2 border-gray-200';
	const ICON_ROTATION_CLASSES = 'h-5 w-5 transition-transform group-hover:rotate-45';

	const [showLogo, setShowLogo] = useState(true);
	return (
		<>
			<div className="flex justify-between w-full">
				<div className="begin-section justify-center items-center content-center flex">
					<div className={`${BORDER_CLASSES} px-2 pr-4 flex`}>
						<img
							src={input.logoUrl}
							alt=""
							className="mr-4 px-0"
							width={15}
							hidden={!input.logoUrl || showLogo}
							onError={() => setShowLogo(false)}
							onLoad={() => setShowLogo(true)}
						/>
						<Typography
							variant="h5"
							color="blue-gray"
							className="justify-center items-center content-center"
						>
							{input.name}
						</Typography>
					</div>
					<Typography className={`${BORDER_CLASSES} px-4`}>Version {input.version}</Typography>
					<div className="px-4 flex flex-row space-x-2">
						{input.published &&
							<Chip variant="filled" className={"bg-primary-light"} value="Published" />}
						{input.isDraft &&
							<Chip variant="outlined" className={"border-primary-light text-primary-light"}
								  value="Draft" />}
					</div>
				</div>
				<div className="flex">
					<div className={`space-x-2 ${BORDER_CLASSES} pr-2 flex flex-row`}>
						{input.isModified && <Button className={"flex items-center space-x-2"} onClick={input.save}>
							{input.isSaving ? <Spinner /> : <i className="bi bi-floppy-fill"></i>}
							<span>save</span>
						</Button>}
						{input.isDraft &&
							<Button className={"flex items-center space-x-2"} onClick={input.publish}>
								<ArrowUpOnSquareIcon className={ICON_ROTATION_CLASSES} />
								<span>Publish</span>
							</Button>}
						<Button className={"flex items-center space-x-2"} onClick={input.download}>
							<ArrowDownOnSquareIcon className={ICON_ROTATION_CLASSES} />
							<span>Download</span>
						</Button>
					</div>
					<IconButton className="border-l-2 border-gray-200 ml-2" onClick={input.delete}>
						<TrashIcon className={ICON_ROTATION_CLASSES} />
					</IconButton>
				</div>
			</div>
		</>
	);
}