/**
PROBLEM 3
__________
Write a program to find pairs of positive integers (A, B) whose sum is equal to the input number
N (N < 10 power 6).
The conditions to be satisfied by A & B are:
● A has at least two digits and starts with a non-zero digit
● B always has one digit less than A
● B can start with 0
● B is obtained from A by leaving out one digit.
The output should also indicate the number of such pairs. For example, if we input 1002 to the
program, the output should be as follows:
4 pairs found:
906 + 96 = 1002
911 + 91 = 1002
951 + 51 = 1002
1001 + 001 = 1002
--------------------------------------------------------------------------
Assuming input is provided in testdata.in with the following contents:
2
1002
11
Line 1: Number of test cases
Line 2 Onwards: The Number itself
Print the output in the following format.
---------------------------------------------------------------------------
TEST #1
4 pairs found
906 + 96 = 1002
911 + 91 = 1002
951 + 51 = 1002
TEST #2
1 pair found
10 + 1 = 11
Link to test file: https://dl.dropboxusercontent.com/s/fb85x5m8ycenpgb/
testdata.in
 */

var standard_input = process.stdin;
standard_input.setEncoding("utf-8");

console.log("Provide Input:");

let inputs = [];
standard_input.on("data", function(data) {
  if (!data || isNaN(data)) {
    console.log("Please input numbers only");
  } else if (inputs.length > 0) {
    if (inputs[0] < inputs.length + 1) {
      inputs.push(data);
      main();
    } else {
      inputs.push(data);
    }
  } else {
    inputs.push(data);
  }
});

const validate = (a, b) => {
  let bstr = b.toString();
  let astr = a.toString();
  if (astr.length < 2) {
    return false;
  }
  if (astr.length - 1 != bstr.length) {
    return false;
  }
  for (let i = 0; i < bstr.length; i++) {
    let digit = bstr.charAt(i);
    let index = astr.indexOf(digit);
    if (index == -1) {
      return false;
    } else {
      astr = astr.slice(index + 1);
    }
  }
  return true;
};
const gen_pairs = num => {
  for (let j = 10; j < num; j++) {
    b = num - j;
    if (validate(j, b)) {
      console.log(j + " + " + b + " = " + num);
    } else {
      let astr = j.toString(),
        bstr = b.toString();
      if (astr.length > bstr.length && astr.length - 1 != bstr.length) {
        let diff = astr.length - 1 - bstr.length;
        if (diff == 1) {
          bstr = "0" + bstr;
          if (validate(j, bstr)) {
            console.log(j + " + " + bstr + " = " + num);
          }
        }
      }
    }
  }
};

var main = () => {
  console.log("---------------OUTPUT----------------\n");
  let f = 1;
  inputs.splice(0, 1);
  for (let i of inputs) {
    console.log("TEST #" + f);
    gen_pairs(i);
    f++;
  }
  process.exit(0);
};
