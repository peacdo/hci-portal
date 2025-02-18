import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useResources } from '../../contexts/ResourcesContext';
import {
    getModuleResources,
    trackResourceUsage,
    getResourceRecommendations,
    RESOURCE_TYPES
} from '../../lib/resourceService';
import {
    Book,
    Video,
    Link as LinkIcon,
    FileText,
    Code,
    Download,
    Eye,
    Clock,
    AlertTriangle,
    Loader,
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Tag,
    X,
    GripVertical,
    History,
    Star,
    Heart
} from 'lucide-react';
import ResourcePreview from './ResourcePreview';

const ResourceTypeIcon = ({ type, className = 'h-5 w-5' }) => {
    switch (type) {
        case RESOURCE_TYPES.PDF:
            return <Book className={className} />;
        case RESOURCE_TYPES.VIDEO:
            return <Video className={className} />;
        case RESOURCE_TYPES.LINK:
            return <LinkIcon className={className} />;
        case RESOURCE_TYPES.DOCUMENT:
            return <FileText className={className} />;
        case RESOURCE_TYPES.CODE_SAMPLE:
            return <Code className={className} />;
        default:
            return <FileText className={className} />;
    }
};

const STORAGE_KEYS = {
    GROUP_ORDER: 'studyResources.groupOrder',
    COLLAPSED_GROUPS: 'studyResources.collapsedGroups',
    TOPIC_HISTORY: 'studyResources.topicHistory',
    RECENT_SEARCHES: 'studyResources.recentSearches',
    FAVORITE_TOPICS: 'studyResources.favoriteTopics'
};

const StudyResources = ({ courseId, moduleId }) => {
    const { user } = useAuth();
    const { topicResources: resources } = useResources();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resourceTypeFilter, setResourceTypeFilter] = useState('all');
    const [resourceSortBy, setResourceSortBy] = useState('recent');
    const [resourceSortOrder, setResourceSortOrder] = useState('desc');
    
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [sortBy, setSortBy] = useState('date'); // 'date', 'views', 'downloads'
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [availableTopics, setAvailableTopics] = useState([]);
    const [topicSearchTerm, setTopicSearchTerm] = useState('');
    const [topicCounts, setTopicCounts] = useState({});
    const [topicSortBy, setTopicSortBy] = useState('alphabetical'); // 'alphabetical', 'count', 'recent'
    const [topicGroups, setTopicGroups] = useState({});
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());
    const [focusedTopic, setFocusedTopic] = useState(null);
    const [allGroupsCollapsed, setAllGroupsCollapsed] = useState(false);
    const [focusedGroup, setFocusedGroup] = useState(null);
    const [groupOrder, setGroupOrder] = useState([]);
    const [draggedGroup, setDraggedGroup] = useState(null);
    const [dragOverGroup, setDragOverGroup] = useState(null);
    const [topicHistory, setTopicHistory] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSearchHistory, setShowSearchHistory] = useState(false);
    const [favoriteTopics, setFavoriteTopics] = useState(new Set());
    const [suggestedTopics, setSuggestedTopics] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [resourceAnalytics, setResourceAnalytics] = useState({});

    useEffect(() => {
        fetchResources();
        fetchRecommendations();
    }, [courseId, moduleId]);

    useEffect(() => {
        // Extract unique topics and group them by category
        const topics = new Set();
        const groups = {};
        
        [...resources, ...recommendations].forEach(resource => {
            resource.topics?.forEach(topic => {
                topics.add(topic);
                // Group topics by their prefix (e.g., "Frontend/React" goes under "Frontend")
                const category = topic.includes('/') ? topic.split('/')[0] : 'General';
                if (!groups[category]) {
                    groups[category] = new Set();
                }
                groups[category].add(topic);
            });
        });

        // Convert Sets to sorted arrays
        const sortedGroups = Object.fromEntries(
            Object.entries(groups).map(([category, topicsSet]) => [
                category,
                Array.from(topicsSet)
            ])
        );

        setTopicGroups(sortedGroups);
        setAvailableTopics(Array.from(topics));
    }, [resources, recommendations]);

    useEffect(() => {
        // Calculate topic counts from all resources
        const counts = {};
        [...resources, ...recommendations].forEach(resource => {
            resource.topics?.forEach(topic => {
                counts[topic] = (counts[topic] || 0) + 1;
            });
        });
        setTopicCounts(counts);
    }, [resources, recommendations]);

    useEffect(() => {
        setGroupOrder(Object.keys(topicGroups));
    }, [topicGroups]);

    // Load persisted state
    useEffect(() => {
        const loadPersistedState = () => {
            try {
                const savedGroupOrder = localStorage.getItem(STORAGE_KEYS.GROUP_ORDER);
                if (savedGroupOrder) {
                    setGroupOrder(JSON.parse(savedGroupOrder));
                }

                const savedCollapsedGroups = localStorage.getItem(STORAGE_KEYS.COLLAPSED_GROUPS);
                if (savedCollapsedGroups) {
                    setCollapsedGroups(new Set(JSON.parse(savedCollapsedGroups)));
                }

                const savedTopicHistory = localStorage.getItem(STORAGE_KEYS.TOPIC_HISTORY);
                if (savedTopicHistory) {
                    setTopicHistory(JSON.parse(savedTopicHistory));
                }

                const savedRecentSearches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
                if (savedRecentSearches) {
                    setRecentSearches(JSON.parse(savedRecentSearches));
                }

                const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITE_TOPICS);
                if (savedFavorites) {
                    setFavoriteTopics(new Set(JSON.parse(savedFavorites)));
                }
            } catch (error) {
                console.error('Error loading persisted state:', error);
            }
        };

        loadPersistedState();
    }, []);

    // Save state changes to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.GROUP_ORDER, JSON.stringify(groupOrder));
    }, [groupOrder]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.COLLAPSED_GROUPS, JSON.stringify(Array.from(collapsedGroups)));
    }, [collapsedGroups]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TOPIC_HISTORY, JSON.stringify(topicHistory));
    }, [topicHistory]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recentSearches));
    }, [recentSearches]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.FAVORITE_TOPICS, JSON.stringify(Array.from(favoriteTopics)));
    }, [favoriteTopics]);

    // Generate topic suggestions based on usage patterns
    useEffect(() => {
        const generateSuggestions = () => {
            const suggestions = [];
            
            // Suggest based on recently used topics in the same category
            topicHistory.forEach(({ topic }) => {
                const category = topic.includes('/') ? topic.split('/')[0] : 'General';
                const relatedTopics = Object.entries(topicGroups)
                    .find(([key]) => key === category)?.[1] || [];
                
                relatedTopics
                    .filter(t => t !== topic && !selectedTopics.includes(t))
                    .forEach(t => {
                        if (!suggestions.includes(t)) {
                            suggestions.push(t);
                        }
                    });
            });

            // Suggest frequently used topics not in history
            const sortedByCount = Object.entries(topicCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([topic]) => topic)
                .filter(topic => 
                    !selectedTopics.includes(topic) && 
                    !suggestions.includes(topic)
                );

            setSuggestedTopics([...suggestions, ...sortedByCount].slice(0, 5));
        };

        generateSuggestions();
    }, [topicHistory, topicGroups, selectedTopics, topicCounts]);

    useEffect(() => {
        const calculateResourceAnalytics = () => {
            const analytics = {};
            resources.forEach(resource => {
                analytics[resource.id] = {
                    totalUsage: (resource.views || 0) + (resource.downloads || 0),
                    usageByDay: resource.usageHistory?.reduce((acc, usage) => {
                        const date = usage.timestamp.toDate().toLocaleDateString();
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                    }, {}),
                    averageRating: resource.ratings?.reduce((sum, rating) => sum + rating.value, 0) / (resource.ratings?.length || 1),
                    topicEngagement: resource.topics?.reduce((acc, topic) => {
                        acc[topic] = (acc[topic] || 0) + 1;
                        return acc;
                    }, {})
                };
            });
            setResourceAnalytics(analytics);
        };

        calculateResourceAnalytics();
    }, [resources]);

    const fetchResources = async () => {
        try {
            const moduleResources = await getModuleResources(courseId, moduleId);
            setResources(moduleResources);
        } catch (err) {
            setError('Failed to fetch resources');
            console.error(err);
        }
    };

    const fetchRecommendations = async () => {
        try {
            const recommendedResources = await getResourceRecommendations(courseId, user.uid);
            setRecommendations(recommendedResources);
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    const trackResourceEngagement = async (resourceId, action, details = {}) => {
        try {
            // Track the basic action
            await trackResourceUsage(courseId, moduleId, resourceId, action);

            // Track additional engagement details
            const timestamp = new Date();
            const engagement = {
                resourceId,
                action,
                timestamp,
                userId: user.uid,
                sessionDuration: details.sessionDuration,
                scrollDepth: details.scrollDepth,
                interactionCount: details.interactionCount,
                ...details
            };

            // Update local analytics
            setResourceAnalytics(prev => ({
                ...prev,
                [resourceId]: {
                    ...prev[resourceId],
                    totalUsage: (prev[resourceId]?.totalUsage || 0) + 1,
                    usageByDay: {
                        ...prev[resourceId]?.usageByDay,
                        [timestamp.toLocaleDateString()]: (prev[resourceId]?.usageByDay?.[timestamp.toLocaleDateString()] || 0) + 1
                    }
                }
            }));

            console.log('Resource engagement tracked:', engagement);
        } catch (error) {
            console.error('Failed to track resource engagement:', error);
        }
    };

    const handleResourceAction = async (resourceId, action) => {
        const startTime = Date.now();
        let details = {
            startTime,
            sessionDuration: 0,
            scrollDepth: 0,
            interactionCount: 1
        };

        try {
            const resource = resources.find(r => r.id === resourceId);
            if (!resource) return;

            // Track basic usage
            await trackResourceUsage(courseId, moduleId, resourceId, action);

            // Update details based on action type
            if (action === 'view') {
                const win = window.open(resource.url, '_blank');
                if (win) {
                    const checkWindow = setInterval(() => {
                        if (win.closed) {
                            clearInterval(checkWindow);
                            details.sessionDuration = (Date.now() - startTime) / 1000;
                            trackResourceEngagement(resourceId, action, details);
                        }
                    }, 1000);
                }
            } else {
                trackResourceEngagement(resourceId, action, details);
            }

            // Update local state
            setResources(prev =>
                prev.map(r =>
                    r.id === resourceId
                        ? {
                              ...r,
                              [action === 'view' ? 'views' : 'downloads']:
                                  r[action === 'view' ? 'views' : 'downloads'] + 1
                          }
                        : r
                )
            );
        } catch (err) {
            console.error(`Failed to track ${action}:`, err);
        }
    };

    const filterAndSortResources = (items) => {
        let filtered = items;

        // Apply type filter
        if (resourceTypeFilter !== 'all') {
            filtered = filtered.filter(resource => resource.type === resourceTypeFilter);
        }

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(resource =>
                resource.title.toLowerCase().includes(searchLower) ||
                resource.description.toLowerCase().includes(searchLower) ||
                resource.topics?.some(topic => topic.toLowerCase().includes(searchLower))
            );
        }

        // Apply topic filter
        if (selectedTopics.length > 0) {
            filtered = filtered.filter(resource =>
                selectedTopics.every(topic => resource.topics?.includes(topic))
            );
        }

        // Sort resources
        return filtered.sort((a, b) => {
            let comparison = 0;
            switch (resourceSortBy) {
                case 'recent':
                    comparison = (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0);
                    break;
                case 'rating':
                    comparison = (b.averageRating || 0) - (a.averageRating || 0);
                    break;
                case 'usage':
                    const bUsage = (b.views || 0) + (b.downloads || 0);
                    const aUsage = (a.views || 0) + (a.downloads || 0);
                    comparison = bUsage - aUsage;
                    break;
                case 'title':
                    comparison = a.title.localeCompare(b.title);
                    break;
                default:
                    comparison = 0;
            }
            return resourceSortOrder === 'desc' ? comparison : -comparison;
        });
    };

    const toggleSortOrder = () => {
        setSortOrder(current => current === 'desc' ? 'asc' : 'desc');
    };

    const handlePreviewClose = () => {
        setSelectedResource(null);
    };

    const handleTopicSelect = (topic) => {
        setSelectedTopics(prev => {
            const newTopics = prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic];
            
            if (!prev.includes(topic)) {
                setTopicHistory(prevHistory => {
                    const newHistory = [
                        { topic, timestamp: new Date().toISOString() },
                        ...prevHistory.filter(h => h.topic !== topic)
                    ].slice(0, 10); // Keep last 10 topics
                    return newHistory;
                });
            }
            
            return newTopics;
        });
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedType('all');
        setSelectedTopics([]);
        setSortBy('date');
        setSortOrder('desc');
    };

    const getSortedTopics = () => {
        const filteredTopics = availableTopics.filter(topic =>
            topic.toLowerCase().includes(topicSearchTerm.toLowerCase())
        );

        switch (topicSortBy) {
            case 'count':
                return filteredTopics.sort((a, b) => topicCounts[b] - topicCounts[a]);
            case 'recent':
                // Sort by most recently used topics in resources
                return filteredTopics.sort((a, b) => {
                    const aResources = [...resources, ...recommendations].filter(r => r.topics?.includes(a));
                    const bResources = [...resources, ...recommendations].filter(r => r.topics?.includes(b));
                    const latestA = Math.max(...aResources.map(r => r.createdAt?.toDate() || 0));
                    const latestB = Math.max(...bResources.map(r => r.createdAt?.toDate() || 0));
                    return latestB - latestA;
                });
            case 'alphabetical':
            default:
                return filteredTopics.sort();
        }
    };

    const handleKeyDown = (e, topic) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                handleTopicSelect(topic);
                break;
            case 'ArrowRight':
                e.preventDefault();
                const topics = Object.values(topicGroups).flat();
                const currentIndex = topics.indexOf(topic);
                const nextTopic = topics[currentIndex + 1];
                if (nextTopic) {
                    setFocusedTopic(nextTopic);
                    document.getElementById(`topic-${nextTopic}`).focus();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                const allTopics = Object.values(topicGroups).flat();
                const currIndex = allTopics.indexOf(topic);
                const prevTopic = allTopics[currIndex - 1];
                if (prevTopic) {
                    setFocusedTopic(prevTopic);
                    document.getElementById(`topic-${prevTopic}`).focus();
                }
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const currentGroup = Object.entries(topicGroups).find(([_, groupTopics]) =>
                    groupTopics.includes(topic)
                )?.[0];
                if (currentGroup) {
                    const groupTopics = topicGroups[currentGroup];
                    const topicIndex = groupTopics.indexOf(topic);
                    const newIndex = e.key === 'ArrowUp' 
                        ? (topicIndex - 1 + groupTopics.length) % groupTopics.length
                        : (topicIndex + 1) % groupTopics.length;
                    const newTopic = groupTopics[newIndex];
                    setFocusedTopic(newTopic);
                    document.getElementById(`topic-${newTopic}`)?.focus();
                }
                break;
            case 'Tab':
                if (e.shiftKey) {
                    e.preventDefault();
                    const groups = Object.keys(topicGroups);
                    const currentGroup = Object.entries(topicGroups).find(([_, groupTopics]) =>
                        groupTopics.includes(topic)
                    )?.[0];
                    const currentIndex = groups.indexOf(currentGroup);
                    const prevIndex = (currentIndex - 1 + groups.length) % groups.length;
                    const prevGroup = groups[prevIndex];
                    if (!collapsedGroups.has(prevGroup) && topicGroups[prevGroup].length > 0) {
                        const newTopic = topicGroups[prevGroup][0];
                        setFocusedTopic(newTopic);
                        setFocusedGroup(prevGroup);
                        document.getElementById(`topic-${newTopic}`)?.focus();
                    }
                }
                break;
        }
        if (e.ctrlKey || e.metaKey) {
            const currentGroup = Object.entries(topicGroups).find(([_, groupTopics]) =>
                groupTopics.includes(topic)
            )?.[0];
            
            if (currentGroup) {
                switch (e.key.toLowerCase()) {
                    case 'a':
                        e.preventDefault();
                        handleSelectAllInGroup(currentGroup);
                        break;
                    case 'c':
                        e.preventDefault();
                        toggleGroupCollapse(currentGroup);
                        break;
                }
            }
        }
    };

    const handleGroupKeyDown = (e, category) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                toggleGroupCollapse(category);
                break;
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                const groups = Object.keys(topicGroups);
                const currentIndex = groups.indexOf(category);
                const newIndex = e.key === 'ArrowUp'
                    ? (currentIndex - 1 + groups.length) % groups.length
                    : (currentIndex + 1) % groups.length;
                const newGroup = groups[newIndex];
                setFocusedGroup(newGroup);
                document.getElementById(`group-${newGroup}`)?.focus();
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (collapsedGroups.has(category)) {
                    toggleGroupCollapse(category);
                } else if (topicGroups[category].length > 0) {
                    const firstTopic = topicGroups[category][0];
                    setFocusedTopic(firstTopic);
                    document.getElementById(`topic-${firstTopic}`)?.focus();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (!collapsedGroups.has(category)) {
                    toggleGroupCollapse(category);
                }
                break;
        }
    };

    const toggleGroupCollapse = (category) => {
        setCollapsedGroups(prev => {
            const newCollapsed = new Set(prev);
            if (newCollapsed.has(category)) {
                newCollapsed.delete(category);
            } else {
                newCollapsed.add(category);
            }
            return newCollapsed;
        });
    };

    const handleSelectAllInGroup = (category) => {
        const groupTopics = topicGroups[category];
        const allGroupTopicsSelected = groupTopics.every(topic => 
            selectedTopics.includes(topic)
        );

        if (allGroupTopicsSelected) {
            // Deselect all topics in the group
            setSelectedTopics(prev => 
                prev.filter(topic => !groupTopics.includes(topic))
            );
        } else {
            // Select all topics in the group
            setSelectedTopics(prev => {
                const newTopics = new Set([...prev]);
                groupTopics.forEach(topic => newTopics.add(topic));
                return Array.from(newTopics);
            });
        }
    };

    const toggleAllGroups = () => {
        setAllGroupsCollapsed(prev => {
            const newState = !prev;
            if (newState) {
                setCollapsedGroups(new Set(Object.keys(topicGroups)));
            } else {
                setCollapsedGroups(new Set());
            }
            return newState;
        });
    };

    const handleDragStart = (e, category) => {
        setDraggedGroup(category);
        e.currentTarget.classList.add('opacity-50');
    };

    const handleDragEnd = (e) => {
        e.currentTarget.classList.remove('opacity-50');
        setDraggedGroup(null);
        setDragOverGroup(null);
    };

    const handleDragOver = (e, category) => {
        e.preventDefault();
        if (category !== draggedGroup) {
            setDragOverGroup(category);
        }
    };

    const handleDrop = (e, category) => {
        e.preventDefault();
        if (draggedGroup === category) return;

        setGroupOrder(prevOrder => {
            const newOrder = [...prevOrder];
            const draggedIndex = newOrder.indexOf(draggedGroup);
            const dropIndex = newOrder.indexOf(category);
            newOrder.splice(draggedIndex, 1);
            newOrder.splice(dropIndex, 0, draggedGroup);
            return newOrder;
        });
    };

    // Track search history
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setTopicSearchTerm(value);

        if (value.trim() && !recentSearches.includes(value.trim())) {
            setRecentSearches(prev => [value.trim(), ...prev].slice(0, 5));
        }
    };

    const handleSearchHistoryClick = (term) => {
        setTopicSearchTerm(term);
        setShowSearchHistory(false);
    };

    const clearSearchHistory = () => {
        setRecentSearches([]);
        localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
    };

    const toggleFavoriteTopic = (topic) => {
        setFavoriteTopics(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(topic)) {
                newFavorites.delete(topic);
            } else {
                newFavorites.add(topic);
            }
            return newFavorites;
        });
    };

    const renderTopicHistory = () => {
        if (topicHistory.length === 0) return null;

        return (
            <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Recently Used Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                    {topicHistory.map(({ topic, timestamp }) => (
                        <button
                            key={topic}
                            onClick={() => handleTopicSelect(topic)}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                selectedTopics.includes(topic)
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            } hover:opacity-80 transition-all duration-200`}
                            title={`Last used: ${new Date(timestamp).toLocaleDateString()}`}
                        >
                            <Star className="h-3 w-3 mr-1" />
                            <span>{topic.includes('/') ? topic.split('/')[1] : topic}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderSearchInput = () => (
        <div className="relative">
            <div className="flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search topics..."
                    value={topicSearchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSearchHistory(true)}
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
                {recentSearches.length > 0 && (
                    <button
                        onClick={() => setShowSearchHistory(!showSearchHistory)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        <History className="h-4 w-4 text-gray-400" />
                    </button>
                )}
            </div>
            {showSearchHistory && recentSearches.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg">
                    <div className="p-2 border-b dark:border-gray-700 flex justify-between items-center">
                        <span className="text-sm text-gray-500">Recent Searches</span>
                        <button
                            onClick={clearSearchHistory}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                            Clear History
                        </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {recentSearches.map((term, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearchHistoryClick(term)}
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                                <History className="h-4 w-4 text-gray-400" />
                                <span>{term}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderFavoriteTopics = () => {
        if (favoriteTopics.size === 0) return null;

        return (
            <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Favorite Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                    {Array.from(favoriteTopics).map(topic => (
                        <button
                            key={topic}
                            onClick={() => handleTopicSelect(topic)}
                            className={`flex items-center px-3 py-1 rounded-full text-sm ${
                                selectedTopics.includes(topic)
                                    ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                                    : 'bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            } hover:opacity-80 transition-all duration-200`}
                        >
                            <Heart className="h-3 w-3 mr-1 fill-current" />
                            <span>{topic.includes('/') ? topic.split('/')[1] : topic}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderTopicSuggestions = () => {
        if (suggestedTopics.length === 0 || !showSuggestions) return null;

        return (
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Suggested Topics
                    </h4>
                    <button
                        onClick={() => setShowSuggestions(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        Hide suggestions
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map(topic => (
                        <div key={topic} className="flex items-center">
                            <button
                                onClick={() => handleTopicSelect(topic)}
                                className="flex items-center px-3 py-1 rounded-l-full text-sm bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:opacity-80 transition-all duration-200"
                            >
                                <Tag className="h-3 w-3 mr-1" />
                                <span>{topic.includes('/') ? topic.split('/')[1] : topic}</span>
                            </button>
                            <button
                                onClick={() => toggleFavoriteTopic(topic)}
                                className={`px-2 py-1 rounded-r-full text-sm border-l ${
                                    favoriteTopics.has(topic)
                                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                                        : 'bg-gray-50 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                } hover:opacity-80 transition-all duration-200`}
                                title={favoriteTopics.has(topic) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Heart className={`h-3 w-3 ${favoriteTopics.has(topic) ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTopicButton = (topic) => (
        <div key={topic} className="flex items-center">
            <button
                id={`topic-${topic}`}
                onClick={() => handleTopicSelect(topic)}
                onKeyDown={(e) => handleKeyDown(e, topic)}
                onFocus={() => setFocusedTopic(topic)}
                className={`flex items-center px-3 py-1 rounded-l-full text-sm transform transition-all duration-200 ${
                    selectedTopics.includes(topic)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 scale-105'
                        : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 border dark:border-gray-600'
                } hover:opacity-80 group focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                tabIndex={0}
                role="checkbox"
                aria-checked={selectedTopics.includes(topic)}
            >
                <Tag className={`h-3 w-3 mr-1 transition-transform duration-200 ${
                    selectedTopics.includes(topic) ? 'rotate-12' : ''
                }`} />
                <span>{topic.includes('/') ? topic.split('/')[1] : topic}</span>
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs transition-colors duration-200 ${
                    selectedTopics.includes(topic)
                        ? 'bg-blue-200 dark:bg-blue-800'
                        : 'bg-gray-100 dark:bg-gray-600'
                }`}>
                    {topicCounts[topic] || 0}
                </span>
            </button>
            <button
                onClick={() => toggleFavoriteTopic(topic)}
                className={`px-2 py-1 rounded-r-full text-sm border-l ${
                    favoriteTopics.has(topic)
                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                        : 'bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 border dark:border-gray-600'
                } hover:opacity-80 transition-all duration-200`}
                title={favoriteTopics.has(topic) ? 'Remove from favorites' : 'Add to favorites'}
            >
                <Heart className={`h-3 w-3 ${favoriteTopics.has(topic) ? 'fill-current' : ''}`} />
            </button>
        </div>
    );

    // Update the topic rendering in groups
    const renderTopicGroup = (category, topics) => {
        const filteredTopics = topics.filter(topic =>
            topic.toLowerCase().includes(topicSearchTerm.toLowerCase())
        );

        if (filteredTopics.length === 0) return null;

        const isCollapsed = collapsedGroups.has(category);
        const allGroupTopicsSelected = topics.every(topic => 
            selectedTopics.includes(topic)
        );

        return (
            <div
                key={category}
                className={`space-y-2 ${
                    dragOverGroup === category ? 'border-t-2 border-blue-500' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, category)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, category)}
                onDrop={(e) => handleDrop(e, category)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            className="p-1 cursor-grab hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Drag to reorder"
                        >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                        </button>
                        <button
                            id={`group-${category}`}
                            onClick={() => toggleGroupCollapse(category)}
                            onKeyDown={(e) => handleGroupKeyDown(e, category)}
                            onFocus={() => setFocusedGroup(category)}
                            className={`flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 ${
                                focusedGroup === category ? 'bg-gray-100 dark:bg-gray-700' : ''
                            }`}
                            tabIndex={0}
                            role="button"
                            aria-expanded={!isCollapsed}
                        >
                            <span className="transform transition-transform duration-200">
                                {isCollapsed ? '▶' : '▼'}
                            </span>
                            <span>{category}</span>
                            <span className="text-xs text-gray-400">
                                ({filteredTopics.length})
                            </span>
                        </button>
                    </div>
                    <button
                        onClick={() => handleSelectAllInGroup(category)}
                        className={`text-xs px-2 py-1 rounded ${
                            allGroupTopicsSelected
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        } hover:opacity-80 transition-opacity`}
                    >
                        {allGroupTopicsSelected ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div
                    className={`transition-all duration-200 ease-in-out ${
                        isCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'
                    }`}
                >
                    {!isCollapsed && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {filteredTopics.map(topic => renderTopicButton(topic))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Update the topic groups rendering in renderTopicFilters
    const renderTopicGroups = () => (
        <div className="space-y-4">
            {groupOrder.map(category => renderTopicGroup(category, topicGroups[category] || []))}
            {Object.values(topicGroups).flat().filter(topic =>
                topic.toLowerCase().includes(topicSearchTerm.toLowerCase())
            ).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
                    No topics match your search.
                </p>
            )}
        </div>
    );

    // Update renderTopicFilters to use the new renderTopicGroups
    const renderTopicFilters = () => (
        <div className="space-y-4 mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Topics</h3>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleAllGroups}
                        className="text-sm px-2 py-1 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {allGroupsCollapsed ? 'Expand All' : 'Collapse All'}
                    </button>
                    <select
                        value={topicSortBy}
                        onChange={(e) => setTopicSortBy(e.target.value)}
                        className="text-sm px-2 py-1 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                    >
                        <option value="alphabetical">Sort A-Z</option>
                        <option value="count">Sort by Count</option>
                        <option value="recent">Sort by Recent</option>
                    </select>
                    {(selectedTopics.length > 0 || searchTerm || selectedType !== 'all') && (
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Keyboard shortcuts: Ctrl/⌘ + A to select all in group, Ctrl/⌘ + C to collapse/expand group
                <br />
                Use Tab and Arrow keys to navigate between groups and topics
            </div>

            {renderFavoriteTopics()}
            {renderTopicSuggestions()}
            {renderTopicHistory()}
            {renderSearchInput()}
            {renderTopicGroups()}

            {selectedTopics.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filterAndSortResources([...resources, ...recommendations]).length} resources match selected topics
                </div>
            )}
        </div>
    );

    const renderResourceCard = (resource, isRecommended = false, key) => {
        const analytics = resourceAnalytics[resource.id] || {};
        const recentUsage = analytics.usageByDay?.[new Date().toLocaleDateString()] || 0;

        return (
            <div
                key={key}
                className={`p-4 border rounded-lg ${
                    isRecommended ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                } dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => setSelectedResource(resource)}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <ResourceTypeIcon type={resource.type} />
                        <div>
                            <h3 className="font-medium">{resource.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {resource.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {resource.topics?.map(topic => (
                                    <span
                                        key={`${resource.id}-${topic}`}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {topic}
                                    </span>
                                ))}
                            </div>
                            {isRecommended && (
                                <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {resource.relevance}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => {
                                handleResourceAction(resource.id, 'view');
                                window.open(resource.url, '_blank');
                            }}
                            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            title="View"
                        >
                            <Eye className="h-4 w-4" />
                        </button>
                        {resource.downloadUrl && (
                            <button
                                onClick={() => {
                                    handleResourceAction(resource.id, 'download');
                                    window.open(resource.downloadUrl, '_blank');
                                }}
                                className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                title="Download"
                            >
                                <Download className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {resource.views} views
                    </span>
                    {resource.downloadUrl && (
                        <span className="flex items-center">
                            <Download className="h-4 w-4 mr-1" />
                            {resource.downloads} downloads
                        </span>
                    )}
                    <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {resource.duration || 'N/A'}
                    </span>
                    {analytics.averageRating > 0 && (
                        <span className="flex items-center">
                            <Star className="h-4 w-4 mr-1 fill-yellow-400" />
                            {analytics.averageRating.toFixed(1)}
                        </span>
                    )}
                    {recentUsage > 0 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {recentUsage} uses today
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderSearchAndFilters = () => (
        <div className="flex flex-col space-y-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
            </div>
            
            <div className="flex flex-wrap gap-4">
                <select
                    value={resourceTypeFilter}
                    onChange={(e) => setResourceTypeFilter(e.target.value)}
                    className="px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                    <option value="all">All Resource Types</option>
                    {Object.entries(RESOURCE_TYPES).map(([key, value]) => (
                        <option key={value} value={value}>
                            {key.split('_').map(word => 
                                word.charAt(0) + word.slice(1).toLowerCase()
                            ).join(' ')}
                        </option>
                    ))}
                </select>

                <select
                    value={resourceSortBy}
                    onChange={(e) => setResourceSortBy(e.target.value)}
                    className="px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                >
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rated</option>
                    <option value="usage">Most Used</option>
                    <option value="title">Title</option>
                </select>

                <button
                    onClick={() => setResourceSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    {resourceSortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                    ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                    )}
                    {resourceSortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>

                {(searchTerm || resourceTypeFilter !== 'all' || selectedTopics.length > 0) && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setResourceTypeFilter('all');
                            setSelectedTopics([]);
                            setResourceSortBy('recent');
                            setResourceSortOrder('desc');
                        }}
                        className="px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear all filters
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {renderSearchAndFilters()}
            {availableTopics.length > 0 && renderTopicFilters()}

            {recommendations.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">Recommended Resources</h2>
                    <div className="grid gap-4 grid-cols-1">
                        {filterAndSortResources(recommendations).map(resource => 
                            renderResourceCard(resource, true, `rec-${resource.id}`)
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-lg font-medium">Module Resources</h2>
                <div className="grid gap-4 grid-cols-1">
                    {filterAndSortResources(resources).map(resource => 
                        renderResourceCard(resource, false, `res-${resource.id}`)
                    )}
                </div>
                {resources.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No resources available for this module yet.
                    </p>
                ) : filterAndSortResources(resources).length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No resources match your search criteria.
                    </p>
                )}
            </div>

            {selectedResource && (
                <ResourcePreview
                    resource={selectedResource}
                    onClose={handlePreviewClose}
                    onAction={handleResourceAction}
                    courseId={courseId}
                    moduleId={moduleId}
                />
            )}
        </div>
    );
};

export default StudyResources; 