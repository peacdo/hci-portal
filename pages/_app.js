// pages/_app.js
import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { ProgressProvider } from '../contexts/ProgressContext';
import { ResourceManagementProvider } from '../contexts/ResourceManagementContext';
import { QuizProvider } from '../contexts/QuizContext';
import { FlashcardProvider } from '../contexts/FlashcardContext';

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider>
            <ProgressProvider>
                <ResourceManagementProvider>
                    <QuizProvider>
                        <FlashcardProvider>
                            <Component {...pageProps} />
                        </FlashcardProvider>
                    </QuizProvider>
                </ResourceManagementProvider>
            </ProgressProvider>
        </ThemeProvider>
    );
}

export default MyApp;