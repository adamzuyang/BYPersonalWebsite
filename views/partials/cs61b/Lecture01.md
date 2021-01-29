# Lecture 1: Welcome to 61B
#### 8/26/2020


## Hello World

```
# In Python
print("hello world")

// In Java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("hello world");
    }
}

// Output:
hello world
```
- In Java, all code must be part of a class
- Classes are defined with `public class CLASSNAME`
- We use `{ }` to delineate the beginning and ending of things
- We must end lines with a semicolon
- The code we want to run must be inside `public static void main(String[] args)`

```
# In Python
x = 0
while x < 10:
    print(x)
    x = x + 1

// In Java
public class HelloNumbers {
    public static void main(String[] args) {
        int x = 0;  // Must declare variables, variable types can never change
        while (x < 10) {
            System.out.println(x);
            x = x + 1;
        }
    }
}
```
- Before Java variables can be used, they must be declared
- Java variables must have a specific type
- Java variable types can never change
- Types are verified before the code even runs!!!

```
# In Python
def larger(x, y):
    """Returns the larger of x and y"""
    if (x > y):
        return x
    return y

print (larger(-5, 10))


// In Java
public class LargerDemo {
    /** Returns the larger of x and y. */
    public static larger(int x, int y) {
        if (x > y) {
            return x;
        }
        return y;
    }

    public static void main(String[] args) {
        System.out.println(larger(-5, 10));
    }
}
```
- Functions must be declared as part of a class in Java. A function that is part of a class is called a "method". So in Java, all functions are methods.
- To define a function in Java, we use "public static". We will see alternate ways of defining functions later.
- ALL parameters of a function must have a declared type, and the return value of a function must have a declared type.
- Functions in Java return only one value!

### Java and Object Orientation
- Java is an object oriented language with strict requirements:
  - Every Java file must contain a class declaration
  - All code lives inside a class, even helper functions, global constants, etc.
  - To run a java program, you typically define a min method using `public static void main(String[] args)`

### Java and Static Typing
- Java is statically typed!
  - All variables, parameter,s and methods must have a declared type
  - That type can never change
  - Expressions also have a type
  - The compiler checks that all the types in your program are compatible before the program ever runs!
    - This is unlike Python, where type checks are performed DURING execution

### Reflections on Static Typing
- The Good:
  - Catches certain types of errors, making debugging easier
  - Type errors can (almost) never occur on the end user's computer
  - Makes it easier to read and reason about code
  - Code can run more efficiently, e.g. no need to do expensive runtime type checks
- The Bad:
  - Code is more verbose
  - Code is less general (functions can only be applied to inputs of certain types)
    - There is a way around this in Java (generics)


## Welcome to 61B 2019

### What is 61B About?
- Writing code that runs efficiently
  - Good algorithms
  - Good data structures
- Writing code efficiently
  - Designing, building, testing, and debugging large programs
  - Use of programming tools
    - git, IntelliJ, JUnit
  - Java

### Why Study Algorithms or Data Structures?
- Daily life is supported by them

### Why Study Algorithms or Data Structures?
- Major driver of current progress of our civilization
- Self-driving cars
- AlphaGo
- To become a better programmer
- Being an efficient programmer means using the right data structures and algorithms for the job

### Why Study Algorithms or Data Structures?
- To understand the universe. Science is increasingly about simulation and complex data analysis rather than simple observations and clean equations.
- To create beautiful things
- As an end unto itself
