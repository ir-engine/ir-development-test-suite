import { Benchmark } from './BenchmarkOrchestration'

const PhysicsBenchmark: Benchmark = {
  begin: (end: () => void) => {
    end()
  }
}

export default PhysicsBenchmark
