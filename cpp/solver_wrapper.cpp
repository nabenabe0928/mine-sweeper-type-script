#include <emscripten/bind.h>
#include "solver.cpp"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(mine_sweeper_solver) {
  register_vector<int>("VectorInt");
  register_vector<double>("VectorDouble");
  function("calculate_prob_flatten", &calculate_prob_flatten);
}
