export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Rundown Studio</h1>
          <p className="mt-4 text-lg text-gray-600">
            Simple event rundown planning tool
          </p>
          <div className="mt-8">
            <a
              href="/rundowns"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Go to Rundowns
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
