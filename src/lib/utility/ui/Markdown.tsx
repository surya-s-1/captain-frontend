import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import breaks from 'remark-breaks'

const componentPlugin = {
    pre: ({ children }) => (
        <pre
            className='bg-secondary text-color-secondary
            border rounded-lg p-4 my-4
            overflow-x-auto font-mono scrollbar'
        >
            {children}
        </pre>
    ),
    hr: () => (
        <>
            <br />
            <hr />
            <br />
        </>
    ),
    h1: ({ children }) => (
        <h1 className='font-semibold text-2xl'>
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className='font-semibold text-xl'>
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h2 className='font-semibold text-lg'>
            {children}
        </h2>
    ),
    ul: ({ children }) => (
        <ul className='list-disc ml-5'>
            {children}
        </ul>
    )
}

export function Markdown({ text }: { text: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, breaks]}
            components={{ ...componentPlugin }}
        >
            {text}
        </ReactMarkdown>
    )
}