const request = require('supertest')
const app = require('../src/app')
const mongoose = require('mongoose')
const Task = require('../src/models/task')

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Do Laundry'
}
const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Check emails'
}
const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Study'
}
const taskFour = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Cook dinner'
}

beforeEach(async () => {
  await Task.deleteMany(),
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
  await new Task(taskFour).save()
})

// CREATE
test('should create a new task', async () => {
  await request(app).post('/tasks').send({
    description: 'Call the bank'
  }).expect(201)
})

test('should create many tasks', async () => {
  const response = await request(app).post('/tasks_bulk').send([
    {description: 'Pay my bills'},
    {description: 'Buy eggs'},
    {description: 'Clean the toilet'}
  ]).expect(201)
  expect(response.body.length).toEqual(3)
})

// READ
test('should get one task by ID successfully', async () => {
  await request(app).get('/tasks/' + taskOne._id).send().expect(200)
})

test('should return error 404 with invalid ID', async () => {
  await request(app).get('/tasks/' + new mongoose.Types.ObjectId()).send().expect(404)
})

test('should get many tasks by ID successfully', async () => {
  const response = await request(app).get('/tasks').send([
    taskOne._id, taskTwo._id, taskThree._id
  ]).expect(200)
  expect(response.body.length).toEqual(3)
})

// UPDATE
test('should update task to completed successfully', async () => {
  await request(app).patch('/tasks/' + taskTwo._id).send({completed: true}).expect(200)

  const task = await Task.findById(taskTwo._id).exec()
  expect(task.completed).toEqual(true)
})

test('should return 400 error if trying to update invalid field', async () => {
  const response = await request(app).patch('/tasks/' + taskTwo._id).send({rating: 5}).expect(400)

  expect(response.body.error).toEqual('invalid update')
})

test('should update many tasks successfully', async () => {
  await request(app).patch('/tasks_bulk').send([
    {_id: taskOne._id, completed: true},
    {_id: taskThree._id, description: 'Learn to code'}
  ]).expect(200)

  const one = await Task.findById(taskOne._id).exec()
  const three = await Task.findById(taskThree._id).exec()
  expect(one.completed).toEqual(true)
  expect(three.description).toEqual('Learn to code')
})

test('should update many tasks to completed successfully', async () => {
  await request(app).patch('/tasks_bulk_completed').send([{ _id: [taskOne._id, taskFour._id]},
  {completed: true}]).expect(200)

  const one = await Task.findById(taskOne._id).exec()
  const four = await Task.findById(taskFour._id).exec()
  expect(one.completed).toEqual(true)
  expect(four.completed).toEqual(true)
})

// DELETE
test('should delete a task by ID', async () => {
  await request(app).delete('/tasks/' + taskOne._id).send().expect(200)
  const one = await Task.findById(taskOne._id).exec()
  expect(one).toBeNull()
})

test('should delete many tasks by ID', async () => {
  await request(app).delete('/tasks_bulk').send([taskThree._id, taskTwo._id]).expect(200)
  const three = await Task.findById(taskThree._id).exec()
  const two = await Task.findById(taskTwo._id).exec()
  expect(three).toBeNull()
  expect(two).toBeNull()
})
