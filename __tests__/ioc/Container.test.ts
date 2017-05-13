import { VirtualNode } from 'tweed'
import Container, { inject, autoinject } from '../../src/ioc/Container'

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = new Container()
  })

  test('it can create an instance of a class', () => {
    class X {}

    expect(container.make(X)).toBeInstanceOf(X)
  })

  test('it can create a dependency', () => {
    class X {}
    @autoinject
    class Y {
      constructor (public dep: X) {}
    }

    const y = container.make(Y)
    expect(y.dep).toBeInstanceOf(X)
  })

  test('it can bind an abstraction to an implementation', () => {
    interface A {}
    class B implements A {}

    container.bind<A>('token').toClass(B)

    expect(container.make<A>('token')).toBeInstanceOf(B)
  })

  test('it can define its dependencies', () => {
    class X {}
    @inject(X)
    class Y {
      constructor (public x: any) {}
    }

    const y = container.make(Y)
    expect(y.x).toBeInstanceOf(X)
  })

  test('it can bind to a factory', () => {
    interface A {}
    class B implements A {}

    container.bind<A>('token').toFactory(() => new B())

    expect(container.make<A>('token')).toBeInstanceOf(B)
  })

  test('the factory receives the container', () => {
    interface A {}
    class B implements A {}
    class C {
      constructor (public a: A) {}
    }

    container.bind<C>('C').toFactory((con) => new C(con.make<A>('A')))
    container.bind<A>('A').toClass(B)

    expect(container.make<C>('C').a).toBeInstanceOf(B)
  })

  test('it can bind to a singleton class', () => {
    class X {}

    container.bind<X>('token').toSingletonClass(X)

    const a = container.make<X>('token')
    const b = container.make<X>('token')
    expect(a).toBe(b)
  })

  test('it can bind to a singleton instance', () => {
    class X {}

    const x = new X()

    container.bind<X>('token').toInstance(x)

    const a = container.make<X>('token')
    const b = container.make<X>('token')
    expect(a).toBe(b)
    expect(b).toBe(x)
    expect(a).toBe(x)
  })

  test('it can bind to a singleton factory', () => {
    class X {}

    let x: X | null = null

    container.bind<X>('token').toSingletonFactory(() => {
      x = new X()
      return x
    })

    const a = container.make<X>('token')
    const b = container.make<X>('token')
    expect(a).toBe(b)
    expect(b).toBe(x)
    expect(a).toBe(x)
  })

  test('it cannot make a class with dependencies that has no annotation', () => {
    class X {}
    class Y {
      constructor (public x: X) {}
    }

    expect(() => container.make(Y)).toThrow()
  })
})
