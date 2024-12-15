import { createContext, useContext, useState, useCallback } from 'react';
import AnalyticsService from '../services/AnalyticsService';

const AnalyticsContext = createContext({});

export const AnalyticsProvider = ({ children }) => {
    const [isTracking, setIsTracking] = useState(false);

    const startTracking = useCallback(async () => {
        if (!isTracking) {
            await AnalyticsService.startTracking();
            setIsTracking(true);
        }
    }, [isTracking]);

    const stopTracking = useCallback(async () => {
        if (isTracking) {
            await AnalyticsService.stopTracking();
            setIsTracking(false);
        }
    }, [isTracking]);

    const trackEvent = useCallback(async (eventName, eventData = {}) => {
        if (isTracking) {
            await AnalyticsService.trackEvent(eventName, eventData);
        }
    }, [isTracking]);

    const getResourceStats = useCallback(async (timeRange = 'week') => {
        return await AnalyticsService.getResourceStats(timeRange);
    }, []);

    const getUsageTrends = useCallback(async (timeRange = 'week') => {
        return await AnalyticsService.getUsageTrends(timeRange);
    }, []);

    const getUserAnalytics = useCallback(async (userId) => {
        return await AnalyticsService.getUserAnalytics(userId);
    }, []);

    return (
        <AnalyticsContext.Provider value={{
            isTracking,
            startTracking,
            stopTracking,
            trackEvent,
            getResourceStats,
            getUsageTrends,
            getUserAnalytics
        }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useResourceAnalytics = () => useContext(AnalyticsContext);