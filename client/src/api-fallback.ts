import type { User, UserInsert, UserUpdate } from '@shared/types'

// Simple flag to enable/disable fallback
const ENABLE_FALLBACK = false // Set to false to disable localStorage fallback

interface Component {
  id: string
  parent_id?: string
  name: string
  status: string
  attributes: Record<string, any>
  created_at: string
  updated_at: string
}

class LocalStorageDB {
  private users: User[] = []
  private components: Component[] = []
  private tokens: Map<string, { userId: string; expires: number }> = new Map()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    try {
      const users = localStorage.getItem('fallback_users')
      const components = localStorage.getItem('fallback_components')
      const tokens = localStorage.getItem('fallback_tokens')
      
      if (users) this.users = JSON.parse(users)
      if (components) this.components = JSON.parse(components)
      if (tokens) {
        const parsed = JSON.parse(tokens)
        this.tokens = new Map(parsed)
      }
      
      if (this.users.length === 0) {
        this.seedDefaultAdmin()
      }
    } catch (e) {
      this.seedDefaultAdmin()
    }
  }

  private saveToStorage() {
    localStorage.setItem('fallback_users', JSON.stringify(this.users))
    localStorage.setItem('fallback_components', JSON.stringify(this.components))
    localStorage.setItem('fallback_tokens', JSON.stringify(Array.from(this.tokens.entries())))
  }

  private seedDefaultAdmin() {
    const admin: User = {
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    this.users.push(admin)
    this.saveToStorage()
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2)
  }

  private hashPassword(password: string): string {
    return btoa(password + 'salt')
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash
  }

  private findUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email)
  }

  private findUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id)
  }

  private findToken(token: string): { userId: string; expires: number } | undefined {
    return this.tokens.get(token)
  }

  private isTokenExpired(token: { userId: string; expires: number }): boolean {
    return Date.now() > token.expires
  }

  private createToken(userId: string): string {
    const token = this.generateToken()
    const expires = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    this.tokens.set(token, { userId, expires })
    this.saveToStorage()
    return token
  }

  private validateToken(token: string): User | null {
    const tokenData = this.findToken(token)
    if (!tokenData || this.isTokenExpired(tokenData)) {
      this.tokens.delete(token)
      this.saveToStorage()
      return null
    }
    return this.findUserById(tokenData.userId) || null
  }

  // User operations
  register(data: UserInsert): { token: string; user: User } {
    if (this.findUserByEmail(data.email)) {
      throw new Error('Email already exists')
    }

    const user: User = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.users.push(user)
    this.saveToStorage()

    const token = this.createToken(user.id)
    return { token, user }
  }

  login(data: { email: string; password: string }): { token: string; user: User } {
    const user = this.findUserByEmail(data.email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // For demo purposes, accept any password
    const token = this.createToken(user.id)
    return { token, user }
  }

  me(token: string): { user: User } {
    const user = this.validateToken(token)
    if (!user) {
      throw new Error('Invalid token')
    }
    return { user }
  }

  listUsers(token: string): { users: User[] } {
    const currentUser = this.validateToken(token)
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required')
    }
    return { users: this.users }
  }

  addUser(token: string, data: UserInsert): { user: User } {
    const currentUser = this.validateToken(token)
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required')
    }

    if (this.findUserByEmail(data.email)) {
      throw new Error('Email already exists')
    }

    const user: User = {
      id: this.generateId(),
      email: data.email,
      name: data.name,
      role: data.role || 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.users.push(user)
    this.saveToStorage()
    return { user }
  }

  updateUser(token: string, id: string, data: UserUpdate): { user: User } {
    const currentUser = this.validateToken(token)
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.id !== id)) {
      throw new Error('Access denied')
    }

    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const user = this.users[userIndex]
    if (data.email && data.email !== user.email) {
      if (this.findUserByEmail(data.email)) {
        throw new Error('Email already exists')
      }
      user.email = data.email
    }
    if (data.name) user.name = data.name
    if (data.role && currentUser.role === 'admin') user.role = data.role

    user.updated_at = new Date().toISOString()
    this.users[userIndex] = user
    this.saveToStorage()
    return { user }
  }

  deleteUser(token: string, id: string): { user: User } {
    const currentUser = this.validateToken(token)
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const userIndex = this.users.findIndex(u => u.id === id)
    if (userIndex === -1) {
      throw new Error('User not found')
    }

    const user = this.users[userIndex]
    this.users.splice(userIndex, 1)
    this.saveToStorage()
    return { user }
  }

  passwordResetRequest(email: string): { ok: boolean; token?: string } {
    const user = this.findUserByEmail(email)
    if (!user) {
      return { ok: true } // Don't reveal if email exists
    }

    const resetToken = this.generateToken()
    return { ok: true, token: resetToken }
  }

  passwordResetConfirm(token: string, password: string): { ok: boolean } {
    // For demo purposes, accept any token
    return { ok: true }
  }

  // Component operations
  listComponents(token: string, parent_id?: string, status?: string, includeChildren?: boolean): { items: Component[] } {
    const currentUser = this.validateToken(token)
    if (!currentUser) {
      throw new Error('Invalid token')
    }

    let components = [...this.components]

    if (parent_id) {
      components = components.filter(c => c.parent_id === parent_id)
    } else if (includeChildren) {
      // Return all components with hierarchy
    } else {
      components = components.filter(c => !c.parent_id)
    }

    if (status) {
      components = components.filter(c => c.status === status)
    }

    return { items: components }
  }

  createComponent(token: string, form: FormData): { item: Component } {
    const currentUser = this.validateToken(token)
    if (!currentUser) {
      throw new Error('Invalid token')
    }

    const component: Component = {
      id: this.generateId(),
      parent_id: form.get('parent_id') as string || undefined,
      name: form.get('name') as string,
      status: form.get('status') as string || 'active',
      attributes: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Parse attributes from form
    const attributes: Record<string, any> = {}
    form.forEach((value, key) => {
      if (key.startsWith('attributes[')) {
        const attrKey = key.slice(11, -1)
        attributes[attrKey] = value
      }
    })
    component.attributes = attributes

    this.components.push(component)
    this.saveToStorage()
    return { item: component }
  }

  updateComponent(token: string, id: string, form: FormData): { item: Component } {
    const currentUser = this.validateToken(token)
    if (!currentUser) {
      throw new Error('Invalid token')
    }

    const componentIndex = this.components.findIndex(c => c.id === id)
    if (componentIndex === -1) {
      throw new Error('Component not found')
    }

    const component = this.components[componentIndex]
    
    if (form.has('name')) component.name = form.get('name') as string
    if (form.has('status')) component.status = form.get('status') as string
    if (form.has('parent_id')) component.parent_id = form.get('parent_id') as string || undefined

    // Parse attributes from form
    const attributes: Record<string, any> = {}
    form.forEach((value, key) => {
      if (key.startsWith('attributes[')) {
        const attrKey = key.slice(11, -1)
        attributes[attrKey] = value
      }
    })
    component.attributes = attributes

    component.updated_at = new Date().toISOString()
    this.components[componentIndex] = component
    this.saveToStorage()
    return { item: component }
  }

  deleteComponent(token: string, id: string): { ok: boolean } {
    const currentUser = this.validateToken(token)
    if (!currentUser) {
      throw new Error('Invalid token')
    }

    const componentIndex = this.components.findIndex(c => c.id === id)
    if (componentIndex === -1) {
      throw new Error('Component not found')
    }

    // Also delete child components
    const toDelete = [id]
    const findChildren = (parentId: string) => {
      const children = this.components.filter(c => c.parent_id === parentId)
      children.forEach(child => {
        toDelete.push(child.id)
        findChildren(child.id)
      })
    }
    findChildren(id)

    this.components = this.components.filter(c => !toDelete.includes(c.id))
    this.saveToStorage()
    return { ok: true }
  }

  cloneComponent(token: string, id: string): { item: Component } {
    const currentUser = this.validateToken(token)
    if (!currentUser) {
      throw new Error('Invalid token')
    }

    const original = this.components.find(c => c.id === id)
    if (!original) {
      throw new Error('Component not found')
    }

    const cloned: Component = {
      ...original,
      id: this.generateId(),
      name: `${original.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    this.components.push(cloned)
    this.saveToStorage()
    return { item: cloned }
  }

  listAttributeKeys(token: string): { keys: string[] } {
    const currentUser = this.validateToken(token)
    if (!currentUser) {
      throw new Error('Invalid token')
    }

    const keys = new Set<string>()
    this.components.forEach(component => {
      Object.keys(component.attributes).forEach(key => keys.add(key))
    })

    return { keys: Array.from(keys) }
  }
}

const db = new LocalStorageDB()

// Smart API fallback function
export async function smartApiFallback<T>(
  apiCall: () => Promise<T>,
  fallbackCall: () => T
): Promise<T> {
  if (!ENABLE_FALLBACK) {
    return apiCall()
  }
  
  try {
    return await apiCall()
  } catch (error) {
    console.warn('API unavailable, using localStorage fallback:', error)
    return Promise.resolve(fallbackCall())
  }
}

// Enhanced API with fallback
export const ApiWithFallback = {
  register: (data: UserInsert) => 
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
      () => db.register(data)
    ),

  login: (data: { email: string; password: string }) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
      () => db.login(data)
    ),

  me: (token: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      () => db.me(token)
    ),

  listUsers: (token: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      () => db.listUsers(token)
    ),

  addUser: (token: string, data: UserInsert) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      }).then(res => res.json()),
      () => db.addUser(token, data)
    ),

  updateUser: (token: string, id: string, data: UserUpdate) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      }).then(res => res.json()),
      () => db.updateUser(token, id, data)
    ),

  deleteUser: (token: string, id: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      () => db.deleteUser(token, id)
    ),

  passwordResetRequest: (email: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/password/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).then(res => res.json()),
      () => db.passwordResetRequest(email)
    ),

  passwordResetConfirm: (token: string, password: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/auth/password/reset-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      }).then(res => res.json()),
      () => db.passwordResetConfirm(token, password)
    ),

  listComponents: (token: string, parent_id?: string, status?: string, includeChildren?: boolean) =>
    smartApiFallback(
      () => {
        const params = new URLSearchParams()
        if (parent_id) params.append('parent_id', parent_id)
        if (status) params.append('status', status)
        if (includeChildren && !parent_id) params.append('include_children', 'true')
        
        return fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/components?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
      },
      () => db.listComponents(token, parent_id, status, includeChildren)
    ),

  createComponent: (token: string, form: FormData) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/components`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      }).then(res => res.json()),
      () => db.createComponent(token, form)
    ),

  updateComponent: (token: string, id: string, form: FormData) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/components/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      }).then(res => res.json()),
      () => db.updateComponent(token, id, form)
    ),

  deleteComponent: (token: string, id: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/components/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      () => db.deleteComponent(token, id)
    ),

  cloneComponent: (token: string, id: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/components/${id}/clone`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      () => db.cloneComponent(token, id)
    ),

  listAttributeKeys: (token: string) =>
    smartApiFallback(
      () => fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:3000'}/api/components/attribute-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.json()),
      () => db.listAttributeKeys(token)
    )
}

export default ApiWithFallback
