# Tweed Inject

A dependency injection framework, with the [Tweed](https://github.com/tweedjs/tweed)
library in mind. It doesn't require Tweed, though.

---

## Installation
```shell
$ npm install tweed-inject
```

---

## Overview
The `Container` class can be used to create and store instances. It can then be used to
automatically inject dependencies into class constructors.

<details>
<summary>JavaScript (Babel)</summary>
```javascript
// src/main.js

import { Container } from 'tweed-inject'
import UserRepository from './UserRepository'
import LocalStorageUserRepository from './LocalStorageUserRepository'
import UserService from './UserService'

const container = new Container()

container.bind(UserRepository).toClass(LocalStorageUserRepository)

// Uses the @inject decorator to resolve the necessary dependencies
const userService = container.make(UserService)

userService.create('Jane Doe', 35)

console.log(userService.all())
// -> [{ name: 'Jane Doe', age: 35 }]
```
```javascript
// src/UserRepository.js

/**
 * Marker for the UserRepository interface
 *
 * interface User {
 *   name: string
 *   age: number
 * }
 *
 * interface UserRepository {
 *   all (): User[]
 *   add (user: User): void
 * }
 */
export default 'UserRepository'
```
```javascript
// src/LocalStorageUserRepository.js

/**
 * @implements UserRepository
 */
export default class LocalStorageUserRepository {
  all () {
    return JSON.parse(localStorage.getItem('users'))
  }

  add (user) {
    let current = localStorage.getItem('users') || []

    current.push(user)

    localStorage.setItem('users', JSON.stringify(current))
  }
}
```
```javascript
// src/UserService.js

import { inject } from 'tweed-inject'
import UserRepository from './UserRepository'

@inject(UserRepository)
export default class UserService {
  constructor (repo) {
    this.repo = repo
  }

  all () {
    return this.repo.all()
  }

  create (name, age) {
    this.repo.add({ name, age })
  }
}
```
</details>

<details>
<summary>TypeScript</summary>
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators",
    "emitDecoratorMetadata": true
  }
}
```
```typescript
// src/main.ts

import { Container } from 'tweed-inject'
import UserRepository from './UserRepository'
import LocalStorageUserRepository from './LocalStorageUserRepository'
import UserService from './UserService'

const container = new Container()

container.bind<UserRepository>(UserRepository).toClass(LocalStorageUserRepository)

// Uses the @autoinject decorator to resolve the necessary dependencies
const userService = container.make(UserService)

userService.create('Jane Doe', 35)

console.log(userService.all())
// -> [{ name: 'Jane Doe', age: 35 }]
```
```typescript
// src/UserRepository.ts

Marker for the UserRepository interface

export interface User {
  name: string
  age: number
}

interface UserRepository {
  all (): User[]
  add (user: User): void
}

// Marker
const UserRepository = 'UserRepository'

export default UserRepository
```
```typescript
// src/LocalStorageUserRepository.ts

import UserRepository, { User } from './UserRepository'

export default class LocalStorageUserRepository implements UserRepository {
  all (): User[] {
    return JSON.parse(localStorage.getItem('users'))
  }

  add (user: User): void {
    let current: User[] = localStorage.getItem('users') || []

    current.push(user)

    localStorage.setItem('users', JSON.stringify(current))
  }
}
```
```typescript
// src/UserService.ts

import { autoinject } from 'tweed-inject'
import UserRepository, { User } from './UserRepository'

@autoinject
export default class UserService {
  constructor (
    private repo: UserRepository
  ) {}

  all (): User[] {
    return this.repo.all()
  }

  create (name: string, age: number): void {
    this.repo.add({ name, age })
  }
}
```
</details>
