let obj = [
  { id: 1, king: 'abcd', queen: 'dudu' },
  { id: 2, king: 'abc', queen: 'def' }
]

obj = obj.map(item =>
    item.id === 2 ? { ...item, queen: 'update'} : item
  )

console.log(obj)
