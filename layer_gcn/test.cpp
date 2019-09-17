#include "vendor/dispatch.hpp"
#include "vendor/CImg.h"

using namespace amd::dispatch;
using namespace cimg_library;

class TestDispatch : public Dispatch {
 public:
  TestDispatch(int argc, const char** argv) : Dispatch(argc, argv) {}

  bool SetupCodeObject() override { return LoadCodeObjectFromFile("test.co"); }

  bool Setup() override {
    CImg<float> image("test.png");
    size_t buffer_size = image.dim_x() * image.dim_y() * 1 * 3; // z_dim = 1 and 3 for color channels
    if (!AllocateKernarg(buffer_size) return false;
    
    _in = AllocateBuffer(buffer_size);
    for (int i = 0; i < image.dim_x(); i++)
      for (int j = 0; j < image.dim_y(); y++)
        for (int k = 0; k < 3; k++)
        {
          _in[(i + j * image.dim_x()) * 3 + 0] = image(i, j, 0, 0);
          _in[(i + j * image.dim_x()) * 3 + 1] = image(i, j, 0, 1);
          _in[(i + j * image.dim_x()) * 3 + 2] = image(i, j, 0, 2);
        };
    Kernarg(buffer_size);
    Kernarg(_in);
    SetGridSize(image.dim_x(), image.dim_y());
    SetWorkgroupSize(2, 2);
    return true;
  }

  bool Verify() override {
  /*
    if (!CopyFrom(_out)) {
      output << "Error: failed to copy from local" << std::endl;
      return false;
    }
    if (((const float*)_out->SystemPtr())[0] != 3.14159f) {
      output << "Error: validation failed: got "
             << (((const float*)_out->SystemPtr())[0]) << " expected " << 3.14159
             << std::endl;
      return false;
    }
    */
    return true;
  }

 private:
  Buffer* _in;
};

int main(int argc, const char** argv) {
  return TestDispatch(argc, argv).RunMain();
}

