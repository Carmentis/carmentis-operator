import PaymentCard from '@/components/payment-card.component';
import FlexCenter from '@/components/flex-center.component';

export default function ExchangePage() {

	async function handlePayment(event: FormData) {
		'use server';

		// TODO event payment
	}

	return <FlexCenter>
		<PaymentCard pay={handlePayment}/>
	</FlexCenter>
}



