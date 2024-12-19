'use client';

import { fetchOrganisation } from '@/components/api.hook';
import { useParams } from 'next/navigation';

export default function Home(){

    const params: { organisationId: string } = useParams();
    const {data, loading, error} = fetchOrganisation(parseInt(params.organisationId));
    console.log(data);

    return (
        <>

            <div className="w-100">
                <div className="w-100 mb-4">
                    <h5>Dashboard</h5>
                </div>

                <div className="flex w-100 sm:flex-col xl:flex-row mb-4">
                    <div className="xl:w-3/12 sm:w-100 sm:mr-0 xl:mr-2 card">
                        <h2><i className={"bi bi-cash-stack card-icon"}></i> Cost</h2>
                        <p>0.00 CMTS</p>
                    </div>
                    <div className="xl:w-3/12 sm:w-100 sm:mr-0 xl:mr-2 card">
                        <h2><i className={"bi bi-layers card-icon"}></i> Virtual Blockchains</h2>
                        <p>0</p>
                    </div>
                    <div className="xl:w-3/12 sm:w-100 sm:mr-0 xl:mr-2 card">
                        <h2><i className={"bi bi-database card-icon"}></i> Storage</h2>
                        <p>0 B</p>
                    </div>
                    <div className="xl:w-3/12 sm:w-100  card">
                        <h2><i className={"bi bi-book card-icon"}></i> Records</h2>
                        <p>0</p>
                    </div>
                </div>

                <div className="card">
                    <h2>Recent Activities</h2>
                </div>
            </div>

        </>
    );
}
