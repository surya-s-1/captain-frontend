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
        <h1 className='font-semibold text-2xl mb-2'>
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className='font-semibold text-xl mb-2'>
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className='font-semibold text-lg mb-2'>
            {children}
        </h3>
    ),
    p: ({ children }) => (
        <p className='mb-2'>
            {children}
        </p>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            target='_blank'
            className='text-blue-500 underline hover:text-blue-700 transition-colors'
        >
            {children}
        </a>
    ),
    ul: ({ children }) => (
        <ul className='list-disc ml-5 mb-2'>
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className='list-decimal ml-5 mb-2'>
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className='mb-2'>
            {children}
        </li>
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