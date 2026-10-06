export interface User { id: string; username: string; email: string }
export interface Wallet { id: string; balance: string; user?: Partial<User>; createdAt?: string }
export interface Transaction {
  id: string; type: string; category?: string; amount: string; status: string;
  description?: string; createdAt?: string; counterparty?: string;
}
export interface TxFilters { type?: string; from?: string; to?: string }
export interface TxPage { items: Transaction[]; page: number; limit: number; total?: number; totalPages?: number }
export interface Analytics { totalIncome: string; totalExpense: string; monthly: { month: string; income: string; expense: string }[] }
export interface RegisterResponse { message: string; user: User; wallet: { id: string; balance: string }; access_token: string }
