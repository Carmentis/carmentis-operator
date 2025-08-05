import Avatar from 'boring-avatars';

export default function AvatarOrganisation(input: {organisationId: number|string, width?: number, height?: number, className?: string}) {
	return <Avatar
		square={true}
		name={input.organisationId.toString()}
		variant={"marble"}
		width={input.width}
		height={input.height}
		className={input.className}
	/>
}