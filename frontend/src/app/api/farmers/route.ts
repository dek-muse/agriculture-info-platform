import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const dataFilePath = path.join(process.cwd(), 'data', 'data.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const farmers = JSON.parse(data);
    return NextResponse.json(farmers);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newFarmer = await request.json();

    // const data = await fs.readFile(dataFilePath, 'utf-8').catch(() => '[]');
    const data = await fs.readFile(dataFilePath, 'utf-8').catch(async () => {
      await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
      await fs.writeFile(dataFilePath, '[]');
      return '[]';
    });
    const farmers = JSON.parse(data);


    farmers.push(newFarmer);

    await fs.writeFile(dataFilePath, JSON.stringify(farmers, null, 2));

    return NextResponse.json({ message: 'Farmer registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save farmer data' }, { status: 500 });
  }
}
