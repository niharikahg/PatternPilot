export type LibraryProblem = { title: string; difficulty: string; text: string };

export const LIBRARY: LibraryProblem[] = [
  { title: "Two Sum", difficulty: "Easy", text: "You're given a list of integers and a target number. Find the positions of two different numbers in the list that add up to the target. You can assume exactly one such pair exists. Return the two indices in any order." },
  { title: "Valid Parentheses", difficulty: "Easy", text: "Given a string made only of the bracket characters ( ) [ ] { }, decide whether it is well-formed: every opening bracket must be closed by the same kind of bracket, and brackets must close in the correct nesting order." },
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", text: "You have a list where each entry is a stock's price on a given day. You may buy once and sell once later. Return the largest profit you can make, or 0 if no profitable trade exists." },
  { title: "Maximum Subarray", difficulty: "Medium", text: "Given a list of integers (which may include negatives), find the contiguous stretch of at least one element whose values add up to the largest possible total, and return that total." },
  { title: "Climbing Stairs", difficulty: "Easy", text: "A staircase has n steps. Each move you can climb either 1 or 2 steps. How many distinct sequences of moves get you exactly to the top?" },
  { title: "Reverse Linked List", difficulty: "Easy", text: "You're given the head node of a singly linked list. Reverse the direction of every link so the last node becomes the head, and return the new head." },
  { title: "Merge Intervals", difficulty: "Medium", text: "You're given a list of intervals, each a [start, end] pair. Combine every group of overlapping intervals into a single interval and return the resulting list of non-overlapping intervals." },
  { title: "Number of Islands", difficulty: "Medium", text: "You have a 2D grid of '1' (land) and '0' (water). An island is a group of land cells connected horizontally or vertically. Count how many separate islands are in the grid." },
];
