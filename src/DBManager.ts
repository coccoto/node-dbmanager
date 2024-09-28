import mysql from 'mysql2/promise'
import { logger } from '@coccoto/node-logmanager'
import dotenv from 'dotenv'
import fs from 'fs';

dotenv.config()

export class DBManager {

    private db: mysql.Connection | null = null

    async connect(): Promise<void> {
        try {
            if (this.db !== null) {
                return
            }

            if (! process.env['DB_HOST'] || ! process.env['DB_USER'] || ! process.env['DB_PASSWORD'] || ! process.env['DB_DATABASE']) {
                throw new Error('The .env file is not configured.')
            }

            const config: mysql.ConnectionOptions = {
                host: process.env['DB_HOST'],
                user: process.env['DB_USER'],
                password: process.env['DB_PASSWORD'],
                database: process.env['DB_DATABASE'],

            }
            this.db = await mysql.createConnection(config)

            logger.info(`Connection to the database was successful. Host: ${process.env['DB_HOST']} User: ${process.env['DB_USER']} Database: ${process.env['DB_DATABASE']}`);
            return

        } catch (error: unknown) {
            logger.error('Failed to connect to database. Error: ' + (error as Error).message)
            throw error
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.db === null) {
                throw new Error('No active database connection to disconnect.')
            }
            await this.db.end()

        } catch (error: unknown) {
            logger.error('Failed to disconnect from the database. Error: ' + (error as Error).message)
            throw error

        } finally {
            this.db = null
        }
    }

    async select<T>(query: string): Promise<T[]> {
        try {
            if (this.db === null) {
                throw new Error('Database connection is not established.')
            }
            const [rows] = await this.db.execute<mysql.RowDataPacket[]>(query)
            return rows as T[]

        } catch (error: unknown) {
            logger.error('Failed to execute the SELECT. Error: ' + (error as Error).message)
            throw error
        }
    }

    async readFile(filePath: string): Promise<string> {
        try {
            const data = fs.readFileSync(filePath, 'utf8')
            return data
        } catch (error) {
            logger.error(`Failed to read the file at path: "${filePath}". Error: ${(error as Error).message}`)
            throw error
        }
    }
}

