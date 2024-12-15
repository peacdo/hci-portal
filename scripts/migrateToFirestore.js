import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import resources from '../data/resources';

const migrateToFirestore = async () => {
    try {
        // First, clear existing data
        console.log('Clearing existing data...');
        const weeksSnapshot = await getDocs(collection(db, 'weeks'));
        const materialsSnapshot = await getDocs(collection(db, 'materials'));

        const deletePromises = [
            ...weeksSnapshot.docs.map(doc => deleteDoc(doc.ref)),
            ...materialsSnapshot.docs.map(doc => deleteDoc(doc.ref))
        ];
        await Promise.all(deletePromises);

        // Migrate weeks
        console.log('Migrating weeks...');
        for (const resource of resources) {
            const weekId = resource.week.toString();
            await setDoc(doc(db, 'weeks', weekId), {
                title: resource.title,
                keywords: resource.keywords || [],
                order: typeof resource.week === 'number' ? resource.week : 999,
                createdAt: new Date().toISOString()
            });

            // Migrate materials for this week
            console.log(`Migrating materials for week ${weekId}...`);
            for (let i = 0; i < resource.materials.length; i++) {
                const material = resource.materials[i];
                await setDoc(doc(collection(db, 'materials')), {
                    weekId,
                    title: material.title,
                    type: material.type,
                    viewLink: material.viewLink,
                    downloadLink: material.downloadLink,
                    order: i,
                    progress: false,
                    createdAt: new Date().toISOString()
                });
            }
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

export default migrateToFirestore;