'use client';

import { Button, Card, CardBody, Checkbox, Input, Typography } from '@material-tailwind/react';
import Form from 'next/form';

export default function PaymentCard(input: { pay: (formData: FormData) => void }) {
	return <Card className={"w-96"}>
		<CardBody>

			<div className="flex justify-center mb-8">
				<Typography variant={"h3"}>Pay</Typography>
			</div>

			<Form action={input.pay} className={"space-y-4"}>
				<Input
					label={'Token'}
					name={'token'}
				/>
				<Input
					label={'EUR'}
					name={'eur'}
				/>

				<div id="method">
					<Typography>Method</Typography>
					<Checkbox
						name={'paymentMethod'}
						label={"Credit card"}
					/>
					<Checkbox
						name={'paymentMethod'}
						label={"Cryptocurrency"}
					/>
					<Checkbox
						name={'paymentMethod'}
						label={"Bank transfer"}
					/>
				</div>


				<Button className={"w-full"}>
					Pay
				</Button>
			</Form>
		</CardBody>
	</Card>
}
