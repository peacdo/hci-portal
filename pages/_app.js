import '../styles/globals.css';
import { ThemeProvider } from '../components/ThemeProvider';
import { ProgressProvider } from '../contexts/ProgressContext';
import { ResourceManagementProvider } from '../contexts/ResourceManagementContext';

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider>
            <ProgressProvider>
                <ResourceManagementProvider>
                    <Component {...pageProps} />
                </ResourceManagementProvider>
            </ProgressProvider>
        </ThemeProvider>
    );
}

export default MyApp;