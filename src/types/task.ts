
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  notDoneThisTime?: boolean;
  createdAt: string;
}
