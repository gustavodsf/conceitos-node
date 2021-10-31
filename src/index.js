const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } =  request.headers;

  const userExist =  users.find(user => user.username === username);
  if(!userExist) {
    return response.status(400).json({error: "User didn't exist!!"})
  }

  request.user = userExist;
  return next();
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } =  request.body;
  const userExist =  users.some(user => user.username === username);

  if(userExist) {
    return response.status(400).json({error: "User already exist!!"})
  }

  const newUser = { 
    id: uuidv4(), // precisa ser um uuid
    name: name, 
    username: username, 
    todos: []
  }

  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
   const { user } = request;
   return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newPost = { 
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }

  user.todos.push(newPost);
  response.status(201).json(newPost)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo =  user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({error: "Todo didn't exist!!"})
  }

  todo.deadline = deadline != undefined ? new Date(deadline) : todo.deadline;
  todo.title =  title ? title: todo.title;
  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo =  user.todos.find(todo => todo.id === id);
  if(!todo){
    return response.status(404).json({error: "Todo didn't exist!!"})
  }

  todo.done =  true;
  return response.status(200).json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = user.todos.findIndex(todo => todo.id === id);
  if(index == -1){
    return response.status(404).json({error: "Todo didn't exist!!"})
  }

  user.todos.splice(index, 1);
  
  return response.status(204).json(user.todos);
});

module.exports = app;