
import { PropsWithChildren } from 'react';
import { EnvProvider, EnvScript, makeEnvPublic } from 'next-runtime-env';

export function EnvVarsContext({children}: PropsWithChildren) {

	return <>
		{children}
	</>
}

