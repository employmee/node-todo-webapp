const express = require('express')
const router = new express.Router()
const Task = require('../models/task')

// CREATE task
router.post('/tasks', async (req, res) => {
  try {
    const task = await new Task(req.body)
    if (task.save()) {
      res.status(201).send(task)
    }
  } catch (error) {
    res.status(400).send(error)
  }
})

// CREATE many tasks
router.post('/tasks_bulk', async (req, res) => {
  try {
    const tasks = await Task.insertMany(req.body)
    res.status(201).send(tasks)
  } catch (error) {
    res.status(400).send(error)
  }
})

// GET task
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch {
    res.status(500).send()
  }
})

// GET many tasks by ID
router.get('/tasks', async (req, res) => {
  try {
    // expect req.body to be an array of IDs
    const tasks = await Task.where('_id').in(req.body)
    res.send(tasks)
  } catch {
    res.status(500).send()
  }
})

// UPDATE task by ID
router.patch('/tasks/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['completed', 'description']
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update)
  })

  if (!isValidOperation) {
    return res.status(400).send({ error: 'invalid update'})
  }
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

// UPDATE many tasks
router.patch('/tasks_bulk', async (req, res) => {
  try {
    let tasks = []
    // expect req.body to be an array of objects containing task id and content to be updated
    for (let taskJSON in req.body) {
      const task = await Task.findByIdAndUpdate(req.body[taskJSON]["_id"], req.body[taskJSON], { new: true, runValidators: true })
      if (!task) {
        return res.status(404).send()
      }
      tasks.push(task)
    }
    res.send(tasks)
  } catch (error) {
    res.status(400).send(error)
  }
})

// UPDATE many tasks complete field
router.patch('/tasks_bulk_completed', async (req, res) => {
  const updates = Object.keys(req.body[1])
  // expects req.body to be an array with 2 objects, the first being an array of IDs, and the second being what to update completed to
  if (updates != 'completed') {
    return res.status(400).send({ error: 'invalid update. Only update completed field when updating many'})
  }
  try {
    const tasks = await Task.updateMany(req.body[0],req.body[1])
    res.send(tasks)
  } catch (error) {
    res.status(400).send(error)
  }
})

// DELETE task by ID
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (error) {
    res.status(500).send()
  }
})

// DELETE many tasks by ID
router.delete('/tasks_bulk', async (req, res) => {
  try {
    // expects req.body to be an array of IDs
    const tasks = await Task.deleteMany({ _id: req.body})
    res.send(tasks)
  } catch {
    res.status(500).send()
  }
})

module.exports = router
