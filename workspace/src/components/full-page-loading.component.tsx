import FullSpaceSpinner from '@/components/full-page-spinner.component';

type FullPageLoadingComponentProps = {
	label?: string
}

export default function FullPageLoadingComponent({label} : FullPageLoadingComponentProps) {
	return <FullSpaceSpinner label={label}/>
}