import 'reflect-metadata'

const DEPENDENCIES_META = 'design:paramtypes'

export type Class <T> = {
  new (...args: any[]): T
}

export default class Container {
  private _bindings: Binding<any>[] = []

  make <T> (classConstructor: Class<T>): T
  make <T> (interfaceToken: string): T
  make <T> (token: any): T {
    if (token == null) {
      throw new TypeError('Container cannot make something that is null or undefined')
    }

    for (const binding of this._bindings) {
      if (binding.token === token) {
        if (binding.singleton) {
          if (binding.instance == null) {
            binding.instance = binding.factory(this)
          }
          return binding.instance
        }
        return binding.factory(this)
      }
    }

    let dependencies: any[] = []

    if (Reflect.hasMetadata(DEPENDENCIES_META, token)) {
      dependencies = Reflect.getMetadata(DEPENDENCIES_META, token)
    }

    if (typeof token !== 'function') {
      throw new Error(
        `${token} is not a constructor. Did you forget to bind it?\n\n` +
        `  container.bind(${JSON.stringify(token)}).toClass(SomeClass)`
      )
    }

    if (dependencies.length === 0 && token.length !== 0) {
      throw new Error(
        `${token.name} has ${token.length} dependencies, ` +
        `but has registered ${dependencies.length}. ` +
        'Are you trying to @autoinject an interface?'
      )
    }

    if (dependencies.length !== token.length) {
      throw new Error(
        `${token.name} has ${token.length} dependencies, ` +
        `but has registered ${dependencies.length}. ` +
        'Did you forget to decorate with @inject or @autoinject?'
      )
    }

    return new token(
      ...dependencies.map(this.make.bind(this))
    )
  }

  bind <T> (token: any): Bind<T> {
    return new Bind<T>(this, token)
  }

  setBinding <T> (binding: Binding<T>): void {
    this._bindings.push(binding)
  }
}

export interface Binding <T> {
  token: any
  factory: (container: Container) => T
  singleton: boolean
  instance?: T
}

export class Bind <T> {
  constructor (
    private _container: Container,
    private _token: any
  ) {}

  private _set <U extends T> (
    singleton: boolean,
    factory: (container: Container) => U
  ): void {
    this._container.setBinding<T>({
      token: this._token,
      singleton,
      factory
    })
  }

  toClass <U extends T> (classConstructor: Class<U>): void {
    this._set(false, () => this._container.make(classConstructor))
  }

  toFactory <U extends T> (factory: (container: Container) => U): void {
    this._set(false, factory)
  }

  toSingletonClass <U extends T> (classConstructor: Class<U>): void {
    this._set(true, () => this._container.make(classConstructor))
  }

  toInstance <U extends T> (instance: U): void {
    this._set(true, () => instance)
  }

  toSingletonFactory <U extends T> (factory: (container: Container) => U): void {
    this._set(true, factory)
  }
}

export type AutoInjectDecorator = ClassDecorator
export type InjectDecorator = (...dependencies: any[]) => ClassDecorator

export const inject: InjectDecorator = function (...dependencies: any[]) {
  return (target: any) => {
    Reflect.defineMetadata(DEPENDENCIES_META, dependencies, target)
  }
}

export const autoinject: AutoInjectDecorator = function () {}
