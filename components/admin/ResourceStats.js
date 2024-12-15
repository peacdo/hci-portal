// components/admin/ResourceStats.js
import { BarChart2, FileText, File } from 'lucide-react';
import { useResources } from '../../contexts/ResourceContext';

const ResourceStats = () => {
    const { resources, loading } = useResources();

    if (loading) return <div>Loading stats...</div>;

    // Calculate stats directly from resources
    const stats = {
        total: resources.reduce((sum, week) => sum + week.materials.length, 0),
        pdf: resources.reduce((sum, week) =>
            sum + week.materials.filter(m => m.type === 'pdf').length, 0),
        docx: resources.reduce((sum, week) =>
            sum + week.materials.filter(m => m.type === 'docx').length, 0),
        byWeek: Object.fromEntries(
            resources.map(week => [
                week.week,
                {
                    total: week.materials.length,
                    pdf: week.materials.filter(m => m.type === 'pdf').length,
                    docx: week.materials.filter(m => m.type === 'docx').length
                }
            ])
        )
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <BarChart2 className="h-10 w-10 text-blue-500" />
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold">Total Resources</h3>
                        <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <FileText className="h-10 w-10 text-red-500" />
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold">PDF Documents</h3>
                        <p className="text-3xl font-bold">{stats.pdf}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                    <File className="h-10 w-10 text-green-500" />
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold">DOCX Documents</h3>
                        <p className="text-3xl font-bold">{stats.docx}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourceStats;