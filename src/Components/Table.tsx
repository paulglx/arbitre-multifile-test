import React from 'react'

const Table = (props: any) => {

    return Object.keys(props).length > 0 ? (
        <table className="table-auto text-sm my-2">
            <tbody>
                {Object.keys(props).map((key) => (
                    <tr key={key} className='border hover:bg-gray-50'>
                        <th className='text-left bg-gray-50 px-2 py-1 font-medium'>{key}</th>
                        <td className={`font-mono text-xs px-2 py-1 ${props[key] ? 'text-gray-900' : 'text-gray-400'}`}>{props[key] ? props[key] : 'null'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    ) : null;
}

export default Table