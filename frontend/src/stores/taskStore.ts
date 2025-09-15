import { create } from 'zustand';
import type { Task, TaskForm } from '../types';
import apiClient from '../utils/api';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: string;
    priority?: string;
    assignee?: string;
    project?: string;
    category?: string;
    search?: string;
  };
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

interface TaskActions {
  fetchTasks: (params?: any) => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  createTask: (taskData: TaskForm) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addComment: (taskId: string, content: string) => Promise<void>;
  reviewTask: (taskId: string, approved: boolean, comments?: string, qualityScore?: number) => Promise<void>;
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  clearFilters: () => void;
  setCurrentTask: (task: Task | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>((set, get) => ({
  // State
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pages: 0,
    total: 0,
    limit: 20,
  },

  // Actions
  fetchTasks: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = { ...get().filters, ...params };
      const response = await apiClient.getTasks(queryParams);
      
      set({
        tasks: (response as any).tasks,
        pagination: (response as any).pagination,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch tasks',
      });
      throw error;
    }
  },

  fetchTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getTask(id);
      
      set({
        currentTask: (response as any).task,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch task',
      });
      throw error;
    }
  },

  createTask: async (taskData: TaskForm) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createTask(taskData);
      
      set((state) => ({
        tasks: [(response as any).task, ...state.tasks],
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to create task',
      });
      throw error;
    }
  },

  updateTask: async (id: string, taskData: Partial<Task>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateTask(id, taskData);
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task._id === id ? (response as any).task : task
        ),
        currentTask: state.currentTask?._id === id ? (response as any).task : state.currentTask,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to update task',
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteTask(id);
      
      set((state) => ({
        tasks: state.tasks.filter(task => task._id !== id),
        currentTask: state.currentTask?._id === id ? null : state.currentTask,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to delete task',
      });
      throw error;
    }
  },

  addComment: async (taskId: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.addTaskComment(taskId, content);
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? (response as any).task : task
        ),
        currentTask: state.currentTask?._id === taskId ? (response as any).task : state.currentTask,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to add comment',
      });
      throw error;
    }
  },

  reviewTask: async (taskId: string, approved: boolean, comments?: string, qualityScore?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await (apiClient as any).request(`/tasks/${taskId}/review`, {
        method: 'POST',
        body: JSON.stringify({ approved, comments, qualityScore }),
      });
      
      set((state) => ({
        tasks: state.tasks.map(task => 
          task._id === taskId ? (response as any).task : task
        ),
        currentTask: state.currentTask?._id === taskId ? (response as any).task : state.currentTask,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to review task',
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setCurrentTask: (task) => {
    set({ currentTask: task });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
