import { promises as fs } from 'fs';
import path from 'path';
import Notice from '@/components/notice';

export default async function NoticePage() {
    const filePath = path.join(process.cwd(), 'public', 'README.md');
    const fileContents = await fs.readFile(filePath, 'utf-8');

    return <Notice content={fileContents} />;
}