import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Modal({ isOpen, closeModal, children }) {
    if (!isOpen) return null

    return createPortal(
        <div className={`fixed inset-0 bg-black/50 flex justify-center items-center z-50`}>
            <div className='bg-primary text-color-primary p-8 rounded-md shadow-lg max-w-sm w-full relative'>
                <button
                    onClick={closeModal}
                    className='absolute top-4 right-4 border p-1 rounded-full cursor-pointer'
                >
                    <X size={12} />
                </button>
                <div>{children}</div>
            </div>
        </div>,
        document.body
    )
}