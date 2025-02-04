import Avatar from 'boring-avatars';

export default function AvatarOrganisation(input: {organisationId: number, width?: number, height?: number, className?: string}) {
	return <Avatar
		name={input.organisationId.toString()}
		variant={"marble"}
		width={input.width}
		height={input.height}
		className={input.className}
	/>
}