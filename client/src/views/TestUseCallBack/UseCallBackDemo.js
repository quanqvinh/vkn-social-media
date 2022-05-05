import { useState, useCallback } from "react";
import Todos from "./Todo";

const UseCallbackDemo = () => {
   const [count, setCount] = useState(0);
   const [todos, setTodos] = useState([]);

   const increment = () => {
      setCount((c) => c + 1);
   };

   const addTodo = useCallback(() => {
      setTodos((t) => [...t, "New Todo"]);
   }, [todos]);

   return (
      <>
         <div className="use-callback-demo container">
            <Todos todos={todos} addTodo={addTodo} />
            <hr />
            <div>
               Count: {count}
               <button className="btn" onClick={increment}>
                  +
               </button>
            </div>
         </div>
      </>
   );
};

export default UseCallbackDemo;
