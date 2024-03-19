import type { UserI } from '../server/models/User';

export interface res {
  status: number,
  message?: string
}

export interface userRes extends res {
  data: {
    user: UserI
  }
}
