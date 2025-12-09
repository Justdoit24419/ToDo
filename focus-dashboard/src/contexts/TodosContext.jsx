import { createContext, useContext } from 'react';
import { useTodos } from '../hooks/useTodos';

const TodosContext = createContext();

export const TodosProvider = ({ children }) => {
  const todosValue = useTodos();

  return (
    <TodosContext.Provider value={todosValue}>
      {children}
    </TodosContext.Provider>
  );
};

export const useGlobalTodos = () => {
  const context = useContext(TodosContext);
  if (!context) {
    throw new Error('useGlobalTodos must be used within TodosProvider');
  }
  return context;
};
