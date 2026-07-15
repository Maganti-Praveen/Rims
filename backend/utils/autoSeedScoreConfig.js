const ScoreConfig = require('../models/ScoreConfig');

const defaultScoreConfigs = [
    // Publications
    { category: 'publication', subCategory: 'SCI Journal', points: 10, description: 'SCI / SCIE indexed journal publications' },
    { category: 'publication', subCategory: 'Scopus Journal', points: 8, description: 'Scopus indexed journal publications' },
    { category: 'publication', subCategory: 'UGC Care Journal', points: 5, description: 'UGC CARE list journal publications' },
    { category: 'publication', subCategory: 'Book Publication', points: 15, description: 'Published text books or reference books' },
    { category: 'publication', subCategory: 'Book Chapter', points: 5, description: 'Chapters published in edited books' },
    { category: 'publication', subCategory: 'Conference Proceeding', points: 4, description: 'Papers published in Scopus/IEEE conferences' },
    { category: 'publication', subCategory: 'Other', points: 2, description: 'Other non-indexed publications' },

    // Patents
    { category: 'patent', subCategory: 'Granted', points: 20, description: 'Patents granted by patent office' },
    { category: 'patent', subCategory: 'Published', points: 10, description: 'Patents published in official journal' },
    { category: 'patent', subCategory: 'Filed', points: 5, description: 'Patents filed with patent office' },

    // Workshops / FDPs
    { category: 'workshop', subCategory: 'Organized', points: 10, description: 'Workshops/FDPs organized as coordinator' },
    { category: 'workshop', subCategory: 'Attended', points: 3, description: 'Workshops/FDPs attended (min 3 days)' },

    // Seminars / Guest Lectures
    { category: 'seminar', subCategory: 'Organized', points: 5, description: 'Seminars/webinars organized' },
    { category: 'seminar', subCategory: 'Resource Person', points: 8, description: 'Invited as speaker/resource person' },
    { category: 'seminar', subCategory: 'Attended', points: 2, description: 'Seminars/webinars attended' },

    // Certifications
    { category: 'certification', subCategory: 'NPTEL / SWAYAM', points: 5, description: 'NPTEL elite or gold certifications' },
    { category: 'certification', subCategory: 'Global Certification', points: 5, description: 'AWS, Oracle, Cisco, Coursera, etc.' },
    { category: 'certification', subCategory: 'Other', points: 2, description: 'Other technical certifications' },
];

const autoSeedScoreConfig = async () => {
    try {
        const count = await ScoreConfig.countDocuments();
        if (count === 0) {
            await ScoreConfig.insertMany(defaultScoreConfigs);
            console.log(`[ScoreConfig] Seeded ${defaultScoreConfigs.length} default score settings.`);
        }
    } catch (err) {
        console.error('[ScoreConfig] Auto-seed error:', err.message);
    }
};

module.exports = autoSeedScoreConfig;
