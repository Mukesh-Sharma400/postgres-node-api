import { Pool } from 'pg';
import { User } from '../models/userModel';
import { Request, Response } from 'express';

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "postgres",
    port: 5432,
})

// Function to handle errors
const handleError = (res: Response, error: Error) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
};

// GET all users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM example_table');
        const users: User[] = result.rows;
        client.release();
        res.json(users);
    } catch (error) {
        handleError(res, error as Error);
    }
};

// GET user by ID
export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM example_table WHERE id = $1', [id]);
        const user: User = result.rows[0];
        client.release();
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        handleError(res, error as Error);
    }
};

// CREATE new user
export const createUser = async (req: Request, res: Response) => {
    const { name, age, email } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO example_table (name, age, email) VALUES ($1, $2, $3) RETURNING *', [name, age, email]);
        const newUser: User = result.rows[0];
        client.release();
        res.status(201).json(newUser);
    } catch (error) {
        handleError(res, error as Error);
    }
};

// UPDATE user by ID
export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, age, email } = req.body;
    try {
        const client = await pool.connect();
        const result = await client.query('UPDATE example_table SET name = $1, age = $2, email = $3 WHERE id = $4 RETURNING *', [name, age, email, id]);
        const updatedUser: User = result.rows[0];
        client.release();
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        handleError(res, error as Error);
    }
};

// DELETE user by ID
export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        await client.query('DELETE FROM example_table WHERE id = $1', [id]);
        client.release();
        res.status(204).send();
    } catch (error) {
        handleError(res, error as Error);
    }
};