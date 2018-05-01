angular.module("mwc.geometry", [])

    .factory("TransformMatrix", [
        function() {
            function TransformMatrix(a, b, c, d, e, f) {
                this.set(
                    a == undefined ? 1 : a || 0,
                    b == undefined ? 0 : b || 0,
                    c == undefined ? 0 : c || 0,
                    d == undefined ? 1 : d || 0,
                    e == undefined ? 0 : e || 0,
                    f == undefined ? 0 : f || 0
                );
            }

            TransformMatrix.prototype = {
                set: function(a, b, c, d, e, f) {
                    this.a = a;
                    this.b = b;
                    this.c = c;
                    this.d = d;
                    this.e = e;
                    this.f = f;

                    return this;
                },

                transform: function(a, b, c, d, e, f) {
                    this.set(
                        a*this.a + c*this.b,
                        b*this.a + d*this.b,
                        a*this.c + c*this.d,
                        b*this.c + d*this.d,
                        a*this.e + c*this.f + e,
                        b*this.e + d*this.f + f
                    );

                    return this;
                },

                transformFromMatrix: function(matrix) {
                    return this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
                },

                translate: function(dx, dy) {
                    return this.transform(1, 0, 0, 1, dx, dy);
                },

                rotate: function(angle) {
                    var sin = Math.sin(angle), cos = Math.cos(angle);
                    return this.transform(cos, sin, -sin, cos, 0, 0);
                },

                scale: function(sx, sy) {
                    return this.transform(sx, 0, 0, sy, 0, 0);
                },

                reset: function() {
                    return this.set(1, 0, 0, 1, 0, 0);
                },

                copy: function(matrix) {
                    this.set(
                        matrix.a,
                        matrix.b,
                        matrix.c,
                        matrix.d,
                        matrix.e,
                        matrix.f
                    );

                    return this;
                },

                clone: function() {
                    return new TransformMatrix(
                        this.a,
                        this.b,
                        this.c,
                        this.d,
                        this.e,
                        this.f
                    );
                }
            };

            return TransformMatrix;
        }
    ])

    .factory("Point", [
        function() {
            function Point(x, y) {
                this.set(x, y);
            }

            Point.prototype = {
                set: function(x, y) {
                    this.x = x || 0;
                    this.y = y || 0;

                    return this;
                },

                transform: function(matrix) {
                    this.set(
                        matrix.a*this.x + matrix.c*this.y + matrix.e,
                        matrix.b*this.x + matrix.d*this.y + matrix.f
                    );

                    return this;
                },

                distanceTo: function(point) {
                    var dx = this.x - point.x, dy = this.y - point.y;

                    return Math.sqrt(dx*dx + dy*dy);
                },

                copy: function(point) {
                    this.set(point.x, point.y);

                    return this;
                },

                clone: function() {
                    return new Point(this.x, this.y);
                }
            };

            Point.triangleArea = function(point1, point2, point3) {
                return point1.x*(point2.y - point3.y) +
                       point2.x*(point3.y - point1.y) +
                       point3.x*(point1.y - point2.y);
            };

            Point.linearInterpolation = function(point1, point2, p) {
                var q = 1 - p;

                return new Point(
                    q*point1.x + p*point2.x,
                    q*point1.y + p*point2.y
                );
            }

            return Point;
        }
    ])

    .factory("Polygon", [
        "Point",
        "TransformMatrix",
        function(Point, TransformMatrix) {
            function Polygon() {
                this.vertices = [];
                this.AABB = {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    shape: this
                };
                this.dirtyAABB = false;
            }

            Polygon.prototype = {
                addVertex: function(point) {
                    this.vertices.push(point.clone());
                    this.dirtyAABB = true;

                    return this;
                },

                transform: function(matrix) {
                    for (var i=0; i<this.vertices.length; i++) {
                        this.vertices[i].transform(matrix);
                    }
                    this.dirtyAABB = true;

                    return this;
                },

                calculateAABB: function() {
                    this.AABB.left = this.AABB.right = this.vertices[0].x;
                    this.AABB.top = this.AABB.bottom = this.vertices[0].y;

                    for (var i=1; i<this.vertices.length; i++) {
                        this.AABB.left = Math.min(this.AABB.left, this.vertices[i].x);
                        this.AABB.right = Math.max(this.AABB.right, this.vertices[i].x);
                        this.AABB.top = Math.min(this.AABB.top, this.vertices[i].y);
                        this.AABB.bottom = Math.max(this.AABB.bottom, this.vertices[i].y);
                    }

                    this.dirtyAABB = false;
                },

                getAABB: function() {
                    if (this.dirtyAABB) {
                        this.calculateAABB();
                    }

                    return this.AABB;
                },

                copy: function(polygon) {
                    var i;

                    this.vertices.length = Math.min(this.vertices.length, polygon.vertices.length);
                    for (i=0; i<this.vertices.length; i++) {
                        this.vertices[i].copy(polygon.vertices[i]);
                    }
                    for (; i<polygon.vertices.length; i++) {
                        this.vertices.push(polygon.vertices[i].clone());
                    }
                    this.dirtyAABB = true;

                    return this;
                },

                clone: function() {
                    var newPolygon = new Polygon();

                    newPolygon.copy(this);

                    return newPolygon;
                },

                draw: function(canvasContext) {
                    canvasContext.moveTo(this.vertices[0].x, this.vertices[0].y);
                    for (var i=1; i<this.vertices.length; i++) {
                        canvasContext.lineTo(this.vertices[i].x, this.vertices[i].y);
                    }
                    canvasContext.lineTo(this.vertices[0].x, this.vertices[0].y);

                    return this;
                }
            };

            Polygon.regularPolygon = function(nSizes) {
                var newPolygon = new Polygon(), matrix = new TransformMatrix(), angle = 2*Math.PI/nSizes;

                for (var i=0; i<nSizes; i++) {
                    matrix.reset().rotate(i*angle);
                    newPolygon.addVertex(new Point(0, 1).transform(matrix));
                }

                return newPolygon;
            };

            Polygon.triangle = function() {
                return Polygon.regularPolygon(3);
            };

            Polygon.square = function() {
                return Polygon.regularPolygon(4).transform(new TransformMatrix().rotate(-Math.PI/4));
            };

            Polygon.pentagon = function() {
                return Polygon.regularPolygon(5);
            }

            Polygon.hexagon = function() {
                return Polygon.regularPolygon(6);
            }

            Polygon.diamond = function() {
                return new Polygon()
                    .addVertex(new Point(0, 1))
                    .addVertex(new Point(-0.5, 0))
                    .addVertex(new Point(0, -1))
                    .addVertex(new Point(0.5, 0));
            };

            return Polygon;
        }
    ])

    .factory("Circle", [
        "Point",
        function(Point) {
            function Circle(x, y, radius) {
                this.center = new Point(x, y);
                this.radius = radius || 1;
                this.AABB = {
                    left: x - radius,
                    right: x + radius,
                    top: y - radius,
                    bottom: y + radius,
                    shape: this
                };
                this.dirtyAABB = false;
            }

            Circle.prototype = {
                transform: function(matrix) {
                    this.center.transform(matrix);
                    this.dirtyAABB = true;

                    return this;
                },

                setRadius: function(radius) {
                    this.radius = Math.max(0, radius);
                    this.dirtyAABB = true;

                    return this;
                },

                calculateAABB: function() {
                    this.AABB.left = this.center.x - this.radius;
                    this.AABB.right = this.center.x + this.radius;
                    this.AABB.top = this.center.y - this.radius;
                    this.AABB.bottom = this.center.y + this.radius;

                    this.dirtyAABB = false;
                },

                getAABB: function() {
                    if (this.dirtyAABB) {
                        this.calculateAABB();
                    }

                    return this.AABB;
                },

                copy: function(circle) {
                    this.center.copy(circle.center);
                    this.radius = circle.radius;
                    this.dirtyAABB = true;

                    return this;
                },

                clone: function() {
                    return new Circle(this.center.x, this.center.y, this.radius);
                },

                draw: function(canvasContext) {
                    canvasContext.arc(
                        this.center.x,
                        this.center.y,
                        this.radius,
                        0,
                        2*Math.PI,
                        false
                    );
                }
            };

            return Circle;
        }
    ])

    .factory("CollisionTester", [
        "Point",
        "Polygon",
        "Circle",
        function(Point, Polygon, Circle) {
            return {
                testCircleAndCircle: function(circle1, circle2) {
                    return circle1.center.distanceTo(circle2.center) <= circle1.radius + circle2.radius;
                },

                testCircleAndPolygon: function(circle, polygon) {
                    var edge1, edge2, edgeLength, centerLength, p, closest;

                    for (var i=0; i<polygon.vertices.length; i++) {
                        edge1 = polygon.vertices[i];
                        edge2 = polygon.vertices[(i+1)%polygon.vertices.length];
                        edgeLength = edge1.distanceTo(edge2);
                        centerLength = edge1.distanceTo(circle.center);
                        p = ((circle.center.x - edge1.x)*(edge2.x - edge1.x) +
                             (circle.center.y - edge1.y)*(edge2.y - edge1.y))/(edgeLength*centerLength);
                        if (p<0) {
                            closest = edge1;
                        }
                        else if (p>1) {
                            closest = edge2;
                        }
                        else {
                            closest = Point.linearInterpolation(edge1, edge2, p);
                        }

                        if (closest.distanceTo(circle.center) <= circle.radius) {
                            return true;
                        }
                    }

                    return false;
                },

                testPolygonAndPolygon: function(polygon1, polygon2) {
                    var edge1, edge2, vertex, isDividingAxis;

                    // Tests for collision using the Separating Axis Theorem
                    for (var i=0; i<polygon1.vertices.length; i++) {
                        edge1 = polygon1.vertices[i];
                        edge2 = polygon1.vertices[(i+1)%polygon1.vertices.length];
                        isDividingAxis = true;
                        for (var j=0; j<polygon2.vertices.length; j++) {
                            if (Point.triangleArea(edge1, edge2, polygon2.vertices[j])>=0) {
                                isDividingAxis = false;
                                break;
                            }
                        }

                        if (isDividingAxis) {
                            return false;
                        }
                    }

                    for (var i=0; i<polygon2.vertices.length; i++) {
                        edge1 = polygon2.vertices[i];
                        edge2 = polygon2.vertices[(i+1)%polygon2.vertices.length];
                        isDividingAxis = true;
                        for (var j=0; j<polygon1.vertices.length; j++) {
                            if (Point.triangleArea(edge1, edge2, polygon1.vertices[j])>=0) {
                                isDividingAxis = false;
                                break;
                            }
                        }

                        if (isDividingAxis) {
                            return false;
                        }
                    }

                    return true;
                },

                test: function(obj1, obj2) {
                    if (obj1 instanceof Circle) {
                        if (obj2 instanceof Circle) {
                            return this.testCircleAndCircle(obj1, obj2);
                        }
                        else {
                            return this.testCircleAndPolygon(obj1, obj2);
                        }
                    }
                    else {
                        if (obj2 instanceof Circle) {
                            return this.testCircleAndPolygon(obj2, obj1);
                        }
                        else {
                            return this.testPolygonAndPolygon(obj1, obj2);
                        }
                    }
                }
            }
        }
    ]);
