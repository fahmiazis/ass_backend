const arr = [1, 2, 3, 4]
const temp = []

for (let i = 0; i < arr.length; i++) {
  const data = []
  data.push(arr[i])
  temp.push(data)
}
console.log(arr)
console.log(temp)
