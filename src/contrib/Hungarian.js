/* Copyright (c) 2012 Kevin L. Stern
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Ported to JavaScript by Gerard Meier. For simplicity, it's a literal port,
 * omitting any typical JavaScript idioms & paradigms. For usage examples see
 * the Test() function at the bottom.
 */


define(function(require) {
	/// Create a new array and prefill
	/// with an initial value.
	/// @param array The desired array length.
	/// @param value The value to be assigned.
	/// @returns A new array filled with initial values
	function NewArray(length, value) {
	    var array = new Array(length);

	    for(var i = 0; i < length; ++i) {
	        array[i] = value;
	    }

	    return array;
	}

	/// Fill an array with a given value.
	/// @param array The array to be filled.
	/// @param value The value to be assigned.
	/// @returns The given array, filled with value
	function ArrayFill(array, value) {
	    for(var i = 0; i < array.length; ++i) {
	        array[i] = value;
	    }
	}

	/// Copy an array to a certain length. If the source
	/// array is shorter, the copy is padded with a given 
	/// value.
	/// @param array The array to be copied.
	/// @param length Length of the resulting copy.
	/// @param value The to be repeated padding value.
	/// @returns A copy whose length is as specified.
	function ArrayCopy(array, length, value) {
	    var copy = array.slice(0, length);

	    while(copy.length < length) {
	        copy.push(value);
	    }

	    return copy;
	}

	/**
	 * An implementation of the Hungarian algorithm for solving the assignment
	 * problem. An instance of the assignment problem consists of a number of
	 * workers along with a number of jobs and a cost matrix which gives the cost of
	 * assigning the i'th worker to the j'th job at position (i, j). The goal is to
	 * find an assignment of workers to jobs so that no job is assigned more than
	 * one worker and so that no worker is assigned to more than one job in such a
	 * manner so as to minimize the total cost of completing the jobs.
	 * <p>
	 * 
	 * An assignment for a cost matrix that has more workers than jobs will
	 * necessarily include unassigned workers, indicated by an assignment value of
	 * -1; in no other circumstance will there be unassigned workers. Similarly, an
	 * assignment for a cost matrix that has more jobs than workers will necessarily
	 * include unassigned jobs; in no other circumstance will there be unassigned
	 * jobs. For completeness, an assignment for a square cost matrix will give
	 * exactly one unique worker to each job.
	 * <p>
	 * 
	 * This version of the Hungarian algorithm runs in time O(n^3), where n is the
	 * maximum among the number of workers and the number of jobs.
	 * 
	 * @author Kevin L. Stern
	 */
	function Hungarian(costMatrix) {

		
		if(typeof costMatrix.toArrays == "function") {
			costMatrix = costMatrix.toArrays();
			
			TODO("Optimize double copy in Hungarian ctor");
		}
		
	    this.dim = Math.max(costMatrix.length, costMatrix[0].length);
	    this.rows = costMatrix.length;
	    this.cols = costMatrix[0].length;

	    this.costMatrix = [];

	    //
	    for(var w = 0; w < this.dim; w++) {
	        if(w < costMatrix.length) {
	            if(costMatrix[w].length != this.cols) {
	                throw new Error("Irregular cost matrix");
	            }
	            this.costMatrix[w] = ArrayCopy(costMatrix[w], this.dim, 0.0);
	        } else {
	            this.costMatrix[w] = NewArray(this.dim, 0.0);
	        }
	    }

	    this.labelByWorker = NewArray(this.dim, 0.0);
	    this.labelByJob = NewArray(this.dim, 0.0);
	    this.minSlackWorkerByJob = NewArray(this.dim, 0);
	    this.minSlackValueByJob = NewArray(this.dim, 0.0);
	    this.committedWorkers = NewArray(this.dim, false);
	    this.parentWorkerByCommittedJob = NewArray(this.dim, 0);
	    this.matchJobByWorker = NewArray(this.dim, -1);
	    this.matchWorkerByJob = NewArray(this.dim, -1);
	}

	/**
	 * Compute an initial feasible solution by assigning zero labels to the
	 * workers and by assigning to each job a label equal to the minimum cost
	 * among its incident edges.
	 */
	Hungarian.prototype.computeInitialFeasibleSolution = function() {
	    for(var j = 0; j < this.dim; j++) {
	        this.labelByJob[j] = Infinity;
	    }

	    for(var w = 0; w < this.dim; w++) {
	        for(var j = 0; j < this.dim; j++) {
	            if(this.costMatrix[w][j] < this.labelByJob[j]) {
	                this.labelByJob[j] = this.costMatrix[w][j];
	            }
	        }
	    }
	};

	/**
	 * Execute the algorithm.
	 * 
	 * @return the minimum cost matching of workers to jobs based upon the
	 *         provided cost matrix. A matching value of -1 indicates that the
	 *         corresponding worker is unassigned.
	 */
	Hungarian.prototype.execute = function() {
	    /*
	     * Heuristics to improve performance: Reduce rows and columns by their
	     * smallest element, compute an initial non-zero dual feasible solution and
	     * create a greedy matching from workers to jobs of the cost matrix.
	     */
	    this.reduce();
	    this.computeInitialFeasibleSolution();
	    this.greedyMatch();

	    var w = this.fetchUnmatchedWorker();
	    while(w < this.dim) {
	        this.initializePhase(w);
	        this.executePhase();
	        w = this.fetchUnmatchedWorker();
	    }

	    var result = ArrayCopy(this.matchJobByWorker, this.rows);

	    for(w = 0; w < result.length; w++) {
	        if(result[w] >= this.cols) {
	            result[w] = -1;
	        }
	    }

	    return result;
	};

	/**
	 * Execute a single phase of the algorithm. A phase of the Hungarian algorithm
	 * consists of building a set of committed workers and a set of committed jobs
	 * from a root unmatched worker by following alternating unmatched/matched
	 * zero-slack edges. If an unmatched job is encountered, then an augmenting
	 * path has been found and the matching is grown. If the connected zero-slack
	 * edges have been exhausted, the labels of committed workers are increased by
	 * the minimum slack among committed workers and non-committed jobs to create
	 * more zero-slack edges (the labels of committed jobs are simultaneously
	 * decreased by the same amount in order to maintain a feasible labeling).
	 * <p>
	 * 
	 * The runtime of a single phase of the algorithm is O(n^2), where n is the
	 * dimension of the internal square cost matrix, since each edge is visited at
	 * most once and since increasing the labeling is accomplished in time O(n) by
	 * maintaining the minimum slack values among non-committed jobs. When a phase
	 * completes, the matching will have increased in size.
	 */
	Hungarian.prototype.executePhase = function() {
	    while(true) {
	        var minSlackWorker = -1,
	            minSlackJob = -1;
	        var minSlackValue = Infinity;

	        for(var j = 0; j < this.dim; j++) {
	            if(this.parentWorkerByCommittedJob[j] == -1) {
	                if(this.minSlackValueByJob[j] < minSlackValue) {
	                    minSlackValue = this.minSlackValueByJob[j];
	                    minSlackWorker = this.minSlackWorkerByJob[j];
	                    minSlackJob = j;
	                }
	            }
	        }

	        if(minSlackValue > 0) {
	            this.updateLabeling(minSlackValue);
	        }

	        this.parentWorkerByCommittedJob[minSlackJob] = minSlackWorker;

	        if(this.matchWorkerByJob[minSlackJob] == -1) {
	            /*
	             * An augmenting path has been found.
	             */
	            var committedJob = minSlackJob;
	            var parentWorker = this.parentWorkerByCommittedJob[committedJob];
	            while(true) {
	                var temp = this.matchJobByWorker[parentWorker];
	                this.match(parentWorker, committedJob);
	                committedJob = temp;
	                if(committedJob == -1) {
	                    break;
	                }
	                parentWorker = this.parentWorkerByCommittedJob[committedJob];
	            }
	            return;

	        } else {
	            /*
	             * Update slack values since we increased the size of the committed
	             * workers set.
	             */
	            var worker = this.matchWorkerByJob[minSlackJob];
	            this.committedWorkers[worker] = true;
	            for(var j = 0; j < this.dim; j++) {
	                if(this.parentWorkerByCommittedJob[j] == -1) {
	                    var slack = this.costMatrix[worker][j] - this.labelByWorker[worker] - this.labelByJob[j];
	                    if(this.minSlackValueByJob[j] > slack) {
	                        this.minSlackValueByJob[j] = slack;
	                        this.minSlackWorkerByJob[j] = worker;
	                    }
	                }
	            }
	        }
	    }
	};

	/**
	 * 
	 * @return the first unmatched worker or {@link #dim} if none.
	 */
	Hungarian.prototype.fetchUnmatchedWorker = function() {
	    var w;
	    for(w = 0; w < this.dim; w++) {
	        if(this.matchJobByWorker[w] == -1) {
	            break;
	        }
	    }
	    return w;
	};

	/**
	 * Find a valid matching by greedily selecting among zero-cost matchings. This
	 * is a heuristic to jump-start the augmentation algorithm.
	 */
	Hungarian.prototype.greedyMatch = function() {
	    for(var w = 0; w < this.dim; w++) {
	        for(var j = 0; j < this.dim; j++) {
	            if(this.matchJobByWorker[w] == -1 && this.matchWorkerByJob[j] == -1 && this.costMatrix[w][j] - this.labelByWorker[w] - this.labelByJob[j] == 0) {
	                this.match(w, j);
	            }
	        }
	    }
	};

	/**
	 * Initialize the next phase of the algorithm by clearing the committed
	 * workers and jobs sets and by initializing the slack arrays to the values
	 * corresponding to the specified root worker.
	 * 
	 * @param w
	 *          the worker at which to root the next phase.
	 */
	Hungarian.prototype.initializePhase = function(w) {
	    ArrayFill(this.committedWorkers, false);
	    ArrayFill(this.parentWorkerByCommittedJob, -1);

	    this.committedWorkers[w] = true;
	    for(var j = 0; j < this.dim; j++) {
	        this.minSlackValueByJob[j] = this.costMatrix[w][j] - this.labelByWorker[w] - this.labelByJob[j];
	        this.minSlackWorkerByJob[j] = w;
	    }
	};

	/**
	 * Helper method to record a matching between worker w and job j.
	 */
	Hungarian.prototype.match = function(w, j) {
	    this.matchJobByWorker[w] = j;
	    this.matchWorkerByJob[j] = w;
	};

	/**
	 * Reduce the cost matrix by subtracting the smallest element of each row from
	 * all elements of the row as well as the smallest element of each column from
	 * all elements of the column. Note that an optimal assignment for a reduced
	 * cost matrix is optimal for the original cost matrix.
	 */
	Hungarian.prototype.reduce = function() {

	    for(var w = 0; w < this.dim; w++) {
	        var min = Infinity;
	        for(var j = 0; j < this.dim; j++) {
	            if(this.costMatrix[w][j] < min) {
	                min = this.costMatrix[w][j];
	            }
	        }
	        for(var j = 0; j < this.dim; j++) {
	            this.costMatrix[w][j] -= min;
	        }
	    }

	    var min = NewArray(this.dim, Infinity);
	    //double[] min = new double[dim];
	    //for (int j = 0; j < dim; j++) {
	    //	min[j] = Double.POSITIVE_INFINITY;
	    //}

	    for(var w = 0; w < this.dim; w++) {
	        for(var j = 0; j < this.dim; j++) {
	            if(this.costMatrix[w][j] < min[j]) {
	                min[j] = this.costMatrix[w][j];
	            }
	        }
	    }

	    for(var w = 0; w < this.dim; w++) {
	        for(var j = 0; j < this.dim; j++) {
	            this.costMatrix[w][j] -= min[j];
	        }
	    }
	};

	/**
	 * Update labels with the specified slack by adding the slack value for
	 * committed workers and by subtracting the slack value for committed jobs. In
	 * addition, update the minimum slack values appropriately.
	 */
	Hungarian.prototype.updateLabeling = function(slack) {
	    for(var w = 0; w < this.dim; w++) {
	        if(this.committedWorkers[w]) {
	            this.labelByWorker[w] += slack;
	        }
	    }

	    for(var j = 0; j < this.dim; j++) {
	        if(this.parentWorkerByCommittedJob[j] != -1) {
	            this.labelByJob[j] -= slack;
	        } else {
	            this.minSlackValueByJob[j] -= slack;
	        }
	    }
	};

	return Hungarian;
});

/*
function Test() {
    /// Compare whether two arrays are identical value-wise.
    /// @param a Left hand side array
    /// @param b Right hand side array
    /// @return A boolean indicating value equivalency
    function ArrayEquals(a, b) {
        if(a.length == b.length) {
            for(var i = 0; i < a.length; ++i) {
                if(a[i] != b[i]) {
                    return false;
                }
            }

            return true;
        }

        return false;
    }

    /// Compute the cheapest path through the matrix and compare
    /// the outcome with the known solution.
    /// @param matrix An array of arrays with numbers.
    /// @param solution The known solution, for validation.
    function Assert(matrix, solution) {

        var h = new Hungarian(matrix);
        var s = h.execute();

        if(ArrayEquals(solution, s)) {
            console.log("Solution correct.");
        } else {
            console.log("Failed: ", matrix, solution, s);
        }
    }

    /// Some tests copied from: http://www.fantascienza.net/leonardo/so/hungarian.d
    Assert([
        [],
        []
    ], [-1, -1]);
    Assert([
        [1]
    ], [0]);
    Assert([
        [1],
        [1]
    ], [0, -1]);
    Assert([
        [1, 1]
    ], [0]);
    Assert([
        [1, 1],
        [1, 1]
    ], [0, 1]);
    Assert([
        [1, 1],
        [1, 1],
        [1, 1]
    ], [0, 1, -1]);
    Assert([
        [1, 2, 3],
        [6, 5, 4]
    ], [0, 2]);
    Assert([
        [1, 2, 3],
        [6, 5, 4],
        [1, 1, 1]
    ], [0, 2, 1]);
    Assert([
        [1, 2, 3],
        [6, 5, 4],
        [1, 1, 1]
    ], [0, 2, 1]);
    Assert([
        [10, 25, 15, 20],
        [15, 30, 5, 15],
        [35, 20, 12, 24],
        [17, 25, 24, 20]
    ], [0, 2, 1, 3]);

}

Test();
*/