import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center">
        <div className="relative inline-block mb-8">
            <h1 className="text-9xl font-extrabold text-orange-100 italic">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold text-gray-800">Page Not Found</p>
            </div>
        </div>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          href="/" 
          className="inline-block px-8 py-3 bg-orange-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:bg-orange-700 transition transform hover:-translate-y-1"
        >
          Return to Shop
        </Link>
      </div>
    </div>
  )
}
