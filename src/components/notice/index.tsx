'use client'

import { Markdown } from '@/lib/utility/ui/Markdown'

export default function Notice({ content }: { content: string }) {
    return (
        <div className='w-full flex-col overflow-auto scrollbar'>
            <div className='w-full sticky top-0 backdrop-blur-xs bg-white/30 shadow-md p-4 flex justify-center text-3xl font-semibold'>
                NOTICE
            </div>
            <div className='p-8'>
                <Markdown text={content} />
            </div>
        </div>
    )
}
