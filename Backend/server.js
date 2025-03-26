const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create an Express app (Global Variables)
const app = express();
const port = 3000;

//Cors 
const cors = require('cors');
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'todo_db',
    password: 'Monstermind5669',
    port: 5432,
});

// Middleware
app.use(bodyParser.json());

// API endpoints

//To display all the tasks
app.get('/tasks', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
});

//To add a new task
app.post('/tasks', async (req, res) => {
    const { task } = req.body;
    const result = await pool.query('INSERT INTO tasks (name) VALUES ($1) RETURNING *', [task]);
    res.json(result.rows[0]);
});

//To delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params; // Extract the task ID from the URL
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found'); // If no task exists with the given ID
        }
        res.status(200).send('Task deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting task'); // Internal server error
    }
});

//To update a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params; // Extract the task ID from the request parameters
    const { task } = req.body; // Extract the updated task text from the request body

    if (!task || task.trim() === '') {
        return res.status(400).send('Task content cannot be empty'); // Validate input
    }

    try {
        const result = await pool.query(
            'UPDATE tasks SET name = $1 WHERE id = $2 RETURNING *',
            [task.trim(), id]
        );

        if (result.rowCount === 0) {
            return res.status(404).send('Task not found'); // Handle case when task ID does not exist
        }

        res.status(200).json(result.rows[0]); // Send the updated task back as the response
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).send('An error occurred while updating the task'); // Handle unexpected errors
    }
});


//To check the status of the task
app.put('/tasks/:id/status', async (req, res) => {
    const { id } = req.params; // Task ID from URL
    const { status } = req.body; // New status (0 or 1)
    try {
        const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        if (result.rowCount === 0) {
            return res.status(404).send('Task not found');
        }
        res.status(200).json(result.rows[0]); // Return the updated task
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating task status');
    }
});

//To Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});