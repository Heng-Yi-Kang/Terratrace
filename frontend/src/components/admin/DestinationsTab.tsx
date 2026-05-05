'use client'

export default function DestinationsTab() {
  const destinations = [
    { id: 1, name: 'Green Valley Hotel', location: 'Switzerland', status: 'approved', ecoScore: 95 },
    { id: 2, name: 'Eco Resort Bali', location: 'Indonesia', status: 'pending', ecoScore: 88 },
    { id: 3, name: 'Sustainable Stay Oslo', location: 'Norway', status: 'approved', ecoScore: 92 },
    { id: 4, name: 'Forest Retreat Canada', location: 'Canada', status: 'pending', ecoScore: 76 },
    { id: 5, name: 'Solar Powered Inn', location: 'Portugal', status: 'approved', ecoScore: 91 },
  ]

  const getStatusBadge = (status: string) => {
    return status === 'approved'
      ? 'bg-secondary/10 text-secondary'
      : 'bg-cta/10 text-cta'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-3xl text-text">Destinations</h1>
        <p className="font-sans text-text/60 mt-2">Manage eco-certified destinations</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-text/10">
        <button className="pb-3 px-2 font-sans font-medium text-primary border-b-2 border-primary cursor-pointer">
          All (342)
        </button>
        <button className="pb-3 px-2 font-sans font-medium text-text/50 hover:text-text transition-colors cursor-pointer">
          Approved (327)
        </button>
        <button className="pb-3 px-2 font-sans font-medium text-text/50 hover:text-text transition-colors cursor-pointer">
          Pending (15)
        </button>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="bg-white/80 backdrop-blur-md rounded-organic p-6 shadow-organic hover:shadow-organic-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-primary/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(dest.status)}`}>
                {dest.status}
              </span>
            </div>
            <h3 className="font-sans font-semibold text-lg text-text mb-1">{dest.name}</h3>
            <p className="font-sans text-text/50 text-sm mb-4">{dest.location}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm text-text/60">Eco Score:</span>
                <span className="font-sans font-semibold text-primary">{dest.ecoScore}</span>
              </div>
              <button className="text-primary hover:text-primary/80 font-sans text-sm font-medium cursor-pointer">
                {dest.status === 'pending' ? 'Review' : 'View'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <button className="px-6 py-3 bg-white text-text border border-text/20 rounded-xl font-sans font-medium hover:bg-background transition-colors duration-200 cursor-pointer">
          Load More Destinations
        </button>
      </div>
    </div>
  )
}