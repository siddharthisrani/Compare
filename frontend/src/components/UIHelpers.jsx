import React from 'react'


export function IconLock(){
return (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m6 0H6m6-14a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3z"/></svg>)
}


export function Badge({ children }){
return <span className="inline-block px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-800 rounded">{children}</span>
}