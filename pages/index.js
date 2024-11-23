// pages/index.js
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
                Human-Computer Interaction
              </h1>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  Human-Computer Interaction (HCI) is a multidisciplinary field focused on the design,
                  evaluation, and implementation of interactive computing systems for human use. It
                  encompasses elements from computer science, psychology, design, and several other fields
                  to create intuitive and effective interfaces.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                  Through HCI, we study how humans interact with computers and design technologies
                  that allow humans to interact with computers in novel ways. This field is crucial
                  in making technology accessible and useful for everyone.
                </p>
              </div>

              {/* Additional Feature Cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Design Principles</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Learn fundamental principles of interface design and user experience.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">User Research</h3>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    Discover methods for understanding user needs and behaviors.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors">
                Getting Started Guide
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white transition-colors">
                      Start with the Basics
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors">
                      Begin your journey by learning the fundamentals from our{' '}
                      <Link
                          href="/resources"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
                      >
                        resources
                      </Link>
                      . These materials will give you a solid foundation in HCI principles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white transition-colors">
                      Expand Your Knowledge
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors">
                      Deepen your understanding by reading our curated{' '}
                      <Link
                          href="/resources"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
                      >
                        articles
                      </Link>
                      . These will provide you with practical insights and current trends in HCI.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white transition-colors">
                      Practice and Apply
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors">
                      Put your knowledge into practice with hands-on exercises and real-world examples.
                      Join discussions and share your insights with fellow students.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors">
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                      href="/resources"
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Course Materials
                  </Link>
                  <Link
                      href="/about"
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Meet the Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
}