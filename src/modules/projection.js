(function () {
    
    

    function quadraticEq(x, a, b, c) {
        return a * x * x + b * x + c;
    }

    function reverseQuadraticEq(y, a, b, c, pos) {
        if (pos) {
            return (-b + Math.sqrt(b * b - 4 * a * (c - y))) / (2 * a);
        } else {
            return (-b - Math.sqrt(b * b - 4 * a * (c - y))) / (2 * a);
        }
    }

    function createProjectionCoeffs() {
        return {
            A_Y: 3 / 16,
            B_Y: -14 / 16,
            C_Y: 1,
            A_S: -2.5 / 16,
            B_S: 0 / 16,
            C_S: 1,
        };
    }

    function makeProjectFunctions(coeffs) {
        var A_Y = coeffs.A_Y,
            B_Y = coeffs.B_Y,
            C_Y = coeffs.C_Y;
        var A_S = coeffs.A_S,
            B_S = coeffs.B_S,
            C_S = coeffs.C_S;

        function project(x, y, res) {
            res = res || {};
            res.y = quadraticEq(y, A_Y, B_Y, C_Y);
            res.scaleX = quadraticEq(y, A_S, B_S, C_S);
            res.scaleY = res.scaleX;
            res.x = (1 - res.scaleX) / 2 + x * res.scaleX;
            return res;
        }

        function reverseProject(x, y, res) {
            res = res || {};
            res.y = reverseQuadraticEq(y, A_Y, B_Y, C_Y, false);
            var scale = quadraticEq(res.y, A_S, B_S, C_S);
            res.x = (x - (1 - scale) / 2) / scale;
            return res;
        }

        return { project, reverseProject, quadraticEq, reverseQuadraticEq };
    }

    var coeffs = createProjectionCoeffs();
    var api = makeProjectFunctions(coeffs);

    if (typeof window !== 'undefined') {
        window.Projection = { coeffs: coeffs, api: api };
    }
})();
