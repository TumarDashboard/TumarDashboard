const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function cleanupDuplicates() {
    try {
        let uri;
        const envPath = path.resolve(__dirname, '../.env.local');
        
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            // Более надежный поиск: ищем строку, начинающуюся с ключа, игнорируя пробелы
            const match = envContent.match(/NEXT_PRIVATE_MONGODB_URI\s*=\s*["']?([^"'\r\n\s]+)/);
            if (match) {
                uri = match[1];
            }
        }

        if (!uri) {
            throw new Error('NEXT_PRIVATE_MONGODB_URI not found in .env.local');
        }

        console.log('Connecting to MongoDB...');
        // Очищаем URI на всякий случай еще раз
        const cleanUri = uri.trim();
        
        await mongoose.connect(cleanUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected successfully');

        const ProtectedObjectSchema = new mongoose.Schema({
            number: String,
            name: String
        }, { timestamps: true });

        const ProtectedObject = mongoose.models.ProtectedObjects || mongoose.model('ProtectedObjects', ProtectedObjectSchema);

        const allObjects = await ProtectedObject.find({}).lean();
        console.log(`Total objects scanned: ${allObjects.length}`);

        const seenNumbers = new Map();
        const idsToRemove = [];

        // Сортируем по updatedAt DESC (оставляем самые новые записи)
        allObjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        for (const obj of allObjects) {
            if (!obj.number) continue;
            const num = String(obj.number);
            if (seenNumbers.has(num)) {
                idsToRemove.push(obj._id);
            } else {
                seenNumbers.set(num, obj._id);
            }
        }

        console.log(`Unique numbers found: ${seenNumbers.size}`);
        console.log(`Duplicates to purge: ${idsToRemove.length}`);

        if (idsToRemove.length > 0) {
            const result = await ProtectedObject.deleteMany({ _id: { $in: idsToRemove } });
            console.log(`SUCCESS: Deleted ${result.deletedCount} duplicate entries.`);
        } else {
            console.log('No duplicates found.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR during cleanup:', error.message);
        process.exit(1);
    }
}

cleanupDuplicates();
