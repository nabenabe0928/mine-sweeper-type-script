#include <emscripten/bind.h>
#include "solver.cpp"

using namespace emscripten;

int get_size(vector<double>* vec) {
  return vec->size();
}

double get_at(vector<double>* vec, int index) {
  return (*vec)[index];
}

EMSCRIPTEN_BINDINGS(mine_sweeper_solver) {
  register_vector<int>("VectorInt");
  register_vector<double>("VectorDouble");
  function("calculate_prob_flatten", &calculate_prob_flatten, allow_raw_pointers());
  function("get_size", &get_size, allow_raw_pointers());
  function("get_at", &get_at, allow_raw_pointers());  
}
