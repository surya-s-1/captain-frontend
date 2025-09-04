export function Notice({ title, content, buttonLabel = null, loading = null, callback = null }) {
    return (
        <div className='sticky bottom-0 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-black flex items-center justify-between'>
            <div>
                <p className='font-semibold'>{title}</p>
                <p>{content}</p>
            </div>
            {buttonLabel &&
            <div className='flex justify-end'>
                <button
                    className={`p-2 bg-black text-white rounded cursor-pointer`}
                    disabled={loading}
                    onClick={callback}
                >
                    {buttonLabel}
                </button>
            </div>}
        </div>
    )
}