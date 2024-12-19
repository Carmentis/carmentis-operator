'use client';

import {useEffect, useState} from "react";

export default function TestPage() {
    const [response, setResponse] = useState<string>('');

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_WORKSPACE_API_BASE_URL + '/status';
        console.log("URL", url)
        fetch(url)
            .then(res => res.json())
            .then(data => {
            setResponse(data.service + "-" + data.version)
        })
    }, []);

    return <h1>{response}</h1>
}