LLVM=/opt/rocm/hcc/bin/llvm-mc -mattr=-code-object-v3 -triple amdgcn-amd-amdhsa -mcpu=gfx900 -filetype=obj
CLANG=/opt/rocm/hcc/bin/clang -target amdgcn--amdhsa
CLANG2=/opt/rocm/hcc/bin/clang++ -I/opt/rocm/hsa/include/hsa -std=c++11 -L/opt/rocm/lib -lhsa-runtime64

all:
	$(LLVM) test.s -o test.o
	$(CLANG) test.o -o test.co
	$(CLANG2) test.cpp vendor/dispatch.cpp -o test

clear:
	rm test.o
	rm test.co
	rm test
