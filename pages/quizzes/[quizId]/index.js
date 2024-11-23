import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import QuizView from '../../../components/quiz/QuizView';
import quizData from '../../../data/quizzes';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const QuizPage = () => {
    const router = useRouter();
    const { quizId } = router.query;
    const quiz = quizData.find(q => q.id === quizId);

    if (!quiz) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Quiz Not Found
                        </h1>
                        <Link
                            href="/quizzes"
                            className="inline-flex items-center text-blue-600 hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Quizzes
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                {/* Quiz Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <Link
                            href="/quizzes"
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5 mr-1" />
                            Back to Quizzes
                        </Link>
                        {quiz.type === 'week' && (
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                Week {quiz.relatedWeek}
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {quiz.title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">{quiz.description}</p>
                </div>

                {/* Quiz Content */}
                <QuizView quizId={quizId} />
            </div>
        </Layout>
    );
};

export default QuizPage;