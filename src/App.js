import React, { useState } from "react";
import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";

import "./App.css";

const GET_TODOS = gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid, $done: Boolean) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($text: String) {
    insert_todos(objects: { text: $text }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql`
  mutation deleteTodo($id: uuid) {
    delete_todos(where: { id: { _eq: $id } }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

function App() {
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText("")
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  const [todoText, setTodoText] = useState("");

  const handleChange = e => {
    setTodoText(e.target.value);
  };

  const handleToggleTodo = async ({ id, done }) => {
    const data = await toggleTodo({ variables: { id, done: !done } });
    console.log("add todo ", data);
  };

  const handleAddTodo = async e => {
    e.preventDefault();
    if (!todoText.trim()) return;
    //setTodos(prevTodos => [todo, ...prevTodos]);
    const data = await addTodo({
      variables: { text: todoText },
      refetchQueries: [{ query: GET_TODOS }]
    });
    console.log("toggle todo ", data);
  };

  const handleDeleteTodo = async ({ id }) => {
    const isConfirmed = window.confirm("You want to delete it?");
    if (isConfirmed) {
      const data = await deleteTodo({
        variables: { id },
        update: cashe => {
          const prevData = cashe.readQuery({ query: GET_TODOS });
          const updatedTodos = prevData.todos.filter(todo => todo.id !== id);
          cashe.writeQuery({ query: GET_TODOS, data: { todos: updatedTodos } });
        }
      });
      console.log("delete todo ", data);
    }
  };

  if (loading) return <div>loading.....</div>;
  if (error) return <div>Error:{error.message}</div>;
  return (
    <div
      className="vh-100 code flex flex-column 
    items-center bg-dark-blue white pa3 fl-1"
    >
      <h1 className="f2-l">
        Todo List{" "}
        <span role="image" aria-label="checkmark">
          ✅
        </span>
      </h1>
      <div>
        <form className="mb3">
          <input
            className="f4 pa2 b--dashed"
            type="text"
            placeholder="add todo"
            onChange={handleChange}
            value={todoText}
          />
          <button
            className="pa2 f4 bg-green"
            type="submit"
            onClick={handleAddTodo}
          >
            Add
          </button>
        </form>
      </div>
      <div
        className="flex flex-column items-center
      justify-center"
      >
        {data.todos.length > 0 ? (
          data.todos.map(todo => (
            <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
              <span
                className={`
              pointer list pa1 f3
              ${todo.done && "strike"}`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => handleDeleteTodo(todo)}
                className="bn bg-transparent f4"
              >
                <span className="red">&times;</span>
              </button>
            </p>
          ))
        ) : (
          <div>No todos yet</div>
        )}
      </div>
    </div>
  );
}

export default App;
