import * as zip from "@zip.js/zip.js";

import { ChangeEvent, useEffect, useMemo, useState } from "react"

import Table from "./Table";

const Main = () => {

    const [files, setFiles] = useState<FileList | null>(null);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [response, setResponse] = useState({});
    const [stdin, setStdin] = useState("");

    /*
    required files state : holds true if file is present, false if not

    requiredFilesState = {
        "compile": true
        "run": false,
    }
    */

    const [requiredFilesState, setRequiredFilesState] = useState<{ [key: string]: boolean }>({});

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    }

    const filesAsList = useMemo(() => {
        return files ? Array.from(files) : [];
    }, [files]);

    useMemo(() => {

        const requiredFiles = [
            "compile",
            "run",
        ]

        if (!filesAsList) {
            return;
        }

        const newRequiredFilesState = requiredFiles.reduce((acc, file) => {
            const fileExists = filesAsList.find(f => f.name === file);
            acc[file] = !!fileExists;
            return acc;
        }, {} as { [key: string]: boolean });

        setRequiredFilesState(newRequiredFilesState);
    }, [filesAsList])

    useEffect(() => {
        // Set isValid to true if all required files are present
        const requiredFilesArePresent = Object.values(requiredFilesState).every(value => value);
        setIsValid(requiredFilesArePresent);
    }, [requiredFilesState])

    const generateZip = async () => {
        const zipFileWriter = new zip.BlobWriter("application/zip");
        const zipWriter = new zip.ZipWriter(zipFileWriter);

        const filesAsList = files ? Array.from(files) : [];

        for (const file of filesAsList) {
            await zipWriter.add(file.name, new zip.BlobReader(file));
        }

        const zipFile = await zipWriter.close();

        return zipFile;
    }

    const blobToBase64 = (blob: Blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        return new Promise(resolve => {
            reader.onloadend = () => {
                resolve(reader.result);
            };
        });
    };

    const generateZipBase64 = async () => {
        const zipFile = await generateZip();
        const rawBase64 = await blobToBase64(zipFile) as string;
        const b64Placeholder = document.getElementById("b64-placeholder");

        // Strip the "data:application/zip;base64," part
        const base64Regex = /^data:application\/zip;base64,/;
        const base64Match = base64Regex.exec(rawBase64 as string);
        const base64 = base64Match ? rawBase64.replace(base64Match[0], "") : rawBase64;

        if (b64Placeholder) {
            b64Placeholder.innerHTML = base64;
        }

        return base64;
    }

    const downloadFile = (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "files.zip";
        a.click();
    }

    const sendToJudge0 = async (encodedZip: string) => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "language_id": 89,
            "additional_files": encodedZip,
            "stdin": stdin,
        })

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        } as RequestInit;

        const judge0Response = document.getElementById("judge0-response");

        if (!judge0Response) {
            console.log("Judge0 response or stdout divs not found")
            return;
        }

        judge0Response.innerHTML = "Sending to Judge0...";

        setResponse({});

        await fetch("http://localhost:2358/submissions?wait=true", requestOptions)
            .then(response => response.json())
            .then(result => {
                let transformedResult = structuredClone(result);
                transformedResult.status = transformedResult.status.description;
                setResponse(transformedResult);
                judge0Response.innerHTML = JSON.stringify(result, null, 2);
            })
            .catch(error => {
                console.log('error', error);
                judge0Response.innerHTML = "Judge0 is not running"
            });
    }

    return (<div className="mx-auto px-20 py-12">

        <h1 className="text-xl font-bold text-gray-800">Judge0 file uploader</h1>
        <h2 className="text-gray-700">A proof of concept for Arbitre : sending multiple files at once to Judge0 in a base64-encoded zip</h2>
        <h3 className="text-gray-500">Use this to build and try out test suites</h3>

        <br />

        <h3 className="text-lg font-semibold mb-2">1. Select files</h3>

        <input type="file" onChange={handleFileChange} multiple className="hover:bg-gray-50 p-1" />

        <ul className="mt-2 mb-1 empty:hidden text-sm">
            {requiredFilesState && Object.keys(requiredFilesState).map((file, index) => {
                return (
                    <li key={index} className="my-3">
                        <span className={`border-2 shadow-sm rounded-lg px-2 py-1 ${requiredFilesState[file] ? "bg-green-50 border-green-300 text-green-800" : "bg-gray-50 border-gray-300 text-gray-600 border-dashed"}`}>
                            {file}
                        </span>

                        {requiredFilesState[file] ? <span className="text-green-500 ml-1">✓</span> : <span className="text-gray-400 ml-1">(required)</span>}
                    </li>
                )
            })}
            {filesAsList && filesAsList.map((file, index) => {
                if (requiredFilesState[file.name]) {
                    return null;
                }
                return (
                    <li key={index} className="my-3">
                        <span className="border-2 rounded-lg px-2 py-1 bg-blue-50 border-blue-300 text-blue-800 border-dashed">
                            {file.name}
                        </span>
                    </li>
                )
            })}
        </ul>

        <hr className="my-4" />

        <h3 className="text-lg font-semibold mt-4">2. Send to Judge0</h3>

        <textarea
            className="px-2 py-1 font-mono text-sm rounded-lg mt-2 border-2 w-96"
            placeholder="stdin (optionnal)"
            value={stdin}
            onChange={(e: any) => setStdin(e.target.value)}
        />
        <br />

        <button
            onClick={() => isValid ? generateZipBase64().then(sendToJudge0) : undefined}
            className={`text-sm text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 rounded-lg px-2 py-1 mt-2 ${isValid ? "" : "cursor-not-allowed opacity-50"}`}
        >
            Zip and send to Judge0
        </button>

        {!isValid && <>
            <br />
            <div className="text-xs text-gray-400 mt-1">
                There are missing files for this exercise.&nbsp;
                <button className="underline" onClick={() => generateZipBase64().then(sendToJudge0)}>Send my files anyway</button>
            </div>
        </>}

        <br />
        <Table {...response} />
        <pre id="judge0-response" className="inline-block font-mono text-gray-600 rounded-lg mt-2 break-words empty:hidden text-xs"></pre>

        <hr className="my-4" />

        <h3 className="text-lg font-medium mt-2 text-gray-600">Bonus tools</h3>

        <button
            onClick={() => generateZip().then(downloadFile)}
            className={`text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-2 py-1 mt-2 ${isValid ? "" : "cursor-not-allowed opacity-50"}`}
        >Download zip</button>

        <br />

        <button
            onClick={isValid ? generateZipBase64 : undefined}
            className={`text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-2 py-1 mt-2 ${isValid ? "" : "cursor-not-allowed opacity-50"}`}
        >
            Generate base64
        </button>

        <div id="b64-placeholder" className="font-mono bg-gray-50 text-gray-700 text-xs rounded-lg px-2 py-1 break-words mt-2 empty:hidden border"></div>

    </div>)
}

export default Main