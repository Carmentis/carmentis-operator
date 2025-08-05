import Skeleton from 'react-loading-skeleton';
import { useNodeCardDimensions } from './NodeCardDimensions';

export function ShowLoadingNodeCard() {
	const { height: cardHeight, width: cardWidth } = useNodeCardDimensions();
	return <Skeleton width={cardWidth} height={cardHeight}/>
}