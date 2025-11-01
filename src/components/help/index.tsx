'use client'

import React, { useEffect, useState } from 'react'

export default function Help() {
    const [data, setData] = useState([])

    useEffect(() => {
        fetch('/help.json')
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error('Error fetching help data:', error))
    }, [])

    return (
        <div className='max-w-3xl mx-auto px-4 py-8'>
            {data.length === 0 ? (
                <p className='text-center text-xl text-gray-500'>Loading help content...</p>
            ) : (
                data.map((item, index) => (
                    <div key={index} className='mb-8 bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow'>
                        <h3 className='text-2xl font-semibold text-gray-800 mb-4'>{item.title}</h3>
                        <p className='text-gray-700 mb-4'>{item.description}</p>
                        {item.iframe && (
                            <iframe
                                src={`${item.iframe}?rel=0&showinfo=0&autohide=1`}
                                title={item.title}
                                width='100%'
                                height='400'
                                className='rounded-lg border-2 border-gray-200'
                                allow='accelerometer autoplay encrypted-media gyroscope picture-in-picture'
                                allowFullScreen
                            ></iframe>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}