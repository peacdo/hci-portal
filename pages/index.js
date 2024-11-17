// pages/index.js
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Human-Computer Interaction
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Human-Computer Interaction (HCI) is a multidisciplinary field focused on the design, 
              evaluation, and implementation of interactive computing systems for human use. It 
              encompasses elements from computer science, psychology, design, and several other fields 
              to create intuitive and effective interfaces.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Through HCI, we study how humans interact with computers and design technologies 
              that allow humans to interact with computers in novel ways. This field is crucial 
              in making technology accessible and useful for everyone.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Getting Started Guide
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Start with the Basics</h3>
                  <p className="text-gray-600 mt-2">
                    Begin your journey by learning the fundamentals from our{' '}
                    <Link href="/resources" className="text-blue-600 hover:underline">
                      resources
                    </Link>
                    . These materials will give you a solid foundation in HCI principles.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Expand Your Knowledge</h3>
                  <p className="text-gray-600 mt-2">
                    Deepen your understanding by reading our curated{' '}
                    <Link href="/resources" className="text-blue-600 hover:underline">
                      articles
                    </Link>
                    . These will provide you with practical insights and current trends in HCI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}