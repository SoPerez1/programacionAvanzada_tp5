

import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/tasks', async (req, res) => {
    try {
        const { status } = req.query
        const result = status
            ? await pool.query('SELECT * FROM tasks WHERE status = $1 ORDER BY id', [status])
            : await pool.query('SELECT * FROM tasks ORDER BY id')
        res.json(result.rows)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.post('/tasks', async (req, res) => {
    try {
        const { 
            project_name, activity_type, status, summary, 
            description, priority, reporter, assignee, 
            precondition, closed_at, sprint 
        } = req.body

        if (!project_name) {
            return res.status(400).json({ error: 'project_name is required' })
        }

        const result = await pool.query(
            `INSERT INTO tasks (
                project_name, activity_type, status, summary, 
                description, priority, reporter, assignee, 
                precondition, closed_at, sprint
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                project_name, activity_type || null, status || 'Pendiente', 
                summary || null, description || null, priority || null, 
                reporter || null, assignee || null, precondition || null, 
                closed_at || null, sprint || null
            ]
        )

        res.status(201).json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PUT /tasks/:id - Actualizar una tarea existente
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params
        let { 
            project_name, activity_type, status, summary, 
            description, priority, reporter, assignee, 
            precondition, closed_at, sprint 
        } = req.body

        closed_at = closed_at === '' ? null : closed_at;
        activity_type = activity_type === '' ? null : activity_type;
        summary = summary === '' ? null : summary;
        description = description === '' ? null : description;
        priority = priority === '' ? null : priority;
        reporter = reporter === '' ? null : reporter;
        assignee = assignee === '' ? null : assignee;
        precondition = precondition === '' ? null : precondition;
        sprint = sprint === '' ? null : sprint;

        const result = await pool.query(
            `UPDATE tasks
             SET project_name = COALESCE($1, project_name),
                 activity_type = $2,
                 status = COALESCE($3, status),
                 summary = $4,
                 description = $5,
                 priority = $6,
                 reporter = $7,
                 assignee = $8,
                 precondition = $9,
                 closed_at = $10,
                 sprint = $11,
                 updated_at = NOW()
             WHERE id = $12
             RETURNING *`,
            [
                project_name, activity_type, status, summary, 
                description, priority, reporter, assignee, 
                precondition, closed_at, sprint, id
            ]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json(result.rows[0])
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.status(204).send()
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`)
    console.log(`📝 API endpoints available at /tasks`)
})
