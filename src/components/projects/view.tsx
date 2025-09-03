export interface Project {
    name: string
    connected: boolean
    project_id: string | null
    latest_version: string | null
}

interface ProjectViewInput {
    tool: string
    loading: boolean
    error: string | null
    projects: Project[]
}

export function ProjectView({ tool, loading, error, projects }: ProjectViewInput) {
    return (
        <>
            <h2 className='text-color-primary/70 text-lg font-semibold mb-4'>{tool}</h2>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {(loading || error) ?
                    <div>
                        {loading ?
                            <p>Loading...</p> :
                            <p className='text-error font-semibold'>{error}</p>}
                    </div> :
                    projects.map((project, idx) => (
                        <a
                            key={idx}
                            href={project.connected && `/projects/versions?projectId=${project.project_id}&version=${project.latest_version}`}
                            className='flex flex-col justify-between gap-8 cursor-pointer p-4 rounded-md shadow-md'
                        >
                            <h2 className='text-xl'>{project.name}</h2>
                            <div className={`w-full flex items-center justify-between ${!project.connected && 'flex-row-reverse'}`}>
                                {project.connected ?
                                <>
                                    <a
                                        href={`/projects/versions?projectId=${project.project_id}`}
                                    >
                                        See versions
                                    </a>
                                    <span
                                        className='w-fit text-success p-2'
                                    >
                                        Connected
                                    </span>
                                </>:
                                <button
                                    className='w-fit text-link font-sans font-semibold p-2 cursor-pointer'
                                    onClick={(e) => {
                                        e.preventDefault()
                                    }}
                                >
                                    Connect
                                </button>
                                }
                            </div>
                        </a>
                    ))}
            </div>
        </>
    )
}