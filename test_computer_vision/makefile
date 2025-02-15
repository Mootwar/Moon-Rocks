# Compiler name
CXX = clang++

# C++ compiler flags
CXXFLAGS = -Wall -std=c++17 -g

# The build target (executable) file
PROGRAM = test.out

# List of source files
CPPFILES = test.cpp

# Automatically convert the list of .cpp files to a list of .o files
OBJFILES = $(CPPFILES:.cpp=.o)

# The default target: build the executable
all: $(PROGRAM)

# How to build the final executable from object files
$(PROGRAM): $(OBJFILES)
	$(CXX) $(OBJFILES) -o $(PROGRAM)

# Pattern rule: how to compile any .cpp file into a .o file
%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c $< -o $@

# Remove build artifacts
clean:
	rm -f $(PROGRAM) *.o

# Run the program
run: $(PROGRAM)
	./$(PROGRAM)
