export default function DefaultUserIcon(input: {className?: string, style?: React.CSSProperties}) {
	return <div
		className={`bg-gray-100 rounded-full p-2 w-12 h-12 items-center justify-center text-center align-middle mb-4 ${input.className}`}>
		<i className={'bi bi-person large-icon'}></i>
	</div>
}