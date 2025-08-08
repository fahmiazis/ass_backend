const obj = { king: 'abc', queen: 'def' }

const newObj = {
  ...obj,
  queen: obj.king
}

console.log(newObj)
