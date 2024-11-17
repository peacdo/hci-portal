import React from 'react';
import { Book, Clock, Search, Menu } from 'lucide-react';

const WebsiteTheme = ({ 
  featuredLectures = [], 
  recentLectures = [],
  onSearch,
  navigationLinks = []
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Menu className="h-6 w-6 md:hidden" />
              <div className="flex items-center space-x-2">
                <Book className="h-6 w-6" />
                <span className="text-xl font-bold">EduLectures</span>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search lectures..."
                  className="w-full px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  className="hover:text-blue-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Featured Lectures</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredLectures.map((lecture) => (
              <div key={lecture.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{lecture.duration}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{lecture.title}</h3>
                  <p className="text-gray-600 mb-4">{lecture.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{lecture.instructor}</span>
                    <button 
                      onClick={() => lecture.onWatch?.()} 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Lectures Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Lectures</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="divide-y divide-gray-200">
              {recentLectures.map((lecture) => (
                <div key={lecture.id} className="py-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{lecture.title}</h3>
                    <p className="text-gray-600">{lecture.department}</p>
                  </div>
                  <button 
                    onClick={() => lecture.onViewDetails?.()}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WebsiteTheme;