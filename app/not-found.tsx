import React from 'react'

const NotFound = () => {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex flex-col gap-3">
        <div className="mockup-code">
          <pre data-prefix="$"><code>get access URL</code></pre>
          <pre data-prefix=">" className="text-warning"><code>fetching...</code></pre>
          <pre data-prefix=">" className="bg-error text-error-content"><code>404: NOT FOUND!</code></pre>
          <pre data-prefix="$"><code className='animate-ping'>_</code></pre>
        </div>
      </div>
    </div>
  )
}

export default NotFound