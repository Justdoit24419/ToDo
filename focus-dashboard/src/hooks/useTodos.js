import { useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const recalcSubtaskAllocations = useCallback((todo) => {
    const parentAllocated = todo.allocatedTime || 0;
    if (!parentAllocated) return todo;

    const subtasks = todo.subtasks || [];
    const weightTotal = subtasks
      .filter(st => !st.allocatedTime && (st.weight || 0) > 0)
      .reduce((sum, st) => sum + (st.weight || 0), 0);

    if (weightTotal <= 0) return todo;

    const updatedSubtasks = subtasks.map(subtask => {
      // 명시적 할당 시간이 있는 경우 유지
      if (subtask.allocatedTime && subtask.allocatedTime > 0) return subtask;
      if (!subtask.weight || subtask.weight <= 0) return subtask;

      const alloc = Math.round((parentAllocated * subtask.weight) / weightTotal);
      return { ...subtask, allocatedTime: alloc };
    });

    return { ...todo, subtasks: updatedSubtasks };
  }, []);

  // 초기 로드
  useEffect(() => {
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTodos = async () => {
    try {
      setIsLoading(true);
      console.log('[useTodos] 할일 로드 시작');
      const data = await api.getTodos();
      console.log('[useTodos] 할일 로드 완료:', data);
      console.log('[useTodos] 할일 개수:', data?.length || 0);
      setTodos(data || []);
    } catch (error) {
      console.error('[useTodos] 할일 로드 실패:', error);
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const syncTodos = async (updatedTodos) => {
    try {
      await api.saveTodos(updatedTodos);
    } catch (error) {
      console.error('할일 저장 실패:', error);
    }
  };

  // 투두 추가
  const addTodo = useCallback((text, startDate = '', endDate = '') => {
    if (!text || text.trim() === '') {
      return false;
    }

    const newTodo = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      focusTime: 0,
      allocatedTime: 0,
      startDate: startDate || '',
      endDate: endDate || '',
      subtasks: []
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
    return true;
  }, [todos]);

  // 완료 상태 토글
  const toggleTodo = useCallback((id) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  // 투두 삭제
  const deleteTodo = useCallback((id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  // 투두의 집중 시간 업데이트
  const updateTodoFocusTime = useCallback((id, minutes, subtaskId = null) => {
    if (!id || !minutes) return;

    const updatedTodos = todos.map(todo => {
      if (todo.id !== id) return todo;

      const nextTodo = { ...todo, focusTime: (todo.focusTime || 0) + minutes };

      if (subtaskId) {
        nextTodo.subtasks = (nextTodo.subtasks || []).map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, focusTime: (subtask.focusTime || 0) + minutes }
            : subtask
        );
      }

      return nextTodo;
    });

    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  // 투두 날짜 업데이트
  const updateTodoDates = useCallback((id, startDate, endDate) => {
    if (!id) return;

    const updatedTodos = todos.map(todo =>
      todo.id === id
        ? { ...todo, startDate: startDate || '', endDate: endDate || '' }
        : todo
    );
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  // 서브태스크 추가
  const addSubtask = useCallback((parentId, text, weight = 0, allocatedTime = 0) => {
    if (!text || text.trim() === '') {
      return false;
    }

    const newSubtask = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      weight: weight || 0,
      allocatedTime: allocatedTime || 0,
      focusTime: 0
    };

    const updatedTodos = todos.map(todo =>
      todo.id === parentId
        ? { ...todo, subtasks: [...(todo.subtasks || []), newSubtask] }
        : todo
    );
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
    return true;
  }, [todos]);

  // 서브태스크 토글
  const toggleSubtask = useCallback((parentId, subtaskId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === parentId) {
        const updatedSubtasks = (todo.subtasks || []).map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, completed: !subtask.completed }
            : subtask
        );
        return { ...todo, subtasks: updatedSubtasks };
      }
      return todo;
    });
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  // 서브태스크 삭제
  const deleteSubtask = useCallback((parentId, subtaskId) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === parentId) {
        const updatedSubtasks = (todo.subtasks || []).filter(
          subtask => subtask.id !== subtaskId
        );
        return { ...todo, subtasks: updatedSubtasks };
      }
      return todo;
    });
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  // 할당 시간 업데이트
  const updateAllocatedTime = useCallback((id, allocatedTime) => {
    console.log('updateAllocatedTime 호출:', { id, allocatedTime });
    if (!id) {
      console.log('updateAllocatedTime: id가 없어서 스킵');
      return;
    }

    const updatedTodos = todos.map(todo => {
      if (todo.id !== id) return todo;
      console.log('updateAllocatedTime: 투두 업데이트 전:', { id: todo.id, text: todo.text, allocatedTime: todo.allocatedTime });
      const next = { ...todo, allocatedTime: allocatedTime || 0 };
      console.log('updateAllocatedTime: 투두 업데이트 후:', { id: next.id, text: next.text, allocatedTime: next.allocatedTime });
      return recalcSubtaskAllocations(next);
    });
    console.log('updateAllocatedTime: setTodos 호출, 총 투두 수:', updatedTodos.length);
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos, recalcSubtaskAllocations]);

  // 서브태스크 비중 업데이트
  const updateSubtaskWeight = useCallback((parentId, subtaskId, weight) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === parentId) {
        const updatedSubtasks = (todo.subtasks || []).map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, weight: weight || 0 }
            : subtask
        );
        const nextTodo = { ...todo, subtasks: updatedSubtasks };
        return recalcSubtaskAllocations(nextTodo);
      }
      return todo;
    });
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos, recalcSubtaskAllocations]);

  const updateSubtaskAllocatedTime = useCallback((parentId, subtaskId, allocatedTime) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === parentId) {
        const updatedSubtasks = (todo.subtasks || []).map(subtask =>
          subtask.id === subtaskId
            ? { ...subtask, allocatedTime: allocatedTime || 0 }
            : subtask
        );
        const nextTodo = { ...todo, subtasks: updatedSubtasks };
        return recalcSubtaskAllocations(nextTodo);
      }
      return todo;
    });
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos, recalcSubtaskAllocations]);

  // 서브태스크 수정 (텍스트 + 비중)
  const updateSubtask = useCallback((parentId, subtaskId, text, weight, allocatedTime) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === parentId) {
        const updatedSubtasks = (todo.subtasks || []).map(subtask =>
          subtask.id === subtaskId
            ? {
              ...subtask,
              text: text.trim(),
              weight: weight || 0,
              allocatedTime: allocatedTime || 0
            }
            : subtask
        );
        return { ...todo, subtasks: updatedSubtasks };
      }
      return todo;
    });
    setTodos(updatedTodos);
    syncTodos(updatedTodos);
  }, [todos]);

  return {
    todos,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodoFocusTime,
    updateTodoDates,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    updateAllocatedTime,
    updateSubtaskWeight,
    updateSubtask,
    updateSubtaskAllocatedTime,
    refreshTodos: loadTodos
  };
};
