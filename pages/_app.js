import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { ProgressProvider } from '../contexts/ProgressContext';
import { ResourceManagementProvider } from '../contexts/ResourceManagementContext';
import { QuizProvider } from '../contexts/QuizContext';
import { FlashcardProvider } from '../contexts/FlashcardContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ResourceProvider } from '../contexts/ResourceContext';
import { ErrorProvider } from '../contexts/ErrorContext';
import { LoggerProvider } from '../contexts/LoggerContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';

const MyApp = ({ Component, pageProps }) => {
    return (
        <ErrorProvider>
            <AuthProvider>
                <LoggerProvider>
                    <AnalyticsProvider>
                        <ThemeProvider>
                            <ResourceProvider>
                                <ProgressProvider>
                                    <ResourceManagementProvider>
                                        <QuizProvider>
                                            <FlashcardProvider>
                                                <Component {...pageProps} />
                                            </FlashcardProvider>
                                        </QuizProvider>
                                    </ResourceManagementProvider>
                                </ProgressProvider>
                            </ResourceProvider>
                        </ThemeProvider>
                    </AnalyticsProvider>
                </LoggerProvider>
            </AuthProvider>
        </ErrorProvider>
    );
};

export default MyApp;