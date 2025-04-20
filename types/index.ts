export interface FirestoreTimestamp {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date | string | FirestoreTimestamp;
  type: "income" | "expense";
  userId: string;
}

export interface DebtCredit {
  id: string;
  amount: number;
  description: string;
  person: string;
  date: Date | string | FirestoreTimestamp;
  dueDate?: Date | string | FirestoreTimestamp;
  type: "debt" | "credit";
  status: "pending" | "paid";
  userId: string;
}
