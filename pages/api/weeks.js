import { getGitHubFile, updateGitHubFile } from '../../lib/githubUtils';

const initialWeeks = [
    {
        id: '1',
        weekNumber: 1,
        title: 'Introduction to Human-Computer Interaction',
        description: 'Overview of HCI principles and fundamentals',
        createdAt: '2024-02-17T00:00:00.000Z',
        updatedAt: '2024-02-17T00:00:00.000Z'
    },
    {
        id: '2',
        weekNumber: 2,
        title: 'User Research and Analysis',
        description: 'Understanding user needs and research methodologies',
        createdAt: '2024-02-17T00:00:00.000Z',
        updatedAt: '2024-02-17T00:00:00.000Z'
    }
];

export default async function handler(req, res) {
    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                let weeksList = await getGitHubFile('weeks.json');
                
                // If weeks.json doesn't exist, create it with initial data
                if (!weeksList) {
                    await updateGitHubFile('weeks.json', initialWeeks);
                    weeksList = initialWeeks;
                }
                
                return res.status(200).json(weeksList);

            case 'POST':
                const { title, description, weekNumber } = req.body;
                
                if (!title) {
                    return res.status(400).json({ error: 'Title is required' });
                }

                const existingWeeks = await getGitHubFile('weeks.json') || [];
                const newWeek = {
                    id: Date.now().toString(),
                    title,
                    description,
                    weekNumber,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const updatedWeeks = [...existingWeeks, newWeek];
                await updateGitHubFile('weeks.json', updatedWeeks);
                
                return res.status(201).json(newWeek);

            case 'PUT':
                const weekId = req.query.id;
                if (!weekId) {
                    return res.status(400).json({ error: 'Week ID is required' });
                }

                const weekData = req.body;
                if (!weekData.title) {
                    return res.status(400).json({ error: 'Title is required' });
                }

                const currentWeeks = await getGitHubFile('weeks.json') || [];
                const weekIndex = currentWeeks.findIndex(w => w.id === weekId);

                if (weekIndex === -1) {
                    return res.status(404).json({ error: 'Week not found' });
                }

                const updatedWeeksList = currentWeeks.map(week =>
                    week.id === weekId ? { 
                        ...week, 
                        ...weekData, 
                        updatedAt: new Date().toISOString() 
                    } : week
                );

                await updateGitHubFile('weeks.json', updatedWeeksList);
                return res.status(200).json(updatedWeeksList[weekIndex]);

            case 'DELETE':
                const deleteId = req.query.id;
                if (!deleteId) {
                    return res.status(400).json({ error: 'Week ID is required' });
                }

                const existingWeeksList = await getGitHubFile('weeks.json') || [];
                const filteredWeeks = existingWeeksList.filter(w => w.id !== deleteId);

                if (existingWeeksList.length === filteredWeeks.length) {
                    return res.status(404).json({ error: 'Week not found' });
                }

                await updateGitHubFile('weeks.json', filteredWeeks);
                return res.status(200).json({ message: 'Week deleted successfully' });

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 