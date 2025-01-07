'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlobalSearchResponse, useCallGlobalSearchApi } from '@/components/api.hook';
import { useToast } from '@/app/layout';
import { Card, CardBody, Spinner, Typography } from '@material-tailwind/react';
import Link from 'next/link';

/**
 * Component representing the search bar in the navbar.
 * @constructor
 */
export default function NavbarSearchBar() {
    const [search, setSearch] = useState('');
    const params = useParams();
    const notify = useToast();
    const organisationId = parseInt(params.organisationId);
    const callGlobalSearch = useCallGlobalSearchApi();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<GlobalSearchResponse|undefined>(undefined);



    useEffect(() => {
        if ( search !== '' ) {
            callSearch();
        }
    }, [search]);


    /**
     * Call the global search API.
     */
    function callSearch() {
        setIsLoading(true);
        callGlobalSearch(organisationId, search, {
            onSuccessData: data => {
                setResult(data)
            },
            onError: notify.error,
            onEnd: () => setIsLoading(false)
        })
    }

    /**
     * Launch the search for the provided query.
     *
     * @param event
     */
    function submitForm( event: FormEvent ) {
        event.preventDefault();
        callSearch();
    }

    /**
     * Component representing a search item.
     * @param input
     * @constructor
     */
    function SearchItem( input: { content: string, link: string } ) {
        return <Link href={input.link} onClick={() => setSearch('')}>
            <Card className={"rounded mb-2"}>
                <CardBody className={"p-2"}>
                    {input.content}
                </CardBody>
            </Card>
        </Link>
    }

    return <div className={"relative"}>
        <form className="w-100" onSubmit={(e) => submitForm(e)}>
            <label htmlFor="default-search"
                   className="text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
            <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap={"round"} strokeLinejoin={"round"} strokeWidth={2}
                              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input type="search" id="default-search"
                       value={search}
                       className={`${search !== '' ? 'rounded-b-none' : ''} block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-0   dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white`}
                       placeholder="Search applications, oracles, users..."
                       required onChange={(e) => setSearch(e.target.value)} />
            </div>
        </form>

        { search !== '' &&
            <div className={"absolute bg-gray-50  w-full p-4 z-30 shadow-lg rounded-b-md"}>
                {
                    isLoading && <Spinner width={30}/>
                }
                {
                    !isLoading && result &&
                    <div className={"flex flex-col space-y-8"}>
                        <div hidden={result.users.length === 0} >
                            <Typography>Users</Typography>
                            {
                                result.users.map(u => <SearchItem
                                    content={u.firstname + ' ' + u.lastname}
                                    link={`/home/organisation/${organisationId}/user`}/>)
                            }
                        </div>

                        <div hidden={result.applications.length === 0}>
                            <Typography>Applications</Typography>
                            {
                                result.applications.map(a =>  <SearchItem
                                    content={a.name}
                                    link={`/home/organisation/${organisationId}/application/${a.id}`}
                                />)
                            }
                        </div>

                        <div hidden={result.oracles.length === 0}>
                            <Typography>Oracles</Typography>
                            {
                                result.oracles.map(o =>  <SearchItem
                                    content={o.name}
                                    link={`/home/organisation/${organisationId}/oracle/${o.id}`}
                                />)
                            }
                        </div>

                    </div>
                }
            </div>
        }


    </div>;
}