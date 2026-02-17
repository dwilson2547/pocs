import EmbeddedPostgres from 'embedded-postgres';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';

async function main() {
    // Clean up existing data directory if it exists
    if (existsSync('./data')) {
        console.log('Cleaning up existing data directory...');
        await rm('./data', { recursive: true, force: true });
        // Wait a bit to ensure filesystem cleanup is complete
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Create the object - using non-persistent for easier testing
    const pg = new EmbeddedPostgres({
        databaseDir: '/home/daniel/documents/workspace/emdeded-postgres-test/data/db',
        user: 'postgres',
        password: 'password',
        port: 6543,
        persistent: false, // Changed to false for easier cleanup
        initdbFlags: ['--debug'], // Enable debug logging for initdb
        onError: (err) => {
            console.error('PostgreSQL Error:', err);
        },
        onLog: (msg) => {
            console.log('PostgreSQL Log:', msg);
        }
    });

    try {
        // Create the cluster config files
        console.log('Initializing PostgreSQL...');
        await pg.initialise();

        // Start the server
        console.log('Starting PostgreSQL server...');
        await pg.start();

        // Create and/or drop database
        console.log('Creating test database...');
        await pg.createDatabase('TEST');
        
        console.log('Dropping test database...');
        await pg.dropDatabase('TEST');

        // Initialize a node-postgres client
        console.log('Querying databases...');
        const client = pg.getPgClient();
        await client.connect();
        const result = await client.query('SELECT datname FROM pg_database');
        console.log('Available databases:', result.rows.map(row => row.datname));
        await client.end();

        // Stop the server
        console.log('Stopping PostgreSQL server...');
        await pg.stop();
        
        console.log('Test completed successfully!');
    } catch (error) {
        console.error('Error:', error);
        try {
            await pg.stop();
        } catch (stopError) {
            // Ignore stop errors
        }
        process.exit(1);
    }
}

main();
