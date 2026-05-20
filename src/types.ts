// Domain types. DO NOT change shape — repo + routes depend on these.

export interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string; // ISO-8601
}

export interface CreateTodoInput {
  title: string;
  done?: boolean;
}

export interface UpdateTodoPatch {
  title?: string;
  done?: boolean;
}
