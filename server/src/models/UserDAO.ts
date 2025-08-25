import { DatabaseConnection } from '../types/database';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  email?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export class UserDAO {
  constructor(private connection: DatabaseConnection) {}

  async findByUsername(username: string): Promise<User | null> {
    const [user] = await this.connection.query(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return user ? this.mapUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await this.connection.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return user ? this.mapUser(user) : null;
  }

  private mapUser(data: any): User {
    return {
      id: data.id,
      username: data.username,
      password_hash: data.password_hash,
      email: data.email,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}
