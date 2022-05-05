import { memo } from "react";

import React from "react";

const Todo = ({ todos, addTodo }) => {
   console.log("todo rendering");
   return (
      <>
         <h2>My Todos</h2>
         {todos.map((todo, index) => {
            return <p key={index}>{todo}</p>;
         })}
         <button className="btn" onClick={addTodo}>
            Add Todo
         </button>
      </>
   );
};

export default memo(Todo);
