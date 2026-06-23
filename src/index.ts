import { eq } from 'drizzle-orm';
// Make sure the db import is correct. Assuming it's in './db.ts'
import { db, pool } from './db'; 
// Import the departments schema you created
import { departments } from './db/schema/app';
import express from 'express';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, welcome to classroom API');
});

async function main() {
  try {
    console.log('Performing CRUD operations on departments table...');

    // CREATE: Insert a new department
    const [newDepartment] = await db
      .insert(departments)
      .values({ code: 'MATH' })
      .returning();

    if (!newDepartment) {
      throw new Error('Failed to create department');
    }
    
    console.log('✅ CREATE: New department created:', newDepartment);

    // READ: Select the department
    const foundDepartment = await db.select().from(departments).where(eq(departments.id, newDepartment.id));
    console.log('✅ READ: Found department:', foundDepartment[0]);

    // UPDATE: Change the department's code
    const [updatedDepartment] = await db
      .update(departments)
      .set({ code: 'SCI' })
      .where(eq(departments.id, newDepartment.id))
      .returning();
    
    if (!updatedDepartment) {
      throw new Error('Failed to update department');
    }
    
    console.log('✅ UPDATE: Department updated:', updatedDepartment);

    // DELETE: Remove the department
    await db.delete(departments).where(eq(departments.id, newDepartment.id));
    console.log('✅ DELETE: Department deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    throw error;
  }
}

let server: ReturnType<typeof app.listen>;

async function bootstrap() {
  await main();
  server = app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
  });
}

bootstrap().catch(async (error) => {
  console.error('Startup failed:', error);
  if (pool) {
    await pool.end().catch(() => undefined);
  }
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    console.log('HTTP server closed.');
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
