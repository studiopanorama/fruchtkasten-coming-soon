// src/pathseg.js
// Polyfill für SVGPathSeg – benötigt von Matter.Svg.pathToVertices()

if (!("SVGPathSegList" in window)) {
  (function () {
    const NS = "http://www.w3.org/2000/svg";

    const tempPath = document.createElementNS(NS, "path");

    Object.defineProperty(SVGPathElement.prototype, "pathSegList", {
      get: function () {
        const list = [];
        const length = this.getTotalLength();
        const samples = Math.ceil(length / 4); // feinere Auflösung

        for (let i = 0; i <= samples; i++) {
          const p = this.getPointAtLength((i / samples) * length);
          list.push({ x: p.x, y: p.y });
        }

        return {
          numberOfItems: list.length,
          getItem: function (i) {
            return list[i];
          }
        };
      }
    });
  })();
}