export const isINNIndividual = (value) => {
    const valueToString = value ? value.toString() : '';
    return /[0-9]{12}/.test(value);
    // const getN = (index) => (parseInt(valueToString[index]))
    // if(valueToString.length === 12){
    //   const dgt11 = (( 
    //     7 * getN(0) + 2 * getN(1) + 4 * getN(2) + 
    //     10 * getN(3) + 3 * getN(4) + 5 * getN(5) +
    //     9 * getN(6) + 4 * getN(7) + 6 * getN(8) +
    //     8 * getN(9)) % 11)
      
    //   const dgt12 = ((
    //     3 * getN(0) + 7 * getN(1) + 2 * getN(2) +
    //     4 * getN(3) + 10 * getN(4) + 3 * getN(5) +
    //     5 * getN(6) + 9 * getN(7) + 4 * getN(8) +
    //     6 * getN(9) + 8 * getN(10)) % 11) % 10

    //   console.log(getN(10), dgt11, getN(11), dgt12);
      
    //   return (getN(10) === dgt11 && getN(11) === dgt12)
    // }
    // return false
  }