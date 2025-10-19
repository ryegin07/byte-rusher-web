export default function DocumentVerifyLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded w-48"></div>
                  <div className="h-4 bg-gray-300 rounded w-64"></div>
                </div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-64"></div>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-lg mx-auto"></div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-300 rounded w-24 mx-auto"></div>
                    <div className="h-4 bg-gray-300 rounded w-48 mx-auto"></div>
                    <div className="h-10 bg-gray-300 rounded w-full"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-5 bg-gray-300 rounded w-32"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                  <div className="h-10 bg-gray-300 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
