import { DatabaseConnection } from '../types/database';

export interface User {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
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

  async create(userData: {
    username: string;
    password_hash: string;
    display_name: string;
    email?: string;
    avatar_url?: string;
  }): Promise<User> {
    const id = crypto.randomUUID();
    const now = new Date();
    
    await this.connection.query(
      'INSERT INTO users (id, username, password_hash, display_name, email, avatar_url, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, userData.username, userData.password_hash, userData.display_name, userData.email || null, userData.avatar_url || null, JSON.stringify({}), now, now]
    );

    return {
      id,
      username: userData.username,
      password_hash: userData.password_hash,
      display_name: userData.display_name,
      email: userData.email,
      avatar_url: userData.avatar_url,
      created_at: now,
      updated_at: now
    };
  }

  private mapUser(data: any): User {
    return {
      id: data.id,
      username: data.username,
      password_hash: data.password_hash,
      display_name: data.display_name,
      email: data.email,
      avatar_url: data.avatar_url,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}
