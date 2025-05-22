function eliminationArray (arr1, arr2) {
  const result = []
  for (let i = 0; i < arr1.length; i++) {
    let cek = null
    for (let j = 0; j < arr2.length; j++) {
      if (j === (arr2.length - 1) && cek === null) {
        result.push(arr1[i])
      } else if (arr1[i] === arr2[j]) {
        cek = true
        break
      }
    }
  }
  return result
}

console.log(eliminationArray([1, 2, 30, 10, 15], [1, 2, 3, 20, 50]))
