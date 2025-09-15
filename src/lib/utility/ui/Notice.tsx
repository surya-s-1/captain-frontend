import { Loader2 } from 'lucide-react'

export function Notice({ title, content, buttonLabel = null, loading = null, callback = null }) {
    return (
        <div className='sticky bottom-0 p-4 bg-gradient-to-br from-indigo-500 to-violet-600 border-l-4 border-yellow-500 text-white flex items-center justify-between'>
            <div>
                <p className='font-semibold'>{title}</p>
                <p>{content}</p>
            </div>
            {buttonLabel &&
                <div className='flex justify-end'>
                    <button
                        className={`p-2 bg-black text-white rounded cursor-pointer flex items-center gap-2`}
                        disabled={loading}
                        onClick={callback}
                    >
                        {buttonLabel} {loading && <Loader2 className='animate-spin' size={16} />}
                    </button>
                </div>}
        </div>
    )
}