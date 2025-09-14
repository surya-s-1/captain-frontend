'use client'

import { Markdown } from '@/lib/utility/ui/Markdown'

export default function Notice({ content }: { content: string }) {
    return (
        <div className='w-full p-8 overflow-auto scrollbar'>
            <Markdown text={content} />
        </div>
    )
}
