import Layout from '../components/Layout';
import { BookOpen, Linkedin, Github, Mail } from 'lucide-react';

export default function About() {
  return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <img
                    src="https://media.istockphoto.com/id/1177794485/vector/person-gray-photo-placeholder-woman.jpg?s=612x612&w=0&k=20&c=B41l9xgyu4bR63vPqt49mKZIRGh8ewpewN7zXnYPOsI="
                    alt="Lecturer Name"
                    className="rounded-lg shadow-lg w-full dark:opacity-90"
                />
              </div>
              <div className="md:col-span-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dr. Ayşe Kula</h1>
                <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                  Lecturer of Human-Computer Interaction
                </h2>

                <div className="flex space-x-4 mb-6">
                  <a
                      href="https://scholar.google.com.tr/citations?user=q6kaxIsAAAAJ&hl=tr"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="Google Scholar Profile"
                  >
                    <BookOpen className="h-6 w-6" />
                  </a>
                  <a
                      href="https://www.linkedin.com/in/ayşe-kula-5a33a16/"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                  <a
                      href="mailto:ayse.kula@ostimteknik.edu.tr"
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      aria-label="Email Contact"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tristique, tortor sit amet
                    tincidunt rutrum, metus leo semper lorem, id vehicula quam metus at quam.
                    Maecenas pretium commodo lacus, posuere pulvinar mi accumsan ut. Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit. Curabitur in libero id quam scelerisque tincidunt et in mi.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tristique, tortor sit amet
                    tincidunt rutrum, metus leo semper lorem, id vehicula quam metus at quam.
                    Vestibulum id malesuada dolor.
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tristique, tortor sit amet
                    tincidunt rutrum, metus leo semper lorem, id vehicula quam metus at quam.
                    Vestibulum id malesuada dolor. Suspendisse ac ligula sed nisi lacinia placerat.
                    Proin fringilla consequat sapien. Donec ac accumsan diam. Nulla nec tempus nibh.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 transition-colors">
            <div className="flex items-center space-x-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About the Developer</h2>
              <div className="flex space-x-4">
                <a
                    href="https://github.com/peacdo"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="GitHub Profile"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                    href="mailto:gorkemozyilmaz@outlook.com"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label="Email Contact"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300">
                Görkem Özyılmaz, student. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris tristique,
                tortor sit amet tincidunt rutrum, metus leo semper lorem, id vehicula quam metus at quam.
              </p>
            </div>
          </div>
        </div>
      </Layout>
  );
}